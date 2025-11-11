using System.Security.Cryptography;
using System.Linq;
using System.Text;
using Microsoft.EntityFrameworkCore;
using MamMoi.Application.DTOs.Invitation;
using MamMoi.Application.DTOs;
using MamMoi.Application.Interfaces;
using MamMoi.Application.Interfaces.Auth;
using MamMoi.Domain.Interfaces;
using MamMoi.Infrastructure.Models;
using GardenMemberEntity = MamMoi.Infrastructure.Models.GardenMember;

namespace MamMoi.Infrastructure.Services.Staff;

public class StaffService : IInvitationService
{
    private readonly IUserRepository _userRepository;
    private readonly IGardenRepository _gardenRepository;
    private readonly IGardenMemberRepository _gardenMemberRepository;
    private readonly IEmailService _emailService;
    private readonly MamMoiDbContext _context;

    public StaffService(
        IUserRepository userRepository,
        IGardenRepository gardenRepository,
        IGardenMemberRepository gardenMemberRepository,
        IEmailService emailService,
        MamMoiDbContext context)
    {
        _userRepository = userRepository;
        _gardenRepository = gardenRepository;
        _gardenMemberRepository = gardenMemberRepository;
        _emailService = emailService;
        _context = context;
    }

    public async Task<CreateStaffResponseDto> CreateStaffAsync(int gardenId, int farmerId, CreateStaffDto dto)
    {
        // 1. Validate farmer có quyền tạo staff (có ít nhất 1 vườn)
        var (farmerGardens, _) = await _gardenRepository.GetGardensByUserIdAsync(farmerId, 1, 1, null);
        if (!farmerGardens.Any())
            throw new UnauthorizedAccessException("Farmer must have at least one garden to create staff");

        // 2. Check email chưa tồn tại
        var existingUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == dto.Email);

        if (existingUser != null)
            throw new InvalidOperationException($"User with email {dto.Email} already exists");

        // 3. Generate temporary password
        var temporaryPassword = GenerateTemporaryPassword();
        var passwordHash = HashPassword(temporaryPassword);

        // 4. Create new Staff user
        var newStaff = new User
        {
            Email = dto.Email,
            FullName = dto.FullName,
            Phone = dto.Phone,
            Address = dto.Address,
            PasswordHash = passwordHash,
            RoleId = 4, // Staff role
            IsActive = true,
            CreatedAt = DateTime.Now,
            PreferredLanguage = "vi"
        };

        _context.Users.Add(newStaff);
        await _context.SaveChangesAsync();

        // 5. Send email with login credentials
        var farmer = await _context.Users.FindAsync(farmerId);
        var emailSubject = $"[MamMoi] Tài khoản Staff đã được tạo";
        var emailBody = $@"
            <h2>Chào mừng {newStaff.FullName}!</h2>
            <p>Tài khoản Staff của bạn đã được tạo bởi {farmer?.FullName}.</p>
            
            <h3>Thông tin đăng nhập:</h3>
            <p><strong>Email:</strong> {newStaff.Email}</p>
            <p><strong>Mật khẩu tạm thời:</strong> {temporaryPassword}</p>
            
            <p><strong>Lưu ý:</strong> Vui lòng đổi mật khẩu ngay sau khi đăng nhập lần đầu.</p>
            <p>Bạn sẽ được assign vào các vườn cụ thể sau.</p>
            
            <p>Trân trọng,<br/>MamMoi Team</p>
        ";

        await _emailService.SendEmailAsync(newStaff.Email, emailSubject, emailBody);

        return new CreateStaffResponseDto
        {
            StaffId = newStaff.UserId,
            Email = newStaff.Email,
            FullName = newStaff.FullName,
            TemporaryPassword = temporaryPassword,
            Message = $"Staff {newStaff.FullName} đã được tạo thành công. Sử dụng assign-staff API để add vào vườn."
        };
    }

    public async Task<GardenMemberResponseDto> AssignStaffAsync(int gardenId, int staffId, int farmerId)
    {
        // 1. Validate garden exists và farmer là owner
        var garden = await _gardenRepository.GetByIdAsync(gardenId);
        if (garden == null)
            throw new KeyNotFoundException($"Garden with ID {gardenId} not found");

        var isOwner = await _gardenRepository.IsOwnerAsync(gardenId, farmerId);
        if (!isOwner)
            throw new UnauthorizedAccessException("Only garden owner can assign staff");

        // 2. Validate staff exists và là Staff role
        var staff = await _context.Users.FindAsync(staffId);
        if (staff == null)
            throw new KeyNotFoundException($"Staff with ID {staffId} not found");

        if (staff.RoleId != 4) // Staff = 4
            throw new InvalidOperationException("Only Staff users can be assigned to gardens");

        // 2.5. Enable tài khoản nếu inactive
        if (!staff.IsActive)
        {
            staff.IsActive = true;
            _context.Users.Update(staff);
        }

        // 3. Check if garden already has a staff (1 garden = 1 staff rule)
        // Only count Staff role (roleId = 4), not Farmer role (roleId = 3)
        var existingStaffInGarden = await _context.GardenMembers
            .FirstOrDefaultAsync(gm => gm.GardenId == gardenId && gm.RoleId == 4); // Staff role only

        if (existingStaffInGarden != null)
        {
            var existingStaff = await _context.Users.FindAsync(existingStaffInGarden.UserId);
            throw new InvalidOperationException("Garden already has a staff assigned. One garden can only have one staff.");
        }

        // 4. Check if staff is already assigned to another garden
        var staffOtherAssignments = await _context.GardenMembers
            .FirstOrDefaultAsync(gm => gm.UserId == staffId);

        if (staffOtherAssignments != null)
        {
            var otherGarden = await _context.Gardens.FindAsync(staffOtherAssignments.GardenId);
            throw new InvalidOperationException("Staff is already assigned to another garden. One staff can only work in one garden.");
        }

        // 5. Create garden member record
        var gardenMember = new GardenMemberEntity
        {
            GardenId = gardenId,
            UserId = staffId,
            RoleId = 4, // Staff
            Status = "Active",
            CreatedAt = DateTime.Now
        };

        _context.GardenMembers.Add(gardenMember);
        await _context.SaveChangesAsync();

        return new GardenMemberResponseDto
        {
            MemberId = gardenMember.MemberId,
            GardenId = gardenId,
            GardenName = garden.Name,
            UserId = staffId,
            Email = staff.Email,
            FullName = staff.FullName,
            RoleId = 4,
            RoleName = "Staff",
            Status = "Active",
            CreatedAt = gardenMember.CreatedAt,
            InvitedByUserId = farmerId,
            InvitedByName = (await _context.Users.FindAsync(farmerId))?.FullName
        };
    }

    public async Task<bool> RemoveStaffAsync(int gardenId, int staffId, int farmerId)
    {
        // 1. Validate farmer là owner của garden
        var isOwner = await _gardenRepository.IsOwnerAsync(gardenId, farmerId);
        if (!isOwner)
            throw new UnauthorizedAccessException("Only garden owner can remove staff");

        // 2. Find garden member
        var gardenMember = await _context.GardenMembers
            .FirstOrDefaultAsync(gm => gm.GardenId == gardenId && gm.UserId == staffId && gm.Status == "Active");

        if (gardenMember == null)
            throw new KeyNotFoundException("Staff is not actively assigned to this garden");

        // 3. Set inactive thay vì xóa
        gardenMember.Status = "Inactive";
        await _context.SaveChangesAsync();

        // 4. Disable tài khoản user
        var user = await _context.Users.FindAsync(staffId);
        if (user != null)
        {
            user.IsActive = false;
            await _context.SaveChangesAsync();
        }

        return true;
    }

    public async Task<List<GardenMemberResponseDto>> GetGardenMembersAsync(int gardenId)
    {
        var members = await _context.GardenMembers
            .Include(gm => gm.User)
            .Include(gm => gm.Role)
            .Include(gm => gm.Garden)
            .Where(gm => gm.GardenId == gardenId && gm.Status == "Active")
            .OrderByDescending(gm => gm.CreatedAt)
            .ToListAsync();

        return members.Select(gm => new GardenMemberResponseDto
        {
            MemberId = gm.MemberId,
            GardenId = gm.GardenId,
            GardenName = gm.Garden.Name,
            UserId = gm.UserId,
            Email = gm.User?.Email ?? "",
            FullName = gm.User?.FullName,
            RoleId = gm.RoleId,
            RoleName = gm.Role.RoleName,
            Status = gm.Status,
            CreatedAt = gm.CreatedAt,
            InvitedAt = null,
            InvitedByUserId = null,
            InvitedByName = null
        }).ToList();
    }

    public async Task<List<UserDto>> GetInactiveStaffAsync()
    {
        var inactiveStaff = await _context.Users
            .Where(u => u.RoleId == 4 && !u.IsActive) // Staff role = 4, inactive
            .OrderBy(u => u.FullName)
            .ToListAsync();

        return inactiveStaff.Select(u => new UserDto
        {
            Id = Guid.NewGuid(), // Temporary ID for DTO
            Username = u.Email, // Use email as username
            Email = u.Email,
            FullName = u.FullName,
            CreatedAt = u.CreatedAt
        }).ToList();
    }



    /// <summary>
    /// Generate temporary password for new staff
    /// </summary>
    private string GenerateTemporaryPassword()
    {
        const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
        var random = new Random();
        return new string(Enumerable.Repeat(chars, 12)
            .Select(s => s[random.Next(s.Length)]).ToArray());
    }

    /// <summary>
    /// Hash password using SHA256 (same as AuthService)
    /// </summary>
    private byte[] HashPassword(string password)
    {
        using var sha256 = SHA256.Create();
        return sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
    }
}
