import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const serif = { fontFamily: "'Cormorant Garamond', 'Times New Roman', Georgia, serif" }
const sans = { fontFamily: "'Jost', 'Inter', sans-serif" }

export default function Registro() {
    const [nombre, setNombre] = useState('')
    const [correo, setCorreo] = useState('')
    const [password, setPassword] = useState('')
    const [confirmarPassword, setConfirmarPassword] = useState('')

    const [error, setError] = useState('')
    const [cargando, setCargando] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (password !== confirmarPassword) {
            setError('Las contraseñas no coinciden. Por favor, verifica.')
            return
        }

        setCargando(true)

        try {
            const response = await fetch('http://localhost:5090/api/Auth/registro', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nombre, correo, password })
            })

            if (!response.ok) {
                throw new Error('Hubo un problema al crear la cuenta. El correo podría ya estar registrado.')
            }

            navigate('/login')

        } catch (err) {
            setError(err.message)
        } finally {
            setCargando(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8] py-12 px-4 sm:px-6 lg:px-8" style={sans}>
            <div className="max-w-md w-full space-y-8 bg-white p-10 border border-[#E8D8D2] shadow-sm">

                {/* Cabecera */}
                <div className="text-center">
                    <Link to="/" className="inline-flex items-center gap-2 text-3xl font-semibold text-[#2A1F1F] no-underline mb-6" style={serif}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C9758A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
                        </svg>
                        <span>Beauty<span className="text-[#C9758A] italic">Store</span></span>
                    </Link>
                    <h2 className="text-2xl tracking-tight text-[#2A1F1F]" style={serif}>
                        Crear Cuenta
                    </h2>
                    <p className="mt-2 text-sm text-[#6B4E4E] font-light">
                        Únete y recibe un 10% de descuento en tu primera compra
                    </p>
                </div>

                {error && (
                    <div className="bg-[#FDF0F0] border border-[#F2C4C4] text-[#C9758A] px-4 py-3 text-sm text-center">
                        {error}
                    </div>
                )}

                <form className="mt-8 space-y-5" onSubmit={handleSubmit}>

                    <div>
                        <label htmlFor="nombre" className="block text-xs font-medium tracking-widest text-[#2A1F1F] uppercase mb-1">
                            Nombre Completo
                        </label>
                        <input
                            id="nombre"
                            name="nombre"
                            type="text"
                            required
                            className="appearance-none relative block w-full px-3 py-2 border border-[#E8D8D2] placeholder-[#A49393] text-[#2A1F1F] focus:outline-none focus:ring-[#C9758A] focus:border-[#C9758A] focus:z-10 sm:text-sm bg-[#FAFAF8] transition-colors"
                            placeholder="Ej. María Pérez"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                        />
                    </div>

                    <div>
                        <label htmlFor="correo" className="block text-xs font-medium tracking-widest text-[#2A1F1F] uppercase mb-1">
                            Correo Electrónico
                        </label>
                        <input
                            id="correo"
                            name="correo"
                            type="email"
                            required
                            className="appearance-none relative block w-full px-3 py-2 border border-[#E8D8D2] placeholder-[#A49393] text-[#2A1F1F] focus:outline-none focus:ring-[#C9758A] focus:border-[#C9758A] focus:z-10 sm:text-sm bg-[#FAFAF8] transition-colors"
                            placeholder="tu@correo.com"
                            value={correo}
                            onChange={(e) => setCorreo(e.target.value)}
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-xs font-medium tracking-widest text-[#2A1F1F] uppercase mb-1">
                            Contraseña
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            minLength="6"
                            className="appearance-none relative block w-full px-3 py-2 border border-[#E8D8D2] placeholder-[#A49393] text-[#2A1F1F] focus:outline-none focus:ring-[#C9758A] focus:border-[#C9758A] focus:z-10 sm:text-sm bg-[#FAFAF8] transition-colors"
                            placeholder="Mínimo 6 caracteres"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div>
                        <label htmlFor="confirmarPassword" className="block text-xs font-medium tracking-widest text-[#2A1F1F] uppercase mb-1">
                            Confirmar Contraseña
                        </label>
                        <input
                            id="confirmarPassword"
                            name="confirmarPassword"
                            type="password"
                            required
                            className="appearance-none relative block w-full px-3 py-2 border border-[#E8D8D2] placeholder-[#A49393] text-[#2A1F1F] focus:outline-none focus:ring-[#C9758A] focus:border-[#C9758A] focus:z-10 sm:text-sm bg-[#FAFAF8] transition-colors"
                            placeholder="Repite tu contraseña"
                            value={confirmarPassword}
                            onChange={(e) => setConfirmarPassword(e.target.value)}
                        />
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={cargando}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium tracking-widest text-white bg-[#2A1F1F] hover:bg-[#C9758A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C9758A] transition-colors uppercase disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {cargando ? 'Registrando...' : 'Crear Cuenta'}
                        </button>
                    </div>
                </form>

                <div className="text-center mt-6">
                    <p className="text-sm text-[#6B4E4E] font-light">
                        ¿Ya tienes una cuenta?{' '}
                        <Link to="/login" className="font-medium text-[#C9758A] hover:text-[#b5647a] no-underline">
                            Inicia sesión aquí
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}