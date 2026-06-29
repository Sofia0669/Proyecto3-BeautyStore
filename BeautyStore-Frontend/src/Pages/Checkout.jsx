import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { PayPalButtons } from "@paypal/react-paypal-js";
import jsPDF from 'jspdf';

export default function Checkout() {
    const { cart, total, clearCart } = useCart();
    const [mensaje, setMensaje] = useState(null);
    const navigate = useNavigate();
    const API = 'http://localhost:5090/api';
    const formatoMoneda = (valor) =>
        new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC' }).format(valor);


    // 1️⃣ Crear orden en backend
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

    // 2️⃣ Capturar pago y guardar en BD
    const capturarOrden = async (data) => {
        // Mapear el carrito al formato que espera el backend
        const carritoFormateado = cart.map(item => ({
            idProducto: item.id,
            cantidad: item.cantidad
        }));

        const response = await fetch('http://localhost:5090/api/paypal/capture-order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                orderID: data.orderID,
                carrito: carritoFormateado
            })
        });

        const result = await response.json();

        if (response.ok) {
            clearCart();
            setMensaje({ texto: `¡Pago exitoso! Pedido #${result.idPedido}`, tipo: 'success' });
            descargarPDFFactura(result);
            setTimeout(() => navigate('/'), 3000);
        } else {
            setMensaje({ texto: result.mensaje || "Error en el pago", tipo: 'error' });
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

    return (
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-xl">

            <h2 className="text-2xl font-bold mb-6">Procesar Pago</h2>

            <div className="mb-4">
                <p className="text-gray-500">Total a pagar</p>
                <p className="text-3xl font-bold text-green-600">
                    ₡{total.toLocaleString()}
                </p>
            </div>

            {/* Botón PayPal */}
            <PayPalButtons
                createOrder={crearOrden}
                onApprove={capturarOrden}
            />

            {mensaje && (
                <div className={`mt-4 p-3 rounded ${mensaje.tipo === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {mensaje.texto}
                </div>
            )}
        </div>
    );
}