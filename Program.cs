using BeautyStore.Data;
using BeautyStore.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Security.Claims;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Base de datos
builder.Services.AddDbContext<BeautyStoreContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Servicio JWT
builder.Services.AddScoped<TokenService>();

// JWT Authentication
builder.Services.AddAuthentication("Bearer")
    .AddJwtBearer("Bearer", options =>
    {
        var jwtConfig = builder.Configuration.GetSection("Jwt");

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtConfig["Issuer"],
            ValidAudience = jwtConfig["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtConfig["Key"]!)),
            RoleClaimType = ClaimTypes.Role
        };

        options.Events = new JwtBearerEvents
        {
            OnAuthenticationFailed = context =>
            {
                Console.WriteLine($"Error de Autenticación: {context.Exception.Message}");
                return Task.CompletedTask;
            }
        };
    });

// Authorization
builder.Services.AddAuthorization();

// Controladores
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
});

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactPolicy", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Apply migrations automatically
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<BeautyStoreContext>();
    db.Database.Migrate();
    // Seed inicial: categorías y productos de ejemplo
    if (!db.Categorias.Any() && !db.Productos.Any())
    {
        var catMaquillaje = new BeautyStore.Models.Categoria { Nombre = "Maquillaje", Descripcion = "Cosméticos para maquillaje" };
        var catFacial = new BeautyStore.Models.Categoria { Nombre = "Cuidado Facial", Descripcion = "Productos para la piel" };
        var catCabello = new BeautyStore.Models.Categoria { Nombre = "Cabello", Descripcion = "Cuidado y styling" };

        db.Categorias.AddRange(catMaquillaje, catFacial, catCabello);
        db.SaveChanges();

        var productos = new[] {
            new BeautyStore.Models.Producto { Nombre = "Labial Mate Terciopelo", Descripcion = "Larga duración", Precio = 4900m, Stock = 25, Imagen = null, IdCategoria = catMaquillaje.IdCategoria },
            new BeautyStore.Models.Producto { Nombre = "Protector Solar SPF 50", Descripcion = "Textura ligera", Precio = 8500m, Stock = 40, Imagen = null, IdCategoria = catFacial.IdCategoria },
            new BeautyStore.Models.Producto { Nombre = "Base Líquida Natural", Descripcion = "Cobertura media", Precio = 12000m, Stock = 18, Imagen = null, IdCategoria = catMaquillaje.IdCategoria },
            new BeautyStore.Models.Producto { Nombre = "Shampoo Hidratante", Descripcion = "Cabello sedoso", Precio = 7200m, Stock = 30, Imagen = null, IdCategoria = catCabello.IdCategoria }
        };

        db.Productos.AddRange(productos);
        db.SaveChanges();
    }
}

// Swagger
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseHttpsRedirection();

app.UseCors("ReactPolicy");

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.Run();