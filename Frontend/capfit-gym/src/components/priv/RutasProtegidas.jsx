import ErrorPage from "./ErrorPage"; 

const RutasProtegidas = ({ children, allowedRoles }) => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("rol");

    if (!token) {
        return (
            <ErrorPage 
                code="401" 
                title="No Autorizado" 
                message="Debes iniciar sesión con una cuenta válida para poder acceder a este contenido." 
            />
        );
    }

    if (allowedRoles && !allowedRoles.includes(role)) {
        return (
            <ErrorPage 
                code="403" 
                title="Acceso Prohibido" 
                message="Tu usuario no cuenta con los privilegios de administrador necesarios para ver esta página." 
            />
        );
    }

    return children;
};

export default RutasProtegidas;