import { useState, useEffect, useCallback } from "react";
import { useAppContext } from "../context/AppContext";
import 'bootstrap/dist/css/bootstrap.min.css';

const ClasesFuncional = () => {
    const { setAlertMessage } = useAppContext();
    const token = localStorage.getItem("token");

    const [serverReservations, setServerReservations] = useState([]);
    const [selectedDay, setSelectedDay] = useState("Lunes");

    const weekDays = [
        { name: "Lunes", label: "Lunes", date: "7" },
        { name: "Martes", label: "Martes", date: "8" },
        { name: "Miércoles", label: "Miércoles", date: "9" },
        { name: "Jueves", label: "Jueves", date: "10" },
        { name: "Viernes", label: "Viernes", date: "11" }
    ];

    const classSchedules = [
        "08:00 - 09:00",
        "10:00 - 11:00",
        "14:00 - 15:00",
        "16:00 - 17:00",
        "18:00 - 19:00",
        "20:00 - 21:00"
    ];

    const fetchReservations = useCallback(() => {
        if (!token) return;

        fetch('http://localhost:5000/api/reservas', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
            if (Array.isArray(data)) setServerReservations(data);
        })
        .catch(err => console.error("Error cargando reservas:", err));
    }, [token]);

    useEffect(() => {
        fetchReservations();
    }, [fetchReservations]);

    const handleReservationToggle = (schedule) => {
        if (!token) {
            setAlertMessage({
                texto: "Debes iniciar sesión para poder reservar una clase.",
                variante: "danger"
            });
            return;
        }

        const fullSchedule = `${selectedDay} - ${schedule}`;
        const existingReservation = serverReservations.find(r => r.horario === fullSchedule);

        if (existingReservation) {
            setServerReservations(prev => prev.filter(r => r.id !== existingReservation.id));

            fetch(`http://localhost:5000/api/reservas/${existingReservation.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(res => res.json())
            .then(() => {
                setAlertMessage({
                    texto: `Has cancelado tu turno de las ${schedule} el día ${selectedDay}.`,
                    variante: "warning"
                });
                fetchReservations();
            });

        } else {
            fetch('http://localhost:5000/api/reservas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    claseId: 1, 
                    horario: fullSchedule 
                })
            })
            .then(res => res.json())
            .then(() => {
                setAlertMessage({
                    texto: `¡Reserva exitosa para el turno de las ${schedule} (${selectedDay})!`,
                    variante: "success"
                });
                fetchReservations();
            })
            .catch(err => console.error("Error en POST:", err));
        }
    };

    return (
        <div className="container py-4 text-center">
            <h2 className="text-warning fw-bold mb-2">Seleccioná un día</h2>
            <p className="text-white-50 mb-4">Elegí la fecha para ver los horarios disponibles de Clases Funcionales.</p>

            <div className="d-flex justify-content-center gap-2 overflow-auto pb-4 mb-3">
                {weekDays.map((day) => {
                    const isActive = selectedDay === day.name;
                    return (
                        <div
                            key={day.name}
                            onClick={() => setSelectedDay(day.name)}
                            className="p-3 rounded-4 shadow-sm"
                            style={{
                                minWidth: "90px",
                                cursor: "pointer",
                                backgroundColor: isActive ? "#ffb300" : "#1a1a1a",
                                color: isActive ? "#000" : "#fff",
                                border: isActive ? "2px solid #ffb300" : "1px solid #333",
                                transform: isActive ? "scale(1.05)" : "scale(1)",
                                transition: "all 0.2s ease"
                            }}
                        >
                            <div className="small text-uppercase fw-semibold" style={{ opacity: isActive ? 0.9 : 0.6 }}>{day.name.substring(0, 3)}</div>
                            <div className="fs-3 fw-bold my-1">{day.date}</div>
                            <div className="small" style={{ opacity: isActive ? 0.9 : 0.5 }}>nov</div>
                        </div>
                    );
                })}
            </div>

            <hr className="border-secondary my-4 opacity-25" />

            <div className="mx-auto" style={{ maxWidth: "600px" }}>
                <h4 className="text-warning fw-bold mb-3">
                    Turnos para el día <span className="text-white">{selectedDay}</span>
                </h4>

                <div className="d-flex flex-column gap-3">
                    {classSchedules.map((schedule) => {
                        const fullSchedule = `${selectedDay} - ${schedule}`;
                        const isReserved = Array.isArray(serverReservations) && serverReservations.some(r => r && r.horario === fullSchedule);

                        return (
                            <div 
                                key={schedule}
                                className="d-flex justify-content-between align-items-center p-3 rounded-3 shadow-sm"
                                style={{ backgroundColor: "#1a1a1a", border: "1px solid #ffb300" }}
                            >
                                <div className="d-flex align-items-center gap-3">
                                    <span className="fs-5 text-warning fw-bold">⏰ {schedule}</span>
                                    <span className="badge bg-dark text-white-50 border border-secondary">Funcional</span>
                                </div>
                                <button
                                    className={`btn fw-bold px-4 py-2 ${isReserved ? "btn-success" : "btn-warning text-dark"}`}
                                    onClick={() => handleReservationToggle(schedule)}
                                >
                                    {isReserved ? "Reservado ✓" : "Reservar Turno"}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ClasesFuncional;