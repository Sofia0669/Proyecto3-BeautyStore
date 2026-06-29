import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CartSidebar from './CartSidebar';

const serif = { fontFamily: "'Cormorant Garamond', 'Times New Roman', Georgia, serif" }
const sans = { fontFamily: "'Jost', 'Inter', sans-serif" }

export default function Navbar() {
    const [isCartOpen, setIsCartOpen] = useState(false);
    const navigate = useNavigate();
    const [token, setToken] = useState(null);

    useEffect(() => {
        setToken(localStorage.getItem("token"));
    }, []);

    const isLoggedIn = !!token;

    const logout = () => {
        localStorage.removeItem("token");
        setToken(null);
        localStorage.removeItem("rol");
        localStorage.removeItem("idUsuario");
        localStorage.removeItem("nombre");
        localStorage.removeItem("correo");
        navigate("/login");
    };

    return (
        <>
            <nav className="sticky top-0 z-20 flex items-center justify-between px-8 md:px-16 py-4 bg-[#FAFAF8] border-b border-[#E8D8D2] backdrop-blur-md bg-opacity-95">

                {/* LOGO - Elegante con serif */}
                <Link to="/" className="text-2xl font-semibold text-[#2A1F1F] tracking-wide no-underline transition-opacity duration-300 hover:opacity-80" style={serif}>
                    Beauty<span className="text-[#C9758A] italic font-normal">Store</span> <span className="text-xs tracking-widest text-[#8A7A75] ml-1">CR</span>
                </Link>

                {/* MENU PRINCIPAL */}
                <div className="flex items-center gap-8">
                    <Link 
                        to="/" 
                        className="text-xs font-medium tracking-widest text-[#2A1F1F] uppercase no-underline transition-colors duration-300 hover:text-[#C9758A]" 
                        style={sans}
                    >
                        Inicio
                    </Link>
                    
                    <Link 
                        to="/catalogo" 
                        className="text-xs font-medium tracking-widest text-[#2A1F1F] uppercase no-underline transition-colors duration-300 hover:text-[#C9758A]" 
                        style={sans}
                    >
                        Catálogo
                    </Link>

                    {/* BOTÓN CARRITO - Minimalista sin emoji */}
                    <button 
                        onClick={() => setIsCartOpen(true)}
                        className="text-xs font-medium tracking-widest text-[#2A1F1F] uppercase bg-transparent border-none cursor-pointer flex items-center gap-2 transition-colors duration-300 hover:text-[#C9758A]"
                        style={sans}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.625.625 0 1 1-1.25 0 .625.625 0 0 1 1.25 0Zm7.5 0a.625.625 0 1 1-1.25 0 .625.625 0 0 1 1.25 0Z" />
                        </svg>
                        <span>Carrito</span>
                    </button>
                </div>

                {/* 🔐 AUTENTICACIÓN - Botones con diseño de sutil delineado */}
                <div style={sans}>
                    {isLoggedIn ? (
                        <button 
                            onClick={logout}
                            className="text-xs font-medium tracking-widest text-[#8A7A75] uppercase bg-transparent border border-[#E8D8D2] px-4 py-2 rounded-none transition-all duration-300 hover:bg-[#2A1F1F] hover:text-white hover:border-[#2A1F1F]"
                        >
                            Cerrar sesión
                        </button>
                    ) : (
                        <Link 
                            to="/login"
                            className="text-xs font-medium tracking-widest text-[#2A1F1F] uppercase bg-transparent border border-[#2A1F1F] px-4 py-2 rounded-none no-underline inline-block transition-all duration-300 hover:bg-[#2A1F1F] hover:text-white"
                        >
                            Iniciar sesión
                        </Link>
                    )}
                </div>

            </nav>

            <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </>
    );
}