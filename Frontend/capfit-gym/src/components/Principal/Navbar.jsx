import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";
import { useAppContext } from "../context/AppContext";
import Changuito from "./Changuito";
import capfitLogoNormal from "../../img/logoNormal.jpeg";

const Navbar = () => {
    const [showLocationModal, setShowLocationModal] = useState(false);
    const {
        cart,
        showFloatingCart,
        setShowFloatingCart,
        setAlertMessage,
        token,
        role,
        logout
    } = useAppContext();

    const navigate = useNavigate();
    const location = useLocation();
    const isAdmin = role === "admin" || role === "sysadmin";

    const navigateTo = (path) => {
        setShowFloatingCart(false);
        navigate(path);
    };

    const handleCartClick = () => {
        if (!token) {
            setAlertMessage({ texto: "Debes iniciar sesión para ver tu changuito.", variante: "danger" });
            navigate("/login");
            return;
        }
        if (location.pathname !== "/tienda") {
            navigateTo("/tienda");
        } else {
            setShowFloatingCart(!showFloatingCart);
        }
    };

    return (
        <>
            <nav className="d-flex justify-content-between align-items-center px-4 py-3" style={{ backgroundColor: "#1a1a1a", borderBottom: "2px solid #ffb300" }}>
                <div className="d-flex align-items-center" style={{ cursor: "pointer" }} onClick={() => navigateTo("/")}>
                    <img src={capfitLogoNormal} alt="Capfit Gym Logo" style={{ height: "45px", objectFit: "contain" }} className="me-4" />
                    <h3 className="fw-bold m-0 fs-5">
                        <span className="text-white">CAPFIT</span>
                        <span className="text-warning"> GYM</span>
                    </h3>
                </div>

                <div className="d-flex align-items-center position-relative">
                    
                    <button
                        className="btn fw-semibold d-flex align-items-center justify-content-center p-2 me-3 border-0 text-dark btn-mapa-hover"
                        style={{
                            width: "42px",
                            height: "42px",
                            borderRadius: "50%",
                            backgroundColor: "#ffb300",
                            transition: "background-color 0.2s ease"
                        }}
                        onClick={() => setShowLocationModal(true)}
                        title="Ubicación"
                    >
                    <svg height="21" viewBox="0 0 21 21" width="21" xmlns="http://www.w3.org/2000/svg">
                            <g fill="none" fillRule="evenodd" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" transform="translate(4 2)">
                                <path d="m6.5 16.5407715.6311176-.7118691c.71585099-.8191184 1.36011688-1.5983525 1.93279767-2.3377022l.4733382-.6239608c1.97516433-2.6615039 2.96274653-4.77276704 2.96274653-6.33378943 0-3.33218241-2.6862915-6.03344997-6-6.03344997s-6 2.70126756-6 6.03344997c0 1.56102239.98758218 3.67228553 2.96274653 6.33378943l.4733382.6239608c.73630387.9505925 1.5909423 1.9671163 2.56391527 3.0495713z" />
                                <circle cx="6.5" cy="6.5" r="2.5" />
                            </g>
                    </svg>
                    </button>

                    <button className="btn btn-custom-outline fw-semibold px-3 py-2 me-3 text-warning border-warning" onClick={() => navigateTo("/clases")}>
                        <svg height="21" viewBox="0 0 21 21" width="21" xmlns="http://www.w3.org/2000/svg"><g fill="none" fillRule="evenodd" transform="translate(2 2)"><path d="m2.5.5h12c1.1045695 0 2 .8954305 2 2v12c0 1.1045695-.8954305 2-2 2h-12c-1.1045695 0-2-.8954305-2-2v-12c0-1.1045695.8954305-2 2-2z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" /><path d="m.5 4.5h16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" /><g fill="currentColor"><circle cx="8.5" cy="8.5" r="1" /><circle cx="4.5" cy="8.5" r="1" /><circle cx="12.5" cy="8.5" r="1" /><circle cx="8.5" cy="12.5" r="1" /><circle cx="4.5" cy="12.5" r="1" /><circle cx="12.5" cy="12.5" r="1" /></g></g></svg>
                    </button>

                    {token && !isAdmin && (
                        <button
                            className="btn btn-custom-outline fw-semibold px-3 py-2 me-3 text-warning border-warning"
                            style={{ borderRadius: "12px", backgroundColor: "#1a1a1a" }}
                            onClick={() => navigateTo("/membresia")}
                        >
                            Membresía
                        </button>
                    )}

                    <button
                        className="btn d-flex align-items-center justify-content-center p-2 me-4 position-relative"
                        onClick={handleCartClick}
                        title="Mi Changuito"
                        style={{
                            width: "42px",
                            height: "42px",
                            borderRadius: "50%",
                            border: "2px solid #ffb300",
                            backgroundColor: "#ffb300",
                            transition: "all 0.2s ease"
                        }}
                    >
                        🛒
                        {cart.length > 0 && (
                            <span className="badge bg-dark text-warning rounded-pill position-absolute top-0 start-100 translate-middle" style={{ fontSize: "10px" }}>
                                {cart.reduce((acc, item) => acc + item.quantity, 0)}                            </span>
                        )}
                    </button>

                    {token && isAdmin && (
                        <button className="btn btn-custom-outline fw-semibold px-3 py-2 me-3" onClick={() => navigateTo("/admin")}>
                            Panel Admin
                        </button>
                    )}

                    {location.pathname === "/tienda" && showFloatingCart && (
                        <div
                            className="position-absolute shadow-lg p-3 rounded"
                            style={{ top: "55px", right: "0px", width: "350px", backgroundColor: "#1a1a1a", border: "2px solid #ffb300", zIndex: 1000 }}
                        >
                            <h5 className="text-warning fw-bold border-bottom pb-2 mb-3">Tu Changuito</h5>
                            <Changuito />
                        </div>
                    )}

                    {!token ? (
                        <>
                            <button className="btn btn-custom-outline fw-semibold px-3 py-2 me-2" onClick={() => navigateTo("/login")}>
                                Iniciar Sesión
                            </button>
                            <button className="btn btn-custom-outline fw-semibold px-3 py-2" onClick={() => navigateTo("/register")}>
                                Registrarse
                            </button>
                        </>
                    ) : (
                        <button className="btn btn-outline-danger fw-semibold px-3 py-2" onClick={() => logout(navigate)}>
                            Cerrar Sesión
                        </button>
                    )}
                </div>
            </nav>

            <Modal show={showLocationModal} onHide={() => setShowLocationModal(false)} centered contentClassName="bg-dark text-white border border-warning">
                <Modal.Header closeButton closeVariant="white" className="border-secondary">
                    <Modal.Title className="text-warning fw-bold">📍 Ubicación Capfit Gym</Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center py-4">
                    <p className="fs-5 mb-2">¿Deseás abrir Google Maps para ver cómo llegar al gimnasio?</p>
                    <p className="text-white-50 small">Se abrirá una pestaña externa con la dirección exacta.</p>
                </Modal.Body>
                <Modal.Footer className="border-secondary justify-content-center">
                    <Button variant="outline-secondary" className="px-4 fw-semibold text-white" onClick={() => setShowLocationModal(false)}>
                        Cancelar
                    </Button>
                    <Button
                        variant="warning"
                        className="px-4 fw-bold text-dark"
                        onClick={() => {
                            setShowLocationModal(false);
                            window.open("https://www.google.com/maps/place/CAPFIT+GYM/@-32.998084,-60.6263982,17z", "_blank");
                        }}
                    >
                        Abrir Google Maps 🗺️
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default Navbar;