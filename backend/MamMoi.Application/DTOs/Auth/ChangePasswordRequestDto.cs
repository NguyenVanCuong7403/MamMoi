using System.ComponentModel.DataAnnotations;

namespace MamMoi.Application.DTOs.Auth
{
    public class ChangePasswordRequestDto
    {
        [Required(ErrorMessage = "Current password is required")]
        public string CurrentPassword { get; set; } = null!;

        [Required(ErrorMessage = "New password is required")]
        [MinLength(6, ErrorMessage = "Password must be at least 6 characters")]
        public string NewPassword { get; set; } = null!;
    }
}
