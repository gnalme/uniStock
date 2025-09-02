using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UniStock.Data;
using UniStock.Dtos;
using UniStock.Models;

namespace UniStock.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AccessController : ControllerBase
{
    private readonly AppDbContext _context;

    public AccessController(AppDbContext context)
    {
        _context = context;
    }

    
    [HttpGet("{inventoryId}")]
    public async Task<IActionResult> GetAccessList(Guid inventoryId)
    {
        var userId = GetCurrentUserId();

        var inventory = await _context.Inventories
            .Include(i => i.AccessList)
            .ThenInclude(a => a.User)
            .FirstOrDefaultAsync(x => x.Id == inventoryId);

        if (inventory == null) 
            return NotFound(new { message = "Inventory not found" });

        if (inventory.OwnerId != userId && !User.IsInRole("Admin")) 
            return Forbid();

        var accessList = inventory.AccessList
            .Select(a => new
            {
                a.UserId,
                a.User.UserName,
                a.User.Email
            })
            .ToList();

        return Ok(accessList);
    }
    
    [HttpPost("grant")]
    public async Task<IActionResult> GrantAccess([FromBody] GrantAccesDto dto)
    {
        var currentUserId = GetCurrentUserId();

        var inventoryExists = await _context.Inventories
            .AnyAsync(x => x.Id == dto.InventoryId && (x.OwnerId == currentUserId || IsAdmin()));
        if (!inventoryExists)
            return NotFound(new { message = "Inventory not found or no permission" });

        var targetUser = await _context.Users.FirstOrDefaultAsync(x => x.Id == dto.UserId);
        if (targetUser == null)
            return NotFound(new { message = "Target user not found" });

        var alreadyHasAccess = await _context.InventoryAccesses
            .AnyAsync(a => a.InventoryId == dto.InventoryId && a.UserId == dto.UserId);
        if (alreadyHasAccess)
            return BadRequest(new { message = "User already has access" });

        try
        {
            _context.InventoryAccesses.Add(new InventoryAccess
            {
                Id = Guid.NewGuid(),
                UserId = dto.UserId,
                InventoryId = dto.InventoryId
            });

            await _context.SaveChangesAsync();
            return Ok(new { message = "Access granted" });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
            throw;
        }
    }


    [HttpPost("revoke")]
    public async Task<IActionResult> RevokeAccess([FromBody] RevokeAccessDto dto)
    {
        var currentUserId = GetCurrentUserId();

        var inventory = await _context.Inventories
            .Include(i => i.AccessList)
            .FirstOrDefaultAsync(i => i.Id == dto.InventoryId);

        if (inventory == null) 
            return NotFound(new { message = "Inventory not found" });

        if (inventory.OwnerId != currentUserId && !User.IsInRole("Admin"))
            return Forbid();

        var access = inventory.AccessList.FirstOrDefault(a => a.UserId == dto.UserId);
        if (access == null)
            return NotFound(new { message = "User does not have access" });

        _context.InventoryAccesses.Remove(access);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Access revoked" });
    }

    private Guid GetCurrentUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    
    private bool IsAdmin() =>
        User.Claims.Any(c => c is { Type: ClaimTypes.Role, Value: "Admin" });
}
