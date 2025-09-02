using System.ComponentModel.DataAnnotations;

namespace UniStock.Models;

public class ItemValue
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid ItemId { get; set; }
    public Item Item { get; set; } = null!;

    [Required]
    public Guid FieldId { get; set; }
    public CustomFields Field { get; set; } = null!;

    [Required]
    public string Value { get; set; } = "";
}