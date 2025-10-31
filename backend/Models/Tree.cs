using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MamMoi.Models
{
    [Table("Trees")]
    public class Tree
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int TreeId { get; set; }

        [Required]
        [MaxLength(200)]
        public string TreeName { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string? Description { get; set; }

        // Owner of the tree
        [ForeignKey("Owner")]
        public int OwnerId { get; set; }

        public virtual User? Owner { get; set; }
    }
}
