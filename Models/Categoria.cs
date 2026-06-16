using System.ComponentModel.DataAnnotations;

namespace BeautyStore.Models
{
    public class Categoria
    {
        [Key]
        public int IdCategoria { get; set; }

        public string Nombre { get; set; } = string.Empty;

        public string? Descripcion { get; set; }

        public ICollection<Producto>? Productos { get; set; }
    }
}
