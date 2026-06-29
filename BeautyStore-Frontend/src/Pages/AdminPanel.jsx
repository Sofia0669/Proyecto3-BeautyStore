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

    const [stats, setStats] = useState({ totalVentas: 0, totalProductos: 0, stockBajo: 0 });
    const [dataVentas, setDataVentas] = useState([]);
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [pagos, setPagos] = useState([]);

    const [modalAbierto, setModalAbierto] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [itemActual, setItemActual] = useState({});
    const [cargandoEnvio, setCargandoEnvio] = useState(false);

    const fetchSeguro = async (url, headers) => {
        try {
            const res = await fetch(url, { headers });
            if (!res.ok) { console.error(`Error ${res.status}: ${url}`); return []; }
            return await res.json();
        } catch (error) {
            console.error('Error de red:', error);
            return [];
        }
    };

    useEffect(() => {
        const cargarDatos = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;
            const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

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
                    // Agrupar ventas por fecha (últimos 7 días con actividad)
                    const ventasPorFecha = {};
                    pays.forEach(p => {
                        const fecha = new Date(p.fechaPago).toLocaleDateString('es-CR', { day: '2-digit', month: '2-digit' });
                        ventasPorFecha[fecha] = (ventasPorFecha[fecha] || 0) + Number(p.monto || 0);
                    });
                    const ventasPorDia = Object.entries(ventasPorFecha)
                        .slice(-7)
                        .map(([fecha, total]) => ({ name: fecha, ventas: total }));
                    setDataVentas(ventasPorDia);
                }
                setStats({
                    totalVentas: pays?.reduce((acc, p) => acc + Number(p.monto || 0), 0) ?? 0,
                    totalProductos: prods?.length ?? 0,
                    stockBajo: prods?.filter(p => p.stock <= 5).reduce((acc, p) => acc + Number(p.stock || 0), 0) ?? 0
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

    const abrirModal = (item = null) => {
        setModoEdicion(!!item);
        if (item) {
            const copia = { ...item };
            if (vistaActiva === 'pagos' && copia.fechaPago)
                copia.fechaPago = copia.fechaPago.split('T')[0];
            if (vistaActiva === 'usuarios')
                copia.password = '';
            setItemActual(copia);
        } else {
            setItemActual({});
        }
        setModalAbierto(true);
    };

    const manejarCambioInput = ({ target }) => {
        const { name, value } = target;
        setItemActual(prev => ({ ...prev, [name]: value }));
    };

    const guardarItem = async (e) => {
        e.preventDefault();
        setCargandoEnvio(true);

        const token = localStorage.getItem('token');
        const endpointMap = { productos: 'Productos', categorias: 'Categorias', usuarios: 'Usuarios', pagos: 'Pagos' };
        const idKey =
            vistaActiva === 'productos' ? 'idProducto' :
                vistaActiva === 'categorias' ? 'idCategoria' :
                    vistaActiva === 'usuarios' ? 'idUsuario' : 'idPago';

        let datos = { ...itemActual };

        // ✅ FIX CATEGORIAS: incluir descripcion e imagen
        if (vistaActiva === 'categorias') {
            datos = {
                idCategoria: datos.idCategoria || 0,
                nombre: datos.nombre || '',
                descripcion: datos.descripcion || '',
                imagen: datos.imagen || ''
            };
        }

        // ✅ FIX PAGOS: incluir metodoPago y estado correctamente
        if (vistaActiva === 'pagos') {
            datos = {
                idPago: datos.idPago || 0,
                idPedido: Number(datos.idPedido),
                metodoPago: datos.metodoPago || '',
                monto: Number(datos.monto),
                fechaPago: datos.fechaPago,
                estado: datos.estado || 'Pendiente'
            };
        }

        if (vistaActiva === 'usuarios' && modoEdicion && !datos.password)
            delete datos.password;

        let url = `${API}/${endpointMap[vistaActiva]}`;
        if (modoEdicion) url += `/${datos[idKey]}`;

        try {
            const res = await fetch(url, {
                method: modoEdicion ? 'PUT' : 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });

            if (!res.ok) {
                const mensaje = await res.text();
                throw new Error(mensaje || 'Error al guardar');
            }

            Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Guardado correctamente', timer: 2000, showConfirmButton: false });
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
        const endpointMap = { productos: 'Productos', categorias: 'Categorias', usuarios: 'Usuarios', pagos: 'Pagos' };

        try {
            const res = await fetch(`${API}/${endpointMap[vistaActiva]}/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error();

            Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Eliminado con éxito', timer: 2000, showConfirmButton: false });
            setRefresh(r => !r);
        } catch {
            Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo eliminar el registro.' });
        }
    };

    const descargarPDFFactura = async (pago) => {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

        // Una sola llamada que trae pago + cliente + productos
        let factura = null;
        try {
            const res = await fetch(`${API}/Pagos/${pago.idPago}/factura`, { headers });
            if (res.ok) factura = await res.json();
        } catch (_) { }

        // Si el endpoint falla, usar los datos básicos del pago
        if (!factura) factura = { ...pago, cliente: null, productos: [] };

        const cliente = factura.cliente;
        const detallesPedido = factura.productos || [];

        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const rosa = [201, 117, 138];
        const oscuro = [42, 31, 31];
        const gris = [107, 78, 78];
        const claro = [247, 242, 239];

        // ── Encabezado ────────────────────────────────────────────────────────
        doc.setFillColor(...rosa);
        doc.rect(0, 0, 210, 18, 'F');
        doc.setFont('times', 'italic');
        doc.setFontSize(20);
        doc.setTextColor(255, 255, 255);
        doc.text('Beauty Store', 12, 12);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text('Sistema de Control Administrativo · Costa Rica', 12, 17);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(255, 255, 255);
        doc.text('COMPROBANTE DE PAGO', 130, 9);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.text(`Nº Transacción: #${pago.idPago}`, 130, 14);

        // ── Info empresa y número de factura ──────────────────────────────────
        let y = 28;
        doc.setTextColor(...oscuro);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text('Emitido por:', 12, y);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...gris);
        doc.text('Beauty Store S.A.  ·  San José, Costa Rica', 12, y + 5);
        doc.text(`Fecha de emisión: ${new Date(pago.fechaPago).toLocaleDateString('es-CR')}`, 12, y + 10);
        doc.text(`Hora: ${new Date(pago.fechaPago).toLocaleTimeString('es-CR')}`, 12, y + 15);

        doc.setTextColor(...oscuro);
        doc.setFont('helvetica', 'bold');
        doc.text('Número de Pedido:', 130, y);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...gris);
        doc.text(`#${pago.idPedido}`, 130, y + 5);

        // ── Datos del cliente ─────────────────────────────────────────────────
        y = 56;
        doc.setDrawColor(...rosa);
        doc.setLineWidth(0.4);
        doc.line(12, y, 198, y);

        doc.setFillColor(...claro);
        doc.rect(12, y + 2, 186, 24, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(...rosa);
        doc.text('DATOS DEL CLIENTE', 16, y + 9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...oscuro);

        if (cliente) {
            doc.text(`Nombre:  ${cliente.nombre || '—'}`, 16, y + 15);
            doc.text(`Correo:  ${cliente.correo || '—'}`, 16, y + 20);
            doc.text(`ID Usuario:  ${pago.idUsuario}`, 120, y + 15);
            doc.text(`Rol:  ${cliente.rol || '—'}`, 120, y + 20);
        } else {
            doc.text(`ID Usuario: ${pago.idUsuario || '—'}   (datos de cliente no disponibles)`, 16, y + 15);
        }

        // ── Método y estado de pago ───────────────────────────────────────────
        y = 90;
        doc.setDrawColor(...rosa);
        doc.line(12, y, 198, y);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(...rosa);
        doc.text('INFORMACIÓN DEL PAGO', 16, y + 8);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...oscuro);
        doc.text(`Método de pago:`, 16, y + 15);
        doc.setFont('helvetica', 'bold');
        doc.text(pago.metodoPago || 'N/A', 55, y + 15);

        doc.setFont('helvetica', 'normal');
        doc.text(`Estado:`, 120, y + 15);
        doc.setFont('helvetica', 'bold');
        const estadoColor = pago.estado === 'Pagado' ? [22, 163, 74] : pago.estado === 'Pendiente' ? [202, 138, 4] : [220, 38, 38];
        doc.setTextColor(...estadoColor);
        doc.text(pago.estado || 'Pendiente', 140, y + 15);
        doc.setTextColor(...oscuro);

        // ── Detalle de productos ──────────────────────────────────────────────
        y = 115;
        doc.setDrawColor(...rosa);
        doc.line(12, y, 198, y);

        // Encabezado tabla
        doc.setFillColor(...oscuro);
        doc.rect(12, y + 2, 186, 8, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(255, 255, 255);
        doc.text('PRODUCTO', 16, y + 7.5);
        doc.text('CANT.', 120, y + 7.5);
        doc.text('PRECIO UNIT.', 140, y + 7.5);
        doc.text('SUBTOTAL', 172, y + 7.5);

        y += 13;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);

        if (detallesPedido.length > 0) {
            detallesPedido.forEach((det, i) => {
                if (i % 2 === 0) {
                    doc.setFillColor(250, 246, 244);
                    doc.rect(12, y - 4, 186, 7, 'F');
                }
                doc.setTextColor(...oscuro);
                const nombreProd = det.nombre || det.producto?.nombre || `Producto #${det.idProducto}`;
                doc.text(nombreProd.substring(0, 45), 16, y);
                doc.text(String(det.cantidad), 124, y);
                doc.text(formatoMoneda(det.precioUnitario), 140, y);
                doc.text(formatoMoneda(det.cantidad * det.precioUnitario), 172, y);
                y += 8;
            });
        } else {
            doc.setTextColor(...gris);
            doc.text('Orden de Productos Cosméticos y Cuidado Personal', 16, y);
            doc.text('1', 124, y);
            doc.text(formatoMoneda(pago.monto), 140, y);
            doc.text(formatoMoneda(pago.monto), 172, y);
            y += 8;
        }

        // ── Totales ───────────────────────────────────────────────────────────
        y += 4;
        doc.setDrawColor(...rosa);
        doc.line(130, y, 198, y);
        y += 6;

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...gris);
        doc.text('Subtotal:', 140, y);
        doc.setTextColor(...oscuro);
        doc.text(formatoMoneda(pago.monto), 172, y);
        y += 6;
        doc.setTextColor(...gris);
        doc.text('Impuestos (IVA 13%):', 132, y);
        doc.setTextColor(...oscuro);
        doc.text(formatoMoneda(pago.monto * 0.13), 172, y);
        y += 6;
        doc.setFillColor(...oscuro);
        doc.rect(130, y - 4, 68, 9, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(255, 255, 255);
        doc.text('TOTAL:', 140, y + 2);
        doc.text(formatoMoneda(pago.monto), 172, y + 2);

        // ── Pie de página ─────────────────────────────────────────────────────
        const piePagina = 282;
        doc.setDrawColor(...rosa);
        doc.setLineWidth(0.3);
        doc.line(12, piePagina - 8, 198, piePagina - 8);
        doc.setFont('times', 'italic');
        doc.setFontSize(10);
        doc.setTextColor(...rosa);
        doc.text('¡Gracias por apoyar nuestro espacio de belleza!', 12, piePagina - 3);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(...gris);
        doc.text('Este documento es un comprobante oficial de Beauty Store S.A. · beautystorecr.com', 12, piePagina + 2);
        doc.text(`Generado el ${new Date().toLocaleString('es-CR')}`, 148, piePagina + 2);

        doc.save(`Factura_BeautyStore_#${pago.idPago}.pdf`);
    };

    // ─── Encabezados ──────────────────────────────────────────────────────────
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
                <th className={th}>Descripción</th>
                <th className={th}>Imagen</th>
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

    // ─── Filas ─────────────────────────────────────────────────────────────────
    const renderFilaTabla = (item, idx) => {
        const id = item.idProducto || item.idCategoria || item.idUsuario || item.idPago;
        return (
            <tr key={idx} className="border-t border-[#E8D8D2] hover:bg-[#FAFAF8] transition-colors">

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
                    <td className="p-4 text-[#6B4E4E] max-w-[200px] truncate">{item.descripcion || '—'}</td>
                    <td className="p-4 text-[#6B4E4E]">
                        {item.imagen ? (
                            <div className="flex items-center gap-2">
                                <img
                                    src={`/img/${item.imagen}`}
                                    alt={item.nombre}
                                    className="w-8 h-8 object-cover rounded border border-[#E8D8D2]"
                                    onError={(e) => { e.target.src = '/img/sin-imagen.webp'; }}
                                />
                                <span className="text-xs truncate max-w-[100px]">{item.imagen}</span>
                            </div>
                        ) : '—'}
                    </td>
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
                    <td className="p-4 text-[#6B4E4E]">{item.metodoPago || '—'}</td>
                    <td className="p-4 text-[#6B4E4E]">{formatoMoneda(item.monto)}</td>
                    <td className="p-4 text-[#6B4E4E]">{new Date(item.fechaPago).toLocaleDateString('es-CR')}</td>
                    <td className="p-4">
                        <span className={`px-2 py-1 text-xs rounded-full uppercase tracking-wide ${item.estado === 'Pagado' ? 'bg-green-100 text-green-700' :
                            item.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                            }`}>
                            {item.estado || 'Pendiente'}
                        </span>
                    </td>
                </>)}

                <td className="p-4 text-right space-x-3">
                    {vistaActiva === 'pagos' && (
                        <button onClick={() => descargarPDFFactura(item)}
                            className="text-[#C9758A] hover:text-[#2A1F1F] text-sm font-medium tracking-wide transition-colors mr-2">
                            PDF FACTURA
                        </button>
                    )}
                    <button onClick={() => abrirModal(item)}
                        className="text-[#C4975A] hover:text-[#2A1F1F] text-sm font-medium tracking-wide transition-colors">
                        EDITAR
                    </button>
                    <button onClick={() => confirmarEliminar(id)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium tracking-wide transition-colors">
                        ELIMINAR
                    </button>
                </td>
            </tr>
        );
    };

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
                        <button key={v} onClick={() => setVistaActiva(v)}
                            className={`block w-full text-left px-4 py-3 rounded text-sm tracking-widest uppercase transition-colors ${vistaActiva === v ? 'bg-[#C9758A] text-white font-medium' : 'text-gray-400 hover:bg-white/10'
                                }`}>
                            {v}
                        </button>
                    ))}
                </nav>
                <button onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
                    className="mt-auto px-4 py-3 text-sm tracking-widest uppercase text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors text-left w-full">
                    Cerrar Sesión
                </button>
            </aside>

            {/* Contenido */}
            <main className="flex-1 p-10 overflow-y-auto">
                <div className="flex justify-between items-end mb-8 border-b border-[#E8D8D2] pb-4">
                    <h2 className="text-4xl font-semibold text-[#2A1F1F] capitalize" style={serif}>{vistaActiva}</h2>
                    {['productos', 'categorias', 'usuarios', 'pagos'].includes(vistaActiva) && (
                        <button onClick={() => abrirModal()}
                            className="px-6 py-2.5 bg-[#2A1F1F] text-white text-sm font-medium tracking-widest hover:bg-[#C9758A] transition-colors">
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
                                { title: 'Unidades Stock Crítico', value: stats.stockBajo }
                            ].map((i, idx) => (
                                <div key={idx} className="bg-white p-6 border border-[#E8D8D2] shadow-sm rounded-sm">
                                    <h3 className="text-xs font-medium tracking-widest text-[#C4975A] uppercase mb-2">{i.title}</h3>
                                    <p className="text-4xl font-semibold text-[#2A1F1F]" style={serif}>{i.value}</p>
                                </div>
                            ))}
                        </div>
                        <div className="bg-white p-8 border border-[#E8D8D2] shadow-sm rounded-sm h-[400px] w-full">
                            <h3 className="text-xl font-semibold text-[#2A1F1F] mb-6" style={serif}>Tendencia de Ventas (Agrupado por Fecha)</h3>
                            <ResponsiveContainer width="100%" height="85%">
                                <BarChart data={dataVentas}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8D8D2" />
                                    <XAxis dataKey="name" tick={{ fill: '#6B4E4E', fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: '#6B4E4E', fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <Tooltip cursor={{ fill: '#F2E8E4' }}
                                        contentStyle={{ backgroundColor: '#2A1F1F', color: 'white', border: 'none' }}
                                        formatter={(v) => [formatoMoneda(v), 'Ventas']} />
                                    <Bar dataKey="ventas" fill="#C9758A" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                ) : (
                    <div className="bg-[#F7F2EF] p-1 rounded-sm border border-[#E8D8D2]">
                        <div className="bg-white overflow-x-auto">
                            <table className="w-full text-left whitespace-nowrap">
                                <thead>{renderEncabezadosTabla()}</thead>
                                <tbody>
                                    {(vistaActiva === 'productos' ? productos :
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
                    <div className="bg-white p-8 max-w-md w-full border border-[#E8D8D2] shadow-xl relative max-h-[90vh] overflow-y-auto">
                        <button onClick={() => setModalAbierto(false)}
                            className="absolute top-4 right-4 text-2xl text-[#A49393] hover:text-[#2A1F1F]">
                            &times;
                        </button>
                        <h3 className="text-2xl font-semibold text-[#2A1F1F] mb-6" style={serif}>
                            {modoEdicion ? 'Editar' : 'Nuevo'} {vistaActiva.slice(0, -1)}
                        </h3>

                        <form onSubmit={guardarItem} className="space-y-4">

                            {/* Campo Nombre — productos y categorias */}
                            {(vistaActiva === 'productos' || vistaActiva === 'categorias') && (
                                <div>
                                    <label className="block text-xs font-medium tracking-widest text-[#2A1F1F] uppercase mb-1">Nombre</label>
                                    <input required name="nombre" value={itemActual.nombre || ''} onChange={manejarCambioInput}
                                        className="w-full p-2 border border-[#E8D8D2] bg-[#FAFAF8] text-[#2A1F1F] focus:outline-none focus:border-[#C9758A]" />
                                </div>
                            )}

                            {/* ✅ FIX CATEGORIAS: campos descripcion e imagen */}
                            {vistaActiva === 'categorias' && (<>
                                <div>
                                    <label className="block text-xs font-medium tracking-widest text-[#2A1F1F] uppercase mb-1">Descripción</label>
                                    <textarea name="descripcion" value={itemActual.descripcion || ''} onChange={manejarCambioInput}
                                        className="w-full p-2 border border-[#E8D8D2] bg-[#FAFAF8] text-[#2A1F1F] focus:outline-none focus:border-[#C9758A] resize-none h-20" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium tracking-widest text-[#2A1F1F] uppercase mb-1">Nombre de imagen</label>
                                    <input name="imagen" value={itemActual.imagen || ''} onChange={manejarCambioInput}
                                        placeholder="ej: maquillaje.jpg"
                                        className="w-full p-2 border border-[#E8D8D2] bg-[#FAFAF8] text-[#2A1F1F] focus:outline-none focus:border-[#C9758A]" />
                                    {itemActual.imagen && (
                                        <img src={`/img/${itemActual.imagen}`} alt="preview"
                                            className="mt-2 w-16 h-16 object-cover border border-[#E8D8D2] rounded"
                                            onError={(e) => { e.target.src = '/img/sin-imagen.webp'; }} />
                                    )}
                                </div>
                            </>)}

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
                                    <label className="block text-xs font-medium tracking-widest text-[#2A1F1F] uppercase mb-1">Nombre de imagen</label>
                                    <input required name="imagen" value={itemActual.imagen || ''} onChange={manejarCambioInput}
                                        placeholder="ej: producto.jpg"
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

                            {/* ✅ FIX PAGOS: metodoPago y estado con nombre correcto */}
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
                                        <option value="PayPal">PayPal</option>
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
                                    <label className="block text-xs font-medium tracking-widest text-[#2A1F1F] uppercase mb-1">Estado</label>
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
                                <button type="button" onClick={() => setModalAbierto(false)}
                                    className="px-5 py-2.5 text-sm font-medium tracking-widest text-[#6B4E4E] hover:text-[#2A1F1F] transition-colors">
                                    CANCELAR
                                </button>
                                <button type="submit" disabled={cargandoEnvio}
                                    className="px-6 py-2.5 bg-[#2A1F1F] text-white text-sm font-medium tracking-widest hover:bg-[#C9758A] transition-colors disabled:opacity-70">
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