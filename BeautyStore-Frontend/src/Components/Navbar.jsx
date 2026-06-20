import { Link } from 'react-router-dom'

const serif = { fontFamily: "'Cormorant Garamond', 'Times New Roman', Georgia, serif" }
const sans = { fontFamily: "'Jost', 'Inter', sans-serif" }

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-20 flex items-center justify-between px-16 py-4 bg-[#FAFAF8] border-b border-[#E8D8D2]">

      <Link to="/" className="flex items-center gap-2 text-2xl font-semibold text-[#2A1F1F] no-underline" style={serif}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C9758A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
        </svg>
        <span>Beauty<span className="text-[#C9758A] italic">Store</span> CR</span>
      </Link>

      <div className="flex items-center gap-8">
        <Link to="/" className="text-xs font-medium tracking-widest text-[#2A1F1F] opacity-70 hover:opacity-100 transition-opacity no-underline uppercase" style={sans}>Inicio</Link>
        <Link to="/catalogo" className="text-xs font-medium tracking-widest text-[#2A1F1F] opacity-70 hover:opacity-100 transition-opacity no-underline uppercase" style={sans}>Catálogo</Link>
        <Link to="/categorias" className="text-xs font-medium tracking-widest text-[#2A1F1F] opacity-70 hover:opacity-100 transition-opacity no-underline uppercase" style={sans}>Categorías</Link>
      </div>

      <div className="flex items-center gap-3">
        <Link to="/login"
          className="px-5 py-2 text-xs font-medium tracking-widest text-[#2A1F1F] border border-[#2A1F1F] hover:bg-[#2A1F1F] hover:text-white transition-all no-underline uppercase"
          style={sans}>
          Iniciar sesión
        </Link>
        <Link to="/registro"
          className="px-5 py-2 text-xs font-medium tracking-widest text-white bg-[#C9758A] hover:bg-[#b5647a] transition-colors no-underline uppercase"
          style={sans}>
          Registrarse
        </Link>
      </div>
    </nav>
  )
}