using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace BeautyStore.Models
{
    public class Categoria
    {
        [Key]
        public int IdCategoria { get; set; }

        public string Nombre { get; set; } = string.Empty;

        public string? Descripcion { get; set; }

        public string? Imagen { get; set; }

        [JsonIgnore]
        public ICollection<Producto>? Productos { get; set; }
    }
}
