namespace MamMoi.Application.DTOs
{
    public class SystemStatisticsDto
    {
        public int TotalUsers { get; set; }
        public int TotalFarmers { get; set; } // RoleID = 4
        public int TotalStaff { get; set; }   // RoleID = 3

        public int TotalGardens { get; set; }
        public int TotalTrees { get; set; }

        public int TotalTicketsOpen { get; set; }
        public int TotalTicketsClosed { get; set; }

        public decimal TotalRevenue { get; set; }
    }
}