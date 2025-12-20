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
        /// Template for the AI prompt with placeholders: {{ForDate}}, {{TreeJson}}, {{WeatherJson}}, {{OutputJsonFormat}}
        /// </summary>
        public string PromptTemplate { get; set; } = "";
        
        /// <summary>
        /// Expected JSON output format schema for the AI response
        /// </summary>
        public string OutputJsonFormat { get; set; } = "";
    }
}
