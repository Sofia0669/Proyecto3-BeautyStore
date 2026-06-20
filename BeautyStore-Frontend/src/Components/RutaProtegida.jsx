import { Navigate } from 'react-router-dom'

/**
 * Envuelve una ruta para exigir sesión iniciada y, opcionalmente, un rol específico.
 *
 * - Sin token  -> redirige a /login
 * - Con token pero rol incorrecto -> redirige a /
 *
 * Uso:
 *   <RutaProtegida><Checkout /></RutaProtegida>
 *   <RutaProtegida rolRequerido="Admin"><AdminPanel /></RutaProtegida>
 */
export default function RutaProtegida({ children, rolRequerido }) {
    const token = localStorage.getItem('token')
    const rol = localStorage.getItem('rol')

    if (!token) {
        return <Navigate to="/login" replace />
    }

    if (rolRequerido && rol !== rolRequerido) {
        return <Navigate to="/" replace />
    }

    return children
}
