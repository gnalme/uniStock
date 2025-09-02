using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UniStock.Data;

namespace UniStock.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    
    private readonly AppDbContext _context;

    public AdminController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("users")]
    public IActionResult Users()
    {
        var users = _context.Users
            .Where(u => !u.IsDeleted)
            .Select(u => new
            {
                u.Id,
                u.UserName,
                u.Email,
                u.IsBlocked,
                u.IsDeleted,
                u.IsAdmin,
            }).ToList();
        
        return Ok(users);
    }

    [HttpPost("block")]
    public async Task<IActionResult> Block([FromForm] Guid[] ids)
    {
        var users = _context.Users.Where(u => ids.Contains(u.Id)).ToList();
        if (!users.Any()) return NotFound(new { message = "No users found" });

        var currentUserId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
        bool blockingSelf = users.Any(u => u.Id == currentUserId);

        foreach (var u in users)
            u.IsBlocked = true;
    
        await _context.SaveChangesAsync();

        if (blockingSelf)
        {
            await HttpContext.SignOutAsync(); 
            return Ok(new { 
                message = "Blocked", 
                logoutSelf = true 
            });
        }
    
        return Ok(new { message = "Blocked" });
    }

    [HttpPost("unblock")]
    public async Task<IActionResult> Unblock([FromForm] Guid[] ids)
    {
        var user = _context.Users.Where(u => ids.Contains(u.Id)).ToList();
        if (!user.Any()) return NotFound(new { message = "No users found" });
        
        user.ForEach(u => u.IsBlocked = false);
        await _context.SaveChangesAsync();
        return Ok(new { message = "Unblocked" });
    }

    [HttpPost("delete")]
    public async Task<IActionResult> Delete([FromForm] Guid[] ids)
    {
        var user = _context.Users.Where(u => ids.Contains(u.Id)).ToList();
        if (!user.Any()) return NotFound(new { message = "No users found" });
        
        _context.Users.RemoveRange(user);
        await _context.SaveChangesAsync();
        
        return Ok(new { message = "Deleted" });
    }

    [HttpPost("makeadmin")]
    public async Task<IActionResult> MakeAdmin([FromForm] Guid[] ids)
    {
        var user = _context.Users.Where(u => ids.Contains(u.Id)).ToList();
        if (!user.Any()) return NotFound(new { message = "No users found" });
        
        user.ForEach(u => u.IsAdmin = true);
        await _context.SaveChangesAsync();
        
        return Ok(new { message = "Admin rights granted" });
    }

    [HttpPost("unmakeadmin")]
    public async Task<IActionResult> UnmakeAdmin([FromForm] Guid[] ids)
    {
        var getCurrentId = GetCurrentUserId();
        
        var user = _context.Users.Where(u => ids.Contains(u.Id)).ToList();
        if (!user.Any()) return NotFound(new { message = "No users found" });
        
        bool forceLogout = ids.Contains(getCurrentId);
        
        user.ForEach(u => u.IsAdmin = false);
        await _context.SaveChangesAsync();
        return Ok(new { message = "Admin rights removed", logoutSelf = forceLogout });
    }

    private Guid GetCurrentUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}