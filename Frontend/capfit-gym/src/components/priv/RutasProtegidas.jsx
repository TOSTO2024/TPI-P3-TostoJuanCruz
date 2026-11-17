import ErrorPage from "./ErrorPage"; 
const RutasProtegidas = ({ children, allowedRoles }) => {
    const token = localStorage.getItem("token");
    const rol = localStorage.getItem("rol");

    if (!token) {
        return (
            <ErrorPage 
                codigo="401" 
                titulo="No Autorizado" 
                mensaje="Debes iniciar sesión con una cuenta válida para poder acceder a este contenido." 
            />
        );
    }

    if (allowedRoles && !allowedRoles.includes(rol)) {
        return (
            <ErrorPage 
                codigo="403" 
                titulo="Acceso Prohibido" 
                mensaje="Tu usuario no cuenta con los privilegios de administrador necesarios para ver esta página." 
            />
        );
    }

    return children;
};

export default RutasProtegidas;