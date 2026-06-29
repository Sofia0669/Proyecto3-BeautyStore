import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { PayPalButtons } from "@paypal/react-paypal-js";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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

        let factura = null;
        try {
            const res = await fetch(`${API}/Pagos/${pago.idPago}/factura`, { headers });
            if (res.ok) factura = await res.json();
        } catch (_) { }
        if (!factura) factura = { ...pago, cliente: null, productos: [] };

        const cliente = factura.cliente;
        const detallesPedido = factura.productos || [];
        const estadoColor = pago.estado === 'Pagado' ? '#16A34A' : pago.estado === 'Pendiente' ? '#CA8A04' : '#DC2626';

        const productosHtml = detallesPedido.length > 0
            ? detallesPedido.map((det, i) => `
            <tr style="background:${i % 2 === 0 ? '#FAF6F4' : '#fff'}">
                <td style="padding:7px 10px;font-size:10px">${(det.nombre || `Producto #${det.idProducto}`).substring(0, 50)}</td>
                <td style="padding:7px 10px;text-align:center;font-size:10px">${det.cantidad}</td>
                <td style="padding:7px 10px;text-align:right;font-size:10px">${formatoMoneda(det.precioUnitario)}</td>
                <td style="padding:7px 10px;text-align:right;font-size:10px">${formatoMoneda(det.cantidad * det.precioUnitario)}</td>
            </tr>`).join('')
            : `<tr>
            <td style="padding:7px 10px;color:#6B4E4E;font-size:10px">Orden de Productos Cosméticos y Cuidado Personal</td>
            <td style="padding:7px 10px;text-align:center;font-size:10px">1</td>
            <td style="padding:7px 10px;text-align:right;font-size:10px">${formatoMoneda(pago.monto)}</td>
            <td style="padding:7px 10px;text-align:right;font-size:10px">${formatoMoneda(pago.monto)}</td>
        </tr>`;

        const div = document.createElement('div');
        div.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:794px;background:#fff;font-family:Jost,Inter,sans-serif;color:#2A1F1F;';
        div.innerHTML = `
        <div style="background:#C9758A;padding:14px 28px;display:flex;justify-content:space-between;align-items:center">
            <div>
                <div style="font-family:'Times New Roman',serif;font-style:italic;font-size:22px;color:#fff;font-weight:600">Beauty Store</div>
                <div style="font-size:10px;color:rgba(255,255,255,.85);margin-top:2px">Sistema de Control Administrativo · Costa Rica</div>
            </div>
            <div style="text-align:right;color:#fff">
                <div style="font-weight:700;font-size:13px;letter-spacing:1px">COMPROBANTE DE PAGO</div>
                <div style="font-size:10px;margin-top:2px">Nº Transacción: #${pago.idPago}</div>
            </div>
        </div>

        <div style="padding:24px 32px">
            <div style="display:flex;justify-content:space-between;margin-bottom:18px">
                <div>
                    <div style="font-weight:700;font-size:11px;margin-bottom:3px">Emitido por:</div>
                    <div style="font-size:10px;color:#6B4E4E">Beauty Store S.A. · San José, Costa Rica</div>
                    <div style="font-size:10px;color:#6B4E4E">Fecha: ${new Date(pago.fechaPago).toLocaleDateString('es-CR')}</div>
                    <div style="font-size:10px;color:#6B4E4E">Hora: ${new Date(pago.fechaPago).toLocaleTimeString('es-CR')}</div>
                </div>
                <div>
                    <div style="font-weight:700;font-size:11px;margin-bottom:3px">Número de Pedido:</div>
                    <div style="font-size:10px;color:#6B4E4E">#${pago.idPedido}</div>
                </div>
            </div>

            <div style="border-top:1.5px solid #C9758A;padding-top:12px;margin-bottom:14px">
                <div style="background:#F7F2EF;padding:14px;border-radius:2px">
                    <div style="font-weight:700;font-size:10px;color:#C9758A;letter-spacing:1px;text-transform:uppercase;margin-bottom:7px">Datos del Cliente</div>
                    ${cliente
                ? `<div style="display:grid;grid-template-columns:1fr 1fr;gap:3px;font-size:10px">
                            <div><b>Nombre:</b> ${cliente.nombre || '—'}</div>
                            <div><b>ID Usuario:</b> ${pago.idUsuario}</div>
                            <div><b>Correo:</b> ${cliente.correo || '—'}</div>
                        </div>`
                : `<div style="font-size:10px">ID Usuario: ${pago.idUsuario || '—'} (datos no disponibles)</div>`}
                </div>
            </div>

            <div style="border-top:1.5px solid #C9758A;padding-top:12px;margin-bottom:14px">
                <div style="font-weight:700;font-size:10px;color:#C9758A;letter-spacing:1px;text-transform:uppercase;margin-bottom:7px">Información del Pago</div>
                <div style="display:flex;gap:40px;font-size:10px">
                    <div><span style="color:#6B4E4E">Método: </span><b>${pago.metodoPago || 'PayPal'}</b></div>
                    <div><span style="color:#6B4E4E">Estado: </span><b style="color:${estadoColor}">${pago.estado || 'Pagado'}</b></div>
                </div>
            </div>

            <div style="border-top:1.5px solid #C9758A;padding-top:12px;margin-bottom:14px">
                <table style="width:100%;border-collapse:collapse">
                    <thead>
                        <tr style="background:#2A1F1F;color:#fff">
                            <th style="padding:7px 10px;text-align:left;font-weight:600;font-size:10px">PRODUCTO</th>
                            <th style="padding:7px 10px;text-align:center;font-weight:600;font-size:10px">CANT.</th>
                            <th style="padding:7px 10px;text-align:right;font-weight:600;font-size:10px">PRECIO UNIT.</th>
                            <th style="padding:7px 10px;text-align:right;font-weight:600;font-size:10px">SUBTOTAL</th>
                        </tr>
                    </thead>
                    <tbody>${productosHtml}</tbody>
                </table>
            </div>

            <div style="display:flex;justify-content:flex-end">
                <div style="min-width:260px;font-size:10px">
                    <div style="display:flex;justify-content:space-between;padding:4px 0;border-top:1px solid #C9758A;color:#6B4E4E">
                        <span>Subtotal:</span><span style="color:#2A1F1F">${formatoMoneda(pago.monto)}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;padding:4px 0;color:#6B4E4E">
                        <span>Impuestos (IVA 13%):</span><span style="color:#2A1F1F">${formatoMoneda(pago.monto * 0.13)}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;padding:8px 12px;background:#2A1F1F;color:#fff;font-weight:700;font-size:12px;margin-top:5px">
                        <span>TOTAL:</span><span>${formatoMoneda(pago.monto)}</span>
                    </div>
                </div>
            </div>

            <div style="margin-top:28px;border-top:1px solid #C9758A;padding-top:10px">
                <div style="font-family:'Times New Roman',serif;font-style:italic;font-size:12px;color:#C9758A;margin-bottom:5px">¡Gracias por apoyar nuestro espacio de belleza!</div>
                <div style="font-size:9px;color:#6B4E4E;display:flex;justify-content:space-between">
                    <span>Comprobante oficial de Beauty Store S.A. · beautystorecr.com</span>
                    <span>Generado el ${new Date().toLocaleString('es-CR')}</span>
                </div>
            </div>
        </div>
    `;

        document.body.appendChild(div);
        try {
            const canvas = await html2canvas(div, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            const W = pdf.internal.pageSize.getWidth();
            const H = pdf.internal.pageSize.getHeight();
            const imgH = (canvas.height * W) / canvas.width;

            let pos = 0, restante = imgH;
            pdf.addImage(imgData, 'PNG', 0, pos, W, imgH);
            restante -= H;
            while (restante > 0) {
                pos -= H;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, pos, W, imgH);
                restante -= H;
            }

            pdf.save(`Factura_BeautyStore_#${pago.idPago}.pdf`);
        } finally {
            document.body.removeChild(div);
        }
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