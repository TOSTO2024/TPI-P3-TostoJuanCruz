import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { Alert } from "react-bootstrap";
import { AppProvider, useAppContext } from "./components/context/AppContext";

import Navbar from "./components/Principal/Navbar";
import Inicio from "./components/Principal/Inicio";
import Login from "./components/auth/login/Login";
import Register from "./components/auth/register/Register";
import Catalogo from "./components/Principal/Catalogo";
import Changuito from "./components/Principal/Changuito";
import AdminPanel from "./components/admin/AdminPanel";
import ClasesFuncional from "./components/Principal/ClasesFuncional";
import MembresiaPago from "./components/priv/MembresiaPago";
import RutasProtegidas from "./components/priv/RutasProtegidas";
import ErrorPage from "./components/priv/ErrorPage";

import "bootstrap/dist/css/bootstrap.min.css";
import "./app.css";

function ContenidoApp() {
    const { mensajeAlerta, setMensajeAlerta } = useAppContext();
    const navegar = useNavigate();

    return (
        <div className="app-container" style={{ backgroundColor: "#0d0d0d", minHeight: "100vh", color: "#fff" }}>
            <Navbar />

            <main className="py-4">
                {mensajeAlerta && (
                    <div className="container" style={{ maxWidth: "500px" }}>
                        <Alert
                            variant={mensajeAlerta.variante}
                            dismissible
                            onClose={() => setMensajeAlerta(null)}
                            className="fw-semibold text-center mb-4"
                        >
                            {mensajeAlerta.texto}
                        </Alert>
                    </div>
                )}

                <Routes>
                    <Route path="/" element={<Inicio />} />
                    <Route path="/tienda" element={<div className="container"><Catalogo /></div>} />
                    <Route path="/login" element={<Login onLoginSuccess={() => navegar("/")} />} />
                    <Route path="/register" element={<Register onRegister={() => navegar("/login")} />} />

                    <Route
                        path="/clases"
                        element={
                            <RutasProtegidas>
                                <div className="container"><ClasesFuncional /></div>
                            </RutasProtegidas>
                        }
                    />

                    <Route
                        path="/changuito"
                        element={
                            <RutasProtegidas>
                                <div className="container"><Changuito /></div>
                            </RutasProtegidas>
                        }
                    />

                    <Route
                        path="/membresia"
                        element={
                            <RutasProtegidas allowedRoles={["cliente"]}>
                                <div className="container"><MembresiaPago /></div>
                            </RutasProtegidas>
                        }
                    />

                    <Route
                        path="/admin"
                        element={
                            <RutasProtegidas allowedRoles={["admin", "sysadmin"]}>
                                <div className="container"><AdminPanel /></div>
                            </RutasProtegidas>
                        }
                    />

                    <Route
                        path="*"
                        element={
                            <ErrorPage
                                codigo="404"
                                titulo="Página No Encontrada"
                                mensaje="La ruta que estás buscando no existe o fue removida del sistema."
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
                <ContenidoApp />
            </BrowserRouter>
        </AppProvider>
    );
}

export default App;