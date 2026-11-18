import { useState } from "react";
import { Button, Form, Card } from "react-bootstrap";
import { useAppContext } from "../../context/AppContext";
import 'bootstrap/dist/css/bootstrap.min.css';
import "../login/Login.css";

const Register = ({ onRegister }) => {
    const { setAlertMessage } = useAppContext();

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        dni: "",
        birthDate: "",
        password: ""
    });

    const [touched, setTouched] = useState({
        firstName: false,
        lastName: false,
        email: false,
        dni: false,
        birthDate: false,
        password: false
    });

    const lettersOnlyRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,30}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const dniRegex = /^\d{7,8}$/;

    const today = new Date();
    const birthDateObj = new Date(formData.birthDate);
    const age = today.getFullYear() - birthDateObj.getFullYear() - 
        (today.getMonth() < birthDateObj.getMonth() || (today.getMonth() === birthDateObj.getMonth() && today.getDate() < birthDateObj.getDate()) ? 1 : 0);

    const validations = {
        firstName: lettersOnlyRegex.test(formData.firstName),
        lastName: lettersOnlyRegex.test(formData.lastName),
        email: emailRegex.test(formData.email),
        dni: dniRegex.test(formData.dni),
        birthDate: Boolean(formData.birthDate) && birthDateObj <= today && age >= 5 && age <= 100,
        password: formData.password.length >= 8
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setTouched(prev => ({ ...prev, [field]: true }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        setTouched({
            firstName: true,
            lastName: true,
            email: true,
            dni: true,
            birthDate: true,
            password: true
        });

        const isFormValid = Object.values(validations).every(Boolean);

        if (!isFormValid) {
            setAlertMessage({
                text: "Por favor, complete correctamente todos los campos marcados en rojo.",
                variant: "danger"
            });
            return;
        }

        const newUser = {
            nombre: `${formData.firstName} ${formData.lastName}`, 
            email: formData.email,
            password: formData.password,
            dni: formData.dni,
            fechaNacimiento: formData.birthDate
        };

        fetch('http://localhost:5000/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newUser)
        })
        .then(res => {
            if (!res.ok) {
                return res.json().then(data => { throw new Error(data.mensaje || 'Error al registrarse'); });
            }
            return res.json();
        })
        .then(data => {
            localStorage.setItem('token', data.token);
            localStorage.setItem('rol', data.rol);
            localStorage.setItem('nombre', data.nombre);

            setAlertMessage({
                text: `¡Cuenta creada con éxito! Bienvenido ${data.nombre}`,
                variant: "success"
            });

            setTimeout(() => {
                if (onRegister) onRegister(data.rol);
            }, 1200);
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
                    <h3 className="text-center mb-3 fw-bold text-white fs-2">Registrarse</h3>

                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3" controlId="formFirstName">
                            <Form.Label className="fw-semibold text-warning">Nombre</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Ingrese su nombre"
                                value={formData.firstName}
                                onChange={(e) => handleChange("firstName", e.target.value)}
                                isInvalid={touched.firstName && !validations.firstName}
                                isValid={touched.firstName && validations.firstName}
                                className="py-2"
                            />
                            <Form.Control.Feedback type="invalid" className="fw-semibold">
                                Solo letras, entre 3 y 30 caracteres.
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formLastName">
                            <Form.Label className="fw-semibold text-warning">Apellido</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Ingrese su apellido"
                                value={formData.lastName}
                                onChange={(e) => handleChange("lastName", e.target.value)}
                                isInvalid={touched.lastName && !validations.lastName}
                                isValid={touched.lastName && validations.lastName}
                                className="py-2"
                            />
                            <Form.Control.Feedback type="invalid" className="fw-semibold">
                                Solo letras, entre 3 y 30 caracteres.
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formEmail">
                            <Form.Label className="fw-semibold text-warning">Email</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="Ingrese su email"
                                value={formData.email}
                                onChange={(e) => handleChange("email", e.target.value)}
                                isInvalid={touched.email && !validations.email}
                                isValid={touched.email && validations.email}
                                className="py-2"
                            />
                            <Form.Control.Feedback type="invalid" className="fw-semibold">
                                Ingrese un correo electrónico válido.
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formDni">
                            <Form.Label className="fw-semibold text-warning">DNI</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Ingrese su DNI"
                                value={formData.dni}
                                onChange={(e) => handleChange("dni", e.target.value)}
                                isInvalid={touched.dni && !validations.dni}
                                isValid={touched.dni && validations.dni}
                                className="py-2"
                            />
                            <Form.Control.Feedback type="invalid" className="fw-semibold">
                                El DNI debe contener solo números (7 u 8 dígitos).
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formBirthDate">
                            <Form.Label className="fw-semibold text-warning">Fecha de Nacimiento</Form.Label>
                            <Form.Control
                                type="date"
                                value={formData.birthDate}
                                onChange={(e) => handleChange("birthDate", e.target.value)}
                                isInvalid={touched.birthDate && !validations.birthDate}
                                isValid={touched.birthDate && validations.birthDate}
                                className="py-2 text-white"
                            />
                            <Form.Control.Feedback type="invalid" className="fw-semibold">
                                {!formData.birthDate ? "Por favor, seleccione su fecha de nacimiento." : 
                                birthDateObj > today ? "La fecha no puede ser futura." : 
                                "Debes tener entre 5 y 100 años para registrarte."}
                            </Form.Control.Feedback>
                        </Form.Group>
                        
                        <Form.Group className="mb-3" controlId="formPassword">
                            <Form.Label className="fw-semibold text-warning">Contraseña</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Ingrese su contraseña"
                                value={formData.password}
                                onChange={(e) => handleChange("password", e.target.value)}
                                isInvalid={touched.password && !validations.password}
                                isValid={touched.password && validations.password}
                                className="py-2"
                            />
                            <Form.Control.Feedback type="invalid" className="fw-semibold">
                                La contraseña requiere al menos 8 caracteres ({formData.password.length}/8).
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Button variant="warning" type="submit" className="w-100 mt-2 py-3 fw-bold fs-5 text-dark">
                            Crear Cuenta
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    );
};

export default Register;