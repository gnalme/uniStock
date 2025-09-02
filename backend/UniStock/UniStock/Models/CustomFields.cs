using System.ComponentModel.DataAnnotations;

namespace UniStock.Models;


public class CustomFields
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid InventoryId { get; set; }
    public Inventory Inventory { get; set; } = null!;

    [Required]
    public string Title { get; set; } = null!;

    public string? Description { get; set; }

    [Required]
    public FieldType Type { get; set; }

    public bool ShowInTable { get; set; } = false;

    public int Order { get; set; } 

    public ICollection<ItemValue> Values { get; set; } = new List<ItemValue>();
}

