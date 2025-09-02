using Microsoft.EntityFrameworkCore;
using UniStock.Models;

namespace UniStock.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
    
    public DbSet<User> Users => Set<User>();
    public DbSet<Inventory> Inventories => Set<Inventory>();
    public DbSet<InventoryField> InventoryFields => Set<InventoryField>();
    public DbSet<InventoryAccess> InventoryAccesses => Set<InventoryAccess>();
    public DbSet<Item> Items => Set<Item>();
    public DbSet<ItemValue> ItemValues => Set<ItemValue>();
    
    public DbSet<CustomFields> CustomFields => Set<CustomFields>();
    public DbSet<Comment> Comments => Set<Comment>();
    public DbSet<InventoryLike> InventoryLikes => Set<InventoryLike>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();
        
        modelBuilder.Entity<User>()
            .HasIndex(u => u.UserName)
            .IsUnique();
        
        modelBuilder.Entity<Item>()
            .HasIndex(i => new {i.CustomId, i.InventoryId})
            .IsUnique();
        
        modelBuilder.Entity<InventoryField>()
            .HasIndex(f => new { f.InventoryId, f.Name })
            .IsUnique();

        modelBuilder.Entity<InventoryAccess>()
            .HasIndex(a => new { a.InventoryId, a.UserId })
            .IsUnique();
        
        modelBuilder.Entity<InventoryLike>()
            .HasIndex(l => new { l.InventoryId, l.UserId })
            .IsUnique();
    }
}