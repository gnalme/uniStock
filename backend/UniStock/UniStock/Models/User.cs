using System.ComponentModel.DataAnnotations;

namespace UniStock.Models;

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    [Required]
    public string UserName { get; set; } = null!;
    
    [Required, EmailAddress]
    public string? Email { get; set; }
    [Required]
    public string? PasswordHash { get; set; }

    public bool IsAdmin { get; set; } = false;
    public bool IsBlocked { get; set; } = false;
    public bool IsDeleted { get; set; } = false;
    
    public Guid? PasswordResetToken { get; set; }
    
    public DateTime? TokenExpiration { get; set; }
    
    public ICollection<Inventory> OwnedInventories { get; set; } = new List<Inventory>();
    public ICollection<InventoryAccess> InventoryAccesses { get; set; } = new List<InventoryAccess>();

}