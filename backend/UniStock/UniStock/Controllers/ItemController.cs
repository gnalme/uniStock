using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using UniStock.Data;
using UniStock.Dtos;
using UniStock.Models;

namespace UniStock.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ItemController : ControllerBase
{
    private readonly AppDbContext _context;

    public ItemController(AppDbContext context)
    {
        _context = context;
    }

    private Guid GetCurrentUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet("{inventoryId}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetItems(Guid inventoryId)
    {
        var items = await _context.Items
            .Include(i => i.CreatedBy)
            .Include(i => i.FieldValues).ThenInclude(v => v.Field)
            .Where(i => i.InventoryId == inventoryId)
            .ToListAsync();

        return Ok(items.Select(i => new
        {
            i.Id,
            i.CustomId,
            i.CreatedAt,
            CreatedByName = i.CreatedBy.UserName,
            FieldValues = i.FieldValues.Select(v => new { v.FieldId, v.Value })
        }));
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> AddItem([FromBody] CreateItemDto dto)
    {
        var item = new Item
        {
            InventoryId = dto.InventoryId,
            CustomId = string.IsNullOrWhiteSpace(dto.CustomId) 
                ? Guid.NewGuid().ToString("N") 
                : dto.CustomId,
            CreatedById = GetCurrentUserId()
        };

        foreach (var fv in dto.FieldValues)
        {
            item.FieldValues.Add(new ItemValue
            {
                FieldId = fv.FieldId,
                Value = fv.Value
            });
        }

        _context.Items.Add(item);
        await _context.SaveChangesAsync();

        var result = new ItemDto
        {
            Id = item.Id,
            CreatedById = item.CreatedById,
            CustomId = item.CustomId,
            InventoryId = item.InventoryId,
            FieldValues = item.FieldValues
                .Select(f => new ItemValueDto
                {
                    FieldId = f.FieldId,
                    Value = f.Value
                }).ToList()
        };

        return Ok(result);
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> UpdateItem(Guid id, [FromBody] UpdateItemDto dto)
    {
        var item = await _context.Items.Include(i => i.FieldValues).FirstOrDefaultAsync(i => i.Id == id);
        if (item == null) return NotFound();

        if (!string.IsNullOrEmpty(dto.CustomId))
            item.CustomId = dto.CustomId;

        if (dto.FieldValues != null)
        {
            foreach (var fv in dto.FieldValues)
            {
                var existing = item.FieldValues.FirstOrDefault(v => v.FieldId == fv.FieldId);
                if (existing != null)
                    existing.Value = fv.Value;
                else
                    item.FieldValues.Add(new ItemValue { FieldId = fv.FieldId, Value = fv.Value });
            }
        }

        await _context.SaveChangesAsync();
        return Ok(item);
    }
    
    [HttpPost("delete")]
    [Authorize]
    public async Task<IActionResult> Delete([FromBody] Guid[]? ids)
    {
        if (ids == null || ids.Length == 0) return BadRequest();
        
        var currentUserId = GetCurrentUserId();

        if (IsAdmin())
        {
            var allItemsDel = await _context.Items
                .Where(i => ids.Contains(i.Id))
                .ToListAsync();
            
            _context.Items.RemoveRange(allItemsDel);
            await _context.SaveChangesAsync();
            return Ok();
        }
        
        var itemsToDelete = await _context.Items
            .Include(i => i.Inventory)
            .Where(i => ids.Contains(i.Id) && (i.CreatedById == currentUserId || i.Inventory.OwnerId == currentUserId))
            .ToListAsync();
        
        if(itemsToDelete.Count != ids.Length) return BadRequest();
        
        _context.Items.RemoveRange(itemsToDelete);
        await _context.SaveChangesAsync();
        
        return Ok(new { message = "Deleted" });
    }
    
    private bool IsAdmin() =>
        User.Claims.Any(c => c is { Type: ClaimTypes.Role, Value: "Admin" });
    
}
