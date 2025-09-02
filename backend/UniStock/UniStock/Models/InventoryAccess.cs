using System.ComponentModel.DataAnnotations;

namespace UniStock.Models;

public class InventoryAccess
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    public Guid InventoryId { get; set; }
    public Inventory Inventory { get; set; } = null!;

    [Required]
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
}