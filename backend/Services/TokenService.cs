using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using MamMoi.Models;

namespace MamMoi.Services
{
    public class TokenService
    {
        private readonly string _key;
        private readonly string _issuer;
        private readonly string _audience;

        public TokenService(IConfiguration config)
        {
            _key = config["Jwt:Key"] ?? throw new Exception("JWT Key not configured in appsettings.json");
            _issuer = config["Jwt:Issuer"] ?? "MamMoiApp";
            _audience = config["Jwt:Audience"] ?? "MamMoiUsers";
        }

        /// <summary>
        /// Create a JWT token for a given user and role.
        /// </summary>
        public string CreateToken(User user)
        {
            if (user == null)
                throw new ArgumentNullException(nameof(user));

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new Claim(ClaimTypes.Name, user.FullName ?? ""),
                new Claim(ClaimTypes.Email, user.Email ?? ""),
                new Claim(ClaimTypes.Role, user.Role?.Name ?? "User")
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_key));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _issuer,
                audience: _audience,
                claims: claims,
                expires: DateTime.UtcNow.AddHours(8),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
