using System;
using System.Collections.Generic;

namespace MamMoi.Infrastructure.Models;

public partial class Airecommendation
{
    public int RecommendationId { get; set; }

    public int ConsultationId { get; set; }

    public int TreeId { get; set; }

    public DateOnly? ForDate { get; set; }

    public string? ActionsJson { get; set; }

    public bool WeatherAdjusted { get; set; }

    public decimal? Confidence { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual Aiconsultation Consultation { get; set; } = null!;

    public virtual Tree Tree { get; set; } = null!;
}
