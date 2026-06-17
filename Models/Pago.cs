using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace BeautyStore.Models
{
    public class Pago
    {
        [Key]
        public int IdPago { get; set; }

        public int IdPedido { get; set; }

        public string MetodoPago { get; set; } = string.Empty;

        [Column(TypeName = "decimal(10,2)")]
        public decimal Monto { get; set; }

        public DateTime FechaPago { get; set; } = DateTime.Now;

        public string Estado { get; set; } = "Pendiente";

        [JsonIgnore]
        public Pedido? Pedido { get; set; }
    }
}
