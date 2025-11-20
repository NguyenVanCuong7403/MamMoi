using System.ComponentModel.DataAnnotations;

namespace MamMoi.Application.DTOs.Auth
{
    public class ResetPasswordRequestDto
    {
        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        public string Email { get; set; } = null!;

        [Required(ErrorMessage = "Reset token is required")]
        [StringLength(6, MinimumLength = 6, ErrorMessage = "Reset token must be 6 characters")]
        public string ResetToken { get; set; } = null!;

        [Required(ErrorMessage = "New password is required")]
        [MinLength(6, ErrorMessage = "Password must be at least 6 characters")]
        public string NewPassword { get; set; } = null!;
    }
}
