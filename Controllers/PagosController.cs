using BeautyStore.Data;
using BeautyStore.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BeautyStore.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PagosController : ControllerBase
    {
        private readonly BeautyStoreContext _context;

        public PagosController(BeautyStoreContext context)
        {
            _context = context;
        }

        [Authorize]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Pago>>> GetPagos()
        {
            return await _context.Pagos.ToListAsync();
        }

        [Authorize]
        [HttpGet("{id}")]
        public async Task<ActionResult<Pago>> GetPago(int id)
        {
            var pago = await _context.Pagos.FindAsync(id);

            if (pago == null)
            {
                return NotFound();
            }

            return pago;
        }

        [Authorize]
        [HttpPost]
        public async Task<ActionResult<Pago>> PostPago(Pago pago)
        {
            _context.Pagos.Add(pago);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetPago),
                new { id = pago.IdPago },
                pago);
        }

        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> PutPago(int id, Pago pago)
        {
            if (id != pago.IdPago)
            {
                return BadRequest();
            }

            _context.Entry(pago).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Pagos.Any(e => e.IdPago == id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePago(int id)
        {
            var pago = await _context.Pagos.FindAsync(id);

            if (pago == null)
            {
                return NotFound();
            }

            _context.Pagos.Remove(pago);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // --- PASARELA DE PAGOS PROFESIONAL ---
       [Authorize]
[HttpPost("procesar")]
public async Task<IActionResult> ProcesarPago([FromBody] PagoRequest request)
{
    // 1. Validación de tarjeta (Simulación)
    if (string.IsNullOrEmpty(request.NumeroTarjeta) || request.NumeroTarjeta.StartsWith("0000"))
    {
        return BadRequest(new { mensaje = "Transacción rechazada: Verifique los datos de su tarjeta." });
    }

    // 2. Validación de Stock y actualización
    foreach (var item in request.Carrito)
    {
        var producto = await _context.Productos.FindAsync(item.IdProducto);
        
        if (producto == null)
            return NotFound(new { mensaje = $"Producto {item.IdProducto} no encontrado." });

        if (producto.Stock < item.Cantidad)
            return BadRequest(new { mensaje = $"Stock insuficiente para: {producto.Nombre}" });

        // Restamos el stock
        producto.Stock -= item.Cantidad;
    }

    // 3. Crear el objeto Pago
    var nuevoPago = new Pago
    {
        Monto = request.Monto,
        FechaPago = DateTime.Now,
        MetodoPago = "Tarjeta de Crédito"
    };

    _context.Pagos.Add(nuevoPago);
    await _context.SaveChangesAsync();

    return Ok(new { 
        mensaje = "¡Pago procesado con éxito!", 
        idTransaccion = nuevoPago.IdPago 
    });
}

// --- DTOs Actualizados ---
public class PagoRequest 
{
    public decimal Monto { get; set; }
    public string NumeroTarjeta { get; set; } = string.Empty;
    public List<DetalleCarrito> Carrito { get; set; } = new List<DetalleCarrito>();
}

public class DetalleCarrito 
{
    public int IdProducto { get; set; }
    public int Cantidad { get; set; }
}
    }
}