import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { PayPalScriptProvider } from "@paypal/react-paypal-js"

import Home from './Pages/Home'
import Login from './Pages/Login'
import Registro from './Pages/Registro'
import Catalogo from './Pages/Catalogo'
import AdminPanel from './Pages/AdminPanel'
import Checkout from './Pages/Checkout'
import RutaProtegida from './components/RutaProtegida'

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
        <PayPalScriptProvider
            options={{
                clientId: "AdcW48zVwlVE0qVIzm16fUtEM5ZzhEJGKXwzC3hsQKnmt9Flk0RoLTAo4PTgvoFC9vlDGq7altz4rqWz"
            }}
        >
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/registro" element={<Registro />} />
                    <Route path="/catalogo" element={<Catalogo />} />

                    <Route
                        path="/checkout"
                        element={
                            <RutaProtegida>
                                <Checkout />
                            </RutaProtegida>
                        }
                    />

                    <Route
                        path="/admin"
                        element={
                            <RutaProtegida rolRequerido="Admin">
                                <AdminPanel />
                            </RutaProtegida>
                        }
                    />

                    <Route path="*" element={<Placeholder nombre="Página no encontrada" />} />
                </Routes>
            </BrowserRouter>
        </PayPalScriptProvider>
    )
}