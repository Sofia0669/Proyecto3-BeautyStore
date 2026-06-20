import { useState, useEffect } from 'react';

const dataVentas = [
    { name: 'Lun', ventas: 4000 }, { name: 'Mar', ventas: 3000 },
    { name: 'Mié', ventas: 5200 }, { name: 'Jue', ventas: 2780 },
    { name: 'Vie', ventas: 6100 },
];

export default function AdminDashboard() {
    const [vistaActiva, setVistaActiva] = useState('dashboard');
    const [busqueda, setBusqueda] = useState('');
    const [refresh, setRefresh] = useState(false);

    const [stats, setStats] = useState({ totalVentas: 0, totalProductos: 0, stockBajo: 0 });
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [pagos, setPagos] = useState([]);

    const [modalAbierto, setModalAbierto] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [itemActual, setItemActual] = useState({});

    // --- FETCH DE DATOS ---
    useEffect(() => {
        const cargarDatos = async () => {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

            try {
                const resProd = await fetch('http://localhost:5090/api/Productos', { headers });
                if (resProd.ok) setProductos(await resProd.json());

                // Las categorías se cargan siempre: las usa tanto la vista "categorias"
                // como el <select> de categoría dentro del formulario de productos.
                const resCat = await fetch('http://localhost:5090/api/Categorias', { headers });
                if (resCat.ok) setCategorias(await resCat.json());

                if (vistaActiva === 'dashboard') {
                    const resStats = await fetch('http://localhost:5090/api/Productos/stats', { headers });
                    if (resStats.ok) setStats(await resStats.json());
                }
                if (vistaActiva === 'usuarios') {
                    const resUsr = await fetch('http://localhost:5090/api/Usuarios', { headers });
                    if (resUsr.ok) setUsuarios(await resUsr.json());
                }
                if (vistaActiva === 'pagos') {
                    const resPag = await fetch('http://localhost:5090/api/Pagos', { headers });
                    if (resPag.ok) setPagos(await resPag.json());
                }
            } catch (error) { console.error("Error:", error); }
        };
        cargarDatos();
    }, [refresh, vistaActiva]);

    const guardarItem = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const endpointMap = { 'productos': 'Productos', 'categorias': 'Categorias', 'usuarios': 'Usuarios' };

        const endpointBase = endpointMap[vistaActiva];
        let endpoint = `http://localhost:5090/api/${endpointBase}`;
        let method = modoEdicion ? 'PUT' : 'POST';

        const id = itemActual.idProducto || itemActual.idCategoria || itemActual.idUsuario;
        if (modoEdicion) endpoint += `/${id}`;

        try {
            const res = await fetch(endpoint, {
                method: method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(itemActual)
            });

            if (res.ok) {
                setModalAbierto(false);
                setRefresh(!refresh);
            } else {
                const err = await res.text();
                alert(`Error: ${err}`);
            }
        } catch (error) { alert("Error de conexión"); }
    };

    const eliminarItem = async (id, endpointBase) => {
        if (!window.confirm("¿Estás seguro de eliminar este registro de forma permanente?")) return;

        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`http://localhost:5090/api/${endpointBase}/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                setRefresh(!refresh);
            } else {
                const errorText = await res.text();
                console.error("Error al eliminar:", errorText);
                alert(`Error al eliminar (Código ${res.status}). Puede que el registro esté siendo usado en otra tabla (Ej: Un producto que ya tiene ventas).`);
            }
        } catch (error) {
            console.error("Error de conexión:", error);
        }
    };

    const abrirModal = (item = null) => {
        if (item) {
            setModoEdicion(true);
            setItemActual(item);
        } else {
            setModoEdicion(false);
            setItemActual({});
        }
        setModalAbierto(true);
    };

    const exportarPDF = () => window.print();

    // --- RENDERIZADO DE VISTAS ---
    const renderTabla = () => {
        if (vistaActiva === 'dashboard') {
            return (
                <>
                    {/* KPI Cards */}
                    <div className="grid grid-cols-3 gap-6 mb-8">
                        {[
                            { title: 'Ventas Totales', value: `₡${stats.totalVentas}`, color: 'text-gray-900' },
                            { title: 'Productos Activos', value: stats.totalProductos, color: 'text-gray-900' },
                            { title: 'Stock Crítico', value: stats.stockBajo, color: 'text-red-500' }
                        ].map((item, i) => (
                            <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="text-gray-500 text-sm mb-2">{item.title}</h3>
                                <p className={`text-3xl font-bold ${item.color}`}>{item.value}</p>
                            </div>
                        ))}
                    </div>
                    {/* Gráfica Nativa */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
                        <h3 className="text-lg font-semibold mb-6 text-gray-700">Tendencia de Ventas (Semanal)</h3>
                        <div className="flex items-end justify-between h-48 gap-4 px-4">
                            {dataVentas.map((d, index) => {
                                const maxVentas = Math.max(...dataVentas.map(v => v.ventas));
                                const altura = (d.ventas / maxVentas) * 100;
                                return (
                                    <div key={index} className="flex flex-col items-center flex-1 group">
                                        <div className="w-full bg-gray-100 rounded-t-lg relative h-full flex items-end">
                                            <div style={{ height: `${altura}%` }} className="w-full bg-[#C9758A] rounded-t-lg"></div>
                                        </div>
                                        <span className="text-xs text-gray-400 mt-2 font-medium">{d.name}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </>
            );
        }

        // Tabla genérica para Productos, Categorias o Usuarios
        let datosTabla = [];
        let columnas = [];

        if (vistaActiva === 'productos') {
            datosTabla = productos.filter(p => p.nombre?.toLowerCase().includes(busqueda.toLowerCase()));
            columnas = ['Nombre', 'Precio', 'Stock'];
        } else if (vistaActiva === 'categorias') {
            datosTabla = categorias.filter(c => c.nombre?.toLowerCase().includes(busqueda.toLowerCase()));
            columnas = ['ID', 'Nombre', 'Descripción'];
        } else if (vistaActiva === 'usuarios') {
            datosTabla = usuarios.filter(u => u.correo?.toLowerCase().includes(busqueda.toLowerCase()));
            columnas = ['Nombre', 'Correo', 'Rol'];
        } else if (vistaActiva === 'pagos') {
            datosTabla = pagos;
            columnas = ['ID Pago', 'Monto', 'Fecha', 'Método'];
        }

        return (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between mb-6">
                    <input
                        type="text"
                        placeholder="Buscar..."
                        className="border border-gray-200 p-2 rounded-lg w-64 outline-none focus:ring-2 focus:ring-[#C9758A]"
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                    <div className="space-x-3">
                        {vistaActiva !== 'pagos' && (
                            <button onClick={() => abrirModal()} className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition">
                                + Nuevo Registro
                            </button>
                        )}
                        <button onClick={exportarPDF} className="bg-[#C9758A] text-white px-4 py-2 rounded-lg hover:bg-[#a86073] transition">
                            Exportar PDF
                        </button>
                    </div>
                </div>

                <table className="w-full text-left">
                    <thead className="text-gray-400 text-sm uppercase">
                        <tr>
                            {columnas.map(col => <th key={col} className="p-4">{col}</th>)}
                            {vistaActiva !== 'pagos' && <th className="p-4 text-center">Acciones</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {datosTabla.map((item, index) => (
                            <tr key={index} className="hover:bg-gray-50 transition">
                                {vistaActiva === 'productos' && (
                                    <>
                                        <td className="p-4">{item.nombre}</td>
                                        <td className="p-4">₡{item.precio}</td>
                                        <td className="p-4">{item.stock}</td>
                                    </>
                                )}
                                {vistaActiva === 'categorias' && (
                                    <>
                                        <td className="p-4">{item.idCategoria}</td>
                                        <td className="p-4">{item.nombre}</td>
                                        <td className="p-4">{item.descripcion || 'N/A'}</td>
                                    </>
                                )}
                                {vistaActiva === 'usuarios' && (
                                    <>
                                        <td className="p-4">{item.nombre}</td>
                                        <td className="p-4">{item.correo}</td>
                                        <td className="p-4"><span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">{item.rol}</span></td>
                                    </>
                                )}
                                {vistaActiva === 'pagos' && (
                                    <>
                                        <td className="p-4">#{item.idPago}</td>
                                        <td className="p-4 font-bold text-[#C9758A]">₡{item.monto}</td>
                                        <td className="p-4">{new Date(item.fechaPago).toLocaleDateString()}</td>
                                        <td className="p-4">{item.metodoPago}</td>
                                    </>
                                )}

                                {vistaActiva !== 'pagos' && (
                                    <td className="p-4 text-center space-x-3">
                                        <button onClick={() => abrirModal(item)} className="text-blue-500 hover:underline">Editar</button>
                                        <button
                                            onClick={() => eliminarItem(item.idProducto || item.idCategoria || item.idUsuario, vistaActiva.charAt(0).toUpperCase() + vistaActiva.slice(1))}
                                            className="text-red-500 hover:underline">
                                            Eliminar
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col">
                <div className="p-6">
                    <h1 className="text-2xl font-bold mb-2 text-[#C9758A]">Beauty Admin</h1>
                    <p className="text-xs text-gray-400">Panel de Control</p>
                </div>
                <nav className="flex-1 px-4 space-y-2 mt-4">
                    {['dashboard', 'productos', 'categorias', 'usuarios', 'pagos'].map(vista => (
                        <button
                            key={vista}
                            onClick={() => { setVistaActiva(vista); setBusqueda(''); }}
                            className={`w-full text-left p-3 rounded-lg capitalize transition ${vistaActiva === vista ? 'bg-[#C9758A] text-white' : 'hover:bg-slate-800 text-gray-300'}`}
                        >
                            {vista}
                        </button>
                    ))}
                </nav>
            </aside>

            <main className="flex-1 p-8 overflow-y-auto">
                <header className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-800 capitalize">{vistaActiva}</h2>
                </header>

                {renderTabla()}
            </main>

            {modalAbierto && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-2xl w-96 shadow-2xl">
                        <h3 className="text-xl font-bold mb-4 capitalize">{modoEdicion ? 'Editar' : 'Nuevo'} Registro</h3>
                        <form onSubmit={guardarItem} className="space-y-4">

                            {/* Campos dinámicos según la vista */}
                            {vistaActiva === 'productos' && (
                                <>
                                    <input required placeholder="Nombre Producto" className="w-full border p-2 rounded"
                                        value={itemActual.nombre || ''} onChange={e => setItemActual({ ...itemActual, nombre: e.target.value })} />
                                    <textarea placeholder="Descripción" className="w-full border p-2 rounded"
                                        value={itemActual.descripcion || ''} onChange={e => setItemActual({ ...itemActual, descripcion: e.target.value })} />
                                    <input required type="number" step="0.01" placeholder="Precio" className="w-full border p-2 rounded"
                                        value={itemActual.precio || ''} onChange={e => setItemActual({ ...itemActual, precio: parseFloat(e.target.value) })} />
                                    <input required type="number" placeholder="Stock" className="w-full border p-2 rounded"
                                        value={itemActual.stock || ''} onChange={e => setItemActual({ ...itemActual, stock: parseInt(e.target.value) })} />
                                    <select required className="w-full border p-2 rounded"
                                        value={itemActual.idCategoria || ''}
                                        onChange={e => setItemActual({ ...itemActual, idCategoria: parseInt(e.target.value) })}>
                                        <option value="" disabled>Selecciona una categoría</option>
                                        {categorias.map(c => (
                                            <option key={c.idCategoria} value={c.idCategoria}>{c.nombre}</option>
                                        ))}
                                    </select>
                                </>
                            )}

                            {vistaActiva === 'categorias' && (
                                <>
                                    <input required placeholder="Nombre Categoría" className="w-full border p-2 rounded"
                                        value={itemActual.nombre || ''} onChange={e => setItemActual({ ...itemActual, nombre: e.target.value })} />
                                    <textarea placeholder="Descripción" className="w-full border p-2 rounded"
                                        value={itemActual.descripcion || ''} onChange={e => setItemActual({ ...itemActual, descripcion: e.target.value })} />
                                </>
                            )}

                            {vistaActiva === 'usuarios' && (
                                <>
                                    <input required placeholder="Nombre Completo" className="w-full border p-2 rounded"
                                        value={itemActual.nombre || ''} onChange={e => setItemActual({ ...itemActual, nombre: e.target.value })} />
                                    <input required type="email" placeholder="Correo" className="w-full border p-2 rounded"
                                        value={itemActual.correo || ''} onChange={e => setItemActual({ ...itemActual, correo: e.target.value })} />
                                    {/* Nota: En un sistema real, no se edita la contraseña así, pero para tu CRUD escolar sirve */}
                                    {!modoEdicion && <input required type="password" placeholder="Contraseña" className="w-full border p-2 rounded"
                                        value={itemActual.password || ''} onChange={e => setItemActual({ ...itemActual, password: e.target.value })} />}
                                    <select className="w-full border p-2 rounded" value={itemActual.rol || 'Usuario'} onChange={e => setItemActual({ ...itemActual, rol: e.target.value })}>
                                        <option value="Usuario">Usuario</option>
                                        <option value="Admin">Admin</option>
                                    </select>
                                </>
                            )}

                            <div className="flex justify-end space-x-3 mt-6">
                                <button type="button" onClick={() => setModalAbierto(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded">Cancelar</button>
                                <button type="submit" className="bg-[#C9758A] text-white px-4 py-2 rounded shadow hover:bg-[#a86073]">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}