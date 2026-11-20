import { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext.jsx";
import 'bootstrap/dist/css/bootstrap.min.css';

const MembershipPayment = () => {
    const { token, setAlertMessage } = useAppContext();

    const [loading, setLoading] = useState(false);
    const [paymentUrl, setPaymentUrl] = useState(null);
    const [ticketCode, setTicketCode] = useState(null);
    const [lastPaymentDate, setLastPaymentDate] = useState(null);
    const [remainingTime, setRemainingTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [hasActiveTime, setHasActiveTime] = useState(false);

    const currentDate = new Date();
    const monthName = currentDate.toLocaleString('es-ES', { month: 'long' });
    const currentYear = currentDate.getFullYear();
    const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);
    const membershipConcept = `Membresía ${capitalizedMonth} ${currentYear} - Capfit Gym`;

    const isMembershipActive = Boolean(token && lastPaymentDate && hasActiveTime);

    useEffect(() => {
        if (!token) return;

        let cancelled = false;

        fetch('http://localhost:5000/api/usuarios/perfil', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => (res.ok ? res.json() : null))
            .then(data => {
                if (cancelled) return;
                if (data && data.membresia_expiracion) {
                    const expMs = new Date(data.membresia_expiracion).getTime();
                    if (expMs > Date.now()) {
                        setLastPaymentDate(data.membresia_expiracion);
                        setHasActiveTime(true);
                        return;
                    }
                }
                setLastPaymentDate(null);
                setHasActiveTime(false);
            })
            .catch(err => console.error("Error al obtener perfil:", err));

        return () => {
            cancelled = true;
        };
    }, [token]);

    useEffect(() => {
        if (!token || !lastPaymentDate) return;

        const expirationTimeMs = new Date(lastPaymentDate).getTime();

        const updateCountdown = () => {
            const now = Date.now();
            const difference = expirationTimeMs - now;

            if (difference <= 0) {
                setRemainingTime({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                setHasActiveTime(false);
                setLastPaymentDate(null);
                setPaymentUrl(null);
                return false;
            }

            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            setRemainingTime({ days, hours, minutes, seconds });
            setHasActiveTime(true);
            return true;
        };

        if (!updateCountdown()) return;

        const interval = setInterval(() => {
            if (!updateCountdown()) {
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [token, lastPaymentDate]);

    const handleMercadoPagoCheckout = async () => {
        if (isMembershipActive) return;

        const confirmed = window.confirm("¿Está seguro que desea ir a pagar la membresía mensual?");
        if (!confirmed) return;

        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/crear-preferencia', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    titulo: membershipConcept,
                    precio: 25000
                })
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.mensaje || "No se pudo iniciar el pago con Mercado Pago.");
            }

            if (data.init_point) {
                setPaymentUrl(data.init_point);
                window.open(data.init_point, "_blank", "noopener,noreferrer");
            }
        } catch (error) {
            console.error("Error en el pago:", error);
            if (setAlertMessage) {
                setAlertMessage({ text: error.message, variant: "danger" });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmPayment = async () => {
        if (isMembershipActive || loading) return;

        setLoading(true);
        try {
            const ticketRes = await fetch('http://localhost:5000/api/tickets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    concepto: membershipConcept,
                    monto: 25000
                })
            });

            if (ticketRes.ok) {
                const ticketData = await ticketRes.json();
                if (ticketData.codigo_ticket) {
                    setTicketCode(ticketData.codigo_ticket);
                }
            }

            const membresiaRes = await fetch('http://localhost:5000/api/usuarios/membresia', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!membresiaRes.ok) {
                throw new Error("No se pudo activar la membresía.");
            }

            const membresiaData = await membresiaRes.json();
            const expiration =
                membresiaData.membresia_expiracion ||
                new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

            setLastPaymentDate(expiration);
            setHasActiveTime(true);
            setPaymentUrl(null);

            if (setAlertMessage) {
                setAlertMessage({
                    text: "¡Membresía activada por 30 días!",
                    variant: "success"
                });
            }
        } catch (error) {
            console.error("Error al procesar el pago:", error);
            if (setAlertMessage) {
                setAlertMessage({ text: error.message, variant: "danger" });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-4 text-center text-white" style={{ maxWidth: "600px" }}>
            <h2 className="text-warning fw-bold mb-3">Gestión de Membresía</h2>
            <p className="text-white-50 mb-4">
                {isMembershipActive
                    ? "Tu cuota mensual se encuentra al día. No podrás realizar un nuevo pago hasta su vencimiento."
                    : "Aboná tu cuota mensual de forma segura a través de Mercado Pago."}
            </p>

            {!isMembershipActive ? (
                <div className="p-4 rounded-4 shadow-sm" style={{ backgroundColor: "#1a1a1a", border: "1px solid #ffb300" }}>
                    <h4 className="text-white mb-3">{membershipConcept}</h4>
                    <p className="fs-3 text-warning fw-bold mb-4">$25.000 ARS</p>

                    <div className="d-grid gap-3">
                        <button
                            onClick={handleMercadoPagoCheckout}
                            disabled={loading}
                            className="btn btn-warning fw-bold text-dark px-5 py-3 rounded-pill shadow"
                        >
                            {loading ? "Conectando con Mercado Pago..." : "Pagar con Mercado Pago 🚀"}
                        </button>

                        {paymentUrl && (
                            <div className="mt-2 pt-3 border-top border-secondary">
                                <p className="text-white-50 small mb-2">
                                    Si no se abrió la ventana automáticamente,{" "}
                                    <a
                                        href={paymentUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-warning fw-semibold"
                                    >
                                        hacé clic acá para abrir Mercado Pago
                                    </a>.
                                </p>
                                <button
                                    onClick={handleConfirmPayment}
                                    disabled={loading}
                                    className="btn btn-success fw-bold py-2 w-100"
                                >
                                    Confirmar pago aprobado ✓
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div>
                    <div className="p-4 rounded-4 shadow-sm bg-dark border border-success text-start mb-4">
                        <div className="text-center mb-3">
                            <span className="badge bg-success fs-6 px-3 py-2">¡Membresía Activa! ✓</span>
                        </div>
                        <h5 className="text-warning text-center mb-3">🎫 Comprobante Digital</h5>
                        <hr className="border-secondary" />
                        <p><strong>Concepto:</strong> {membershipConcept}</p>
                        <p><strong>Monto:</strong> $25.000 ARS</p>
                        {ticketCode && <p><strong>Código de Ticket:</strong> {ticketCode}</p>}
                        <p>
                            <strong>Válida hasta:</strong>{" "}
                            {new Date(lastPaymentDate).toLocaleDateString('es-AR')}
                        </p>
                        <p className="text-white-50 small mt-3 mb-0 text-center">
                            Presentá tu cuenta en la recepción de Capfit Gym para validar tu ingreso.
                        </p>
                    </div>

                    <div className="p-4 rounded-4 shadow-sm text-center" style={{ backgroundColor: "#1a1a1a", border: "1px solid #ffb300" }}>
                        <h6 className="text-white-50 mb-2">⏱️ Tiempo restante para tu próxima renovación:</h6>
                        <div className="row text-warning fw-bold fs-4 mt-3">
                            <div className="col">
                                {remainingTime.days} <span className="d-block fs-6 text-white-50">Días</span>
                            </div>
                            <div className="col">
                                {remainingTime.hours} <span className="d-block fs-6 text-white-50">Horas</span>
                            </div>
                            <div className="col">
                                {remainingTime.minutes} <span className="d-block fs-6 text-white-50">Minutos</span>
                            </div>
                            <div className="col">
                                {remainingTime.seconds} <span className="d-block fs-6 text-white-50">Segundos</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MembershipPayment;