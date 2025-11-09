using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MamMoi.Api.Infrastructure.Models;

public partial class AIRecommendations
{
    [Key]
    public int RecommendationID { get; set; }

    public int ConsultationID { get; set; }

    public int TreeID { get; set; }

    public DateOnly? ForDate { get; set; }

    public string? ActionsJson { get; set; }

    public bool WeatherAdjusted { get; set; }

    [Column(TypeName = "decimal(4, 2)")]
    public decimal? Confidence { get; set; }

    [Precision(0)]
    public DateTime CreatedAt { get; set; }

    [ForeignKey("ConsultationID")]
    [InverseProperty("AIRecommendations")]
    public virtual AIConsultations Consultation { get; set; } = null!;

    [ForeignKey("TreeID")]
    [InverseProperty("AIRecommendations")]
    public virtual Trees Tree { get; set; } = null!;
}
