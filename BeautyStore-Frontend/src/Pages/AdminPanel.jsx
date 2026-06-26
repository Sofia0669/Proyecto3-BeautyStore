import { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';

const serif = { fontFamily: "'Cormorant Garamond', 'Times New Roman', Georgia, serif" };
const sans = { fontFamily: "'Jost', 'Inter', sans-serif" };

const API = 'http://localhost:5090/api';

const formatoMoneda = (valor) =>
    new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC' }).format(valor);

export default function AdminDashboard() {
    const [vistaActiva, setVistaActiva] = useState('dashboard');
    const [refresh, setRefresh] = useState(false);

    // Estados de datos
    const [stats, setStats] = useState({ totalVentas: 0, totalProductos: 0, stockBajo: 0 });
    const [dataVentas, setDataVentas] = useState([]);
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [pagos, setPagos] = useState([]);

    // Estados CRUD
    const [modalAbierto, setModalAbierto] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [itemActual, setItemActual] = useState({});
    const [cargandoEnvio, setCargandoEnvio] = useState(false);

    // ─── Fetch seguro ──────────────────────────────────────────────────────────
    const fetchSeguro = async (url, headers) => {
        try {
            const res = await fetch(url, { headers });
            if (!res.ok) {
                console.error(`Error ${res.status}: ${url}`);
                return [];
            }
            return await res.json();
        } catch (error) {
            console.error('Error de red:', error);
            return [];
        }
    };

    // ─── Carga de datos ────────────────────────────────────────────────────────
    useEffect(() => {
        const cargarDatos = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;
            const headers = {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            if (vistaActiva === 'dashboard') {
                const [prods, cats, users, pays] = await Promise.all([
                    fetchSeguro(`${API}/Productos`, headers),
                    fetchSeguro(`${API}/Categorias`, headers),
                    fetchSeguro(`${API}/Usuarios`, headers),
                    fetchSeguro(`${API}/Pagos`, headers),
                ]);

                if (prods) setProductos(prods);
                if (cats) setCategorias(cats);
                if (users) setUsuarios(users);
                if (pays) {
                    setPagos(pays);
                    // Gráfico: últimos 7 pagos agrupados por día
                    const ventasPorDia = pays.slice(-7).map(p => ({
                        name: new Date(p.fechaPago).toLocaleDateString('es-CR', { weekday: 'short' }),
                        ventas: Number(p.monto || 0)
                    }));
                    setDataVentas(ventasPorDia);
                }

                setStats({
                    totalVentas: pays?.reduce((acc, p) => acc + Number(p.monto || 0), 0) ?? 0,
                    totalProductos: prods?.length ?? 0,
                    stockBajo: prods?.filter(p => p.stock <= 5).length ?? 0
                });

            } else if (vistaActiva === 'productos') {
                const data = await fetchSeguro(`${API}/Productos`, headers);
                if (data) setProductos(data);

            } else if (vistaActiva === 'categorias') {
                const data = await fetchSeguro(`${API}/Categorias`, headers);
                if (data) setCategorias(data);

            } else if (vistaActiva === 'usuarios') {
                const data = await fetchSeguro(`${API}/Usuarios`, headers);
                if (data) setUsuarios(data);

            } else if (vistaActiva === 'pagos') {
                const data = await fetchSeguro(`${API}/Pagos`, headers);
                if (data) setPagos(data);
            }
        };

        cargarDatos();
    }, [refresh, vistaActiva]);

    // ─── Abrir modal ───────────────────────────────────────────────────────────
    const abrirModal = (item = null) => {
        setModoEdicion(!!item);
        if (item) {
            const copia = { ...item };
            // Normalizar fecha para el input type="date"
            if (vistaActiva === 'pagos' && copia.fechaPago) {
                copia.fechaPago = copia.fechaPago.split('T')[0];
            }
            // Limpiar password al editar usuario
            if (vistaActiva === 'usuarios') {
                copia.password = '';
            }
            setItemActual(copia);
        } else {
            setItemActual({});
        }
        setModalAbierto(true);
    };

    // ─── Cambio de inputs ──────────────────────────────────────────────────────
    const manejarCambioInput = ({ target }) => {
        const { name, value } = target;
        setItemActual(prev => ({ ...prev, [name]: value }));
    };

    // ─── Guardar (POST / PUT) ──────────────────────────────────────────────────
    const guardarItem = async (e) => {
        e.preventDefault();
        setCargandoEnvio(true);

        const token = localStorage.getItem('token');
        const endpointMap = {
            productos: 'Productos',
            categorias: 'Categorias',
            usuarios: 'Usuarios',
            pagos: 'Pagos'
        };
        const idKey =
            vistaActiva === 'productos' ? 'idProducto' :
                vistaActiva === 'categorias' ? 'idCategoria' :
                    vistaActiva === 'usuarios' ? 'idUsuario' : 'idPago';

        let datos = { ...itemActual };

        if (vistaActiva === 'pagos') {
            datos = {
                idPago: datos.idPago || 0,
                idPedido: Number(datos.idPedido),
                metodoPago: datos.metodoPago,
                monto: Number(datos.monto),
                fechaPago: datos.fechaPago,
                estado: datos.estado
            };
        }

        if (vistaActiva === 'usuarios' && modoEdicion && !datos.password) {
            delete datos.password;
        }

        let url = `${API}/${endpointMap[vistaActiva]}`;
        if (modoEdicion) url += `/${datos[idKey]}`;

        try {
            const res = await fetch(url, {
                method: modoEdicion ? 'PUT' : 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(datos)
            });

            if (!res.ok) {
                const mensaje = await res.text();
                throw new Error(mensaje || 'Error al guardar');
            }

            Swal.fire({
                toast: true, position: 'top-end', icon: 'success',
                title: 'Guardado correctamente', timer: 2000, showConfirmButton: false
            });
            setModalAbierto(false);
            setRefresh(r => !r);

        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: error.message });
        } finally {
            setCargandoEnvio(false);
        }
    };

    const confirmarEliminar = async (id) => {
        const result = await Swal.fire({
            title: '¿Estás segura?',
            text: 'Esta acción no se puede deshacer.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#C9758A',
            cancelButtonColor: '#2A1F1F',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (!result.isConfirmed) return;

        const token = localStorage.getItem('token');
        const endpointMap = {
            productos: 'Productos',
            categorias: 'Categorias',
            usuarios: 'Usuarios',
            pagos: 'Pagos'
        };

        try {
            const res = await fetch(
                `${API}/${endpointMap[vistaActiva]}/${id}`,
                { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }
            );
            if (!res.ok) throw new Error();

            Swal.fire({
                toast: true, position: 'top-end', icon: 'success',
                title: 'Eliminado con éxito', timer: 2000, showConfirmButton: false
            });
            setRefresh(r => !r);

        } catch {
            Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo eliminar el registro.' });
        }
    };

    const descargarPDFFactura = (pago) => {
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

        doc.setTextColor(42, 31, 31);
        doc.setFont('times', 'italic');
        doc.setFontSize(26);
        doc.text('Beauty Store', 20, 25);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(107, 78, 78);
        doc.text('Sistema de Control Administrativo', 20, 31);
        doc.text('Costa Rica', 20, 36);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(42, 31, 31);
        doc.setFontSize(12);
        doc.text('COMPROBANTE DE PAGO', 130, 25);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`ID Transacción: #${pago.idPago}`, 130, 32);
        doc.text(`Fecha Emisión: ${new Date(pago.fechaPago).toLocaleDateString('es-CR')}`, 130, 38);

        doc.setDrawColor(232, 216, 210);
        doc.setLineWidth(0.5);
        doc.line(20, 45, 190, 45);

        doc.setFont('helvetica', 'bold');
        doc.text('Detalles del Registro:', 20, 55);
        doc.setFont('helvetica', 'normal');
        doc.text(`ID Pedido: ${pago.idPedido ?? 'N/A'}`, 20, 62);
        doc.text(`Método de Pago: ${pago.metodoPago ?? 'N/A'}`, 20, 68);
        doc.text(`Estado del Pago: ${pago.estado ?? 'Procesado'}`, 20, 74);

        doc.setDrawColor(42, 31, 31);
        doc.setFillColor(247, 242, 239);
        doc.rect(20, 84, 170, 8, 'F');
        doc.setFont('helvetica', 'bold');
        doc.text('Descripción del Concepto', 25, 89);
        doc.text('Total', 160, 89);
        doc.line(20, 92, 190, 92);

        doc.setFont('helvetica', 'normal');
        doc.text('Orden de Productos Cosméticos y Cuidado Personal', 25, 104);
        doc.setFont('helvetica', 'bold');
        doc.text(`₡${pago.monto}`, 160, 104);

        doc.setDrawColor(232, 216, 210);
        doc.line(20, 112, 190, 112);

        doc.setFont('helvetica', 'normal');
        doc.text('Subtotal:', 135, 126);
        doc.text(`₡${pago.monto}`, 160, 126);
        doc.line(130, 130, 190, 130);
        doc.setFont('helvetica', 'bold');
        doc.text('Total Final:', 135, 136);
        doc.text(`₡${pago.monto}`, 160, 136);

        doc.setFont('times', 'italic');
        doc.setFontSize(11);
        doc.setTextColor(201, 117, 138);
        doc.text('¡Gracias por apoyar nuestro espacio de belleza!', 20, 160);

        doc.save(`Factura_BeautyStore_#${pago.idPago}.pdf`);
    };

    // ─── Encabezados de tabla ──────────────────────────────────────────────────
    const trHead = "text-xs tracking-widest text-[#C4975A] uppercase border-b border-[#E8D8D2] bg-[#FAFAF8]";
    const th = "p-4 font-medium";
    const thR = "p-4 font-medium text-right";

    const renderEncabezadosTabla = () => {
        if (vistaActiva === 'productos') return (
            <tr className={trHead}>
                <th className={th}>Nombre</th>
                <th className={th}>Categoría ID</th>
                <th className={th}>Precio</th>
                <th className={th}>Stock</th>
                <th className={thR}>Acciones</th>
            </tr>
        );
        if (vistaActiva === 'categorias') return (
            <tr className={trHead}>
                <th className={th}>ID</th>
                <th className={th}>Nombre</th>
                <th className={thR}>Acciones</th>
            </tr>
        );
        if (vistaActiva === 'usuarios') return (
            <tr className={trHead}>
                <th className={th}>Nombre</th>
                <th className={th}>Correo</th>
                <th className={th}>Rol</th>
                <th className={thR}>Acciones</th>
            </tr>
        );
        if (vistaActiva === 'pagos') return (
            <tr className={trHead}>
                <th className={th}>ID Pago</th>
                <th className={th}>ID Pedido</th>
                <th className={th}>Método</th>
                <th className={th}>Monto</th>
                <th className={th}>Fecha</th>
                <th className={th}>Estado</th>
                <th className={thR}>Acciones</th>
            </tr>
        );
    };

    // ─── Filas de tabla ────────────────────────────────────────────────────────
    const renderFilaTabla = (item, idx) => {
        const id = item.idProducto || item.idCategoria || item.idUsuario || item.idPago;
        return (
            <tr key={idx} className="border-t border-[#E8D8D2] hover:bg-white transition-colors">

                {vistaActiva === 'productos' && (<>
                    <td className="p-4 font-medium text-[#2A1F1F]">{item.nombre}</td>
                    <td className="p-4 text-[#6B4E4E]">{item.idCategoria}</td>
                    <td className="p-4 text-[#6B4E4E]">{formatoMoneda(item.precio)}</td>
                    <td className="p-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${item.stock > 5 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {item.stock}
                        </span>
                    </td>
                </>)}

                {vistaActiva === 'categorias' && (<>
                    <td className="p-4 text-[#6B4E4E]">{item.idCategoria}</td>
                    <td className="p-4 font-medium text-[#2A1F1F]">{item.nombre}</td>
                </>)}

                {vistaActiva === 'usuarios' && (<>
                    <td className="p-4 font-medium text-[#2A1F1F]">{item.nombre}</td>
                    <td className="p-4 text-[#6B4E4E]">{item.correo}</td>
                    <td className="p-4">
                        <span className={`px-2 py-1 text-xs rounded-full uppercase tracking-wider ${item.rol === 'Admin' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                            {item.rol}
                        </span>
                    </td>
                </>)}

                {vistaActiva === 'pagos' && (<>
                    <td className="p-4 font-medium text-[#2A1F1F]">{item.idPago}</td>
                    <td className="p-4 text-[#6B4E4E]">{item.idPedido}</td>
                    <td className="p-4 text-[#6B4E4E]">{item.metodoPago}</td>
                    <td className="p-4 text-[#6B4E4E]">{formatoMoneda(item.monto)}</td>
                    {/* ✅ Corregido: era item.fecha */}
                    <td className="p-4 text-[#6B4E4E]">{new Date(item.fechaPago).toLocaleDateString('es-CR')}</td>
                    <td className="p-4">
                        <span className={`px-2 py-1 text-xs rounded-full uppercase tracking-wide ${item.estado === 'Pagado' ? 'bg-green-100 text-green-700' :
                                item.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-red-100 text-red-700'
                            }`}>
                            {item.estado}
                        </span>
                    </td>
                </>)}

                <td className="p-4 text-right space-x-3">
                    {vistaActiva === 'pagos' && (
                        <button
                            onClick={() => descargarPDFFactura(item)}
                            className="text-[#C9758A] hover:text-[#2A1F1F] text-sm font-medium tracking-wide transition-colors mr-2"
                        >
                            PDF FACTURA
                        </button>
                    )}
                    <button
                        onClick={() => abrirModal(item)}
                        className="text-[#C4975A] hover:text-[#2A1F1F] text-sm font-medium tracking-wide transition-colors"
                    >
                        EDITAR
                    </button>
                    <button
                        onClick={() => confirmarEliminar(id)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium tracking-wide transition-colors"
                    >
                        ELIMINAR
                    </button>
                </td>
            </tr>
        );
    };

    // ─── Render principal ──────────────────────────────────────────────────────
    return (
        <div className="flex h-screen bg-[#FAFAF8]" style={sans}>

            {/* Sidebar */}
            <aside className="w-64 bg-[#2A1F1F] text-white p-6 flex flex-col">
                <div className="mb-10 text-center">
                    <h1 className="text-3xl font-semibold text-white m-0" style={serif}>
                        Beauty<em className="text-[#C9758A]">Admin</em>
                    </h1>
                </div>
                <nav className="flex-1 space-y-2">
                    {['dashboard', 'productos', 'categorias', 'usuarios', 'pagos'].map(v => (
                        <button
                            key={v}
                            onClick={() => setVistaActiva(v)}
                            className={`block w-full text-left px-4 py-3 rounded text-sm tracking-widest uppercase transition-colors ${vistaActiva === v
                                    ? 'bg-[#C9758A] text-white font-medium'
                                    : 'text-gray-400 hover:bg-white/10'
                                }`}
                        >
                            {v}
                        </button>
                    ))}
                </nav>
                <button
                    onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
                    className="mt-auto px-4 py-3 text-sm tracking-widest uppercase text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors text-left w-full"
                >
                    Cerrar Sesión
                </button>
            </aside>

            {/* Contenido principal */}
            <main className="flex-1 p-10 overflow-y-auto">
                <div className="flex justify-between items-end mb-8 border-b border-[#E8D8D2] pb-4">
                    <h2 className="text-4xl font-semibold text-[#2A1F1F] capitalize" style={serif}>
                        {vistaActiva}
                    </h2>
                    {['productos', 'categorias', 'usuarios', 'pagos'].includes(vistaActiva) && (
                        <button
                            onClick={() => abrirModal()}
                            className="px-6 py-2.5 bg-[#2A1F1F] text-white text-sm font-medium tracking-widest hover:bg-[#C9758A] transition-colors"
                        >
                            + AGREGAR NUEVO
                        </button>
                    )}
                </div>

                {/* Dashboard */}
                {vistaActiva === 'dashboard' ? (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { title: 'Ventas Totales', value: formatoMoneda(stats.totalVentas) },
                                { title: 'Total Productos', value: stats.totalProductos },
                                { title: 'Stock Crítico', value: stats.stockBajo }
                            ].map((i, idx) => (
                                <div key={idx} className="bg-white p-6 border border-[#E8D8D2] shadow-sm rounded-sm">
                                    <h3 className="text-xs font-medium tracking-widest text-[#C4975A] uppercase mb-2">{i.title}</h3>
                                    <p className="text-4xl font-semibold text-[#2A1F1F]" style={serif}>{i.value}</p>
                                </div>
                            ))}
                        </div>

                        <div className="bg-white p-8 border border-[#E8D8D2] shadow-sm rounded-sm h-[400px] w-full">
                            <h3 className="text-xl font-semibold text-[#2A1F1F] mb-6" style={serif}>
                                Tendencia de Ventas (Últimos 7 pagos)
                            </h3>
                            <ResponsiveContainer width="100%" height="85%">
                                <BarChart data={dataVentas}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8D8D2" />
                                    <XAxis dataKey="name" tick={{ fill: '#6B4E4E', fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: '#6B4E4E', fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        cursor={{ fill: '#F2E8E4' }}
                                        contentStyle={{ backgroundColor: '#2A1F1F', color: 'white', border: 'none' }}
                                        formatter={(v) => [formatoMoneda(v), 'Ventas']}
                                    />
                                    <Bar dataKey="ventas" fill="#C9758A" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                ) : (
                    /* Tabla genérica */
                    <div className="bg-[#F7F2EF] p-1 rounded-sm border border-[#E8D8D2]">
                        <div className="bg-white overflow-x-auto">
                            <table className="w-full text-left whitespace-nowrap">
                                <thead>
                                    {renderEncabezadosTabla()}
                                </thead>
                                <tbody>
                                    {(
                                        vistaActiva === 'productos' ? productos :
                                            vistaActiva === 'categorias' ? categorias :
                                                vistaActiva === 'usuarios' ? usuarios : pagos
                                    ).map(renderFilaTabla)}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>

            {/* Modal CRUD */}
            {modalAbierto && (
                <div className="fixed inset-0 bg-[#2A1F1F]/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white p-8 max-w-md w-full border border-[#E8D8D2] shadow-xl relative">
                        <button
                            onClick={() => setModalAbierto(false)}
                            className="absolute top-4 right-4 text-2xl text-[#A49393] hover:text-[#2A1F1F]"
                        >
                            &times;
                        </button>
                        <h3 className="text-2xl font-semibold text-[#2A1F1F] mb-6" style={serif}>
                            {modoEdicion ? 'Editar' : 'Nuevo'} {vistaActiva.slice(0, -1)}
                        </h3>

                        <form onSubmit={guardarItem} className="space-y-4">

                            {vistaActiva !== 'pagos' && vistaActiva !== 'usuarios' && (
                                <div>
                                    <label className="block text-xs font-medium tracking-widest text-[#2A1F1F] uppercase mb-1">Nombre</label>
                                    <input
                                        required
                                        name="nombre"
                                        value={itemActual.nombre || ''}
                                        onChange={manejarCambioInput}
                                        className="w-full p-2 border border-[#E8D8D2] bg-[#FAFAF8] text-[#2A1F1F] focus:outline-none focus:border-[#C9758A]"
                                    />
                                </div>
                            )}

                            {/* Productos */}
                            {vistaActiva === 'productos' && (<>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium tracking-widest text-[#2A1F1F] uppercase mb-1">Precio (₡)</label>
                                        <input required type="number" name="precio" value={itemActual.precio || ''} onChange={manejarCambioInput}
                                            className="w-full p-2 border border-[#E8D8D2] bg-[#FAFAF8] text-[#2A1F1F] focus:outline-none focus:border-[#C9758A]" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium tracking-widest text-[#2A1F1F] uppercase mb-1">Stock</label>
                                        <input required type="number" name="stock" value={itemActual.stock || ''} onChange={manejarCambioInput}
                                            className="w-full p-2 border border-[#E8D8D2] bg-[#FAFAF8] text-[#2A1F1F] focus:outline-none focus:border-[#C9758A]" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium tracking-widest text-[#2A1F1F] uppercase mb-1">ID Categoría</label>
                                    <input required type="number" name="idCategoria" value={itemActual.idCategoria || ''} onChange={manejarCambioInput}
                                        className="w-full p-2 border border-[#E8D8D2] bg-[#FAFAF8] text-[#2A1F1F] focus:outline-none focus:border-[#C9758A]" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium tracking-widest text-[#2A1F1F] uppercase mb-1">Descripción</label>
                                    <textarea required name="descripcion" value={itemActual.descripcion || ''} onChange={manejarCambioInput}
                                        className="w-full p-2 border border-[#E8D8D2] bg-[#FAFAF8] text-[#2A1F1F] focus:outline-none focus:border-[#C9758A] resize-none h-20" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium tracking-widest text-[#2A1F1F] uppercase mb-1">URL Imagen</label>
                                    <input required name="imagen" value={itemActual.imagen || ''} onChange={manejarCambioInput}
                                        className="w-full p-2 border border-[#E8D8D2] bg-[#FAFAF8] text-[#2A1F1F] focus:outline-none focus:border-[#C9758A]" />
                                </div>
                            </>)}

                            {/* Usuarios */}
                            {vistaActiva === 'usuarios' && (<>
                                <div>
                                    <label className="block text-xs font-medium tracking-widest text-[#2A1F1F] uppercase mb-1">Nombre</label>
                                    <input required type="text" name="nombre" value={itemActual.nombre || ''} onChange={manejarCambioInput}
                                        className="w-full p-2 border border-[#E8D8D2] bg-[#FAFAF8] text-[#2A1F1F] focus:outline-none focus:border-[#C9758A]" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium tracking-widest text-[#2A1F1F] uppercase mb-1">Correo Electrónico</label>
                                    <input required type="email" name="correo" value={itemActual.correo || ''} onChange={manejarCambioInput}
                                        className="w-full p-2 border border-[#E8D8D2] bg-[#FAFAF8] text-[#2A1F1F] focus:outline-none focus:border-[#C9758A]" />
                                </div>
                                {!modoEdicion && (
                                    <div>
                                        <label className="block text-xs font-medium tracking-widest text-[#2A1F1F] uppercase mb-1">Contraseña</label>
                                        <input required type="password" name="password" value={itemActual.password || ''} onChange={manejarCambioInput}
                                            className="w-full p-2 border border-[#E8D8D2] bg-[#FAFAF8] text-[#2A1F1F] focus:outline-none focus:border-[#C9758A]" />
                                    </div>
                                )}
                                <div>
                                    <label className="block text-xs font-medium tracking-widest text-[#2A1F1F] uppercase mb-1">Rol</label>
                                    <select required name="rol" value={itemActual.rol || ''} onChange={manejarCambioInput}
                                        className="w-full p-2 border border-[#E8D8D2] bg-[#FAFAF8] text-[#2A1F1F] focus:outline-none focus:border-[#C9758A]">
                                        <option value="">Seleccionar...</option>
                                        <option value="Admin">Admin</option>
                                        <option value="Usuario">Usuario</option>
                                    </select>
                                </div>
                            </>)}

                            {/* Pagos */}
                            {vistaActiva === 'pagos' && (<>
                                <div>
                                    <label className="block text-xs font-medium tracking-widest text-[#2A1F1F] uppercase mb-1">ID Pedido</label>
                                    <input required type="number" name="idPedido" value={itemActual.idPedido || ''} onChange={manejarCambioInput}
                                        className="w-full p-2 border border-[#E8D8D2] bg-[#FAFAF8] text-[#2A1F1F] focus:outline-none focus:border-[#C9758A]" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium tracking-widest text-[#2A1F1F] uppercase mb-1">Método de Pago</label>
                                    <select required name="metodoPago" value={itemActual.metodoPago || ''} onChange={manejarCambioInput}
                                        className="w-full p-2 border border-[#E8D8D2] bg-[#FAFAF8] text-[#2A1F1F] focus:outline-none focus:border-[#C9758A]">
                                        <option value="">Seleccionar...</option>
                                        <option value="Tarjeta">Tarjeta</option>
                                        <option value="SINPE">SINPE</option>
                                        <option value="Efectivo">Efectivo</option>
                                        <option value="Manual">Manual</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium tracking-widest text-[#2A1F1F] uppercase mb-1">Monto (₡)</label>
                                    <input required type="number" name="monto" value={itemActual.monto || ''} onChange={manejarCambioInput}
                                        className="w-full p-2 border border-[#E8D8D2] bg-[#FAFAF8] text-[#2A1F1F] focus:outline-none focus:border-[#C9758A]" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium tracking-widest text-[#2A1F1F] uppercase mb-1">Fecha de Operación</label>
                                    <input required type="date" name="fechaPago"
                                        value={itemActual.fechaPago ? itemActual.fechaPago.split('T')[0] : ''}
                                        onChange={manejarCambioInput}
                                        className="w-full p-2 border border-[#E8D8D2] bg-[#FAFAF8] text-[#2A1F1F] focus:outline-none focus:border-[#C9758A]" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium tracking-widest text-[#2A1F1F] uppercase mb-1">Estado de Transacción</label>
                                    <select required name="estado" value={itemActual.estado || ''} onChange={manejarCambioInput}
                                        className="w-full p-2 border border-[#E8D8D2] bg-[#FAFAF8] text-[#2A1F1F] focus:outline-none focus:border-[#C9758A]">
                                        <option value="">Seleccionar...</option>
                                        <option value="Pendiente">Pendiente</option>
                                        <option value="Pagado">Pagado</option>
                                        <option value="Reembolsado">Reembolsado</option>
                                    </select>
                                </div>
                            </>)}

                            <div className="pt-4 flex justify-end gap-3 border-t border-[#E8D8D2] mt-6">
                                <button
                                    type="button"
                                    onClick={() => setModalAbierto(false)}
                                    className="px-5 py-2.5 text-sm font-medium tracking-widest text-[#6B4E4E] hover:text-[#2A1F1F] transition-colors"
                                >
                                    CANCELAR
                                </button>
                                <button
                                    type="submit"
                                    disabled={cargandoEnvio}
                                    className="px-6 py-2.5 bg-[#2A1F1F] text-white text-sm font-medium tracking-widest hover:bg-[#C9758A] transition-colors disabled:opacity-70"
                                >
                                    {cargandoEnvio ? 'GUARDANDO...' : modoEdicion ? 'ACTUALIZAR' : 'GUARDAR'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}