using MamMoi.Application.DTOs.BusinessAdmin;
using MamMoi.Application.Interfaces;
using MamMoi.Infrastructure.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using GardenMemberEntity = MamMoi.Infrastructure.Models.GardenMember;

namespace MamMoi.Infrastructure.Services.BusinessAdmin
{
    public class GardenManagerService : IGardenManagerService
    {
        private readonly MamMoiDbContext _context;

        public GardenManagerService(MamMoiDbContext context)
        {
            _context = context;
        }

        // CREATE (Assign)
        public async Task<GardenMemberDto?> AddMemberToGardenAsync(int gardenId, GardenMemberAddDto dto)
        {
            // Check tồn tại
            var isAlreadyMember = await _context.GardenMembers
                .AnyAsync(m => m.GardenId == gardenId && m.UserId == dto.UserId);

            if (isAlreadyMember) return null;

            var newMember = new GardenMemberEntity
            {
                GardenId = gardenId,  
                UserId = dto.UserId,
                RoleId = dto.RoleId,
                CreatedAt = DateTime.Now,
              
            };

            _context.GardenMembers.Add(newMember);
            await _context.SaveChangesAsync();

            return await GetMemberByMemberIdAsync(newMember.MemberId);
        }

        // READ (Get All)
        public async Task<IEnumerable<GardenMemberDto>> GetMembersInGardenAsync(int gardenId)
        {
            var members = await _context.GardenMembers
                .Include(m => m.User)
                .Include(m => m.Role)
                .Where(m => m.GardenId == gardenId)
                .AsNoTracking()
                .ToListAsync();

            return members.Select(m => MapToDto(m));
        }

        // DELETE (Un-assign)
        public async Task<bool> RemoveMemberFromGardenAsync(int gardenId, int userId)
        {
            var member = await _context.GardenMembers
                .FirstOrDefaultAsync(m => m.GardenId == gardenId && m.UserId == userId);

            if (member == null) return false;

            _context.GardenMembers.Remove(member);
            await _context.SaveChangesAsync();
            return true;
        }

        // === Helper Get 1 ===
        private async Task<GardenMemberDto?> GetMemberByMemberIdAsync(int memberId)
        {
            var member = await _context.GardenMembers
                .Include(m => m.User)
                .Include(m => m.Role)
                .AsNoTracking()
                .FirstOrDefaultAsync(m => m.MemberId == memberId);

            if (member == null) return null;

            return MapToDto(member);
        }

        // === Helper Map ===
        // 🔥 SỬA: Tham số đầu vào là 'GardenMemberEntity'
        private GardenMemberDto MapToDto(GardenMemberEntity m)
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
                JoinedAt = m.CreatedAt
            };
        }
    }
}