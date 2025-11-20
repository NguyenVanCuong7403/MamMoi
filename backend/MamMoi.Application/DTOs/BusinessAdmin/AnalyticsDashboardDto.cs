using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MamMoi.Application.DTOs.BusinessAdmin
{
    public class AnalyticsDashboardDto
    {
        // ===  MRR Hiện tại ===
        // (Tổng MRR của tất cả Subscriptions đang 'Active')
        public decimal CurrentMRR { get; set; }

        // === Tăng trưởng MRR (Tháng này) ===
        // (MRR Mới - MRR Mất đi)
        public decimal NetMRRGrowthThisMonth { get; set; }
        public decimal NewMRRThisMonth { get; set; }
        public decimal ChurnedMRRThisMonth { get; set; }

        // ===  Số lượng Subscriptions ===
        public int TotalActiveSubscriptions { get; set; }
        public int NewSubscriptionsThisMonth { get; set; }
        public int CancellationsThisMonth { get; set; }

        // === Dữ liệu chart (12 tháng qua) ===
        // (Biểu đồ thể hiện MRR Mới vs MRR Mất đi mỗi tháng)
        public List<MonthlyMRRMovementDto> MRRMovementLast12Months { get; set; }
    }

    /// <summary>
    /// DTO "con" cho 1 cột dữ liệu trên chart (MRR Mới vs Mất)
    /// </summary>
    public class MonthlyMRRMovementDto
    {
        public string Month { get; set; } // Format: "2025-11"
        public decimal NewMRR { get; set; }
        public decimal ChurnedMRR { get; set; }
    }
}
