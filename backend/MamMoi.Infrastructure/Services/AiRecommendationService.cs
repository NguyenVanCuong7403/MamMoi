using MamMoi.Application.DTOs;
using MamMoi.Application.Interfaces;
using MamMoi.Infrastructure.External;
using MamMoi.Infrastructure.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace MamMoi.Infrastructure.Services
{
    public class AiRecommendationService : IAiRecommendationService
    {
        private readonly MamMoiDbContext _db;
        private readonly HttpClient _http;
        private readonly GeminiOptions _options;
        public AiRecommendationService(
        MamMoiDbContext db,
        HttpClient http,
        IOptions<GeminiOptions> options)
        {
            _db = db;
            _http = http;
            _options = options.Value;
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
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.TreeId == treeId, ct);

            if (tree == null)
                throw new InvalidOperationException($"Tree {treeId} not found.");

            // TODO: nếu muốn thêm weather thì gọi IWeatherService ở đây
            object? weatherInfo = null;

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
                TreeTypeName = tree.TreeType?.TreeTypeName,
                StageName = tree.Stage?.StageName,
                tree.IsActive,
                tree.IsFruiting,
                tree.ExpectedHarvestDate,
                tree.GardenSoilId,
                tree.LeafStatus,
                tree.BranchStatus,
                tree.FlowerStatus,
                tree.FruitStatus
            };

            // 3. Build prompt
            var prompt = BuildGeminiPrompt(dto, forDate, weatherInfo);

            // 4. Gọi Gemini
            var jsonResponse = await CallGeminiJsonAsync(prompt, ct);

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


            // 7. Tạo Airecommendation
            var recommendation = new Airecommendation
            {
                TreeId = treeId,
                ForDate = forDate,
                ActionsJson = jsonResponse,  // giữ nguyên JSON từ Gemini
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

            var url = $"https://generativelanguage.googleapis.com/v1beta/models/{_options.Model}:generateContent?key={apiKey}";

            using var req = new HttpRequestMessage(HttpMethod.Post, url);

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
            },
                generationConfig = new
                {
                    response_mime_type = "application/json",
                    temperature = 0.7,
                    maxOutputTokens = 2048
                }
            };

            var json = JsonSerializer.Serialize(payload);
            req.Content = new StringContent(json, Encoding.UTF8, "application/json");

            using var resp = await _http.SendAsync(req, ct);
            resp.EnsureSuccessStatusCode();

            var body = await resp.Content.ReadAsStringAsync(ct);

            // Response Gemini dạng:
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
            var candidates = doc.RootElement.GetProperty("candidates");
            if (candidates.GetArrayLength() == 0)
                throw new InvalidOperationException("Gemini returned no candidates.");

            var text = candidates[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString();

            if (string.IsNullOrWhiteSpace(text))
                throw new InvalidOperationException("Gemini returned empty text.");

            return text;
        }
    }
}
