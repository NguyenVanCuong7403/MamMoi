using System;
using System.Collections.Generic;

namespace MamMoi.Infrastructure.Models;

public partial class Aiconsultation
{
    public int ConsultationId { get; set; }

    public int UserId { get; set; }

    public int? TreeId { get; set; }

    public string? PromptInput { get; set; }

    public string? ContextJson { get; set; }

    public string? Model { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual ICollection<Airecommendation> Airecommendations { get; set; } = new List<Airecommendation>();

    public virtual Tree? Tree { get; set; }

    public virtual User User { get; set; } = null!;
}
