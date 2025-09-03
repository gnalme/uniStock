using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCrypt.Net;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authentication.OAuth;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using UniStock.Data;
using UniStock.Dtos;
using UniStock.Models;

namespace UniStock.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AccountController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _config;

    public AccountController(AppDbContext context, IConfiguration config)
    {
        _context = context;
        _config = config;
    }

    [HttpPost("register")]
    public IActionResult Register([FromBody] RegisterDto model)
    {
        if (_context.Users.Any(u => u.Email == model.Email))
            return BadRequest(new { message = "Email already exists" });

        var user = new User
        {
            UserName = model.UserName,
            Email = model.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(model.Password),
            IsAdmin = false, 
            IsBlocked = false
        };

        _context.Users.Add(user);
        _context.SaveChanges();

        return Ok(new { message = "User registered successfully" });
    }

    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginDto model)
    {
        var user = _context.Users.FirstOrDefault(u => u.Email == model.Email);

        if (user == null)
            return Unauthorized(new { message = "Invalid email or password" });
        

        if (!BCrypt.Net.BCrypt.Verify(model.Password, user.PasswordHash))
            return Unauthorized(new { message = "Invalid password" });

        if (user.IsBlocked)
            return Unauthorized(new { message = "User is blocked" });

        var token = GenerateJwtToken(user);

        return Ok(new
        {
            token,
            isAdmin = user.IsAdmin,
            userName = user.UserName
        });
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetMe()
    {
        var userId = GetCurrentUserId();
        
        var user = await _context.Users.FindAsync(userId);
        
        if(user == null) return Unauthorized(new { message = "Not found" });

        return Ok(new
        {
            id=user.Id,
            userName=user.UserName,
            email=user.Email,
        });
    }

    [HttpPut("update")]
    public async Task<IActionResult> UpdateMe([FromBody] UpdateUserDto model)
    {
        var userId = GetCurrentUserId();
        
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return Unauthorized(new { message = "Not found" });
        
        user.Email = model.Email;
        user.UserName = model.Username;

        await _context.SaveChangesAsync();
        
        return Ok(new { message = "User updated successfully" });
    }
    
     /*[HttpGet("login-google")]
     public IActionResult LoginGoogle()
    {
        var redirectUrl = Url.Action(nameof(GoogleCallback), "account");
        var properties = new AuthenticationProperties { RedirectUri = redirectUrl };
        return Challenge(properties, GoogleDefaults.AuthenticationScheme);
    }
    
    [HttpGet("login-github")]
    public IActionResult LoginGitHub()
    {
        var redirectUrl = Url.Action(nameof(GitHubCallback), "account");
        var properties = new AuthenticationProperties { RedirectUri = redirectUrl };
        return Challenge(properties, "GitHub");
    }
    
    [HttpGet("google-callback")]
    public async Task<IActionResult> GoogleCallback()
    {
        var authenticateResult = await HttpContext.AuthenticateAsync(GoogleDefaults.AuthenticationScheme);
        if (!authenticateResult.Succeeded)
            return BadRequest(new { message = "Google authentication failed" });
    
        var email = authenticateResult.Principal.FindFirstValue(ClaimTypes.Email);
        var name = authenticateResult.Principal.FindFirstValue(ClaimTypes.Name);
    
        return await HandleSocialLogin(email, name);
    }
    
    [HttpGet("github-callback")]
    public async Task<IActionResult> GitHubCallback()
    {
        var authenticateResult = await HttpContext.AuthenticateAsync("GitHub");
        if (!authenticateResult.Succeeded)
            return BadRequest(new { message = "GitHub authentication failed" });
    
        var email = authenticateResult.Principal.FindFirstValue(ClaimTypes.Email);
        var name = authenticateResult.Principal.FindFirstValue(ClaimTypes.Name);
    
        return await HandleSocialLogin(email, name);
    }
    
    private async Task<IActionResult> HandleSocialLogin(string? email, string? name)
    {
        if (string.IsNullOrEmpty(email))
        {
            return BadRequest(new { message = "Email claim is missing" });
        }

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null)
        {
            user = new User
            {
                UserName = name,
                Email = email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString()), 
                IsAdmin = false,
                IsBlocked = false
            };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
        }

        if (user.IsBlocked)
            return Unauthorized(new { message = "User is blocked" });

        var token = GenerateJwtToken(user);

        Response.Cookies.Append("socialToken", token);
    
        var redirectUrl = $"http://localhost:5173/social-login-success?token={token}&isAdmin={user.IsAdmin}&userId={user.Id}";
        return Redirect(redirectUrl);
    }*/
    
    private string GenerateJwtToken(User user)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Name, user.UserName),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.Role, user.IsAdmin ? "Admin" : "User")
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"] ?? string.Empty));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(3),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
    
    private Guid GetCurrentUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}
