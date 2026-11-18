import { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext'; 
import 'bootstrap/dist/css/bootstrap.min.css';

const CatalogoCliente = () => {
    const { addToCart, role } = useAppContext();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const isAdmin = role === "admin" || role === "sysadmin";

    useEffect(() => {
        fetch('http://localhost:5000/api/productos')
        .then((res) => res.json())
        .then((data) => {
            setProducts(data);
            setLoading(false);
        })
        .catch((error) => {
            console.error('Error al cargar el catálogo:', error);
            setLoading(false);
        });
    }, []);

    if (loading) return <p style={{ color: '#ffb300' }}>Cargando suplementos de Capfit Gym...</p>;

    return (
        <div className="catalogo-container" style={{ padding: '20px', color: '#fff' }}>
            <h2>Catálogo de Productos</h2>
            <div className="productos-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px', marginTop: '15px' }}>
                {products
                    .filter((product) => {
                        if (product.stock <= 0 && !isAdmin) {
                            return false;
                        }
                        return true;
                    })
                    .map((product) => {
                        const isOutOfStock = product.stock <= 0;

                        return (
                            <div key={product.id} style={{ background: '#1a1a1a', padding: '15px', borderRadius: '8px', border: '1px solid #333' }}>
                                <img src={product.imagen} alt={product.nombre} style={{ width: '100%', height: '150px', objectFit: 'cover', marginBottom: '10px' }} />
                                <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>{product.nombre}</h3>
                                <p style={{ color: '#ffb300', fontWeight: 'bold', fontSize: '16px' }}>${product.precio}</p>
                                
                                {isAdmin && (
                                    <p style={{ fontSize: '12px', color: isOutOfStock ? '#ff4d4d' : '#17a2b8', fontWeight: 'bold' }}>
                                        Stock disponible: {product.stock}
                                    </p>
                                )}

                                <button 
                                    onClick={() => addToCart(product)}
                                    disabled={isOutOfStock} 
                                    style={{ 
                                        background: isOutOfStock ? '#444' : '#ffb300', 
                                        color: isOutOfStock ? '#aaa' : '#0d0d0d', 
                                        border: 'none', 
                                        padding: '8px 12px', 
                                        fontWeight: 'bold', 
                                        borderRadius: '4px', 
                                        cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                                        marginTop: '10px',
                                        width: '100%'
                                    }}
                                >
                                    {isOutOfStock ? 'Sin Stock ❌' : 'Agregar al Changuito 🛒'}
                                </button>
                            </div>
                        );
                    })}
            </div>
        </div>
    );
};

export default CatalogoCliente;