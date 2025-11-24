using Microsoft.AspNetCore.Hosting;
using MamMoi.Application.Interfaces;

namespace MamMoi.Infrastructure.Services;

/// <summary>
/// Service for handling image uploads and storage in wwwroot/uploads
/// </summary>
public class ImageUploadService : IImageUploadService
{
    private readonly IWebHostEnvironment _environment;
    private const long MaxFileSize = 10485760; // 10MB
    private readonly string[] AllowedMimeTypes = { "image/jpeg", "image/png", "image/webp", "image/jpg" };
    private readonly string[] AllowedExtensions = { ".jpg", ".jpeg", ".png", ".webp" };

    public ImageUploadService(IWebHostEnvironment environment)
    {
        _environment = environment;
    }

    public async Task<string> UploadImageAsync(Stream fileStream, string fileName, string contentType, string category, CancellationToken cancellationToken = default)
    {
        // Validate file type
        var extension = Path.GetExtension(fileName).ToLowerInvariant();
        if (!AllowedExtensions.Contains(extension))
        {
            throw new ArgumentException($"File type not allowed. Allowed extensions: {string.Join(", ", AllowedExtensions)}");
        }

        if (!AllowedMimeTypes.Contains(contentType.ToLowerInvariant()))
        {
            throw new ArgumentException($"MIME type not allowed. Allowed types: {string.Join(", ", AllowedMimeTypes)}");
        }

        // Validate file size if stream supports Length property
        if (fileStream.CanSeek && fileStream.Length > MaxFileSize)
        {
            throw new ArgumentException($"File size exceeds maximum of {MaxFileSize / 1048576}MB");
        }

        // Create upload directory if not exists
        var uploadPath = Path.Combine(_environment.WebRootPath, "uploads", category);
        if (!Directory.Exists(uploadPath))
        {
            Directory.CreateDirectory(uploadPath);
        }

        // Generate unique filename
        var uniqueFileName = $"{Guid.NewGuid()}{extension}";
        var filePath = Path.Combine(uploadPath, uniqueFileName);

        // Save file
        using (var fileStreamOutput = new FileStream(filePath, FileMode.Create))
        {
            // Reset stream position if seekable
            if (fileStream.CanSeek)
            {
                fileStream.Position = 0;
            }
            await fileStream.CopyToAsync(fileStreamOutput, cancellationToken);
        }

        // Return relative URL path
        return $"/uploads/{category}/{uniqueFileName}";
    }

    public async Task<string> UploadImageFromBytesAsync(byte[] imageData, string fileName, string contentType, string category, CancellationToken cancellationToken = default)
    {
        // Validate file size
        if (imageData.Length > MaxFileSize)
        {
            throw new ArgumentException($"File size exceeds maximum of {MaxFileSize / 1048576}MB");
        }

        using (var stream = new MemoryStream(imageData))
        {
            return await UploadImageAsync(stream, fileName, contentType, category, cancellationToken);
        }
    }

    public async Task<bool> DeleteImageAsync(string? imageUrl)
    {
        if (string.IsNullOrWhiteSpace(imageUrl))
            return false;

        try
        {
            // Extract relative path from full URL if needed
            string relativePath;
            if (imageUrl.StartsWith("http://", StringComparison.OrdinalIgnoreCase) || 
                imageUrl.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
            {
                // Full URL: extract path after domain
                var uri = new Uri(imageUrl);
                relativePath = uri.AbsolutePath.TrimStart('/');
            }
            else
            {
                // Relative path: remove leading slash
                relativePath = imageUrl.TrimStart('/');
            }

            var filePath = Path.Combine(_environment.WebRootPath, relativePath);

            // Security check: ensure file is within wwwroot/uploads
            var normalizedPath = Path.GetFullPath(filePath);
            var uploadsPath = Path.GetFullPath(Path.Combine(_environment.WebRootPath, "uploads"));
            
            if (!normalizedPath.StartsWith(uploadsPath, StringComparison.OrdinalIgnoreCase))
            {
                // File is outside uploads directory, don't delete
                return false;
            }

            if (File.Exists(filePath))
            {
                File.Delete(filePath);
                await Task.CompletedTask;
                return true;
            }

            return false;
        }
        catch
        {
            return false;
        }
    }
}

