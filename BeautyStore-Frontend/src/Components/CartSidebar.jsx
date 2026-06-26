import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

const serif = { fontFamily: "'Cormorant Garamond', 'Times New Roman', Georgia, serif" }
const sans = { fontFamily: "'Jost', 'Inter', sans-serif" }

export default function CartSidebar({ isOpen, onClose }) {
    const { cart, removeFromCart, total, cambiarCantidad } = useCart();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end" style={sans}>
            {/* Fondo oscuro difuminado */}
            <div className="absolute inset-0 bg-black/45 backdrop-blur-sm transition-opacity duration-300" onClick={onClose}></div>

            {/* Panel Lateral Elegante */}
            <div className="relative w-full max-w-md bg-[#FAFAF8] h-full shadow-2xl p-6 md:p-8 flex flex-col text-[#2A1F1F] border-l border-[#E8D8D2]">

                {/* Encabezado Principal */}
                <div className="flex justify-between items-center pb-5 border-b border-[#E8D8D2] mb-6">
                    <div>
                        <h2 className="text-2xl font-semibold uppercase tracking-wider m-0" style={serif}>Bolsa de Compras</h2>
                        <p className="text-xs text-[#6B4E4E] font-light mt-1 tracking-wide">
                            {cart.reduce((acc, item) => acc + item.cantidad, 0)} artículos seleccionados
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full flex items-center justify-center border border-[#E8D8D2] text-xl font-light hover:border-[#C9758A] hover:text-[#C9758A] transition-colors focus:outline-none"
                    >
                        &times;
                    </button>
                </div>

                {/* Lista de Productos del Carrito */}
                <div className="flex-grow overflow-y-auto pr-1 space-y-4 custom-scrollbar">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col justify-center items-center text-center gap-3 py-12">
                            <span className="text-4xl text-[#C4975A]">✦</span>
                            <p className="text-xl font-medium tracking-wide" style={serif}>Tu bolsa está vacía</p>
                            <p className="text-xs text-[#6B4E4E] font-light max-w-[240px] leading-relaxed">
                                Descubre nuestros productos de alta calidad y añade tus esenciales de belleza.
                            </p>
                            <button
                                onClick={onClose}
                                className="mt-2 px-6 py-2.5 border border-[#2A1F1F] text-xs font-medium tracking-widest uppercase hover:bg-[#2A1F1F] hover:text-white transition-all"
                            >
                                Empezar a comprar
                            </button>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div
                                key={item.id}
                                className="flex gap-4 bg-white p-4 border border-[#E8D8D2] relative transition-all hover:shadow-md hover:border-[#C9758A]/40"
                            >
                                {/* Imagen del Producto Vinculada */}
                                <div className="w-24 h-24 overflow-hidden bg-[#F2E8E4] flex-shrink-0 border border-[#E8D8D2]">
                                    <img
                                        src={item.imagen || '/img/placeholder.jpg'}
                                        alt={item.nombre}
                                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                        onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=Beauty+Store'; }}
                                    />
                                </div>

                                {/* Detalles del Producto */}
                                <div className="flex flex-col flex-grow justify-between pr-4">
                                    <div>
                                        <h3 className="text-base font-semibold leading-tight text-[#2A1F1F] max-w-[180px]" style={serif}>
                                            {item.nombre}
                                        </h3>
                                        <p className="text-xs text-[#C4975A] font-medium mt-1">
                                            ₡{item.precio.toLocaleString()} c/u
                                        </p>
                                    </div>

                                    {/* CONTADOR DE UNIDADES ACTIVO */}
                                    <div className="flex items-center gap-1 mt-3">
                                        <div className="flex items-center border border-[#E8D8D2] bg-[#FAFAF8]">
                                            <button
                                                onClick={() => cambiarCantidad(item.id, item.cantidad - 1)}
                                                className="px-2.5 py-1 text-xs font-medium text-[#6B4E4E] hover:bg-white hover:text-[#C9758A] transition-colors focus:outline-none"
                                                disabled={item.cantidad <= 1}
                                                title="Disminuir cantidad"
                                            >
                                                －
                                            </button>
                                            <span className="px-3 py-1 text-xs font-medium bg-white border-l border-r border-[#E8D8D2] min-w-[28px] text-center">
                                                {item.cantidad}
                                            </span>
                                            <button
                                                onClick={() => cambiarCantidad(item.id, item.cantidad + 1)}
                                                className="px-2.5 py-1 text-xs font-medium text-[#6B4E4E] hover:bg-white hover:text-[#C9758A] transition-colors focus:outline-none"
                                                title="Aumentar cantidad"
                                            >
                                                ＋
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Botón de Eliminación Completa */}
                                <button
                                    onClick={() => removeFromCart(item.id)}
                                    className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors p-1 bg-transparent border-0 cursor-pointer"
                                    title="Eliminar artículo completamente"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                                        <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z" />
                                    </svg>
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Resumen Financiero y Acciones */}
                {cart.length > 0 && (
                    <div className="pt-5 border-t border-[#E8D8D2] mt-auto background-blur-glass">
                        <div className="space-y-2 mb-4">
                            <div className="flex justify-between items-center text-xs text-[#6B4E4E] tracking-wider uppercase">
                                <span>Subtotal artículos</span>
                                <span>₡{cart.reduce((acc, item) => acc + (item.precio * item.cantidad), 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-baseline pt-1">
                                <span className="text-sm text-[#2A1F1F] font-medium uppercase tracking-wider">Total</span>
                                <span className="text-3xl font-semibold text-[#2A1F1F]" style={serif}>
                                    ₡{total.toLocaleString()}
                                </span>
                            </div>
                        </div>

                        <p className="text-[10px] text-[#6B4E4E] font-light italic mb-5 leading-normal">
                            * Los costos de envío y códigos de descuento se procesarán con seguridad durante el checkout.
                        </p>

                        <div className="flex flex-col gap-2.5">
                            <Link
                                to="/checkout"
                                onClick={onClose}
                                className="block w-full text-center bg-[#2A1F1F] text-white py-4 text-xs font-semibold tracking-widest uppercase hover:bg-[#C9758A] transition-colors no-underline"
                                style={{ letterSpacing: '0.15em' }}
                            >
                                Procesar Pedido ✦
                            </Link>
                            <button
                                onClick={onClose}
                                className="w-full text-center bg-transparent text-[#2A1F1F] border border-[#2A1F1F] py-3 text-xs font-medium tracking-widest uppercase hover:bg-[#2A1F1F] hover:text-white transition-all"
                                style={{ letterSpacing: '0.12em' }}
                            >
                                Continuar Explorando
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}