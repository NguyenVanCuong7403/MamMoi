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

        public async Task<AirecommendationDto> GenerateRecommendationForTreeAsync(
            int treeId,
            DateOnly forDate,
            CancellationToken ct = default)
        {
            // 1. Lấy detail cây (có thể dùng TreeDetailDto như TreeQuery đang trả ra)
            var tree = await _db.Trees
                .Include(t => t.Garden)
                .Include(t => t.TreeType)
                .Include(t => t.Stage)
                .Include(t => t.TreeVariety)
                .Include(t => t.GardenSoil)
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.TreeId == treeId, ct);

            if (tree == null)
                throw new InvalidOperationException($"Tree {treeId} not found.");

            // TODO: nếu muốn thêm weather thì gọi IWeatherService ở đây
            object? weatherInfo = null;

            weatherInfo = await _weatherService.GetCurrentByLocationAsync(tree.Garden.Location
    ?.Split(',', StringSplitOptions.RemoveEmptyEntries)
    ?.Last()
    ?.Trim(), ct);

            // 2. Convert sang DTO nhẹ cho prompt (tránh ném cả EF nav)
            var dto = new
            {
                tree.TreeId,
                tree.TreeCode,
                tree.TreeName,
                tree.PlantDate,
                tree.GardenId,
                GardenName = tree.Garden?.Name,
                tree.TreeTypeId,
                TreeVarietyName = tree.TreeVariety.VarietyName,
                TreeTypeName = tree.TreeType?.TreeTypeName,
                StageName = tree.Stage?.StageName,
                tree.IsActive,
                tree.IsFruiting,
                tree.ExpectedHarvestDate,
                GardenSoilName = tree.GardenSoil.CustomLabel,
                preMonthsPlantBefore = tree.preMonths,
                tree.LeafStatus,
                tree.BranchStatus,
                tree.FlowerStatus,
                tree.FruitStatus
            };

            // 3. Build prompt
            var prompt = BuildGeminiPrompt(dto, forDate, weatherInfo);

            // 4. Gọi Gemini
            var jsonResponse = await CallGeminiJsonAsync(prompt, ct);


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

        private string BuildGeminiPrompt(object treeDto, DateOnly forDate, object? weatherInfo)
        {
            var treeJson = JsonSerializer.Serialize(treeDto, new JsonSerializerOptions
            {
                WriteIndented = false
            });

            var weatherJson = weatherInfo != null
                ? JsonSerializer.Serialize(weatherInfo)
                : "null";

            return $@"
Bạn là trợ lý nông nghiệp cho vườn cây ăn trái tại Việt Nam.

Nhiệm vụ:
- Đọc kỹ dữ liệu cây trồng và (nếu có) thông tin thời tiết.
- Đề xuất các công việc chăm sóc chi tiết cho CÂY ĐÓ trong khoảng 1–3 ngày tới (bao gồm ngày: {forDate:yyyy-MM-dd}).
- CHỈ trả về JSON đúng schema bên dưới, không thêm giải thích.

DỮ LIỆU CÂY (JSON):
{treeJson}

DỮ LIỆU THỜI TIẾT (nếu có, JSON):
{weatherJson}

YÊU CẦU ĐẦU RA: Một object JSON duy nhất đúng cấu trúc:

{{
  ""forDate"": ""YYYY-MM-DD"",
  ""phase"": ""growth_development | flowering | fruiting | pre_harvest | post_harvest"",
  ""overallNote"": ""string"",
  ""actions"": [
    {{
      ""type"": ""Watering | Fertilizing | Pruning | Pest Control | Disease Treatment | Harvesting | Mulching | Inspection"",
      ""title"": ""string"",
      ""scheduledDate"": ""YYYY-MM-DD"",
      ""timeOfDay"": ""Morning | Afternoon | Evening | Night"",
      ""priority"": ""Low | Medium | High | Critical"",
      ""estimatedDurationMinutes"": number,
      ""details"": [ ""string"", ""string"" ]
    }}
  ],
  ""confidence"": number between 0 and 1,
  ""weatherAdjusted"": true or false,
  ""reasoning"": ""string (ngắn gọn, tiếng Việt)""
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

            // Throw nếu không thành công (bạn có thể bắt HttpRequestException ở caller)
            resp.EnsureSuccessStatusCode();

            var body = await resp.Content.ReadAsStringAsync(ct);

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
                catch (Exception)
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

        public async Task<List<AirecommendationDto>> getAIRecommendations(int treeId, DateOnly forDate, CancellationToken ct)
        {
            // build the 3-day window
            var dates = new[]
            {
        forDate,
        forDate.AddDays(1),
        forDate.AddDays(2)
    };
            // load existing recommendations for these dates
            var existing = await _db.Airecommendations
                .AsNoTracking()
                .Where(a => a.TreeId == treeId && a.ForDate != null && dates.Contains(a.ForDate.Value))
                .ToListAsync(ct);

            // map existing by DateOnly for quick lookup
            var existingByDate = existing
                .Where(a => a.ForDate.HasValue)
                .ToDictionary(a => a.ForDate!.Value, a => a);


            var results = new List<AirecommendationDto>(capacity: 3);

            foreach (var date in dates.OrderBy(d => d))
            {
                if (existingByDate.TryGetValue(date, out var rec))
                {
                    results.Add(new AirecommendationDto(
                        rec.TreeId,
                        rec.ForDate ?? date,
                        rec.ActionsJson ?? "[]",
                        rec.CreatedAt));
                    continue;
                }

                // missing -> generate (this method inserts into DB already)
                try
                {
                    Console.WriteLine("\n\n[AI Debug]: Trying to generate new data for date: " + date);
                    var generatedDto = await EnsureRecommendationForDateAsync(treeId, date, ct);
                    results.Add(generatedDto);
                }
                catch (OperationCanceledException)
                {
                    throw;
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Failed to generate AI recommendation for tree={treeId} date={date}: {ex.Message}");

                    results.Add(new AirecommendationDto(treeId, date, "[]", DateTime.UtcNow));

                }
            }

            return results.OrderBy(r => r.ForDate).ToList();
        }
    }
}
