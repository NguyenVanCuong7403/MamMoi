namespace MamMoi.Application.Settings;

public class JwtSettings
{
    public string? Key { get; set; }
    public string? Issuer { get; set; }
    public string? Audience { get; set; }
    public int ExpiresInMinutes { get; set; }
}

public class ConnectionStrings
{
    public string? DefaultConnection { get; set; }
}

/// <summary>
/// Root application settings used as a contract in the Application layer.
/// These are simple POCOs to bind from IConfiguration in API/Infrastructure.
/// </summary>
public class AppSettings
{
    public JwtSettings Jwt { get; set; } = new JwtSettings();
    public ConnectionStrings ConnectionStrings { get; set; } = new ConnectionStrings();
}
