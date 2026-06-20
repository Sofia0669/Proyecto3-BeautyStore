using BeautyStore.Data;
using BeautyStore.Models;
using BeautyStore.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BeautyStore.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly BeautyStoreContext _context;
        private readonly TokenService _tokenService;
        private readonly IConfiguration _config;

        public AuthController(
            BeautyStoreContext context,
            TokenService tokenService,
            IConfiguration config)
        {
            _context = context;
            _tokenService = tokenService;
            _config = config;
        }

        [AllowAnonymous]
        [HttpPost("login")]
        public IActionResult Login(
            [FromBody] LoginDTO login)
        {
            var usuario = _context.Usuarios
                .FirstOrDefault(u =>
                    u.Correo == login.Correo &&
                    u.Password == login.Password);

            if (usuario == null)
            {
                return Unauthorized(
                    "Credenciales inválidas");
            }

            var token = _tokenService
                .GenerateToken(usuario, _config);

            return Ok(new { token });
        }

        [AllowAnonymous]
        [HttpPost("registro")]
        public IActionResult Registro([FromBody] Usuario usuario)
        {
            if (string.IsNullOrWhiteSpace(usuario.Correo) ||
                string.IsNullOrWhiteSpace(usuario.Password) ||
                string.IsNullOrWhiteSpace(usuario.Nombre))
            {
                return BadRequest("Nombre, correo y contraseña son obligatorios.");
            }

            var existeCorreo = _context.Usuarios
                .Any(u => u.Correo == usuario.Correo);

            if (existeCorreo)
            {
                return Conflict("El correo ya está registrado.");
            }

            usuario.Rol = "Usuario";
            _context.Usuarios.Add(usuario);
            _context.SaveChanges();

            return Ok(new { mensaje = "Cuenta creada correctamente." });
        }

        [Authorize]
        [HttpGet("datos-seguros")]
        public IActionResult GetDatos()
        {
            return Ok(
                "Este endpoint está protegido con JWT");
        }

        [AllowAnonymous]
        [HttpGet("publico")]
        public IActionResult GetPublico()
        {
            return Ok(
                "Este endpoint es público");
        }
    }
}