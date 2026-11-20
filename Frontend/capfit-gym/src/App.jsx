import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { Alert } from "react-bootstrap";
import { AppProvider, useAppContext } from "./components/context/AppContext.jsx";

import Navbar from "./components/Principal/Navbar.jsx";
import Home from "./components/Principal/Home.jsx";
import Login from "./components/auth/login/Login.jsx";
import Register from "./components/auth/register/Register.jsx";
import ClientCatalog from "./components/Principal/Catalog.jsx";
import Cart from "./components/Principal/Cart.jsx";
import AdminPanel from "./components/admin/AdminPanel.jsx";
import FunctionalClasses from "./components/Principal/FunctionalClasses.jsx";
import MembershipPayment from "./components/priv/MembershipPayment.jsx";
import ProtectedRoutes from "./components/priv/ProtectedRoutes.jsx";
import ErrorPage from "./components/priv/ErrorPage.jsx";

import "bootstrap/dist/css/bootstrap.min.css";
import "./app.css";

function AppContent() {
    const { alertMessage, setAlertMessage } = useAppContext();
    const navigate = useNavigate();

    return (
        <div className="app-container" style={{ backgroundColor: "#0d0d0d", minHeight: "100vh", color: "#fff" }}>
            <Navbar />

            <main className="py-4">
                {alertMessage && (
                    <div className="container" style={{ maxWidth: "500px" }}>
                        <Alert
                            variant={alertMessage.variant}
                            dismissible
                            onClose={() => setAlertMessage(null)}
                            className="fw-semibold text-center mb-4"
                        >
                            {alertMessage.text}
                        </Alert>
                    </div>
                )}

                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/tienda" element={<div className="container"><ClientCatalog /></div>} />
                    <Route path="/login" element={<Login onLoginSuccess={() => navigate("/")} />} />
                    <Route path="/register" element={<Register />} />

                    <Route
                        path="/clases"
                        element={
                            <ProtectedRoutes>
                                <div className="container"><FunctionalClasses /></div>
                            </ProtectedRoutes>
                        }
                    />

                    <Route
                        path="/cart"
                        element={
                            <ProtectedRoutes>
                                <div className="container"><Cart /></div>
                            </ProtectedRoutes>
                        }
                    />

                    <Route
                        path="/membresia"
                        element={
                            <ProtectedRoutes allowedRoles={["cliente"]}>
                                <div className="container"><MembershipPayment /></div>
                            </ProtectedRoutes>
                        }
                    />

                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoutes allowedRoles={["admin", "sysadmin"]}>
                                <div className="container"><AdminPanel /></div>
                            </ProtectedRoutes>
                        }
                    />

                    <Route
                        path="*"
                        element={
                            <ErrorPage
                                code="404"
                                title="Página No Encontrada"
                                message="La ruta que estás buscando no existe o fue removida del sistema."
                            />
                        }
                    />
                </Routes>
            </main>
        </div>
    );
}

function App() {
    return (
        <AppProvider>
            <BrowserRouter>
                <AppContent />
            </BrowserRouter>
        </AppProvider>
    );
}

export default App;