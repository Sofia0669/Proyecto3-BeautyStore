import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Swal from 'sweetalert2'; // ✦ Importamos SweetAlert2

const serif = { fontFamily: "'Cormorant Garamond', 'Times New Roman', Georgia, serif" };
const sans = { fontFamily: "'Jost', 'Inter', sans-serif" };

export default function Catalogo() {
    const [productos, setProductos] = useState([]);
    const [filtroCategoria, setFiltroCategoria] = useState(0);
    const [menuCategoriasAbierto, setMenuCategoriasAbierto] = useState(false);
    const [cargando, setCargando] = useState(true);

    const { addToCart } = useCart();

    const categorias = [
        { id: 0, nombre: 'Todos' },
        { id: 1, nombre: 'Maquillaje' },
        { id: 2, nombre: 'Cuidado Facial' },
        { id: 3, nombre: 'Cabello' },
        { id: 4, nombre: 'Perfumes' }
    ];

    useEffect(() => {
        const obtenerProductos = async () => {
            try {
                const response = await fetch('http://localhost:5090/api/Productos');
                if (response.ok) {
                    const data = await response.json();
                    setProductos(data);
                } else {
                    console.error("Error al obtener los productos del servidor");
                }
            } catch (error) {
                console.error("Error de conexión:", error);
            } finally {
                setCargando(false);
            }
        };

        obtenerProductos();
    }, []);

    // ✦ Función manejadora de agregar con validación de login y alerta
    const manejarAgregarAlCarrito = (producto) => {
        const token = localStorage.getItem('token'); // Lógica de sesión

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

        addToCart({
            id: producto.idProducto,
            nombre: producto.nombre,
            precio: producto.precio,
            imagen: producto.imagen
        });

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

    const productosFiltrados = filtroCategoria === 0
        ? productos
        : productos.filter(p => p.idCategoria === filtroCategoria);

    const obtenerNombreCategoria = (idCat) => {
        const cat = categorias.find(c => c.id === idCat);
        return cat ? cat.nombre : 'Cosmético';
    };

    return (
        <div className="min-h-screen bg-[#FAFAF8] text-[#2A1F1F]" style={sans}>
            <style>{`
                .prod-card:hover { transform: translateY(-4px); border-color: #C9758A; }
                .prod-card { transition: transform 0.25s, border-color 0.25s; }
                .btn-agregar { transition: all 0.3s ease; }
                .btn-agregar:hover { background-color: #C9758A; color: white; border-color: #C9758A; }
            `}</style>

            <Navbar />

            <div className="bg-[#F2E8E4] py-16 text-center border-b border-[#E8D8D2]">
                <h1 className="text-5xl font-semibold text-[#2A1F1F] m-0" style={serif}>
                    Nuestro <em className="text-[#C9758A]">Catálogo</em>
                </h1>
                <p className="text-[#6B4E4E] mt-4 max-w-lg mx-auto font-light" style={sans}>
                    Descubre nuestra selección exclusiva de productos diseñados para realzar tu belleza natural.
                </p>
            </div>

            <div className="max-w-[1400px] mx-auto px-8 lg:px-16 py-12">
                <button
                    onClick={() => setMenuCategoriasAbierto(!menuCategoriasAbierto)}
                    className="md:hidden mb-8 w-full py-3 bg-[#2A1F1F] text-white text-sm font-medium tracking-widest"
                >
                    {menuCategoriasAbierto ? 'OCULTAR FILTROS' : 'MOSTRAR FILTROS ✦'}
                </button>

                <div className="flex flex-col md:flex-row gap-12 items-start">
                    {/* Sidebar de Filtros */}
                    <aside className={`${menuCategoriasAbierto ? 'block' : 'hidden'} md:block w-full md:w-56 flex-shrink-0 sticky top-8`}>
                        <h2 className="text-xs tracking-[0.18em] text-[#C4975A] uppercase mb-6" style={sans}>Filtrar por</h2>
                        <div className="space-y-1">
                            {categorias.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setFiltroCategoria(cat.id)}
                                    className={`block w-full text-left py-2 px-3 text-sm transition-all border-l-2 ${filtroCategoria === cat.id
                                        ? 'border-[#C9758A] text-[#2A1F1F] font-medium bg-[#C9758A]/5'
                                        : 'border-transparent text-[#6B4E4E] font-light hover:text-[#2A1F1F] hover:bg-black/5'
                                        }`}
                                >
                                    {cat.nombre}
                                </button>
                            ))}
                        </div>
                    </aside>

                    {/* Grid Principal */}
                    <main className="flex-grow w-full">
                        {cargando ? (
                            <div className="text-center py-20 text-[#6B4E4E] font-light">Cargando catálogo...</div>
                        ) : (
                            <>
                                <div className="mb-6 flex justify-between items-end border-b border-[#E8D8D2] pb-4">
                                    <span className="text-sm text-[#6B4E4E] font-light">
                                        Mostrando <strong>{productosFiltrados.length}</strong> productos
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {productosFiltrados.map(p => (
                                        <div key={p.idProducto} className="prod-card bg-white border border-[#E8D8D2] flex flex-col h-full cursor-pointer">
                                            <div className="relative overflow-hidden group" style={{ aspectRatio: '4/5' }}>
                                                <img
                                                    src={p.imagen || 'https://via.placeholder.com/400x500?text=Sin+Imagen'}
                                                    alt={p.nombre}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                    onError={(e) => { e.target.src = 'https://via.placeholder.com/400x500?text=Error+Imagen'; }}
                                                />
                                            </div>
                                            <div className="p-5 flex flex-col flex-grow">
                                                <div className="text-[10px] font-medium text-[#C4975A] uppercase tracking-widest mb-2" style={sans}>
                                                    {obtenerNombreCategoria(p.idCategoria)}
                                                </div>
                                                <h3 className="text-lg font-semibold text-[#2A1F1F] mb-1 leading-tight" style={serif}>
                                                    {p.nombre}
                                                </h3>
                                                <p className="text-xs text-[#6B4E4E] line-clamp-2 mt-1 mb-4 flex-grow font-light">
                                                    {p.descripcion}
                                                </p>

                                                {p.stock === 0 && (
                                                    <span className="text-[10px] text-red-500 font-medium tracking-wide uppercase mb-2 block">Agotado</span>
                                                )}

                                                <div className="flex items-end justify-between mt-auto pt-4 border-t border-[#E8D8D2]">
                                                    <span className="text-lg font-semibold text-[#2A1F1F]" style={serif}>
                                                        ₡{p.precio.toLocaleString()}
                                                    </span>
                                                    <button
                                                        onClick={() => manejarAgregarAlCarrito(p)} // ✦ Usamos el manejador con validación
                                                        disabled={p.stock === 0}
                                                        className={`btn-agregar px-4 py-2 border text-xs font-medium tracking-widest bg-transparent ${p.stock === 0
                                                            ? 'border-gray-300 text-gray-300 cursor-not-allowed'
                                                            : 'border-[#2A1F1F] text-[#2A1F1F]'
                                                            }`}
                                                        style={sans}
                                                    >
                                                        {p.stock === 0 ? 'AGOTADO' : 'AGREGAR'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </main>
                </div>
            </div>
            <Footer />
        </div>
    );
}