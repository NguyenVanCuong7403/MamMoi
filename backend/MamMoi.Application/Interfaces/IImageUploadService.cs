namespace MamMoi.Application.Interfaces;

/// <summary>
/// Service for handling image uploads and storage
/// </summary>
public interface IImageUploadService
{
    /// <summary>
    /// Upload an image file and save it to wwwroot/uploads/{category}
    /// </summary>
    /// <param name="file">The image file to upload</param>
    /// <param name="category">Category/folder name (e.g., "tree-types", "tree-images", "growth-stages")</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Relative URL path (e.g., "/uploads/tree-types/filename.jpg")</returns>
    Task<string> UploadImageAsync(Stream fileStream, string fileName, string contentType, string category, CancellationToken cancellationToken = default);

    /// <summary>
    /// Delete an image file by its URL
    /// </summary>
    /// <param name="imageUrl">The URL of the image to delete (relative path)</param>
    /// <returns>True if deleted successfully, false otherwise</returns>
    Task<bool> DeleteImageAsync(string? imageUrl);

    /// <summary>
    /// Upload image from byte array
    /// </summary>
    Task<string> UploadImageFromBytesAsync(byte[] imageData, string fileName, string contentType, string category, CancellationToken cancellationToken = default);
}

