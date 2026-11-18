import { useState, useEffect, useCallback } from "react";
import { useAppContext } from "../../components/context/AppContext"; 
import 'bootstrap/dist/css/bootstrap.min.css';

const InscriptosClases = () => {
    const { token } = useAppContext();
    const [reservations, setReservations] = useState([]);
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

    const fetchAllReservations = useCallback(() => {
        if (!token) return;

        fetch('http://localhost:5000/api/admin/reservas', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
            if (Array.isArray(data)) setReservations(data);
        })
        .catch(err => console.error("Error cargando inscriptos:", err));
    }, [token]);

    useEffect(() => {
        fetchAllReservations();
    }, [fetchAllReservations]);

    return (
        <div className="container py-4 text-center">
            <h2 className="text-warning fw-bold mb-2">Inscriptos en Clases Funcionales</h2>
            <p className="text-white-50 mb-4">Seleccioná un día para ver los alumnos anotados por horario.</p>

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

            <div className="mx-auto" style={{ maxWidth: "700px" }}>
                <h4 className="text-warning fw-bold mb-4">
                    Turnos para el día <span className="text-white">{selectedDay}</span>
                </h4>

                <div className="d-flex flex-column gap-4">
                    {classSchedules.map((schedule) => {
                        const fullSearchSchedule = `${selectedDay} - ${schedule}`;
                        const shiftRegistrations = reservations.filter(r => r.horario === fullSearchSchedule);

                        return (
                            <div 
                                key={schedule}
                                className="p-3 rounded-3 shadow-sm text-start"
                                style={{ backgroundColor: "#1a1a1a", border: "1px solid #ffb300" }}
                            >
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <span className="fs-5 text-warning fw-bold">⏰ {schedule} hs</span>
                                    <span className="badge bg-dark text-white-50 border border-secondary">
                                        Inscriptos: {shiftRegistrations.length}
                                    </span>
                                </div>

                                {shiftRegistrations.length > 0 ? (
                                    <div className="table-responsive">
                                        <table className="table table-dark table-striped table-bordered mb-0">
                                            <thead>
                                                <tr>
                                                    <th style={{ width: "50px" }}>#</th>
                                                    <th>Nombre del Alumno</th>
                                                    <th>Email de Contacto</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {shiftRegistrations.map((student, index) => (
                                                    <tr key={student.id || index}>
                                                        <td>{index + 1}</td>
                                                        <td>{student.nombre}</td>
                                                        <td>{student.email}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-white-50 text-center fst-italic mb-0 py-2">
                                        No hay alumnos inscriptos en este turno todavía.
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default InscriptosClases;