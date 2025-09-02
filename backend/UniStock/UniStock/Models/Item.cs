using System.ComponentModel.DataAnnotations;

namespace UniStock.Models;

public class Item
{
    public Guid Id { get; set; } = Guid.NewGuid();
    [Required]
    public string CustomId { get; set; } = null!; 

    [Required]
    public Guid InventoryId { get; set; }
    public Inventory Inventory { get; set; } = null!;

    [Required]
    public Guid CreatedById { get; set; }
    public User CreatedBy { get; set; } = null!;

    [Required]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<ItemValue> FieldValues { get; set; } = new List<ItemValue>();
}

