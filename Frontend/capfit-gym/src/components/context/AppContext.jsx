import { createContext, useContext, useState } from "react";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [activeSection, setActiveSection] = useState("menu");
    const [alertMessage, setAlertMessage] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [role, setRole] = useState(localStorage.getItem('rol') || null);

    return (
        <AppContext.Provider value={{ 
            activeSection, 
            setActiveSection, 
            alertMessage, 
            setAlertMessage, 
            token, 
            setToken, 
            role, 
            setRole 
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);