import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const categorias = [
  {
    nombre: 'Maquillaje',
    cantidad: 48,
    img: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&q=80',
  },
  {
    nombre: 'Cuidado Facial',
    cantidad: 36,
    img: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&q=80',
  },
  {
    nombre: 'Cabello',
    cantidad: 29,
    img: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400&q=80',
  },
  {
    nombre: 'Perfumes',
    cantidad: 21,
    img: 'https://images.pexels.com/photos/373576/pexels-photo-373576.jpeg',
  },
]

const productos = [
  {
    img: 'https://images.pexels.com/photos/1669888/pexels-photo-1669888.jpeg',
    categoria: 'Maquillaje',
    nombre: 'Labial Mate Terciopelo',
    descripcion: 'Larga duración, 12 horas sin retoque. Fórmula hidratante.',
    precio: 4900,
    badge: 'Popular',
  },
  {
    img: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=500&q=80',
    categoria: 'Cuidado Facial',
    nombre: 'Protector Solar SPF 50',
    descripcion: 'Protección avanzada, textura ligera, sin residuo blanco.',
    precio: 8500,
    badge: null,
  },
  {
    img: 'https://images.pexels.com/photos/4243395/pexels-photo-4243395.jpeg',
    categoria: 'Maquillaje',
    nombre: 'Base Líquida Natural',
    descripcion: 'Cobertura media-alta, acabado natural. 30 tonos disponibles.',
    precio: 12000,
    badge: 'Nuevo',
  },
]
const serif = { fontFamily: "'Cormorant Garamond', 'Times New Roman', Georgia, serif" }
const sans = { fontFamily: "'Jost', 'Inter', sans-serif" }

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#2A1F1F]" style={sans}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Jost:wght@300;400;500;600&display=swap');
        .hero-img { object-fit: cover; width: 100%; height: 100%; }
        .cat-card:hover .cat-overlay { opacity: 1; }
        .cat-overlay { opacity: 0; transition: opacity 0.3s; }
        .prod-card:hover { transform: translateY(-4px); border-color: #C9758A; }
        .prod-card { transition: transform 0.25s, border-color 0.25s; }
      `}</style>

      <Navbar />

      {/* ── HERO ── */}
      <section className="grid grid-cols-2 min-h-[560px]">
        {/* Texto */}
        <div className="flex flex-col justify-center gap-6 px-16 py-16 bg-[#FAFAF8]">
          <p className="text-xs font-medium tracking-[0.2em] text-[#C4975A] uppercase" style={sans}>
            ✦ Nueva colección · Verano 2025
          </p>
          <h1 className="text-6xl font-semibold leading-[1.1] m-0 text-[#2A1F1F]" style={serif}>
            Tu belleza,<br />
            <em className="text-[#C9758A]">elevada</em> al arte.
          </h1>
          <p className="text-base text-[#6B4E4E] leading-relaxed max-w-sm font-light" style={sans}>
            Cosméticos de alta calidad seleccionados para realzar tu esencia natural. Entrega en toda Costa Rica.
          </p>
          <div className="flex gap-3 mt-2">
            <Link to="/catalogo"
              className="px-7 py-3 text-sm font-medium tracking-wide text-white bg-[#2A1F1F] hover:bg-[#C9758A] transition-colors no-underline"
              style={{ letterSpacing: '0.08em' }}>
              EXPLORAR CATÁLOGO
            </Link>
            <Link to="/registro"
              className="px-7 py-3 text-sm font-medium tracking-wide text-[#2A1F1F] border border-[#2A1F1F] hover:bg-[#2A1F1F] hover:text-white transition-all no-underline"
              style={{ letterSpacing: '0.08em' }}>
              CREAR CUENTA
            </Link>
          </div>
        </div>

        {/* Imagen hero */}
        <div className="relative overflow-hidden bg-[#F2E8E4]">
          <img
            src="https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=900&q=85"
            alt="Mujer aplicando cosmético"
            className="hero-img"
            style={{ objectPosition: 'center top' }}
          />
          <div className="absolute bottom-8 left-8 bg-white/90 backdrop-blur-sm px-5 py-4 max-w-[220px]">
            <p className="text-xs text-[#C4975A] font-medium tracking-widest uppercase mb-1" style={sans}>Más vendido</p>
            <p className="text-base font-semibold text-[#2A1F1F] leading-snug" style={serif}>Labial Mate Terciopelo</p>
            <p className="text-sm font-medium text-[#C9758A] mt-1" style={serif}>₡4,900</p>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <div className="grid grid-cols-4 border-t border-b border-[#E8D8D2] bg-[#2A1F1F]">
        {[
          { n: '200+', l: 'Productos disponibles' },
          { n: '15+', l: 'Marcas de confianza' },
          { n: '4.9★', l: 'Calificación promedio' },
          { n: 'Gratis', l: 'Envío en compras +₡30k' },
        ].map((s) => (
          <div key={s.l} className="text-center py-6 border-r border-white/10 last:border-0">
            <div className="text-2xl font-semibold text-[#C9758A]" style={serif}>{s.n}</div>
            <div className="text-xs text-white/60 font-light mt-1 tracking-wide" style={sans}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* ── CATEGORÍAS ── */}
      <section className="px-16 py-16">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs tracking-[0.18em] text-[#C4975A] uppercase mb-2" style={sans}>Explorar por</p>
            <h2 className="text-4xl font-semibold text-[#2A1F1F] m-0" style={serif}>Categorías</h2>
          </div>
          <Link to="/catalogo" className="text-sm text-[#C9758A] underline underline-offset-4 font-medium" style={sans}>
            Ver todas →
          </Link>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {categorias.map((cat) => (
            <Link to="/catalogo" key={cat.nombre}
              className="cat-card relative overflow-hidden block no-underline group" style={{ height: '260px' }}>
              <img src={cat.img} alt={cat.nombre} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="cat-overlay absolute inset-0 bg-[#C9758A]/20" />
              <div className="absolute bottom-4 left-4 text-white">
                <div className="text-lg font-semibold leading-tight" style={serif}>{cat.nombre}</div>
                <div className="text-xs font-light opacity-80 mt-0.5" style={sans}>{cat.cantidad} productos</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── PRODUCTOS DESTACADOS ── */}
      <section className="px-16 py-16 bg-[#F7F2EF]">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs tracking-[0.18em] text-[#C4975A] uppercase mb-2" style={sans}>Selección especial</p>
            <h2 className="text-4xl font-semibold text-[#2A1F1F] m-0" style={serif}>Productos destacados</h2>
          </div>
          <Link to="/catalogo" className="text-sm text-[#C9758A] underline underline-offset-4 font-medium" style={sans}>
            Ver catálogo completo →
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {productos.map((p) => (
            <div key={p.nombre} className="prod-card bg-white border border-[#E8D8D2] overflow-hidden cursor-pointer">
              <div className="relative overflow-hidden" style={{ height: '240px' }}>
                <img src={p.img} alt={p.nombre} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                {p.badge && (
                  <span className="absolute top-3 left-3 bg-[#C9758A] text-white text-xs font-medium px-3 py-1 tracking-wide" style={sans}>
                    {p.badge}
                  </span>
                )}
              </div>
              <div className="p-5">
                <div className="text-xs font-medium text-[#C4975A] uppercase tracking-widest mb-1" style={sans}>{p.categoria}</div>
                <div className="text-lg font-semibold text-[#2A1F1F] mb-1" style={serif}>{p.nombre}</div>
                <div className="text-sm text-[#6B4E4E] leading-relaxed mb-4 font-light" style={sans}>{p.descripcion}</div>
                <div className="flex items-center justify-between border-t border-[#E8D8D2] pt-4">
                  <span className="text-xl font-semibold text-[#2A1F1F]" style={serif}>₡{p.precio.toLocaleString()}</span>
                  <button className="px-4 py-2 bg-[#2A1F1F] text-white text-xs font-medium tracking-widest hover:bg-[#C9758A] transition-colors" style={sans}>
                    AGREGAR
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── BANNER CENTRAL ── */}
      <section className="relative overflow-hidden" style={{ height: '380px' }}>
        <img
          src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1400&q=85"
          alt="Cosméticos de lujo"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#2A1F1F]/55 flex flex-col items-center justify-center gap-5 text-center px-8">
          <p className="text-xs tracking-[0.25em] text-[#C4975A] uppercase" style={sans}>Oferta especial</p>
          <h2 className="text-5xl font-semibold text-white m-0 leading-tight" style={serif}>
            10% de descuento<br />en tu primera compra
          </h2>
          <p className="text-white/70 text-base font-light max-w-md" style={sans}>
            Regístrate ahora y recibe tu cupón de bienvenida al instante
          </p>
          <Link to="/registro"
            className="mt-2 px-8 py-3 bg-[#C9758A] text-white text-sm font-medium tracking-widest hover:bg-[#b5647a] transition-colors no-underline"
            style={sans}>
            REGISTRARME AHORA
          </Link>
        </div>
      </section>

      {/* ── MISIÓN Y VISIÓN ── */}
      <section className="px-16 py-16">
        <div className="text-center mb-12">
          <p className="text-xs tracking-[0.18em] text-[#C4975A] uppercase mb-2" style={sans}>Nuestra razón de ser</p>
          <h2 className="text-4xl font-semibold text-[#2A1F1F] m-0" style={serif}>Quiénes somos</h2>
        </div>
        <div className="grid grid-cols-2 gap-10 items-center">
          <img
            src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=700&q=80"
            alt="Cosméticos premium"
            className="w-full object-cover"
            style={{ height: '360px' }}
          />
          <div className="flex flex-col gap-8">
            <div className="border-l-2 border-[#C9758A] pl-6">
              <div className="text-xs font-medium tracking-[0.18em] text-[#C4975A] uppercase mb-2" style={sans}>Misión</div>
              <h3 className="text-2xl font-semibold text-[#2A1F1F] mb-3" style={serif}>Belleza accesible para todas</h3>
              <p className="text-sm text-[#6B4E4E] leading-relaxed font-light" style={sans}>
                Ofrecer una experiencia de compra sencilla, segura y satisfactoria, con productos de calidad que resalten la belleza natural de nuestras clientas — a un precio justo y con entrega en toda Costa Rica.
              </p>
            </div>
            <div className="border-l-2 border-[#C4975A] pl-6">
              <div className="text-xs font-medium tracking-[0.18em] text-[#C4975A] uppercase mb-2" style={sans}>Visión</div>
              <h3 className="text-2xl font-semibold text-[#2A1F1F] mb-3" style={serif}>La tienda de cosméticos #1 de CR</h3>
              <p className="text-sm text-[#6B4E4E] leading-relaxed font-light" style={sans}>
                Convertirnos en el destino de belleza preferido de las costarricenses, reconocidas por nuestra variedad, calidad de atención y compromiso con el bienestar de cada clienta.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
