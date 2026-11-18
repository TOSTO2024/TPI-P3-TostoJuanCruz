import { useState, useEffect, useCallback } from "react";
import { useAppContext } from "../../components/context/AppContext";
import 'bootstrap/dist/css/bootstrap.min.css';

const ListaClientes = () => {
    const { role } = useAppContext();
    const [users, setUsers] = useState([]);
    const token = localStorage.getItem("token");

    const fetchUsers = useCallback(() => {
        fetch('http://localhost:5000/api/usuarios', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
            if (Array.isArray(data)) {
                setUsers(data);
            }
        })
        .catch(err => console.error("Error al obtener clientes:", err));
    }, [token]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const changeRole = async (userId, newRole) => {
        try {
            const res = await fetch(`http://localhost:5000/api/usuarios/${userId}/rol`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ rol: newRole })
            });

            if (res.ok) {
                fetchUsers(); 
            } else {
                const errorData = await res.json();
                alert(errorData.mensaje || "Error al actualizar el rol.");
            }
        } catch (error) {
            console.error("Error en la petición de cambio de rol:", error);
        }
    };

    const calculateRemainingTime = (expirationDate) => {
        if (!expirationDate) return <span className="text-muted">Sin membresía</span>;

        const difference = new Date(expirationDate).getTime() - new Date().getTime();

        if (difference <= 0) {
            return <span className="text-danger small">Expirada ❌</span>;
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

        return (
            <span className="text-warning small fw-bold">
                ⏱️ {days}d {hours}h {minutes}m
            </span>
        );
    };

    return (
        <div className="container py-4 text-white">
            <h2 className="text-warning fw-bold text-center mb-4">Gestión de Clientes y Roles</h2>
            
            <div className="table-responsive">
                <table className="table table-dark table-striped align-middle" style={{ border: "1px solid #ffb300" }}>
                    <thead>
                        <tr className="text-warning">
                            <th>ID</th>
                            <th>Nombre y Apellido</th>
                            <th>Email</th>
                            <th>DNI</th>
                            <th>Tiempo Restante</th>
                            <th>Rol del Usuario</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.nombre}</td>
                                <td>{user.email}</td>
                                <td>{user.dni || "No especificado"}</td>
                                <td>{calculateRemainingTime(user.membresia_expiracion)}</td>
                                <td>
                                    {role === 'sysadmin' ? (
                                        <select 
                                            value={user.rol} 
                                            onChange={(e) => changeRole(user.id, e.target.value)}
                                            className="form-select form-select-sm bg-dark text-warning border-warning fw-bold"
                                        >
                                            <option value="cliente">cliente</option>
                                            <option value="admin">admin</option>
                                            <option value="sysadmin">sysadmin</option>
                                        </select>
                                    ) : (
                                        <span className="badge bg-secondary text-dark px-3 py-2 fw-bold" style={{ backgroundColor: "#ffb300" }}>
                                            {user.rol}
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ListaClientes;