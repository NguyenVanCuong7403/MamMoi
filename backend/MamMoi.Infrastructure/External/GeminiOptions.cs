using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MamMoi.Infrastructure.External
{
    public class GeminiOptions
    {
        public string ApiKey { get; set; } = "";
        public string Model { get; set; } = "gemini-1.5-flash";
        
        /// <summary>
        /// Folder path containing prompt template files (relative to application root).
        /// Files: ProfessionalPrompt.txt, ModelAcknowledgment.txt, UserPrompt.txt, OutputJsonSchema.json
        /// If empty or files not found, falls back to inline templates below.
        /// </summary>
        public string PromptsFolder { get; set; } = "Prompts";
        
        /// <summary>
        /// Template for the AI prompt with placeholders: {{ForDate}}, {{TreeJson}}, {{WeatherJson}}, {{OutputJsonFormat}}
        /// </summary>
        public string PromptTemplate { get; set; } = "";
        
        /// <summary>
        /// Expected JSON output format schema for the AI response
        /// </summary>
        public string OutputJsonFormat { get; set; } = "";

        /// <summary>
        /// Professional role prompt template with expert knowledge from TreeType and GrowthStage.
        /// Placeholders: {{TreeTypeJson}}, {{StageJson}}
        /// </summary>
        public string ProfessionalPromptTemplate { get; set; } = "";

        /// <summary>
        /// Model acknowledgment message in multi-role conversation
        /// </summary>
        public string ModelAcknowledgment { get; set; } = "";

        /// <summary>
        /// User request prompt template with tree data and weather.
        /// Placeholders: {{ForDate}}, {{TreeJson}}, {{WeatherJson}}, {{OutputJsonFormat}}
        /// </summary>
        public string UserPromptTemplate { get; set; } = "";
    }
}
