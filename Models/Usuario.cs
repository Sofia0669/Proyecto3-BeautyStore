using System.ComponentModel.DataAnnotations;

namespace BeautyStore.Models
{
    public class Usuario
    {
        [Key]
        public int IdUsuario { get; set; }

        public string Nombre { get; set; } = string.Empty;

        public string Correo { get; set; } = string.Empty;

        public string Password { get; set; } = string.Empty;

        public string Rol { get; set; } = "Usuario";
    }
}
