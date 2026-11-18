import { createContext, useState, useContext } from "react";

export const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const [alertMessage, setAlertMessage] = useState(null);
    const [showFloatingCart, setShowFloatingCart] = useState(false);

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("rol");
    const userName = localStorage.getItem("nombre");

    const addToCart = (product) => {
        if (product.stock <= 0) return;

        setCart((prev) => {
            const existingItem = prev.find((item) => item.id === product.id);
            if (existingItem) {
                if (existingItem.quantity >= product.stock) return prev;
                return prev.map((item) =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });

        setAlertMessage({
            text: `¡Agregaste "${product.nombre}" al changuito!`,
            variant: "success"
        });
    };

    const updateQuantity = (id, delta) => {
        setCart((prev) =>
            prev
                .map((item) => {
                    if (item.id === id) {
                        const newQuantity = item.quantity + delta;
                        if (newQuantity > item.stock) return item;
                        return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
                    }
                    return item;
                })
                .filter(Boolean)
        );
    };

    const removeFromCart = (id) => {
        setCart((prev) => prev.filter((item) => item.id !== id));
    };

    const clearCart = () => setCart([]);

    const logout = (navigate) => {
        localStorage.clear();
        setCart([]);
        setShowFloatingCart(false);
        setAlertMessage({ text: "Sesión cerrada correctamente.", variant: "warning" });
        if (navigate) navigate("/");
    };

    return (
        <AppContext.Provider
            value={{
                cart,
                addToCart,
                updateQuantity,
                removeFromCart,
                clearCart,
                alertMessage,
                setAlertMessage,
                showFloatingCart,
                setShowFloatingCart,
                token,
                role,
                userName,
                logout
            }}
        >
            {children}
        </AppContext.Provider>
    );
};