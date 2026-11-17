import { createContext, useContext, useState } from "react";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem("token") || null);
    const [rol, setRol] = useState(localStorage.getItem("rol") || null);
    const [nombre, setNombre] = useState(localStorage.getItem("nombre") || "");
    const [carrito, setCarrito] = useState([]);
    const [mensajeFeedback, setMensajeFeedback] = useState(null);

    const iniciarSesionData = (newToken, newRol, newNombre) => {
        localStorage.setItem("token", newToken);
        localStorage.setItem("rol", newRol);
        if (newNombre) localStorage.setItem("nombre", newNombre);
        setToken(newToken);
        setRol(newRol);
        setNombre(newNombre || "");
    };

    const cerrarSesion = () => {
        localStorage.clear();
        setToken(null);
        setRol(null);
        setNombre("");
        setCarrito([]);
        setMensajeFeedback({
            texto: "Sesión cerrada correctamente.",
            variante: "warning"
        });
    };

    const agregarAlCarrito = (producto) => {
        setCarrito((prevCarrito) => {
            const existe = prevCarrito.find((item) => item.id === producto.id);
            if (existe) {
                return prevCarrito.map((item) =>
                    item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
                );
            }
            return [...prevCarrito, { ...producto, cantidad: 1 }];
        });

        setMensajeFeedback({
            texto: `¡Agregaste "${producto.nombre}" al changuito!`,
            variante: "success"
        });
    };

    const actualizarCantidad = (id, delta) => {
        setCarrito((prevCarrito) => {
            return prevCarrito
                .map((item) => {
                    if (item.id === id) {
                        const nuevaCantidad = item.cantidad + delta;
                        return nuevaCantidad > 0 ? { ...item, cantidad: nuevaCantidad } : null;
                    }
                    return item;
                })
                .filter(Boolean);
        });
    };

    const eliminarDelCarrito = (id) => {
        setCarrito((prevCarrito) => prevCarrito.filter((item) => item.id !== id));
    };

    const vaciarChanguito = () => {
        setCarrito([]);
    };

    return (
        <AppContext.Provider
            value={{
                token,
                rol,
                nombre,
                carrito,
                mensajeFeedback,
                setMensajeFeedback,
                iniciarSesionData,
                cerrarSesion,
                agregarAlCarrito,
                actualizarCantidad,
                eliminarDelCarrito,
                vaciarChanguito
            }}
        >
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => useContext(AppContext);
