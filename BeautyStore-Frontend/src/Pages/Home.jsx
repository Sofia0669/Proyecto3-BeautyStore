import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Swal from 'sweetalert2' // ✦ Importamos SweetAlert2

const serif = { fontFamily: "'Cormorant Garamond', 'Times New Roman', Georgia, serif" }
const sans = { fontFamily: "'Jost', 'Inter', sans-serif" }

const categorias = [
  { nombre: 'Maquillaje', idCat: 1, img: '/img/Paleta de Sombras Nude.jpg' },
  { nombre: 'Cuidado Facial', idCat: 2, img: '/img/Serum Ácido Hialurónico.webp' },
  { nombre: 'Cabello', idCat: 3, img: '/img/Aceite de Argán Reparador.jpg' },
  { nombre: 'Perfumes', idCat: 4, img: '/img/Eau de Parfum Floral.webp' },
]

export default function Home() {
  const [productosDestacados, setProductosDestacados] = useState([])
  const [cargando, setCargando] = useState(true)
  const { addToCart } = useCart()

  useEffect(() => {
    const obtenerDestacados = async () => {
      try {
        const response = await fetch('http://localhost:5090/api/Productos')
        if (response.ok) {
          const data = await response.json()
          setProductosDestacados(data.slice(0, 3))
        }
      } catch (error) {
        console.error("Error al conectar con la API en Home:", error)
      } finally {
        setCargando(false)
      }
    }
    obtenerDestacados()
  }, [])

  // ✦ Función manejadora de agregar con validación de login y alerta
  const manejarAgregarAlCarrito = (producto) => {
    const token = localStorage.getItem('token'); // O la lógica que uses para verificar sesión

    if (!token) {
      Swal.fire({
        title: '¡Atención!',
        text: 'Debes iniciar sesión para poder agregar productos al carrito.',
        icon: 'warning',
        confirmButtonColor: '#2A1F1F',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    // Si está logueado, lo agrega
    addToCart({
      id: producto.idProducto,
      nombre: producto.nombre,
      precio: producto.precio,
      imagen: producto.imagen
    });

    // Alerta tipo Toast elegante en la esquina
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
    });

    Toast.fire({
      icon: 'success',
      title: 'Producto añadido al carrito'
    });
  };

  const obtenerNombreCategoria = (id) => {
    if (id === 1) return 'Maquillaje'
    if (id === 2) return 'Cuidado Facial'
    if (id === 3) return 'Cabello'
    return 'Perfumes'
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#2A1F1F]" style={sans}>
      <style>{`
        .hero-img { object-fit: cover; width: 100%; height: 100%; }
        .cat-card:hover .cat-overlay { opacity: 1; }
        .cat-overlay { opacity: 0; transition: opacity 0.3s; }
        .prod-card:hover { transform: translateY(-4px); border-color: #C9758A; }
        .prod-card { transition: transform 0.25s, border-color 0.25s; }
        .btn-agregar { transition: all 0.3s ease; }
        .btn-agregar:hover { background-color: #C9758A; color: white; border-color: #C9758A; }
      `}</style>

      <Navbar />

      <section className="grid grid-cols-1 md:grid-cols-2 min-h-[560px]">
        <div className="flex flex-col justify-center gap-6 px-12 lg:px-16 py-16 bg-[#FAFAF8]">
          <p className="text-xs font-medium tracking-[0.2em] text-[#C4975A] uppercase" style={sans}>
            ✦ Tu Tienda de Belleza Real
          </p>
          <h1 className="text-5xl lg:text-6xl font-semibold leading-[1.1] m-0 text-[#2A1F1F]" style={serif}>
            Tu belleza,<br />
            <em className="text-[#C9758A]">elevada</em> al arte.
          </h1>
          <p className="text-base text-[#6B4E4E] leading-relaxed max-w-sm font-light" style={sans}>
            Cosméticos de alta calidad seleccionados para realzar tu esencia natural. Entrega inmediata en todo el país.
          </p>
          <div className="flex gap-3 mt-2">
            <Link to="/catalogo"
              className="px-7 py-3 text-sm font-medium tracking-wide text-white bg-[#2A1F1F] hover:bg-[#C9758A] transition-colors no-underline"
              style={{ letterSpacing: '0.08em' }}>
              EXPLORAR CATÁLOGO
            </Link>
          </div>
        </div>

        <div className="relative overflow-hidden bg-[#F2E8E4]">
          <img
            src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1000&q=80"
            alt="Cosméticos Premium de Lujo"
            className="hero-img"
          />
          <div className="absolute bottom-8 left-8 bg-white/90 backdrop-blur-sm px-5 py-4 max-w-[240px] border border-[#E8D8D2]">
            <p className="text-[10px] text-[#C4975A] font-medium tracking-widest uppercase mb-1" style={sans}>Destacado de Hoy</p>
            <p className="text-base font-semibold text-[#2A1F1F] leading-snug m-0" style={serif}>Colección Profesional</p>
            <p className="text-xs text-[#6B4E4E] font-light mt-1" style={sans}>Productos 100% Auténticos</p>
          </div>
        </div>
      </section>

      {/* Cinta métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 border-t border-b border-[#E8D8D2] bg-[#2A1F1F]">
        {[
          { n: '24', l: 'Productos Exclusivos' },
          { n: '100%', l: 'Garantía de Calidad' },
          { n: 'CR', l: 'Envíos a todo el país' },
          { n: 'Envío', l: 'Gratis en compras +₡30k' },
        ].map((s) => (
          <div key={s.l} className="text-center py-6 border-r border-white/10 last:border-0">
            <div className="text-xl lg:text-2xl font-semibold text-[#C9758A]" style={serif}>{s.n}</div>
            <div className="text-[11px] text-white/60 font-light mt-1 tracking-wide" style={sans}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Categorías */}
      <section className="px-8 lg:px-16 py-16">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs tracking-[0.18em] text-[#C4975A] uppercase mb-2" style={sans}>Explorar por</p>
            <h2 className="text-4xl font-semibold text-[#2A1F1F] m-0" style={serif}>Categorías</h2>
          </div>
          <Link to="/catalogo" className="text-sm text-[#C9758A] underline underline-offset-4 font-medium" style={sans}>
            Ver todas →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categorias.map((cat) => (
            <Link to="/catalogo" key={cat.nombre}
              className="cat-card relative overflow-hidden block no-underline group" style={{ height: '280px' }}>
              <img
                src={cat.img}
                alt={cat.nombre}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300?text=Beauty+Store'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="cat-overlay absolute inset-0 bg-[#C9758A]/10" />
              <div className="absolute bottom-4 left-4 text-white">
                <div className="text-xl font-semibold leading-tight" style={serif}>{cat.nombre}</div>
                <div className="text-xs font-light opacity-80 mt-1" style={sans}>Ver Colección✦</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Productos Destacados */}
      <section className="px-8 lg:px-16 py-16 bg-[#F7F2EF]">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs tracking-[0.18em] text-[#C4975A] uppercase mb-2" style={sans}>Selección especial</p>
            <h2 className="text-4xl font-semibold text-[#2A1F1F] m-0" style={serif}>Productos destacados</h2>
          </div>
          <Link to="/catalogo" className="text-sm text-[#C9758A] underline underline-offset-4 font-medium" style={sans}>
            Ver catálogo completo →
          </Link>
        </div>

        {cargando ? (
          <div className="text-center py-12 text-[#6B4E4E] font-light">Cargando destacados desde la base de datos...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {productosDestacados.map((p) => (
              <div key={p.idProducto} className="prod-card bg-white border border-[#E8D8D2] flex flex-col h-full overflow-hidden cursor-pointer">
                <div className="relative overflow-hidden" style={{ aspectRatio: '4/5' }}>
                  <img
                    src={p.imagen || 'https://via.placeholder.com/400x500?text=Sin+Imagen'}
                    alt={p.nombre}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/400x500?text=Error+Imagen'; }}
                  />
                </div>
                <div className="p-5 flex flex-col flex-grow">
                  <div className="text-[10px] font-medium text-[#C4975A] uppercase tracking-widest mb-1" style={sans}>
                    {obtenerNombreCategoria(p.idCategoria)}
                  </div>
                  <div className="text-lg font-semibold text-[#2A1F1F] mb-1" style={serif}>{p.nombre}</div>
                  <div className="text-sm text-[#6B4E4E] leading-relaxed mb-4 font-light line-clamp-2 flex-grow" style={sans}>
                    {p.descripcion}
                  </div>
                  <div className="flex items-center justify-between border-t border-[#E8D8D2] pt-4 mt-auto">
                    <span className="text-xl font-semibold text-[#2A1F1F]" style={serif}>
                      ₡{p.precio.toLocaleString()}
                    </span>
                    <button
                      onClick={() => manejarAgregarAlCarrito(p)} // ✦ Usamos el manejador con validación
                      className="btn-agregar px-4 py-2 border border-[#2A1F1F] bg-transparent text-[#2A1F1F] text-xs font-medium tracking-widest"
                      style={sans}
                    >
                      AGREGAR
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Banner Oferta */}
      <section className="relative overflow-hidden" style={{ height: '380px' }}>
        <img
          src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1400&q=85"
          alt="Cosméticos de lujo ordenados"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#2A1F1F]/60 flex flex-col items-center justify-center gap-4 text-center px-8">
          <p className="text-xs tracking-[0.25em] text-[#C4975A] uppercase" style={sans}>Oferta especial</p>
          <h2 className="text-4xl md:text-5xl font-semibold text-white m-0 leading-tight" style={serif}>
            10% de descuento<br />en tu primera compra
          </h2>
          <p className="text-white/70 text-base font-light max-w-md" style={sans}>
            Regístrate ahora y empieza a disfrutar de la verdadera alta cosmética en Costa Rica.
          </p>
          <Link to="/registro"
            className="mt-2 px-8 py-3 bg-[#C9758A] text-white text-sm font-medium tracking-widest hover:bg-[#b5647a] transition-colors no-underline"
            style={sans}>
            REGISTRARME AHORA
          </Link>
        </div>
      </section>

      {/* Quiénes somos */}
      <section className="px-8 lg:px-16 py-16">
        <div className="text-center mb-12">
          <p className="text-xs tracking-[0.18em] text-[#C4975A] uppercase mb-2" style={sans}>Nuestra razón de ser</p>
          <h2 className="text-4xl font-semibold text-[#2A1F1F] m-0" style={serif}>Quiénes somos</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <img
            src="https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=700&q=80"
            alt="Mesa de maquillaje y cosméticos profesionales"
            className="w-full object-cover border border-[#E8D8D2]"
            style={{ height: '360px' }}
          />
          <div className="flex flex-col gap-8">
            <div className="border-l-2 border-[#C9758A] pl-6">
              <div className="text-xs font-medium tracking-[0.18em] text-[#C4975A] uppercase mb-2" style={sans}>Misión</div>
              <h3 className="text-2xl font-semibold text-[#2A1F1F] mb-3" style={serif}>Belleza accesible para todas</h3>
              <p className="text-sm text-[#6B4E4E] leading-relaxed font-light" style={sans}>
                Ofrecer una experiencia de compra sencilla, segura y satisfactoria, con productos de calidad que resalten la belleza natural de nuestras clientas — a un precio justo y con entrega rápida.
              </p>
            </div>
            <div className="border-l-2 border-[#C4975A] pl-6">
              <div className="text-xs font-medium tracking-[0.18em] text-[#C4975A] uppercase mb-2" style={sans}>Visión</div>
              <h3 className="text-2xl font-semibold text-[#2A1F1F] mb-3" style={serif}>Tu destino de confianza</h3>
              <p className="text-sm text-[#6B4E4E] leading-relaxed font-light" style={sans}>
                Convertirnos en la tienda preferida de cosmética y cuidado personal, reconocida por nuestra variedad, excelente servicio al cliente y autenticidad en cada producto entregado.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}