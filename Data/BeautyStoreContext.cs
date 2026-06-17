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
    }
}