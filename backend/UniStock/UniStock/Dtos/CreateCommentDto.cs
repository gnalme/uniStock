namespace UniStock.Dtos;

public class CreateCommentDto
{
    public Guid InventoryId { get; set; }
    public string Text { get; set; }
}