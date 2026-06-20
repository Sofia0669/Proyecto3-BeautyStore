import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './Pages/Home'
import Login from './Pages/Login'
import Registro from './Pages/Registro'
import Catalogo from './Pages/Catalogo'
import AdminPanel from './Pages/AdminPanel'
import Checkout from './Pages/Checkout'
import RutaProtegida from './components/RutaProtegida'

// Pantalla de "en desarrollo" / 404
const Placeholder = ({ nombre }) => (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8]">
        <div className="text-center">
            <div className="text-5xl mb-4">🚧</div>
            <h2 className="text-2xl font-bold text-[#3D2A2A]">{nombre}</h2>
            <p className="text-[#6B4E4E] mt-2">Esta pantalla está en desarrollo</p>
        </div>
    </div>
)

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* ── Rutas públicas ── */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<Registro />} />
                <Route path="/catalogo" element={<Catalogo />} />

                {/* ── Rutas protegidas: requieren sesión iniciada ── */}
                <Route
                    path="/checkout"
                    element={
                        <RutaProtegida>
                            <Checkout />
                        </RutaProtegida>
                    }
                />

                {/* ── Rutas de administrador: requieren sesión + rol Admin ── */}
                <Route
                    path="/admin"
                    element={
                        <RutaProtegida rolRequerido="Admin">
                            <AdminPanel />
                        </RutaProtegida>
                    }
                />

                {/* ── 404: cualquier ruta no definida ── */}
                <Route path="*" element={<Placeholder nombre="Página no encontrada" />} />
            </Routes>
        </BrowserRouter>
    )
}
