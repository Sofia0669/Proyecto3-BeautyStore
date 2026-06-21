import { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function AdminDashboard() {
    const [vistaActiva, setVistaActiva] = useState('dashboard');
    const [busqueda, setBusqueda] = useState('');
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

    const fetchSeguro = async (url, headers) => {
        try {
            const res = await fetch(url, { headers });
            if (!res.ok) {
                console.error(`Error en ${url}: ${res.status}`);
                return null;
            }
            return await res.json();
        } catch (e) {
            console.error("Error de red:", e);
            return null;
        }
    };

    useEffect(() => {
        const cargarDatos = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;
            const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

            if (vistaActiva === 'dashboard') {
                const statsData = await fetchSeguro('http://localhost:5090/api/Productos/stats', headers);
                const ventasData = await fetchSeguro('http://localhost:5090/api/Ventas/semanal', headers);
                if (statsData) setStats(statsData);
                if (ventasData) setDataVentas(ventasData);
            }
            else if (vistaActiva === 'productos') {
                const data = await fetchSeguro('http://localhost:5090/api/Productos', headers);
                if (data) setProductos(data);
            }
            else if (vistaActiva === 'categorias') {
                const data = await fetchSeguro('http://localhost:5090/api/Categorias', headers);
                if (data) setCategorias(data);
            }
            else if (vistaActiva === 'usuarios') {
                const data = await fetchSeguro('http://localhost:5090/api/Usuarios', headers);
                if (data) setUsuarios(data);
            }
            else if (vistaActiva === 'pagos') {
                const data = await fetchSeguro('http://localhost:5090/api/Pagos', headers);
                if (data) setPagos(data);
            }
        };
        cargarDatos();
    }, [refresh, vistaActiva]);

    // --- ACCIONES CRUD ---
    const guardarItem = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const endpointMap = { 'productos': 'Productos', 'categorias': 'Categorias', 'usuarios': 'Usuarios' };
        let url = `http://localhost:5090/api/${endpointMap[vistaActiva]}`;
        if (modoEdicion) url += `/${itemActual.idProducto || itemActual.idCategoria || itemActual.idUsuario}`;

        const res = await fetch(url, {
            method: modoEdicion ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(itemActual)
        });
        if (res.ok) { setModalAbierto(false); setRefresh(!refresh); }
        else { alert("Error al guardar: Revisa si tu sesión expiró"); }
    };

    const eliminarItem = async (id) => {
        if (!window.confirm("¿Eliminar?")) return;
        const token = localStorage.getItem('token');
        const endpoint = vistaActiva.charAt(0).toUpperCase() + vistaActiva.slice(1);
        await fetch(`http://localhost:5090/api/${endpoint}/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        setRefresh(!refresh);
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <aside className="w-64 bg-slate-900 text-white p-6">
                <h1 className="text-2xl font-bold mb-8 text-[#C9758A]">Beauty Admin</h1>
                {['dashboard', 'productos', 'categorias', 'usuarios', 'pagos'].map(v => (
                    <button key={v} onClick={() => setVistaActiva(v)} className={`block w-full text-left p-3 rounded capitalize ${vistaActiva === v ? 'bg-slate-800' : 'hover:bg-slate-800'}`}>{v}</button>
                ))}
            </aside>
            <main className="flex-1 p-8 overflow-y-auto">
                <h2 className="text-3xl font-bold mb-6 capitalize">{vistaActiva}</h2>

                {vistaActiva === 'dashboard' ? (
                    <div className="space-y-8">
                        <div className="grid grid-cols-3 gap-6">
                            {[{ title: 'Ventas Totales', value: `₡${stats.totalVentas}` }, { title: 'Productos', value: stats.totalProductos }, { title: 'Stock Crítico', value: stats.stockBajo }].map((i, idx) => (
                                <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                    <h3 className="text-gray-500 text-sm">{i.title}</h3>
                                    <p className="text-3xl font-bold">{i.value}</p>
                                </div>
                            ))}
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-[300px] w-full">
                            <h3 className="text-lg font-semibold mb-6">Tendencia de Ventas</h3>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={dataVentas}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="ventas" fill="#C9758A" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <table className="w-full text-left">
                            <thead><tr className="text-gray-400 uppercase text-sm"><th>Nombre / ID</th><th>Detalle</th><th>Acciones</th></tr></thead>
                            <tbody>
                                {(vistaActiva === 'productos' ? productos : vistaActiva === 'categorias' ? categorias : vistaActiva === 'usuarios' ? usuarios : pagos).map((item, idx) => (
                                    <tr key={idx} className="border-t">
                                        <td className="p-4">{item.nombre || item.idPago || item.idUsuario}</td>
                                        <td className="p-4">{item.precio || item.monto || 'N/A'}</td>
                                        <td className="p-4">
                                            {vistaActiva !== 'pagos' && (
                                                <button onClick={() => { setItemActual(item); setModalAbierto(true); }} className="text-blue-500">Editar</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    );
}