using BeautyStore.Data;
using BeautyStore.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System;

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

        // --- CRUD BÁSICO ---

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
            if (pago == null) return NotFound();
            return pago;
        }

        [Authorize]
        [HttpPost]
        public async Task<ActionResult<Pago>> PostPago(Pago pago)
        {
            _context.Pagos.Add(pago);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetPago), new { id = pago.IdPago }, pago);
        }

        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> PutPago(int id, Pago pago)
        {
            if (id != pago.IdPago) return BadRequest();

            _context.Entry(pago).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Pagos.Any(e => e.IdPago == id)) return NotFound();
                throw;
            }

            return NoContent();
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePago(int id)
        {
            var pago = await _context.Pagos.FindAsync(id);
            if (pago == null) return NotFound();

            _context.Pagos.Remove(pago);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // --- PASARELA DE PAGOS ---

        [Authorize]
        [HttpPost("procesar")]
        public async Task<IActionResult> ProcesarPago([FromBody] PagoRequest request)
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdString == null) return Unauthorized();

            int userId = int.Parse(userIdString);

            var hace5Segundos = DateTime.Now.AddSeconds(-5);
            bool hayCompraReciente = await _context.Pedidos
                .AnyAsync(p => p.IdUsuario == userId
                            && p.FechaPedido > hace5Segundos
                            && p.Total == request.Monto);

            if (hayCompraReciente)
            {
                return BadRequest(new { mensaje = "Ya estamos procesando tu compra, espera un momento..." });
            }

            // Iniciamos transacción
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // 1. Crear el Pedido
                var pedido = new Pedido
                {
                    IdUsuario = userId,
                    FechaPedido = DateTime.Now,
                    Total = request.Monto,
                    Estado = "Pagado"
                };
                _context.Pedidos.Add(pedido);
                await _context.SaveChangesAsync();

                foreach (var item in request.Carrito)
                {
                    var producto = await _context.Productos.FindAsync(item.IdProducto);

                    if (producto == null || producto.Stock < item.Cantidad)
                    {
                        await transaction.RollbackAsync();
                        return BadRequest(new { mensaje = $"Error con el producto {item.IdProducto}: Stock insuficiente o no encontrado." });
                    }

                    producto.Stock -= item.Cantidad;

                    var detalle = new DetallePedido
                    {
                        IdPedido = pedido.IdPedido,
                        IdProducto = item.IdProducto,
                        Cantidad = item.Cantidad,
                        PrecioUnitario = producto.Precio
                    };
                    _context.DetallesPedido.Add(detalle);
                }

                var nuevoPago = new Pago
                {
                    IdPedido = pedido.IdPedido,
                    Monto = request.Monto,
                    FechaPago = DateTime.Now,
                    MetodoPago = "Tarjeta de Crédito"
                };
                _context.Pagos.Add(nuevoPago);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new
                {
                    mensaje = "¡Compra procesada con éxito!",
                    idPedido = pedido.IdPedido
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { mensaje = "Error crítico al procesar la compra.", detalle = ex.Message });
            }
        }
    }

    // --- DTOs ---
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