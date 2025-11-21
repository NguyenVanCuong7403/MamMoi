using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MamMoi.Domain.Models
{
    public class SoilMaster
    {
        public int SoilMasterID { get; set; }
        public string SoilName { get; set; }
        public string Texture { get; set; }
        public string Drainage { get; set; }
        public decimal OrganicMatterPct { get; set; }
        public decimal ECdSm { get; set; }
        public string Notes { get; set; }
    }
}