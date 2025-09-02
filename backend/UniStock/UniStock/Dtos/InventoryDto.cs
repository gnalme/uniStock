namespace UniStock.Dtos;

public class InventoryDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public string? Category { get; set; }
    public bool IsPublicWritable { get; set; }
    public Guid OwnerId { get; set; }
    public string OwnerName { get; set; } = null!;
    public int ItemsCount { get; set; }
    public int CustomFieldsCount { get; set; }
}