using System.ComponentModel.DataAnnotations;

namespace MamMoi.Application.DTOs.BusinessAdmin
{
    public class TreeVarietyDto
    {
        public int VarietyId { get; set; }
        public int? TreeTypeId { get; set; }
        public string? TreeTypeName { get; set; }
        public string? VarietyName { get; set; }
        public string? VarietyDescription { get; set; }
    }

    public class TreeVarietyCreateUpdateDto
    {
        [Required]
        public int TreeTypeId { get; set; }
        [Required]
        [StringLength(100)]
        public string VarietyName { get; set; }
        [StringLength(500)]
        public string? VarietyDescription { get; set; }
    }
}