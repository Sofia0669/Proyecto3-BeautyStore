using BeautyStore.Data;
using BeautyStore.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BeautyStore.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DetallePedidoController : ControllerBase
    {
        private readonly BeautyStoreContext _context;

        public DetallePedidoController(BeautyStoreContext context)
        {
            _context = context;
        }

        // GET: api/DetallePedido
        [Authorize]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<DetallePedido>>> GetDetalles()
        {
            return await _context.DetallesPedido
                .Include(d => d.Pedido)
                .Include(d => d.Producto)
                .ToListAsync();
        }

        // GET: api/DetallePedido/5
        [Authorize]
        [HttpGet("{id}")]
        public async Task<ActionResult<DetallePedido>> GetDetalle(int id)
        {
            var detalle = await _context.DetallesPedido
                .Include(d => d.Pedido)
                .Include(d => d.Producto)
                .FirstOrDefaultAsync(d => d.IdDetalle == id);

            if (detalle == null)
            {
                return NotFound();
            }

            return detalle;
        }

        // POST: api/DetallePedido
        [Authorize]
        [HttpPost]
        public async Task<ActionResult<DetallePedido>> PostDetalle(DetallePedido detalle)
        {
            _context.DetallesPedido.Add(detalle);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetDetalle),
                new { id = detalle.IdDetalle },
                detalle);
        }

        // PUT: api/DetallePedido/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutDetalle(int id, DetallePedido detalle)
        {
            if (id != detalle.IdDetalle)
            {
                return BadRequest();
            }

            _context.Entry(detalle).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.DetallesPedido.Any(e => e.IdDetalle == id))
                {
                    return NotFound();
                }

                throw;
            }

            return NoContent();
        }

        // DELETE: api/DetallePedido/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDetalle(int id)
        {
            var detalle = await _context.DetallesPedido.FindAsync(id);

            if (detalle == null)
            {
                return NotFound();
            }

            _context.DetallesPedido.Remove(detalle);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}