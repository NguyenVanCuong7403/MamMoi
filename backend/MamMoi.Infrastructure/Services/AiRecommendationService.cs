using MamMoi.Application.DTOs;
using MamMoi.Application.Interfaces;
using MamMoi.Infrastructure.External;
using MamMoi.Infrastructure.Models;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Encodings.Web;
using System.Text.Json;
using System.Threading.Tasks;

namespace MamMoi.Infrastructure.Services
{
    public class AiRecommendationService : IAiRecommendationService
    {
        private readonly MamMoiDbContext _db;
        private readonly HttpClient _http;
        private readonly GeminiOptions _options;
        private readonly IWeatherService _weatherService;

        private static readonly ConcurrentDictionary<string, SemaphoreSlim> _generationLocks = new();
        
        // Cache for prompt files - loaded once at first use
        private static readonly ConcurrentDictionary<string, string> _promptCache = new();

        private static SemaphoreSlim GetLockForKey(string key)
        {
            return _generationLocks.GetOrAdd(key, k => new SemaphoreSlim(1, 1));
        }

        public AiRecommendationService(
        MamMoiDbContext db,
        HttpClient http,
        IOptions<GeminiOptions> options, IWeatherService weatherService)
        {
            _db = db;
            _http = http;
            _options = options.Value;
            _weatherService = weatherService;
        }

        /// <summary>
        /// Load prompt from file with caching, falls back to config value if file not found.
        /// </summary>
        private string LoadPromptFromFile(string fileName, string fallbackValue)
        {
            var cacheKey = $"{_options.PromptsFolder}/{fileName}";
            
            return _promptCache.GetOrAdd(cacheKey, key =>
            {
                try
                {
                    var filePath = Path.Combine(AppContext.BaseDirectory, _options.PromptsFolder, fileName);
                    if (File.Exists(filePath))
                    {
                        Console.WriteLine($"[Gemini] Loaded prompt from: {filePath}");
                        return File.ReadAllText(filePath);
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[Gemini] Failed to load prompt file {fileName}: {ex.Message}");
                }
                
                // Fallback to config value
                return fallbackValue;
            });
        }

        public async Task<AirecommendationDto> GenerateRecommendationForTreeAsync(
            int treeId,
            DateOnly forDate,
            CancellationToken ct = default)
        {
            // 1. Lấy detail cây (có thể dùng TreeDetailDto như TreeQuery đang trả ra)
            var tree = await _db.Trees
                .Include(t => t.Garden)
                .Include(t => t.TreeType)
                    .ThenInclude(tt => tt.SoilMaster)
                .Include(t => t.Stage)
                .Include(t => t.TreeVariety)
                .Include(t => t.GardenSoil)
                    .ThenInclude(gs => gs.SoilMaster)
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.TreeId == treeId, ct);

            if (tree == null)
                throw new InvalidOperationException($"Tree {treeId} not found.");

            // TODO: nếu muốn thêm weather thì gọi IWeatherService ở đây
            object? weatherInfo = null;
            try
            {
                weatherInfo = await _weatherService.GetCurrentByLocationAsync(tree.Garden.Location
        ?.Split(',', StringSplitOptions.RemoveEmptyEntries)
        ?.Last()
        ?.Trim(), ct);
            } catch(Exception e)
            {
                Console.WriteLine($"[Weather API Error]: {e.Message}");
            }

            // 2. Convert sang DTO nhẹ cho prompt (tránh ném cả EF nav)
            var treeDto = new
            {
                tree.TreeId,
                tree.TreeCode,
                tree.TreeName,
                tree.PlantDate,
                tree.GardenId,
                GardenName = tree.Garden?.Name,
                GardenLocation = tree.Garden?.Location,
                tree.TreeTypeId,
                TreeVarietyName = tree.TreeVariety?.VarietyName,
                TreeTypeName = tree.TreeType?.TreeTypeName,
                StageName = tree.Stage?.StageName,
                tree.IsActive,
                tree.IsFruiting,
                tree.ExpectedHarvestDate,
                GardenSoilName = tree.GardenSoil?.SoilMaster?.SoilName,
                preMonthsPlantBefore = tree.preMonths,
                tree.LeafStatus,
                tree.BranchStatus,
                tree.FlowerStatus,
                tree.FruitStatus
            };

            // 2b. Build TreeType professional knowledge (expert data)
            var treeTypeDto = tree.TreeType == null ? null : new
            {
                tree.TreeType.TreeTypeName,
                tree.TreeType.ScientificName,
                tree.TreeType.Description,
                tree.TreeType.Category,
                tree.TreeType.AverageLifespanYears,
                tree.TreeType.OptimalTemperatureMin,
                tree.TreeType.OptimalTemperatureMax,
                tree.TreeType.OptimalHumidityMin,
                tree.TreeType.OptimalHumidityMax,
                tree.TreeType.DroughtTolerance,
                tree.TreeType.FloodTolerance,
                tree.TreeType.FrostTolerance,
                tree.TreeType.WindTolerance,
                tree.TreeType.LightRequirement,
                tree.TreeType.WaterRequirement,
                tree.TreeType.CareGuide,
                tree.TreeType.Pests,
                tree.TreeType.SeasonalRoadmap,
                SoilRequirement = tree.TreeType.SoilMaster?.SoilName,
                SoilTexture = tree.TreeType.SoilMaster?.Texture,
                SoilDrainage = tree.TreeType.SoilMaster?.Drainage
            };

            // 2c. Build current GrowthStage professional knowledge (care specifications)
            var stageDto = tree.Stage == null ? null : new
            {
                tree.Stage.StageName,
                tree.Stage.StageOrder,
                tree.Stage.Description,
                tree.Stage.MinAgeInMonths,
                tree.Stage.MaxAgeInMonths,
                tree.Stage.WateringFrequencyDays,
                tree.Stage.WateringAmountLiters,
                tree.Stage.FertilizingFrequencyDays,
                tree.Stage.FertilizerType,
                tree.Stage.FertilizerAmountGrams,
                tree.Stage.PruningFrequencyDays,
                tree.Stage.CareInstructions,
                tree.Stage.CommonIssues,
                tree.Stage.CriticalWeatherFactors,
                tree.Stage.VulnerabilityLevel
            };

            // 3. Build multi-role conversation contents
            var contents = BuildGeminiContents(treeDto, treeTypeDto, stageDto, forDate, weatherInfo);

            // 4. Gọi Gemini with multi-role structure
            var jsonResponse = await CallGeminiWithContentsAsync(contents, ct);


            if (jsonResponse.StartsWith("```json\n"))
                jsonResponse = jsonResponse.Substring(7); // remove first 7 chars

            if (jsonResponse.EndsWith("\n```"))
                jsonResponse = jsonResponse.Substring(0, jsonResponse.Length - 3);

            //Console.WriteLine(jsonResponse);
            // 5. Parse JSON (đảm bảo parse được, nếu fail thì throw)
            JsonDocument doc;
            try
            {
                doc = JsonDocument.Parse(jsonResponse);
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException(
                    "Gemini did not return valid JSON for Airecommendation.",
                    ex);
            }

            // Extract confidence / weatherAdjusted nếu có
            decimal? confidence = null;
            bool weatherAdjusted = false;

            if (doc.RootElement.TryGetProperty("confidence", out var confProp) &&
                confProp.ValueKind == JsonValueKind.Number &&
                confProp.TryGetDecimal(out var confVal))
            {
                confidence = confVal;
            }

            if (doc.RootElement.TryGetProperty("weatherAdjusted", out var waProp) &&
                waProp.ValueKind == JsonValueKind.True ||
                waProp.ValueKind == JsonValueKind.False)
            {
                weatherAdjusted = waProp.GetBoolean();
            }

            string actionsJson = "[]"; // default empty array
            if (doc.RootElement.TryGetProperty("actions", out var actionsProp) &&
                actionsProp.ValueKind == JsonValueKind.Array)
            {
                actionsJson = JsonSerializer.Serialize(actionsProp, new JsonSerializerOptions
                {
                    Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping, // preserve Unicode
                    WriteIndented = false
                });
            }

            //Console.WriteLine(actionsJson);

            // 7. Tạo Airecommendation
            var recommendation = new Airecommendation
            {
                ConsultationId = 1,
                TreeId = treeId,
                ForDate = forDate,
                ActionsJson = actionsJson,  // giữ nguyên JSON từ Gemini
                WeatherAdjusted = weatherAdjusted,
                Confidence = confidence,
                CreatedAt = DateTime.UtcNow
            };

            _db.Airecommendations.Add(recommendation);
            await _db.SaveChangesAsync(ct);

            //return recommendation;
            return new AirecommendationDto(
                recommendation.TreeId,
                recommendation.ForDate ?? DateOnly.FromDateTime(DateTime.Now),
                recommendation.ActionsJson,
                recommendation.CreatedAt);
        }

        /// <summary>
        /// Build multi-role conversation structure for Gemini API.
        /// Returns array of content objects with professional knowledge and user request.
        /// </summary>
        private object[] BuildGeminiContents(object treeDto, object? treeTypeDto, object? stageDto, DateOnly forDate, object? weatherInfo)
        {
            var jsonOptions = new JsonSerializerOptions { WriteIndented = false };
            
            var treeJson = JsonSerializer.Serialize(treeDto, jsonOptions);
            var weatherJson = weatherInfo != null ? JsonSerializer.Serialize(weatherInfo, jsonOptions) : "null";
            var treeTypeJson = treeTypeDto != null ? JsonSerializer.Serialize(treeTypeDto, jsonOptions) : "null";
            var stageJson = stageDto != null ? JsonSerializer.Serialize(stageDto, jsonOptions) : "null";

            // Load prompts from files (with fallback to config values)
            var professionalTemplate = LoadPromptFromFile("ProfessionalPrompt.md", _options.ProfessionalPromptTemplate);
            var modelAcknowledgment = LoadPromptFromFile("ModelAcknowledgment.md", _options.ModelAcknowledgment);
            var userTemplate = LoadPromptFromFile("UserPrompt.md", _options.UserPromptTemplate);
            var outputJsonFormat = LoadPromptFromFile("OutputJsonSchema.json", _options.OutputJsonFormat);

            // Role 1: Professional/Expert context - TreeType knowledge & current GrowthStage specifications
            var professionalMessage = professionalTemplate
                .Replace("{{TreeTypeJson}}", treeTypeJson)
                .Replace("{{StageJson}}", stageJson);

            // Role 2: User request with actual tree data
            var userMessage = userTemplate
                .Replace("{{ForDate}}", forDate.ToString("yyyy-MM-dd"))
                .Replace("{{TreeJson}}", treeJson)
                .Replace("{{WeatherJson}}", weatherJson)
                .Replace("{{OutputJsonFormat}}", outputJsonFormat);

            return new object[]
            {
                new { role = "user", parts = new[] { new { text = professionalMessage } } },
                new { role = "model", parts = new[] { new { text = modelAcknowledgment } } },
                new { role = "user", parts = new[] { new { text = userMessage } } }
            };
        }

        [Obsolete("Use BuildGeminiContents instead for multi-role conversation")]
        private string BuildGeminiPrompt(object treeDto, object? treeTypeDto, object? stageDto, DateOnly forDate, object? weatherInfo)
        {
            // This method is kept for backward compatibility but now returns a single combined prompt
            // The actual multi-role logic is in BuildGeminiContents
            var jsonOptions = new JsonSerializerOptions { WriteIndented = false };
            var treeJson = JsonSerializer.Serialize(treeDto, jsonOptions);
            var weatherJson = weatherInfo != null ? JsonSerializer.Serialize(weatherInfo, jsonOptions) : "null";
            var treeTypeJson = treeTypeDto != null ? JsonSerializer.Serialize(treeTypeDto, jsonOptions) : "null";
            var stageJson = stageDto != null ? JsonSerializer.Serialize(stageDto, jsonOptions) : "null";

            return $@"
Bạn là chuyên gia nông nghiệp cây ăn trái Việt Nam.

=== KIẾN THỨC CHUYÊN GIA VỀ LOẠI CÂY ===
{treeTypeJson}

=== THÔNG TIN GIAI ĐOẠN HIỆN TẠI ===
{stageJson}

=== DỮ LIỆU CÂY CỤ THỂ ===
{treeJson}

=== THỜI TIẾT ===
{weatherJson}

Đề xuất chăm sóc cho ngày {forDate:yyyy-MM-dd} và 1-2 ngày tới. CHỈ trả về JSON:
{{
  ""forDate"": ""YYYY-MM-DD"",
  ""phase"": ""growth_development | flowering | fruiting | pre_harvest | post_harvest"",
  ""overallNote"": ""string"",
  ""actions"": [{{""type"": ""..., ""title"": ""..."", ""scheduledDate"": ""..."", ""timeOfDay"": ""..."", ""priority"": ""..."", ""estimatedDurationMinutes"": n, ""details"": []}}],
  ""confidence"": 0-1,
  ""weatherAdjusted"": bool,
  ""reasoning"": ""string""
}}
";
        }

        private async Task<string> CallGeminiJsonAsync(string prompt, CancellationToken ct)
        {
            var apiKey = _options.ApiKey;
            if (string.IsNullOrWhiteSpace(apiKey))
                throw new InvalidOperationException("Gemini API key is not configured.");

            // Sử dụng model từ config, nhưng không truyền key trong query string — dùng header x-goog-api-key
            var url = $"https://generativelanguage.googleapis.com/v1beta/models/{_options.Model}:generateContent";

            using var req = new HttpRequestMessage(HttpMethod.Post, url);

            // Thêm header theo mẫu demo
            req.Headers.Add("x-goog-api-key", apiKey);
            //req.Headers.Add("Accept", "application/json");

            var payload = new
            {
                contents = new[]
                {
            new
            {
                parts = new[]
                {
                    new { text = prompt }
                }
            }
        }
            };

            var json = JsonSerializer.Serialize(payload);
            
            req.Content = new StringContent(json, Encoding.UTF8, "application/json");

            using var resp = await _http.SendAsync(req, ct);
            
            // Read response body BEFORE checking status to capture error details
            var body = await resp.Content.ReadAsStringAsync(ct);

            if (!resp.IsSuccessStatusCode)
            {
                Console.WriteLine($"[Gemini] ERROR: {resp.StatusCode} - {body}");
                throw new HttpRequestException($"Gemini API returned {resp.StatusCode}: {body}");
            }


            // Response Gemini dạng (ví dụ):
            // {
            //   "candidates": [
            //     {
            //       "content": {
            //         "parts": [ { "text": "{...json...}" } ]
            //       }
            //     }
            //   ]
            // }
            using var doc = JsonDocument.Parse(body);

            if (!doc.RootElement.TryGetProperty("candidates", out var candidates) || candidates.GetArrayLength() == 0)
                throw new InvalidOperationException("Gemini returned no candidates.");

            var first = candidates[0];
            if (!first.TryGetProperty("content", out var content)
                || !content.TryGetProperty("parts", out var parts)
                || parts.GetArrayLength() == 0)
            {
                throw new InvalidOperationException("Gemini returned unexpected content format.");
            }

            var text = parts[0].GetProperty("text").GetString();
            if (string.IsNullOrWhiteSpace(text))
                throw new InvalidOperationException("Gemini returned empty text.");

            return text;
        }

        /// <summary>
        /// Call Gemini API with multi-role conversation contents.
        /// </summary>
        private async Task<string> CallGeminiWithContentsAsync(object[] contents, CancellationToken ct)
        {
            var apiKey = _options.ApiKey;
            if (string.IsNullOrWhiteSpace(apiKey))
                throw new InvalidOperationException("Gemini API key is not configured.");

            var url = $"https://generativelanguage.googleapis.com/v1beta/models/{_options.Model}:generateContent";

            using var req = new HttpRequestMessage(HttpMethod.Post, url);
            req.Headers.Add("x-goog-api-key", apiKey);

            var payload = new { contents };
            var json = JsonSerializer.Serialize(payload);
            
            Console.WriteLine($"[Gemini] Multi-role request with {contents.Length} content blocks");
            
            req.Content = new StringContent(json, Encoding.UTF8, "application/json");

            using var resp = await _http.SendAsync(req, ct);
            var body = await resp.Content.ReadAsStringAsync(ct);

            if (!resp.IsSuccessStatusCode)
            {
                Console.WriteLine($"[Gemini] ERROR: {resp.StatusCode} - {body}");
                throw new HttpRequestException($"Gemini API returned {resp.StatusCode}: {body}");
            }

            using var doc = JsonDocument.Parse(body);

            if (!doc.RootElement.TryGetProperty("candidates", out var candidates) || candidates.GetArrayLength() == 0)
                throw new InvalidOperationException("Gemini returned no candidates.");

            var first = candidates[0];
            if (!first.TryGetProperty("content", out var content)
                || !content.TryGetProperty("parts", out var parts)
                || parts.GetArrayLength() == 0)
            {
                throw new InvalidOperationException("Gemini returned unexpected content format.");
            }

            var text = parts[0].GetProperty("text").GetString();
            if (string.IsNullOrWhiteSpace(text))
                throw new InvalidOperationException("Gemini returned empty text.");

            return text;
        }

        private async Task<AirecommendationDto> EnsureRecommendationForDateAsync(int treeId, DateOnly date, CancellationToken ct)
        {
            var key = $"{treeId}:{date:yyyy-MM-dd}";
            var sem = GetLockForKey(key);
            await sem.WaitAsync(ct);
            try
            {
                // check again if exists (inside lock)
                var existing = await _db.Airecommendations
                    .AsNoTracking()
                    .FirstOrDefaultAsync(a => a.TreeId == treeId && a.ForDate == date, ct);

                if (existing != null)
                {
                    return new AirecommendationDto(
                        existing.TreeId,
                        existing.ForDate ?? date,
                        existing.ActionsJson,
                        existing.CreatedAt);
                }

                // not found -> call generator (this will insert into DB)
                AirecommendationDto generated;
                try
                {
                    generated = await GenerateRecommendationForTreeAsync(treeId, date, ct);
                    return generated;
                }
                catch (DbUpdateException dbEx)
                {
                    // If another concurrent request inserted meanwhile (possible across instances), handle duplicate key gracefully
                    // SQL Server duplicate key errors numbers: 2627 (PK or unique), 2601 (unique index)
                    if (dbEx.InnerException is SqlException sqlEx &&
                        (sqlEx.Number == 2627 || sqlEx.Number == 2601))
                    {
                        // load the existing one inserted by the other request
                        var loaded = await _db.Airecommendations
                            .AsNoTracking()
                            .FirstOrDefaultAsync(a => a.TreeId == treeId && a.ForDate == date, ct);

                        if (loaded != null)
                        {
                            return new AirecommendationDto(
                                loaded.TreeId,
                                loaded.ForDate ?? date,
                                loaded.ActionsJson,
                                loaded.CreatedAt);
                        }
                    }

                    // otherwise rethrow
                    throw;
                }
                catch (Exception e)
                {
                    // other exceptions from GenerateRecommendationForTreeAsync -> rethrow so caller can decide
                    throw;
                }
            }
            finally
            {
                sem.Release();
                // optional: cleanup dictionary to avoid memory growth. TryRemove if semaphore has no waiters.
                // Not strictly necessary, but you can prune periodically.
            }
        }

        /// <summary>
        /// Get or generate recommendation for a single day (used for progressive loading)
        /// If tree is inactive, only return existing DB data without calling AI
        /// </summary>
        public async Task<AirecommendationDto> GetSingleDayRecommendationAsync(
            int treeId,
            DateOnly forDate,
            CancellationToken ct = default)
        {
            // Check if tree is active - if inactive, only return existing DB data without calling AI
            var tree = await _db.Trees
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.TreeId == treeId, ct);
            
            bool isTreeActive = tree?.IsActive ?? false;

            if (!isTreeActive)
            {
                // Tree is inactive - only return existing data from DB, don't call AI
                var existing = await _db.Airecommendations
                    .AsNoTracking()
                    .FirstOrDefaultAsync(a => a.TreeId == treeId && a.ForDate == forDate, ct);

                if (existing != null)
                {
                    Console.WriteLine($"[AI Skip]: Tree {treeId} is inactive, returning existing data for date: {forDate}");
                    return new AirecommendationDto(
                        existing.TreeId,
                        existing.ForDate ?? forDate,
                        existing.ActionsJson,
                        existing.CreatedAt);
                }

                // No existing data and tree is inactive - return empty
                Console.WriteLine($"[AI Skip]: Tree {treeId} is inactive and no existing data for date: {forDate}");
                return new AirecommendationDto(treeId, forDate, "[]", DateTime.UtcNow);
            }

            // Tree is active - normal behavior, generate if needed
            return await EnsureRecommendationForDateAsync(treeId, forDate, ct);
        }

        /// <summary>
        /// Refresh recommendations for a tree - delete old ones for today+2 days and regenerate
        /// Only regenerates if deletion was successful; keeps old data if AI fails
        /// If tree is inactive, do NOT refresh/regenerate AI recommendations
        /// </summary>
        public async Task RefreshRecommendationsAsync(int treeId, CancellationToken ct = default)
        {
            // Check if tree is active - if inactive, do not refresh AI recommendations
            var tree = await _db.Trees
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.TreeId == treeId, ct);
            
            bool isTreeActive = tree?.IsActive ?? false;

            if (!isTreeActive)
            {
                Console.WriteLine($"[AI Refresh Skip]: Tree {treeId} is inactive, skipping AI refresh");
                return;
            }

            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var dates = new[] { today, today.AddDays(1), today.AddDays(2) };

            // First cleanup past recommendations
            await CleanupPastRecommendationsAsync(treeId, ct);

            // For each date, try to delete and regenerate
            foreach (var date in dates)
            {
                var key = $"{treeId}:{date:yyyy-MM-dd}";
                var sem = GetLockForKey(key);
                await sem.WaitAsync(ct);
                try
                {
                    // Find existing recommendation for this date
                    var existing = await _db.Airecommendations
                        .FirstOrDefaultAsync(a => a.TreeId == treeId && a.ForDate == date, ct);

                    if (existing != null)
                    {
                        // Try to generate new recommendation first
                        try
                        {
                            Console.WriteLine($"[AI Refresh]: Regenerating for tree={treeId} date={date}");
                            
                            // Delete old one
                            _db.Airecommendations.Remove(existing);
                            await _db.SaveChangesAsync(ct);

                            // Generate new one
                            await GenerateRecommendationForTreeAsync(treeId, date, ct);
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine($"[AI Refresh]: Failed to regenerate for tree={treeId} date={date}: {ex.Message}");
                            // If generation fails, the old one is already deleted, so we just continue
                            // The next GetSingleDayRecommendationAsync call will try again
                        }
                    }
                    else
                    {
                        // No existing recommendation, just generate
                        try
                        {
                            await GenerateRecommendationForTreeAsync(treeId, date, ct);
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine($"[AI Refresh]: Failed to generate new for tree={treeId} date={date}: {ex.Message}");
                        }
                    }
                }
                finally
                {
                    sem.Release();
                }
            }
        }

        /// <summary>
        /// Cleanup past recommendations (before today) to prevent database bloat
        /// </summary>
        public async Task CleanupPastRecommendationsAsync(int treeId, CancellationToken ct = default)
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            
            var oldRecommendations = await _db.Airecommendations
                .Where(a => a.TreeId == treeId && a.ForDate < today)
                .ToListAsync(ct);

            if (oldRecommendations.Any())
            {
                Console.WriteLine($"[AI Cleanup]: Removing {oldRecommendations.Count} old recommendations for tree={treeId}");
                _db.Airecommendations.RemoveRange(oldRecommendations);
                await _db.SaveChangesAsync(ct);
            }
        }
    }
}
