namespace UniStock.Dtos;

public class UpdateItemDto
{
    public string? CustomId { get; set; }
    public List<FieldValueDto>? FieldValues { get; set; }
}