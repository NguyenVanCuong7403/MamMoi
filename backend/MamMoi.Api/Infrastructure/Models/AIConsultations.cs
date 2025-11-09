using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MamMoi.Api.Infrastructure.Models;

public partial class AIConsultations
{
    [Key]
    public int ConsultationID { get; set; }

    public int UserID { get; set; }

    public int? TreeID { get; set; }

    [StringLength(1000)]
    public string? PromptInput { get; set; }

    public string? ContextJson { get; set; }

    [StringLength(100)]
    public string? Model { get; set; }

    [Precision(0)]
    public DateTime CreatedAt { get; set; }

    [InverseProperty("Consultation")]
    public virtual ICollection<AIRecommendations> AIRecommendations { get; set; } = new List<AIRecommendations>();

    [ForeignKey("TreeID")]
    [InverseProperty("AIConsultations")]
    public virtual Trees? Tree { get; set; }

    [ForeignKey("UserID")]
    [InverseProperty("AIConsultations")]
    public virtual Users User { get; set; } = null!;
}
