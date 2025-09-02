using System.ComponentModel.DataAnnotations;

public class CreateInventoryDto
{
    [Required]
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public string? Category { get; set; }
    public bool IsPublicWritable { get; set; } = false;
}


