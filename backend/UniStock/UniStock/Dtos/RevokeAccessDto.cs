namespace UniStock.Dtos;

public class RevokeAccessDto
{
    public Guid InventoryId { get; set; }
    public Guid UserId { get; set; }
}