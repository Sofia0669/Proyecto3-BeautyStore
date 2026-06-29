using BeautyStore.Data;
using BeautyStore.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

[ApiController]
[Route("api/paypal")]
public class PayPalController : ControllerBase
{
    private readonly PayPalService _paypalService;
    private readonly BeautyStoreContext _context;

    // ✅ Inyectar el contexto por DI, no instanciar PayPalService a mano
    public PayPalController(PayPalService paypalService, BeautyStoreContext context)
    {
        _paypalService = paypalService;
        _context = context;
    }

    // 1️⃣ Frontend llama esto primero → obtiene el orderId de PayPal
    [Authorize]
    [HttpPost("create-order")]
    public async Task<IActionResult> CreateOrder([FromBody] PagoRequest data)
    {
        var orderId = await _paypalService.CreateOrder(data.Monto);
        return Ok(new { id = orderId });
    }

    // 2️⃣ Frontend llama esto después de que el usuario aprueba en PayPal
    [Authorize]
    [HttpPost("capture-order")]
    public async Task<IActionResult> CaptureOrder([FromBody] CaptureOrderRequest data)
    {
        // Obtener usuario del JWT
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdString == null) return Unauthorized();
        int userId = int.Parse(userIdString);

        // Capturar el pago en PayPal
        var result = await _paypalService.CaptureOrder(data.OrderID);

        if (result.Status != "COMPLETED")
            return BadRequest(new { mensaje = "El pago no fue aprobado por PayPal." });

        // Obtener el monto real que PayPal capturó
        var montoCapturado = decimal.Parse(
            result.PurchaseUnits[0].Payments.Captures[0].Amount.Value,
            System.Globalization.CultureInfo.InvariantCulture
        );

        // Guardar todo en BD dentro de una transacción
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            // Crear el Pedido
            var pedido = new Pedido
            {
                IdUsuario = userId,
                FechaPedido = DateTime.Now,
                Total = montoCapturado,
                Estado = "Pagado"
            };
            _context.Pedidos.Add(pedido);
            await _context.SaveChangesAsync(); // Necesario para obtener IdPedido

            // Crear los DetallePedido y descontar stock
            foreach (var item in data.Carrito)
            {
                var producto = await _context.Productos.FindAsync(item.IdProducto);
                if (producto == null || producto.Stock < item.Cantidad)
                {
                    await transaction.RollbackAsync();
                    return BadRequest(new { mensaje = $"Stock insuficiente para producto {item.IdProducto}." });
                }

                producto.Stock -= item.Cantidad;

                _context.DetallesPedido.Add(new DetallePedido
                {
                    IdPedido = pedido.IdPedido,
                    IdProducto = item.IdProducto,
                    Cantidad = item.Cantidad,
                    PrecioUnitario = producto.Precio
                });
            }

            // Crear el Pago vinculado al Pedido Y a PayPal
            var pago = new Pago
            {
                IdPedido = pedido.IdPedido,
                Monto = montoCapturado,
                FechaPago = DateTime.Now,
                Estado = "Pagado",
                MetodoPago = "PayPal",
                PaypalOrderId = data.OrderID
            };

            _context.Pagos.Add(pago);

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return Ok(new
            {
                mensaje = "Pago procesado correctamente.",
                idPago = pago.IdPago,
                idPedido = pedido.IdPedido,
                idUsuario = userId,
                monto = pago.Monto,
                fechaPago = pago.FechaPago,
                metodoPago = pago.MetodoPago,
                estado = pago.Estado,
                paypalOrderId = data.OrderID,
                status = result.Status
            });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, new { mensaje = "Error interno.", detalle = ex.Message });
        }
    }
}