using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using UniStock.Data;
using UniStock.Dtos;
using UniStock.Hubs;
using UniStock.Models;

namespace UniStock.Controllers;

[Route("api/[controller]")]
[ApiController]
public class CommentsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IHubContext<CommentsHub> _hubContext;

    public CommentsController(AppDbContext context, IHubContext<CommentsHub> hubContext)
    {
        _context = context;
        _hubContext = hubContext;
    }

    [HttpGet("{inventoryId}")]
    public async Task<IActionResult> GetComments(Guid inventoryId)
    {
        var comment = await _context.Comments
            .Where(c => c.InventoryId == inventoryId)
            .Include(u => u.User)
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new
            {
                c.Id,
                c.Text,
                c.CreatedAt,
                UserName = c.User.UserName
            }).ToListAsync();
        
        return Ok(comment);
    }
    
    [HttpPost]
    public async Task<IActionResult> AddComment([FromBody] CreateCommentDto dto)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var comment = new Comment
        {
            InventoryId = dto.InventoryId,
            Text = dto.Text,
            UserId = userId
        };

        _context.Comments.Add(comment);
        await _context.SaveChangesAsync();

        var result = new {
            comment.Id,
            comment.Text,
            comment.CreatedAt,
            UserName = User.Identity.Name
        };

        await _hubContext.Clients.Group(dto.InventoryId.ToString()).SendAsync("ReceiveComment", result);

        return Ok(result);
    }
}