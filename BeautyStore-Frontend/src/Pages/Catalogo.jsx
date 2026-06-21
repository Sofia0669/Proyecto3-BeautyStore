import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import Navbar from '../components/Navbar';

export default function Catalogo() {
    const [productos, setProductos] = useState([]);
    const [filtro, setFiltro] = useState('Todos');
    const [menuCategoriasAbierto, setMenuCategoriasAbierto] = useState(false);
    const { addToCart } = useCart();

    useEffect(() => {
        setProductos([
            { id: 1, nombre: 'Labial Mate', categoria: 'Maquillaje', precio: 4900, img: '...' },
            { id: 2, nombre: 'Serum Facial', categoria: 'Cuidado Facial', precio: 15500, img: '...' },
        ]);
    }, []);

    const categorias = ['Todos', 'Maquillaje', 'Cuidado Facial', 'Cabello', 'Perfumes'];
    const productosFiltrados = filtro === 'Todos' ? productos : productos.filter(p => p.categoria === filtro);

    return (
        <div className="min-h-screen bg-[#FAFAF8]">
            <Navbar />

            <div className="max-w-7xl mx-auto px-8 py-12">
                <button
                    onClick={() => setMenuCategoriasAbierto(!menuCategoriasAbierto)}
                    className="md:hidden mb-4 p-2 bg-[#2A1F1F] text-white rounded"
                >
                    {menuCategoriasAbierto ? 'Cerrar Filtros' : 'Filtrar por Categoría ☰'}
                </button>

                <div className="flex flex-col md:flex-row gap-12">
                    {/* Sidebar de Categorías */}
                    <aside className={`${menuCategoriasAbierto ? 'block' : 'hidden'} md:block w-full md:w-64 space-y-4`}>
                        <h2 className="font-semibold text-lg mb-4">Categorías</h2>
                        {categorias.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFiltro(cat)}
                                className={`block w-full text-left p-3 border ${filtro === cat ? 'bg-[#C9758A] text-white border-[#C9758A]' : 'bg-white border-[#E8D8D2]'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </aside>

                    <main className="flex-grow grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {productosFiltrados.map(p => (
                            <div key={p.id} className="bg-white border p-4">
                                <img src={p.img} className="w-full h-64 object-cover mb-4" />
                                <h3 className="font-semibold">{p.nombre}</h3>
                                <p className="text-[#C9758A]">₡{p.precio.toLocaleString()}</p>
                                <button
                                    onClick={() => addToCart(p)}
                                    className="w-full mt-4 bg-[#2A1F1F] text-white py-2 hover:bg-[#C9758A]"
                                >
                                    Agregar al Carrito
                                </button>
                            </div>
                        ))}
                    </main>
                </div>
            </div>
        </div>
    );
}