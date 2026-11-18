import { useNavigate } from "react-router-dom";
import meme401 from "../../img/gif1.gif";
import meme403 from "../../img/gif2.gif";
import meme404 from "../../img/gif3.gif";

const ErrorPage = ({ code = "403", title = "Acceso Denegado", message = "No tenés los permisos necesarios para acceder a esta sección." }) => {
    const navigate = useNavigate();

    const getMeme = () => {
        if (code === "401") return meme401;
        if (code === "403") return meme403;
        return meme404;
    };

    return (
        <div className="container text-center py-5" style={{ minHeight: "75vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
            <h1 className="display-1 fw-bold text-warning mb-0">{code}</h1>
            <h2 className="text-white fw-bold mb-3">{title}</h2>
            
            <div className="my-3">
                <img 
                    src={getMeme()} 
                    alt={`Meme error ${code}`} 
                    className="img-fluid rounded border border-warning shadow"
                    style={{ maxHeight: "260px", objectFit: "cover" }}
                />
            </div>

            <p className="text-white-50 fs-5 mb-4" style={{ maxWidth: "500px" }}>
                {message}
            </p>
            <div>
                <button 
                    className="btn btn-warning fw-bold px-4 py-2 text-dark me-3"
                    onClick={() => navigate("/login")}
                >
                    Volver al Login 
                </button>
                <button 
                    className="btn btn-outline-light fw-semibold px-4 py-2"
                    onClick={() => navigate("/")}
                >
                    Ir al Inicio 
                </button>
            </div>
        </div>
    );
};

export default ErrorPage;