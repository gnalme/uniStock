namespace UniStock.Dtos;

public class UpdateInventoryDto
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public string? Category { get; set; }
    public bool? IsPublicWritable { get; set; }
    
    public byte[]? RowVersion { get; set; }
}