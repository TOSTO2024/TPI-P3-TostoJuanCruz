import { createContext, useContext, useState } from "react";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [activeSection, setActiveSection] = useState("menu");
    const [alertMessage, setAlertMessage] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token") || null);
    const [role, setRole] = useState(localStorage.getItem("rol") || null);
    const [userName, setUserName] = useState(localStorage.getItem("nombre") || "");
    const [cart, setCart] = useState([]);
    const [showFloatingCart, setShowFloatingCart] = useState(false);

    const addToCart = (product) => {
        setCart((prevCart) => {
            const existingIndex = prevCart.findIndex((item) => item.id === product.id);
            if (existingIndex > -1) {
                const updatedCart = [...prevCart];
                const currentQty = updatedCart[existingIndex].quantity;
                if (product.stock !== undefined && currentQty >= product.stock) {
                    return prevCart;
                }
                updatedCart[existingIndex] = {
                    ...updatedCart[existingIndex],
                    quantity: currentQty + 1
                };
                return updatedCart;
            }
            return [...prevCart, { ...product, quantity: 1 }];
        });
    };

    const updateQuantity = (productId, delta) => {
        setCart((prevCart) =>
            prevCart
                .map((item) => {
                    if (item.id !== productId) return item;
                    const nextQty = item.quantity + delta;
                    if (nextQty <= 0) return null;
                    if (item.stock !== undefined && nextQty > item.stock) return item;
                    return { ...item, quantity: nextQty };
                })
                .filter(Boolean)
        );
    };

    const removeFromCart = (productId) => {
        setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
    };

    const clearCart = () => {
        setCart([]);
    };

    const logout = (navigate) => {
        localStorage.removeItem("token");
        localStorage.removeItem("rol");
        localStorage.removeItem("nombre");
        localStorage.removeItem("email");
        setToken(null);
        setRole(null);
        setUserName("");
        setCart([]);
        setShowFloatingCart(false);
        if (navigate) {
            navigate("/login");
        }
    };

    return (
        <AppContext.Provider
            value={{
                activeSection,
                setActiveSection,
                alertMessage,
                setAlertMessage,
                token,
                setToken,
                role,
                setRole,
                userName,
                setUserName,
                cart,
                setCart,
                addToCart,
                updateQuantity,
                removeFromCart,
                clearCart,
                showFloatingCart,
                setShowFloatingCart,
                logout
            }}
        >
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);