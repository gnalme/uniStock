using System.ComponentModel.DataAnnotations;

namespace UniStock.Models;

public enum FieldType
{
    SingleLineText,
    MultiLineText,
    Number,
    DocumentOrImage,
    Boolean
}

public class InventoryField
{
    public Guid Id { get; set; } = Guid.NewGuid();
    [Required]
    public string Name { get; set; } = null!;
    public string? Description { get; set; }

    [Required]
    public FieldType Type { get; set; }
    public bool ShowInTable { get; set; } = false;

    [Required]
    public Guid InventoryId { get; set; }
    public Inventory Inventory { get; set; } = null!;
}