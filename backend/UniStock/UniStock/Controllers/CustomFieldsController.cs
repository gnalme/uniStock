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
public class CustomFieldController : ControllerBase
{
    private readonly AppDbContext _context;

    public CustomFieldController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("{inventoryId}")]
    public async Task<IActionResult> GetFields(Guid inventoryId)
    {
        var inventoryExists = await _context.Inventories
            .AnyAsync(i => i.Id == inventoryId);

        if (!inventoryExists)
            return NotFound(new { message = "Inventory not found" });

        var fields = await _context.CustomFields
            .Where(f => f.InventoryId == inventoryId)
            .OrderBy(f => f.Order)
            .Select(f => new CustomFieldDto
            {
                Id = f.Id,
                Title = f.Title,
                Description = f.Description,
                Type = f.Type.ToString(),
                ShowInTable = f.ShowInTable
            })
            .ToListAsync();

        return Ok(fields);
    }

    [HttpPost]
    public async Task<IActionResult> CreateField([FromBody] CreateCustomFieldDto dto)
    {
        var inventory = await _context.Inventories
            .FirstOrDefaultAsync(i => i.Id == dto.InventoryId);

        if (inventory == null)
            return NotFound(new { message = "Inventory not found" });
        
        var count = await _context.CustomFields
            .Where(f => f.InventoryId == dto.InventoryId && f.Type == dto.Type)
            .CountAsync();

        if (count >= 3)
        {
            return BadRequest(new { message = $"You cannot add more than 3 fields of type {dto.Type}" });
        }

        var field = new CustomFields()
        {
            Id = Guid.NewGuid(),
            InventoryId = dto.InventoryId,
            Title = dto.Title,
            Description = dto.Description,
            Type = dto.Type,
            ShowInTable = dto.ShowInTable,
            Order = dto.Order
        };

        _context.CustomFields.Add(field);
        await _context.SaveChangesAsync();

        return Ok(new CustomFieldDto
        {
            Id = field.Id,
            Title = field.Title,
            Description = field.Description,
            Type = field.Type.ToString(),
            ShowInTable = field.ShowInTable
        });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteField(Guid id)
    {
        var field = await _context.CustomFields.FindAsync(id);
        if (field == null)
            return NotFound(new { message = "Field not found" });

        _context.CustomFields.Remove(field);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}

