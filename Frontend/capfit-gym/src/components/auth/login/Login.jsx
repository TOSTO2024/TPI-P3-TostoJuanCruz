import { useState } from "react";
import { Button, Form, Card } from "react-bootstrap";
import { useAppContext } from "../../context/AppContext"; 
import 'bootstrap/dist/css/bootstrap.min.css';
import "./Login.css";

const Login = ({ onLoginSuccess }) => {
    const { setAlertMessage } = useAppContext();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [emailTouched, setEmailTouched] = useState(false);
    const [passwordTouched, setPasswordTouched] = useState(false);

    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isPasswordValid = password.length >= 8;

    const handleSubmit = (e) => {
        e.preventDefault();
        setEmailTouched(true);
        setPasswordTouched(true);

        if (!isEmailValid || !isPasswordValid) {
            setAlertMessage({
                text: "Por favor, corrige los campos antes de ingresar.",
                variant: "danger"
            });
            return;
        }

        fetch('http://localhost:5000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        })
        .then(res => {
            if (!res.ok) {
                return res.json().then(data => { throw new Error(data.mensaje || 'Credenciales inválidas'); });
            }
            return res.json();
        })
        .then(data => {
            localStorage.setItem('token', data.token);
            localStorage.setItem('rol', data.rol);
            localStorage.setItem('nombre', data.nombre);
            localStorage.setItem('email', email);

            setAlertMessage({
                text: `¡Bienvenido ${data.nombre} (${data.rol})! Redirigiendo...`,
                variant: "success"
            });

            setTimeout(() => {
                if (onLoginSuccess) onLoginSuccess(data.rol);
            }, 800);
        })
        .catch(err => {
            setAlertMessage({
                text: "Error: " + err.message,
                variant: "danger"
            });
        });
    };

    return (
        <div className="auth-container">
            <Card className="p-4 shadow-lg custom-card" style={{ width: '450px', minWidth: '450px' }}>
                <Card.Body>
                    <h3 className="text-center mb-4 fw-bold text-white fs-2">Iniciar Sesión</h3>

                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-4" controlId="formEmail">
                            <Form.Label className="fw-semibold fs-5 text-warning">Email</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="Ingrese su email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setEmailTouched(true);
                                }}
                                isInvalid={emailTouched && !isEmailValid}
                                isValid={emailTouched && isEmailValid}
                                className="py-2"
                            />
                            <Form.Control.Feedback type="invalid" className="fw-semibold mt-1">
                                Formato de email inválido.
                            </Form.Control.Feedback>
                        </Form.Group>
                        
                        <Form.Group className="mb-4" controlId="formPassword">
                            <Form.Label className="fw-semibold fs-5 text-warning">Contraseña</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Ingrese su Contraseña"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setPasswordTouched(true);
                                }}
                                isInvalid={passwordTouched && !isPasswordValid}
                                isValid={passwordTouched && isPasswordValid}
                                className="py-2"
                            />
                            <Form.Control.Feedback type="invalid" className="fw-semibold mt-1">
                                La contraseña debe tener al menos 8 caracteres ({password.length}/8).
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Button variant="warning" type="submit" className="w-100 mt-3 py-3 fw-bold fs-5 text-dark">
                            Ingresar
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    );
};

export default Login;