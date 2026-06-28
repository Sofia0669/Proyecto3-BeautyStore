import { createContext, useState, useContext, useEffect } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {

    // Obtiene la llave del carrito según el usuario
    const getCartKey = () => {
        const idUsuario = localStorage.getItem("idUsuario");
        return idUsuario ? `cart_${idUsuario}` : "cart_invitado";
    };

    // Carga el carrito correspondiente al usuario
    const [cart, setCart] = useState(() => {
        const saved = localStorage.getItem(getCartKey());
        return saved ? JSON.parse(saved) : [];
    });

    // Guarda el carrito del usuario actual
    useEffect(() => {
        localStorage.setItem(getCartKey(), JSON.stringify(cart));
    }, [cart]);

    // Recarga el carrito cuando cambia el usuario
    const cargarCarrito = () => {
        const saved = localStorage.getItem(getCartKey());

        if (saved) {
            setCart(JSON.parse(saved));
        } else {
            setCart([]);
        }
    };

    const addToCart = (product) => {

        const idReal = product.idProducto || product.id;
        const imagenReal = product.imagen
            ? `/img/${product.imagen}`
            : product.img;
        console.log(product.nombre);
        console.log(imagenReal);
        setCart(prev => {

            const exists = prev.find(item => item.id === idReal);

            if (exists) {
                return prev.map(item =>
                    item.id === idReal
                        ? { ...item, cantidad: item.cantidad + 1 }
                        : item
                );
            }

            return [
                ...prev,
                {
                    id: idReal,
                    nombre: product.nombre,
                    precio: product.precio,
                    imagen: imagenReal,
                    cantidad: 1
                }
            ];
        });
    };

    const cambiarCantidad = (id, nuevaCantidad) => {

        if (nuevaCantidad < 1) return;

        setCart(prev =>
            prev.map(item =>
                item.id === id
                    ? { ...item, cantidad: nuevaCantidad }
                    : item
            )
        );
    };

    const removeFromCart = (id) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    const clearCart = () => {
        setCart([]);
        localStorage.removeItem(getCartKey());
    };

    const total = cart.reduce(
        (acc, item) => acc + item.precio * item.cantidad,
        0
    );

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                removeFromCart,
                clearCart,
                cambiarCantidad,
                total,
                cargarCarrito
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => useContext(CartContext);