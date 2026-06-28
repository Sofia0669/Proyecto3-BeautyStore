import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { PayPalButtons } from "@paypal/react-paypal-js";

export default function Checkout() {
    const { cart, total, clearCart } = useCart();
    const [mensaje, setMensaje] = useState(null);
    const navigate = useNavigate();

    // 🔵 Crear orden en backend
    const crearOrden = async () => {
        const response = await fetch('http://localhost:5090/api/paypal/create-order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                monto: total,
                carrito: cart
            })
        });

        const data = await response.json();
        return data.id; // orderID de PayPal
    };

    // 🟢 Capturar pago
    const capturarOrden = async (data) => {
        const response = await fetch('http://localhost:5090/api/paypal/capture-order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                orderID: data.orderID,
                carrito: cart
            })
        });

        const result = await response.json();

        if (response.ok) {
            clearCart();
            setMensaje({ texto: `Pago exitoso. Pedido #${result.idPedido}`, tipo: 'success' });

            setTimeout(() => {
                navigate('/');
            }, 3000);
        } else {
            setMensaje({ texto: result.message || "Error en el pago", tipo: 'error' });
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-xl">

            <h2 className="text-2xl font-bold mb-6">Checkout</h2>

            <div className="mb-4">
                <p className="text-gray-500">Total a pagar</p>
                <p className="text-3xl font-bold text-green-600">
                    ₡{total.toLocaleString()}
                </p>
            </div>

            {/* 💳 BOTÓN PAYPAL */}
            <PayPalButtons
                createOrder={crearOrden}
                onApprove={capturarOrden}
            />

            {mensaje && (
                <div className={`mt-4 p-3 rounded ${mensaje.tipo === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>
                    {mensaje.texto}
                </div>
            )}
        </div>
    );
}