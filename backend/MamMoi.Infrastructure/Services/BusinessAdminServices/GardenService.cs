using MamMoi.Application.DTOs.BusinessAdminDto;
using MamMoi.Application.Interfaces;
using Microsoft.EntityFrameworkCore;
using MamMoi.Infrastructure.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MamMoi.Infrastructure.Services.BusinessAdminServices
{
    public class GardenService : IGardenService
    {
        private readonly CapstoneDbContext _context;

        public GardenService(CapstoneDbContext context)
        {
            _context = context;
        }

        // ... (Hàm AddMemberToGardenAsync - "Clear" (Đúng) 100%) ...
        public async Task<GardenMemberDto?> AddMemberToGardenAsync(int gardenId, GardenMemberAddDto dto)
        {
            var isAlreadyMember = await _context.GardenMembers
                .AnyAsync(m => m.GardenId == gardenId && m.UserId == dto.UserId);
            if (isAlreadyMember) return null;

            var newMember = new GardenMember
            {
                GardenId = gardenId,
                UserId = dto.UserId,
                RoleId = dto.RoleId,
                JoinedAt = DateTime.Now
            };
            _context.GardenMembers.Add(newMember);
            await _context.SaveChangesAsync();

            return await GetMemberByMemberIdAsync(newMember.MemberId);
        }

        public async Task<IEnumerable<GardenMemberDto>> GetMembersInGardenAsync(int gardenId)
        {
            var membersRaw = await _context.GardenMembers
                .Include(m => m.User)
                .Include(m => m.Role)
                .Where(m => m.GardenId == gardenId)
                .AsNoTracking()
                .ToListAsync(); 

            return membersRaw.Select(m => MapToDto(m));
        }

        public async Task<bool> RemoveMemberFromGardenAsync(int gardenId, int userId)
        {
            var member = await _context.GardenMembers
                .FirstOrDefaultAsync(m => m.GardenId == gardenId && m.UserId == userId);
            if (member == null) return false;
            _context.GardenMembers.Remove(member);
            await _context.SaveChangesAsync();
            return true;
        }

        private async Task<GardenMemberDto?> GetMemberByMemberIdAsync(int memberId)
        {
            var member = await _context.GardenMembers
                .Include(m => m.User)
                .Include(m => m.Role)
                .AsNoTracking()
                .FirstOrDefaultAsync(m => m.MemberId == memberId);

            return member == null ? null : MapToDto(member);

        }

        private GardenMemberDto MapToDto(GardenMember m)
        {
            return new GardenMemberDto
            {
                MemberId = m.MemberId,
                GardenId = m.GardenId,
                UserId = m.UserId,
                UserFullName = m.User?.FullName ?? "N/A",
                UserEmail = m.User?.Email ?? "N/A",
                RoleId = m.RoleId,
                RoleName = m.Role?.RoleName ?? "N/A",
                JoinedAt = m.JoinedAt
            };
        }
    }
}
