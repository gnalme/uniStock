using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using UniStock.Data;
using UniStock.Dtos;
using UniStock.Models;

namespace UniStock.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InventoriesController : ControllerBase
{
    private readonly AppDbContext _context;

    public InventoriesController(AppDbContext context)
    {
        _context = context;
    }

    // private Guid GetCurrentUserId()
    // {
    //     var idClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
    //     return idClaim != null ? Guid.Parse(idClaim) : Guid.Empty;
    // }
    private Guid GetCurrentUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    private bool IsAdmin() =>
        User.Claims.Any(c => c is { Type: ClaimTypes.Role, Value: "Admin" });
    
    private bool CanEditInventory(Inventory inv, Guid currentUserId)
    {
        if (currentUserId == Guid.Empty) return false; 
        return inv.OwnerId == currentUserId ||
               inv.IsPublicWritable ||
               inv.AccessList.Any(a => a.UserId == currentUserId) ||
               IsAdmin();
    }

    private bool CanDeleteInventory(Inventory inv, Guid currentUserId)
    {
        if (currentUserId == Guid.Empty) return false;
        return inv.OwnerId == currentUserId || IsAdmin();
    }

    [HttpGet]
    [AllowAnonymous]
    public IActionResult GetAll()
    {
        var currentUserId = User.Identity?.IsAuthenticated == true ? GetCurrentUserId() : Guid.Empty;
        var isAdmin = User.Identity?.IsAuthenticated == true && IsAdmin();
        
        var inventories = _context.Inventories
            .Include(i => i.Owner)
            .Select(i => new
            {
                i.Id,
                i.Title,
                i.Description,
                i.Category,
                i.IsPublicWritable,
                i.OwnerId,
                OwnerName = i.Owner.UserName,
                ItemsCount = i.Items.Count,
                LikesCount = i.Likes.Count, 
                UserHasLiked = currentUserId != Guid.Empty && i.Likes.Any(l => l.UserId == currentUserId),
                CanEdit = (currentUserId != Guid.Empty && 
                           (i.OwnerId == currentUserId || i.IsPublicWritable || i.AccessList.Any(a => a.UserId == currentUserId))) || isAdmin,
                CanDelete = (currentUserId != Guid.Empty && i.OwnerId == currentUserId) || isAdmin
            }).ToList();

        return Ok(inventories);
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public IActionResult GetById(Guid id)
    {
        var currentUserId = GetCurrentUserId();

        var inventory = _context.Inventories
            .Include(i => i.Owner)
            .Include(i => i.Items)
            .Include(i => i.AccessList)
            .Include(i => i.Likes)
            .ThenInclude(a => a.User)
            .FirstOrDefault(i => i.Id == id);

        if (inventory == null) return NotFound();

        var canEdit = currentUserId != Guid.Empty && 
                      (inventory.OwnerId == currentUserId ||
                       inventory.AccessList.Any(a => a.UserId == currentUserId) ||
                       inventory.IsPublicWritable ||
                       IsAdmin());

        var canDelete = currentUserId != Guid.Empty && 
                        (inventory.OwnerId == currentUserId || IsAdmin());

        var canManage = currentUserId != Guid.Empty &&
                        (inventory.OwnerId == currentUserId || IsAdmin());

        return Ok(new
        {
            inventory.Id,
            inventory.Title,
            inventory.Description,
            inventory.Category,
            inventory.IsPublicWritable,
            inventory.OwnerId,
            OwnerName = inventory.Owner.UserName,
            Items = inventory.Items.Select(it => new { it.Id, it.CustomId }),
            LikesCount = inventory.Likes.Count, 
            UserHasLiked = currentUserId != Guid.Empty && inventory.Likes.Any(l => l.UserId == currentUserId),
            CanEdit = canEdit,
            CanManage = canManage,
            CanDelete = canDelete
        });
    }
    
    [HttpGet("my")]
    public async Task<IActionResult> GetMyInventories()
    {
        var userId = GetCurrentUserId();
        var invs = await _context.Inventories
            .Where(i => i.OwnerId == userId)
            .ToListAsync();
        return Ok(invs);
    }

    [HttpGet("with-access")]
    public async Task<IActionResult> GetAccessibleInventories()
    {
        var userId = GetCurrentUserId();
        var invs = await _context.Inventories
            .Where(i => i.IsPublicWritable || 
                        _context.InventoryAccesses.Any(a => a.InventoryId == i.Id && a.UserId == userId))
            .ToListAsync();

        return Ok(invs);
    }


    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create([FromBody] CreateInventoryDto dto)
    {
        var currentUserId = GetCurrentUserId();

        var inventory = new Inventory
        {
            Title = dto.Title,
            Description = dto.Description,
            Category = dto.Category,
            IsPublicWritable = dto.IsPublicWritable,
            OwnerId = currentUserId
        };

        _context.Inventories.Add(inventory);
        await _context.SaveChangesAsync();

        return Ok(inventory);
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateInventoryDto dto)
    {
        var currentUserId = GetCurrentUserId();
        var inventory = _context.Inventories
            .Include(inventory => inventory.AccessList)
            .FirstOrDefault(i => i.Id == id);
        
        if (inventory == null) return NotFound();

        if (!CanEditInventory(inventory, currentUserId))
            return Forbid();
        
        if (dto.RowVersion != null)
        {
            _context.Entry(inventory).Property("RowVersion").OriginalValue = dto.RowVersion;
        }

        inventory.Title = dto.Title ?? inventory.Title;
        inventory.Description = dto.Description ?? inventory.Description;
        inventory.Category = dto.Category ?? inventory.Category;
        
        if (dto.IsPublicWritable.HasValue)
            inventory.IsPublicWritable = dto.IsPublicWritable.Value;
        try
        {
            await _context.SaveChangesAsync();
            return Ok(inventory);
        }
        catch (DbUpdateConcurrencyException)
        {
            return Conflict(new
            {
                message = "Inventory was modified by another user. Please reload."
            });
        }
    }
    
    [HttpPost("bulk-delete")]
    [Authorize]
    public async Task<IActionResult> BulkDelete([FromBody] Guid[] ids)
    {
        var currentUserId = GetCurrentUserId();

        var inventories = _context.Inventories
            .Include(i => i.AccessList)
            .Where(i => ids.Contains(i.Id))
            .ToList();

        if (!inventories.Any())
            return NotFound(new { message = "No inventories found" });

        var deletable = inventories
            .Where(inv => CanDeleteInventory(inv, currentUserId))
            .ToList();

        if (!deletable.Any())
            return Forbid();

        _context.Inventories.RemoveRange(deletable);
        await _context.SaveChangesAsync();

        return Ok(new { message = $"Deleted {deletable.Count} inventories" });
    }


    [HttpGet("search")]
    [AllowAnonymous]
    public IActionResult Search([FromQuery] string query)
    {
        if (string.IsNullOrEmpty(query)) return Ok(new List<object>());

        var inventories = _context.Inventories
            .Where(i => i.Title.ToLower().Contains(query))
            .Select(i => new
            {
                i.Id,
                i.Title,
                i.Description,
                i.Category,
                OwnerName = i.Owner.UserName
            }).ToList();
        
        return Ok(inventories);
    }

    [HttpPost("{id}/like")]
    [Authorize]
    public async Task<IActionResult> ToogleLike(Guid id)
    {
        var currentUserId = GetCurrentUserId();

        var inventory = await _context.Inventories
            .FirstOrDefaultAsync(i => i.Id == id);
    
        if (inventory == null) return NotFound();

        var existingLike = await _context.InventoryLikes
            .FirstOrDefaultAsync(l => l.InventoryId == id && l.UserId == currentUserId);

        if (existingLike != null)
        {
            _context.InventoryLikes.Remove(existingLike);
        }
        else
        {
            _context.InventoryLikes.Add(new InventoryLike { InventoryId = id, UserId = currentUserId });
        }

        await _context.SaveChangesAsync(); 

        var updatedLikesCount = await _context.InventoryLikes.CountAsync(l => l.InventoryId == id);
    
        return Ok(new { liked = existingLike == null, likesCount = updatedLikesCount });
    }
}

    
