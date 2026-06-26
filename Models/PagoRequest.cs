using System.Collections.Generic;

namespace BeautyStore.Models
{
    public class PagoRequest
    {
        public decimal Monto { get; set; }

        public List<CarritoItem> Carrito { get; set; } = new();
    }

    public class CarritoItem
    {
        public int IdProducto { get; set; }

        public int Cantidad { get; set; }
    }
}