using System.ComponentModel.DataAnnotations;

namespace UniStock.Models;

public class Inventory
{
    public Guid Id { get; set; } = Guid.NewGuid();
    [Required]
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public string? Category { get; set; } 
    public bool IsPublicWritable { get; set; } = false;
    
    [Timestamp]
    public byte[] RowVersion { get; set; } = null!;

    [Required]
    public Guid OwnerId { get; set; }
    public User Owner { get; set; } = null!;
    
    public ICollection<Item> Items { get; set; } = new List<Item>();
    public ICollection<InventoryAccess> AccessList { get; set; } = new List<InventoryAccess>();
    public ICollection<CustomFields> CustomFields { get; set; } = new List<CustomFields>();
    public ICollection<InventoryLike> Likes { get; set; } = new List<InventoryLike>();

}