namespace MamMoi.Application.Interfaces;

/// <summary>
/// Simple settings access abstraction for the Application layer.
/// Implementations (e.g., reading from IConfiguration) live in Infrastructure or API startup.
/// </summary>
public interface ISettingService
{
    string? Get(string key);
    T? Get<T>(string key);
}
