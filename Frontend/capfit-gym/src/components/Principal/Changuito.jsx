import { useState } from "react";
import { useAppContext } from "../context/AppContext"; 
import imagenPrototipo from "../../img/prototipo.jpg";
import 'bootstrap/dist/css/bootstrap.min.css';

const generateRandomCode = () => {
    return 'CAPFIT-RET-' + Math.floor(100000 + Math.random() * 900000);
};

const Changuito = () => {
    const { 
        cart, 
        updateQuantity, 
        removeFromCart, 
        clearCart, 
        setAlertMessage 
    } = useAppContext();

    const [purchaseReceipt, setPurchaseReceipt] = useState(null);

    const totalAmount = cart.reduce((acc, item) => acc + (item.precio * item.quantity), 0);

    const handleCheckout = async () => {
        const confirmed = window.confirm("¿Está seguro que desea ir a pagar?");
        if (!confirmed) return; 

        const token = localStorage.getItem("token");

        if (!token) {
            setAlertMessage({
                text: "Debes iniciar sesión para poder finalizar la compra.",
                variant: "danger"
            });
            return;
        }

        const purchasedItems = cart.map(prod => ({
            id: prod.id,
            cantidad: prod.quantity
        }));

        try {
            const stockResponse = await fetch('http://localhost:5000/api/productos/comprar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ items: purchasedItems })
            });

            if (!stockResponse.ok) {
                const data = await stockResponse.json();
                setAlertMessage({
                    text: data.mensaje || "Error al procesar el stock de la compra.",
                    variant: "danger"
                });
                return;
            }

            const mpResponse = await fetch('http://localhost:5000/api/crear-preferencia', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    titulo: 'Compra de Suplementos / Productos - Capfit Gym',
                    precio: totalAmount 
                })
            });

            const mpData = await mpResponse.json();

            if (mpData.init_point) {
                window.open(mpData.init_point, '_blank');
            }

            setAlertMessage({
                text: "¡Pedido confirmado y stock actualizado! Redirigiendo a Mercado Pago... 💪🏻😄",
                variant: "success"
            });

            clearCart();

        } catch (error) {
            console.error("Error en la pasarela de compra:", error);
            setAlertMessage({
                text: "Error de conexión con el servidor.",
                variant: "danger"
            });
        }
    };

    const handlePaymentSimulation = async () => {
        const token = localStorage.getItem("token");

        if (!token) {
            setAlertMessage({
                text: "Debes iniciar sesión para realizar la simulación.",
                variant: "danger"
            });
            return;
        }

        if (cart.length === 0) return;

        const purchasedItemsCopy = [...cart];
        const totalAmountCopy = totalAmount;

        const purchasedItems = cart.map(prod => ({
            id: prod.id,
            cantidad: prod.quantity
        }));

        try {
            await fetch('http://localhost:5000/api/productos/comprar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ items: purchasedItems })
            });

            setPurchaseReceipt({
                code: generateRandomCode(),
                products: purchasedItemsCopy,
                totalAmount: totalAmountCopy
            });

            clearCart();

        } catch (error) {
            console.error("Error en la simulación:", error);
        }
    };

    if (purchaseReceipt) {
        return (
            <div className="changuito-container text-white">
                <div className="p-3 rounded-4 shadow-sm bg-dark border border-success text-start mb-3">
                    <div className="text-center mb-2">
                        <span className="badge bg-success fs-6 px-3 py-2">¡Compra Simulada con Éxito! ✓</span>
                    </div>
                    <h6 className="text-warning text-center mb-2">🎫 Comprobante de Retiro</h6>
                    <p className="small mb-1 text-center text-info">Código: <strong>{purchaseReceipt.code}</strong></p>
                    <hr className="border-secondary my-2" />
                    <ul className="list-unstyled small mb-2">
                        {purchaseReceipt.products.map((p, idx) => (
                            <li key={idx} className="d-flex justify-content-between">
                                <span>{p.quantity}x {p.nombre}</span>
                                <span>${(p.precio * p.quantity).toFixed(2)}</span>
                            </li>
                        ))}
                    </ul>
                    <hr className="border-secondary my-2" />
                    <p className="fw-bold mb-1">Total abonado: <span className="text-warning">${purchaseReceipt.totalAmount.toFixed(2)}</span></p>
                    <p className="text-white-50 small mt-2 mb-0 text-center">Presentá este comprobante en la recepción de Capfit Gym para retirar tus productos.</p>
                </div>
                <button 
                    className="btn btn-outline-warning btn-sm w-100 fw-bold"
                    onClick={() => setPurchaseReceipt(null)}
                >
                    Seguir comprando
                </button>
            </div>
        );
    }

    if (cart.length === 0) {
        return (
            <div className="text-center py-3 text-white-50">
                <p className="m-0">Tu changuito está vacío 🛒</p>
            </div>
        );
    }

    return (
        <div className="changuito-container text-white">
            <ul className="list-unstyled mb-3" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                {cart.map((item) => (
                    <li key={item.id} className="d-flex justify-content-between align-items-center mb-3 border-bottom border-secondary pb-2">
                        <div className="d-flex align-items-center">
                            <img 
                                src={(!item.imagen || item.imagen === "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=500&q=80") ? imagenPrototipo : item.imagen} 
                                alt={item.nombre} 
                                style={{ width: '35px', height: '35px', objectFit: 'cover', borderRadius: '4px' }} 
                                className="me-2"
                            />
                            <div>
                                <h6 className="m-0 text-warning" style={{ fontSize: '13px' }}>{item.nombre}</h6>
                                <div className="d-flex align-items-center mt-1">
                                    <button 
                                        className="btn btn-sm btn-outline-warning py-0 px-1" 
                                        style={{ fontSize: '12px' }}
                                        onClick={() => updateQuantity(item.id, -1)}
                                    >
                                        -
                                    </button>
                                    <span className="mx-2 text-white" style={{ fontSize: '12px' }}>{item.quantity}</span>
                                    <button 
                                        className="btn btn-outline-warning btn-sm py-0 px-1"
                                        style={{ fontSize: '12px' }}
                                        onClick={() => updateQuantity(item.id, 1)}
                                        disabled={item.quantity >= item.stock}
                                    >
                                        +
                                    </button>
                                    <span className="ms-2 text-white-50" style={{ fontSize: '11px' }}>(${item.precio.toFixed(2)} "c/u")</span>
                                </div>
                                {item.quantity >= item.stock && (
                                    <small className="text-danger fw-bold d-block mt-1" style={{ fontSize: '10px' }}>
                                        ⚠️ LLegaste al Max de Stock
                                    </small>
                                )}
                            </div>
                        </div>

                        <div className="text-end">
                            <span className="fw-bold text-white d-block" style={{ fontSize: '13px' }}>
                                ${ (item.precio * item.quantity).toFixed(2) }
                            </span>
                            <button 
                                className="btn btn-link text-danger p-0 mt-1" 
                                style={{ fontSize: '12px', textDecoration: 'none' }}
                                onClick={() => removeFromCart(item.id)}
                                title="Eliminar producto"
                            >
                                eliminar
                            </button>
                        </div>
                    </li>
                ))}
            </ul>

            <div className="border-top border-secondary pt-2 d-flex justify-content-between align-items-center mb-3">
                <span className="fw-bold">Total:</span>
                <span className="fw-bold text-warning fs-5">${totalAmount.toFixed(2)}</span>
            </div>

            <button 
                className="btn btn-warning w-100 fw-bold text-dark py-2 mb-2"
                onClick={handleCheckout}
            >
                Finalizar Compra 💪🏻😄
            </button>

            <button 
                className="btn btn-outline-success btn-sm w-100 fw-bold py-1"
                style={{ fontSize: '12px' }}
                onClick={handlePaymentSimulation}
            >
                Simulación pago 
            </button>
        </div>
    );
};

export default Changuito;