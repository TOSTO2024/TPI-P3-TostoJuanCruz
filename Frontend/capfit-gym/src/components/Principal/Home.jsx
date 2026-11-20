import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext.jsx";
import Carousel from "./Carousel.jsx";

const Home = () => {
    const { token, userName } = useAppContext();
    const navigate = useNavigate();

    return (
        <div className="text-center container">
            <Carousel />
            <h1 className="display-3 fw-bold text-white mb-3 mt-4">
                BIENVENIDOS A <span className="text-warning">CAPFIT GYM</span>
            </h1>
            <p className="text-white-50 fs-4 mb-4">Llevá tu rendimiento al siguiente nivel.</p>

            {!token ? (
                <button className="btn btn-warning btn-lg fw-bold px-5 text-dark" onClick={() => navigate("/register")}>
                    Registrate Aquí
                </button>
            ) : (
                <div className="text-warning fs-5 fw-semibold">
                    ¡Qué bueno tenerte por acá, {userName || "Atleta"}! 💪🏻🔥
                </div>
            )}
        </div>
    );
};

export default Home;