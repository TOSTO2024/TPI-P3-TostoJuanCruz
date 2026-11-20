import { useAppContext } from "../context/AppContext.jsx";
import ErrorPage from "./ErrorPage.jsx";

const ProtectedRoutes = ({ children, allowedRoles }) => {
    const { token, role } = useAppContext();

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
                message="Tu usuario no cuenta con los privilegios necesarios para ver esta página."
            />
        );
    }

    return children;
};

export default ProtectedRoutes;