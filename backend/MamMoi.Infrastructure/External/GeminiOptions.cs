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
    }
}
