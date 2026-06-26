import { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cart, setCart] = useState(() => {
        const saved = localStorage.getItem('cart');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product) => {
        const idReal = product.idProducto || product.id;
        const imagenReal = product.imagen || product.img;

        setCart(prev => {
            const exists = prev.find(item => item.id === idReal);
            if (exists) {
                return prev.map(item =>
                    item.id === idReal ? { ...item, cantidad: item.cantidad + 1 } : item
                );
            }
            return [...prev, {
                id: idReal,
                nombre: product.nombre,
                precio: product.precio,
                imagen: imagenReal,
                cantidad: 1
            }];
        });
    };

    const cambiarCantidad = (id, nuevaCantidad) => {
        if (nuevaCantidad < 1) return;
        setCart(prev => prev.map(item =>
            item.id === id ? { ...item, cantidad: nuevaCantidad } : item
        ));
    };

    const removeFromCart = (id) => setCart(prev => prev.filter(item => item.id !== id));

    const clearCart = () => setCart([]);

    const total = cart.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, total, cambiarCantidad }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => useContext(CartContext);