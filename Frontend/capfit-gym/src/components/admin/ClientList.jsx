import { useState, useEffect, useCallback } from "react";
import { useAppContext } from "../../components/context/AppContext.jsx";
import 'bootstrap/dist/css/bootstrap.min.css';

const ClientList = () => {
    const { token, role } = useAppContext();
    const [users, setUsers] = useState([]);

    const fetchUsers = useCallback(() => {
        if (!token) return;

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

    const changeRole = async (userId, userName, currentRole, newRole) => {
        const sysadmins = users.filter(u => u.rol === 'sysadmin');
        if (currentRole === 'sysadmin' && newRole !== 'sysadmin' && sysadmins.length <= 1) {
            alert("Acción denegada: Debe existir al menos un 'sysadmin' en el sistema.");
            return;
        }

        const confirmed = window.confirm(`¿Estás seguro que deseas cambiar el rol de "${userName}" a "${newRole}"?`);
        if (!confirmed) return;

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

    const handleDeleteUser = async (userId, userName, userRole) => {
        const sysadmins = users.filter(u => u.rol === 'sysadmin');
        if (userRole === 'sysadmin' && sysadmins.length <= 1) {
            alert("Acción denegada: No se puede eliminar al único 'sysadmin' del sistema.");
            return;
        }

        const confirmed = window.confirm(`¿ESTÁS SEGURO QUE DESEAS ELIMINAR A "${userName}"? Esta acción restringirá su acceso al sistema.`);
        if (!confirmed) return;

        try {
            const res = await fetch(`http://localhost:5000/api/usuarios/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                fetchUsers();
            } else {
                const errorData = await res.json();
                alert(errorData.mensaje || "Error al eliminar el usuario.");
            }
        } catch (error) {
            console.error("Error en la petición de eliminación:", error);
        }
    };

    const calculateRemainingTime = (expirationDate) => {
        if (!expirationDate) return <span className="text-white-50">Sin membresía</span>;

        const difference = new Date(expirationDate).getTime() - new Date().getTime();

        if (difference <= 0) {
            return <span className="text-danger small fw-bold">Expirada ❌</span>;
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
                <table className="table table-dark table-striped align-middle text-white" style={{ border: "1px solid #ffb300" }}>
                    <thead>
                        <tr className="text-warning">
                            <th>ID</th>
                            <th>Nombre y Apellido</th>
                            <th>Email</th>
                            <th>DNI</th>
                            <th>Tiempo Restante</th>
                            <th>Rol del Usuario</th>
                            {role === 'sysadmin' && <th className="text-center">Acciones</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} className="text-white">
                                <td className="text-white">{user.id}</td>
                                <td className="text-white fw-semibold">{user.nombre}</td>
                                <td className="text-white">{user.email}</td>
                                <td className="text-white">{user.dni || "No especificado"}</td>
                                <td>{calculateRemainingTime(user.membresia_expiracion)}</td>
                                <td>
                                    {role === 'sysadmin' ? (
                                        <select
                                            value={user.rol}
                                            onChange={(e) => changeRole(user.id, user.nombre, user.rol, e.target.value)}
                                            className="form-select form-select-sm bg-dark text-white border-warning fw-bold"
                                        >
                                            <option value="cliente" className="bg-dark text-white">cliente</option>
                                            <option value="admin" className="bg-dark text-white">admin</option>
                                            <option value="sysadmin" className="bg-dark text-white">sysadmin</option>
                                        </select>
                                    ) : (
                                        <span className="badge text-dark px-3 py-2 fw-bold" style={{ backgroundColor: "#ffb300" }}>
                                            {user.rol}
                                        </span>
                                    )}
                                </td>
                                {role === 'sysadmin' && (
                                    <td className="text-center">
                                        <button
                                            onClick={() => handleDeleteUser(user.id, user.nombre, user.rol)}
                                            className="btn btn-outline-danger btn-sm fw-bold px-3"
                                            title="Eliminar usuario"
                                        >
                                            Eliminar
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ClientList;