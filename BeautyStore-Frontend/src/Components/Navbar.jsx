import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CartSidebar from './CartSidebar';

export default function Navbar() {
    const [isCartOpen, setIsCartOpen] = useState(false);
    const navigate = useNavigate();

    // 🔐 estado de login
    const [token, setToken] = useState(null);

    // 🔄 cargar token al iniciar
    useEffect(() => {
        setToken(localStorage.getItem("token"));
    }, []);

    const isLoggedIn = !!token;

    // 🚪 logout
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
            <nav className="sticky top-0 z-20 flex items-center justify-between px-16 py-4 bg-[#FAFAF8] border-b border-[#E8D8D2]">

                {/* LOGO */}
                <Link to="/" className="text-2xl font-semibold">
                    BeautyStore CR
                </Link>

                {/* MENU */}
                <div className="flex items-center gap-8">
                    <Link to="/">Inicio</Link>
                    <Link to="/catalogo">Catálogo</Link>

                    <button onClick={() => setIsCartOpen(true)}>
                        🛒 Carrito
                    </button>
                </div>

                {/* 🔐 LOGIN / LOGOUT */}
                <div>
                    {isLoggedIn ? (
                        <button onClick={logout}>
                            Cerrar sesión
                        </button>
                    ) : (
                        <Link to="/login">
                            Iniciar sesión
                        </Link>
                    )}
                </div>

            </nav>

            <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </>
    );
}