namespace UniStock.Models;

public class Comment
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid InventoryId { get; set; }
    public string Text { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Guid UserId { get; set; }
    public User User { get; set; }
}