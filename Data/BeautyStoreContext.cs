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
    }
}