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

        [Authorize]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetPagos()
        {
            var pagos = await _context.Pagos
                .Include(p => p.Pedido)
                .Select(p => new
                {
                    idPago = p.IdPago,
                    idPedido = p.IdPedido,
                    idUsuario = p.Pedido != null ? p.Pedido.IdUsuario : 0,
                    monto = p.Monto,
                    fechaPago = p.FechaPago,
                    estado = p.Pedido != null ? p.Pedido.Estado : "Desconocido"
                })
                .ToListAsync();

            return Ok(pagos);
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
        public async Task<ActionResult<Pago>> PostPago([FromBody] Pago pago)
        {
            pago.FechaPago = DateTime.Now;
            _context.Pagos.Add(pago);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetPago), new { id = pago.IdPago }, pago);
        }

        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> PutPago(int id, Pago pago)
        {
            if (id != pago.IdPago) return BadRequest();

            var pagoExistente = await _context.Pagos
                .Include(p => p.Pedido)
                .FirstOrDefaultAsync(p => p.IdPago == id);

            if (pagoExistente == null) return NotFound();

            pagoExistente.Monto = pago.Monto;
            pagoExistente.Estado = pago.Estado;
            pagoExistente.MetodoPago = pago.MetodoPago;
            pagoExistente.FechaPago = pago.FechaPago;

            if (pagoExistente.Pedido != null)
            {
                pagoExistente.Pedido.Estado = pago.Estado;
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                return BadRequest("Error de concurrencia al actualizar.");
            }

            return NoContent();
        }

        // 4. DELETE
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

        [Authorize]
        [HttpPost("procesar")]
        public async Task<IActionResult> ProcesarPago([FromBody] PagoRequest request)
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdString == null) return Unauthorized();
            int userId = int.Parse(userIdString);

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
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
                        return BadRequest(new { mensaje = "Stock insuficiente." });
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

                var nuevoPago = new Pago
                {
                    IdPedido = pedido.IdPedido,
                    Monto = request.Monto,
                    FechaPago = DateTime.Now,
                    Estado = "Pagado",
                    MetodoPago = "Tarjeta"
                };
                _context.Pagos.Add(nuevoPago);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { mensaje = "Éxito", idPedido = pedido.IdPedido });
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                return StatusCode(500);
            }
            }
    }
}