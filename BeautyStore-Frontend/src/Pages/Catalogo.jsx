import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const serif = { fontFamily: "'Cormorant Garamond', 'Times New Roman', Georgia, serif" }
const sans = { fontFamily: "'Jost', 'Inter', sans-serif" }

export default function Catalogo() {
    const [productos, setProductos] = useState([])
    const [cargando, setCargando] = useState(true)

    useEffect(() => {
        setTimeout(() => {
            setProductos([
                {
                    id: 1,
                    img: 'https://images.pexels.com/photos/1669888/pexels-photo-1669888.jpeg',
                    categoria: 'Maquillaje',
                    nombre: 'Labial Mate Terciopelo',
                    descripcion: 'Larga duración, 12 horas sin retoque. Fórmula hidratante.',
                    precio: 4900,
                    badge: 'Popular',
                },
                {
                    id: 2,
                    img: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=500&q=80',
                    categoria: 'Cuidado Facial',
                    nombre: 'Protector Solar SPF 50',
                    descripcion: 'Protección avanzada, textura ligera, sin residuo blanco.',
                    precio: 8500,
                    badge: null,
                },
                {
                    id: 3,
                    img: 'https://images.pexels.com/photos/4243395/pexels-photo-4243395.jpeg',
                    categoria: 'Maquillaje',
                    nombre: 'Base Líquida Natural',
                    descripcion: 'Cobertura media-alta, acabado natural. 30 tonos disponibles.',
                    precio: 12000,
                    badge: 'Nuevo',
                },
                {
                    id: 4,
                    img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&q=80',
                    categoria: 'Cuidado Facial',
                    nombre: 'Sérum de Vitamina C',
                    descripcion: 'Ilumina y unifica el tono de la piel. Antioxidante potente.',
                    precio: 15500,
                    badge: null,
                }
            ])
            setCargando(false)
        }, 800)
    }, [])

    return (
        <div className="min-h-screen flex flex-col bg-[#FAFAF8]" style={sans}>
            <Navbar />

            <main className="flex-grow px-16 py-12">
                {/* Cabecera del Catálogo */}
                <div className="mb-12 border-b border-[#E8D8D2] pb-8">
                    <p className="text-xs font-medium tracking-[0.2em] text-[#C4975A] uppercase mb-3">Nuestra Colección</p>
                    <h1 className="text-5xl font-semibold text-[#2A1F1F] m-0" style={serif}>Catálogo de Productos</h1>
                    <p className="mt-4 text-[#6B4E4E] font-light max-w-2xl">
                        Explora nuestra selección cuidadosamente curada de cosméticos de alta calidad.
                        Encuentra los productos perfectos para resaltar tu esencia natural.
                    </p>
                </div>

                {cargando ? (
                    <div className="flex justify-center items-center h-64 text-[#C9758A]">
                        <span className="text-lg tracking-widest uppercase animate-pulse">Cargando colección...</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {productos.map((p) => (
                            <div key={p.id} className="bg-white border border-[#E8D8D2] overflow-hidden hover:border-[#C9758A] transition-colors duration-300 flex flex-col">
                                <div className="relative h-72 overflow-hidden bg-[#F2E8E4]">
                                    <img src={p.img} alt={p.nombre} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                                    {p.badge && (
                                        <span className="absolute top-3 left-3 bg-[#C9758A] text-white text-[10px] font-medium px-2.5 py-1 tracking-widest uppercase">
                                            {p.badge}
                                        </span>
                                    )}
                                </div>
                                <div className="p-5 flex flex-col flex-grow">
                                    <div className="text-[10px] font-medium text-[#C4975A] uppercase tracking-widest mb-2">{p.categoria}</div>
                                    <h3 className="text-lg font-semibold text-[#2A1F1F] mb-2 leading-tight" style={serif}>{p.nombre}</h3>
                                    <p className="text-xs text-[#6B4E4E] font-light mb-4 flex-grow leading-relaxed">{p.descripcion}</p>

                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-[#E8D8D2]">
                                        <span className="text-lg font-semibold text-[#2A1F1F]" style={serif}>₡{p.precio.toLocaleString()}</span>
                                        <button className="text-xs font-medium tracking-widest text-[#2A1F1F] hover:text-[#C9758A] transition-colors uppercase">
                                            + Carrito
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    )
}