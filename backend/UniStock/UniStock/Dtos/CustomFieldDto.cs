using UniStock.Models;

namespace UniStock.Dtos;

public class CustomFieldDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = "";
    public string? Description { get; set; }
    public string Type { get; set; }
    public bool ShowInTable { get; set; }
    public int Order { get; set; }
}

public class CreateCustomFieldDto
{
    public Guid InventoryId { get; set; }
    public string Title { get; set; } = "";
    public string? Description { get; set; }
    public FieldType Type { get; set; }
    public bool ShowInTable { get; set; }
    public int Order { get; set; }
}

