namespace UniStock.Dtos;

public class ItemDto
{
    public Guid Id { get; set; }
    public Guid InventoryId { get; set; }
    public string CustomId { get; set; } = null!;
    public Guid CreatedById { get; set; }
    public List<ItemValueDto> FieldValues { get; set; } = new();
}

public class ItemValueDto
{
    public Guid FieldId { get; set; }
    public string Value { get; set; } = "";
}