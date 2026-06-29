using BeautyStore.Models;
using Microsoft.EntityFrameworkCore;

namespace BeautyStore.Data
{
    public class BeautyStoreContext : DbContext
    {
        public BeautyStoreContext(
            DbContextOptions<BeautyStoreContext> options)
            : base(options)
        {
        }

        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<Categoria> Categorias { get; set; }
        public DbSet<Producto> Productos { get; set; }
        public DbSet<Pedido> Pedidos { get; set; }
        public DbSet<DetallePedido> DetallesPedido { get; set; }
        public DbSet<Pago> Pagos { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.ConfigureWarnings(w =>
                w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Pedido → Usuario  (FK: IdUsuario)
            modelBuilder.Entity<Pedido>()
                .HasOne(ped => ped.Usuario)
                .WithMany(u => u.Pedidos)
                .HasForeignKey(ped => ped.IdUsuario)
                .OnDelete(DeleteBehavior.Restrict);

            // DetallePedido → Pedido  (FK: IdPedido)
            modelBuilder.Entity<DetallePedido>()
                .HasOne(d => d.Pedido)
                .WithMany(ped => ped.Detalles)
                .HasForeignKey(d => d.IdPedido)
                .OnDelete(DeleteBehavior.Cascade);

            // DetallePedido → Producto  (FK: IdProducto)
            modelBuilder.Entity<DetallePedido>()
                .HasOne(d => d.Producto)
                .WithMany(p => p.Detalles)
                .HasForeignKey(d => d.IdProducto)
                .OnDelete(DeleteBehavior.Restrict);

            // Pago → Pedido  (FK: IdPedido)
            modelBuilder.Entity<Pago>()
                .HasOne(pago => pago.Pedido)
                .WithMany()
                .HasForeignKey(pago => pago.IdPedido)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}