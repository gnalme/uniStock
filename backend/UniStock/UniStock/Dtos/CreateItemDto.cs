namespace UniStock.Dtos;

public class FieldValueDto
{
    public Guid FieldId { get; set; }
    public string Value { get; set; } = string.Empty;
}

public class CreateItemDto
{
    public Guid InventoryId { get; set; }
    public string CustomId { get; set; } = string.Empty;
    public List<FieldValueDto> FieldValues { get; set; } = new();
}