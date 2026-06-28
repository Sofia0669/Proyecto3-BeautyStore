using BeautyStore.Models;
using Microsoft.AspNetCore.Mvc;
using PayPalCheckoutSdk.Payments;

[ApiController]
[Route("api/paypal")]
public class PayPalController : ControllerBase
{
    private readonly PayPalService _paypalService;

    public PayPalController()
    {
        _paypalService = new PayPalService();
    }

    // 🔵 Crear orden
    [HttpPost("create-order")]
    public async Task<IActionResult> CreateOrder([FromBody] PagoRequest data){
        decimal monto = data.Monto;

        var orderId = await _paypalService.CreateOrder(monto);

        return Ok(new { id = orderId });
    }

    // 🟢 Capturar orden
    [HttpPost("capture-order")]
    public async Task<IActionResult> CaptureOrder([FromBody] CaptureOrderRequest data)
    {
        string orderId = data.OrderID;

        var result = await _paypalService.CaptureOrder(orderId);

        return Ok(new
        {
            idPedido = result.Id,
            status = result.Status
        });
    }
}