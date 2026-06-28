namespace BeautyStore.Models
{
    public class CaptureOrderRequest
    {
        public string OrderID { get; set; } = string.Empty;

        // ← Agregar esto para recibir el carrito junto con la captura
        public List<CarritoItem> Carrito { get; set; } = new();
    }
}