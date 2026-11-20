import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import db from "./database.js";

const app = express();
const PORT = process.env.PORT || 5000;
const SECRET_KEY = process.env.SECRET_KEY || 'clave_secreta_capfit_gym_utn';
const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

if (!MP_ACCESS_TOKEN) {
    console.warn('Advertencia: MP_ACCESS_TOKEN no está definido en el archivo .env');
}

const client = new MercadoPagoConfig({ accessToken: MP_ACCESS_TOKEN || '' });

app.use(cors());
app.use(express.json());

const verificarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(403).json({ mensaje: 'Token no proporcionado.' });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(403).json({ mensaje: 'Token malformado.' });

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(401).json({ mensaje: 'Token inválido o expirado.' });

        req.usuarioId = decoded.id;
        req.usuarioRol = decoded.rol;
        next();
    });
};

const verificarAdmin = (req, res, next) => {
    if (req.usuarioRol === 'admin' || req.usuarioRol === 'sysadmin') {
        next();
    } else {
        res.status(403).json({ mensaje: 'Acceso denegado: Se requiere rol de Administrador.' });
    }
};

const verificarSysadmin = (req, res, next) => {
    if (req.usuarioRol === 'sysadmin') {
        next();
    } else {
        res.status(403).json({ mensaje: 'Acceso denegado: Se requiere rol exclusivo de Sysadmin.' });
    }
};

const dbGet = (sql, params = []) =>
    new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });

const dbRun = (sql, params = []) =>
    new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve(this);
        });
    });

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    const query = `SELECT * FROM usuarios WHERE email = ? AND password = ?`;
    db.get(query, [email, password], (err, usuario) => {
        if (err) return res.status(500).json({ mensaje: 'Error en el servidor.' });
        if (!usuario) {
            return res.status(401).json({ mensaje: 'Credenciales inválidas.' });
        }

        const token = jwt.sign(
            { id: usuario.id, rol: usuario.rol },
            SECRET_KEY,
            { expiresIn: '4h' }
        );

        res.json({
            mensaje: 'Login exitoso',
            token,
            rol: usuario.rol,
            nombre: usuario.nombre
        });
    });
});

app.post('/api/register', (req, res) => {
    const { email, password, nombre, dni, fechaNacimiento } = req.body;

    if (!email || !password || !dni) {
        return res.status(400).json({ mensaje: 'Email, contraseña y DNI son obligatorios.' });
    }

    const queryCheck = `SELECT * FROM usuarios WHERE email = ? OR dni = ?`;
    db.get(queryCheck, [email, dni], (err, existe) => {
        if (err) return res.status(500).json({ mensaje: 'Error en el servidor.' });
        if (existe) {
            if (existe.email === email) {
                return res.status(400).json({ mensaje: 'El correo electrónico ya se encuentra registrado.' });
            }
            if (existe.dni === dni) {
                return res.status(400).json({ mensaje: 'El DNI ingresado ya se encuentra registrado en el sistema.' });
            }
        }

        const nombreUsuario = nombre || 'Usuario';
        const queryInsert = `INSERT INTO usuarios (email, password, rol, nombre, dni, fechaNacimiento) VALUES (?, ?, 'cliente', ?, ?, ?)`;

        db.run(queryInsert, [email, password, nombreUsuario, dni, fechaNacimiento || null], function (err) {
            if (err) return res.status(500).json({ mensaje: 'Error al registrar usuario.' });

            const nuevoId = this.lastID;
            const token = jwt.sign(
                { id: nuevoId, rol: 'cliente' },
                SECRET_KEY,
                { expiresIn: '4h' }
            );

            res.status(201).json({
                mensaje: 'Registro exitoso',
                token,
                rol: 'cliente',
                nombre: nombreUsuario
            });
        });
    });
});

app.get('/api/usuarios', verificarToken, verificarAdmin, (req, res) => {
    db.all(`SELECT id, email, rol, nombre, dni, fechaNacimiento, membresia_expiracion FROM usuarios`, [], (err, usuarios) => {
        if (err) return res.status(500).json({ mensaje: 'Error al obtener usuarios.' });
        res.json(usuarios);
    });
});

app.put('/api/usuarios/:id/rol', verificarToken, verificarSysadmin, (req, res) => {
    const { id } = req.params;
    const { rol } = req.body;

    if (!['cliente', 'admin', 'sysadmin'].includes(rol)) {
        return res.status(400).json({ mensaje: 'Rol inválido.' });
    }

    db.get(`SELECT rol FROM usuarios WHERE id = ?`, [id], (err, usuarioActual) => {
        if (err || !usuarioActual) return res.status(404).json({ mensaje: 'Usuario no encontrado.' });

        if (usuarioActual.rol === 'sysadmin' && rol !== 'sysadmin') {
            db.get(`SELECT COUNT(*) as count FROM usuarios WHERE rol = 'sysadmin'`, (err, row) => {
                if (err || !row) return res.status(500).json({ mensaje: 'Error al verificar sysadmins.' });
                if (row.count <= 1) {
                    return res.status(400).json({ mensaje: 'Acción denegada: Debe existir al menos un sysadmin en el sistema.' });
                }
                ejecutarUpdateRol();
            });
        } else {
            ejecutarUpdateRol();
        }
    });

    function ejecutarUpdateRol() {
        db.run(`UPDATE usuarios SET rol = ? WHERE id = ?`, [rol, id], function (err) {
            if (err) {
                return res.status(500).json({ mensaje: 'Error al actualizar el rol en la base de datos.' });
            }
            res.json({ mensaje: '¡Rol actualizado con éxito!' });
        });
    }
});

app.delete('/api/usuarios/:id', verificarToken, verificarSysadmin, (req, res) => {
    const { id } = req.params;

    db.get(`SELECT rol, nombre FROM usuarios WHERE id = ?`, [id], (err, usuario) => {
        if (err || !usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado.' });

        if (usuario.rol === 'sysadmin') {
            db.get(`SELECT COUNT(*) as count FROM usuarios WHERE rol = 'sysadmin'`, (err, row) => {
                if (err || !row) return res.status(500).json({ mensaje: 'Error al verificar sysadmins.' });
                if (row.count <= 1) {
                    return res.status(400).json({ mensaje: 'Acción denegada: No se puede eliminar al único sysadmin del sistema.' });
                }
                ejecutarDelete();
            });
        } else {
            ejecutarDelete();
        }
    });

    function ejecutarDelete() {
        db.run(`DELETE FROM usuarios WHERE id = ?`, [id], function (err) {
            if (err) return res.status(500).json({ mensaje: 'Error al eliminar el usuario.' });
            res.json({ mensaje: 'Usuario eliminado con éxito.' });
        });
    }
});

app.post('/api/usuarios/crear-admin', verificarToken, verificarSysadmin, (req, res) => {
    const { email, password, nombre } = req.body;

    if (!email || !password) {
        return res.status(400).json({ mensaje: 'Email y contraseña son obligatorios.' });
    }

    const queryCheck = `SELECT * FROM usuarios WHERE email = ?`;
    db.get(queryCheck, [email], (err, existe) => {
        if (err) return res.status(500).json({ mensaje: 'Error en el servidor.' });
        if (existe) {
            return res.status(400).json({ mensaje: 'El usuario ya existe.' });
        }

        const nombreAdmin = nombre || 'Administrador';
        const queryInsert = `INSERT INTO usuarios (email, password, rol, nombre) VALUES (?, ?, 'admin', ?)`;

        db.run(queryInsert, [email, password, nombreAdmin], function (err) {
            if (err) return res.status(500).json({ mensaje: 'Error al crear administrador.' });

            res.status(201).json({
                mensaje: 'Administrador creado con éxito',
                admin: { id: this.lastID, email, rol: 'admin' }
            });
        });
    });
});

app.get('/', (req, res) => {
    res.json({ mensaje: '¡Servidor de Capfit Gym con SQLite funcionando correctamente!' });
});

app.get('/api/productos', (req, res) => {
    db.all(`SELECT * FROM productos`, [], (err, productos) => {
        if (err) return res.status(500).json({ mensaje: 'Error al obtener productos.' });
        res.json(productos);
    });
});

app.post('/api/productos', verificarToken, verificarAdmin, (req, res) => {
    const { nombre, precio, stock, imagen, descripcion } = req.body;

    if (!nombre || !precio) {
        return res.status(400).json({ error: 'El nombre y el precio son obligatorios.' });
    }

    const nuevoPrecio = Number(precio);
    const nuevoStock = Number(stock) || 0;
    const nuevaImagen = imagen || 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=500&q=80';
    const nuevaDescripcion = descripcion || 'Suplemento oficial de Capfit Gym.';

    const query = `INSERT INTO productos (nombre, precio, stock, imagen, descripcion) VALUES (?, ?, ?, ?, ?)`;
    db.run(query, [nombre, nuevoPrecio, nuevoStock, nuevaImagen, nuevaDescripcion], function (err) {
        if (err) return res.status(500).json({ mensaje: 'Error al crear producto.' });

        res.status(201).json({
            id: this.lastID,
            nombre,
            precio: nuevoPrecio,
            stock: nuevoStock,
            imagen: nuevaImagen,
            descripcion: nuevaDescripcion
        });
    });
});

app.put('/api/productos/:id', verificarToken, verificarAdmin, (req, res) => {
    const { id } = req.params;
    const { nombre, precio, stock, imagen, descripcion } = req.body;

    db.get(`SELECT * FROM productos WHERE id = ?`, [id], (err, producto) => {
        if (err || !producto) return res.status(404).json({ mensaje: 'Producto no encontrado' });

        const nuevoNombre = nombre || producto.nombre;
        const nuevoPrecio = precio ? Number(precio) : producto.precio;
        const nuevoStock = stock !== undefined ? Number(stock) : producto.stock;
        const nuevaImagen = imagen || producto.imagen;
        const nuevaDescripcion = descripcion || producto.descripcion;

        const query = `UPDATE productos SET nombre = ?, precio = ?, stock = ?, imagen = ?, descripcion = ? WHERE id = ?`;
        db.run(query, [nuevoNombre, nuevoPrecio, nuevoStock, nuevaImagen, nuevaDescripcion, id], (err) => {
            if (err) return res.status(500).json({ mensaje: 'Error al actualizar producto.' });

            res.json({
                mensaje: 'Producto actualizado con éxito',
                producto: {
                    id: Number(id),
                    nombre: nuevoNombre,
                    precio: nuevoPrecio,
                    stock: nuevoStock,
                    imagen: nuevaImagen,
                    descripcion: nuevaDescripcion
                }
            });
        });
    });
});

app.delete('/api/productos/:id', verificarToken, verificarAdmin, (req, res) => {
    const { id } = req.params;

    db.get(`SELECT * FROM productos WHERE id = ?`, [id], (err, producto) => {
        if (err || !producto) return res.status(404).json({ mensaje: 'Producto no encontrado' });

        db.run(`DELETE FROM productos WHERE id = ?`, [id], (err) => {
            if (err) return res.status(500).json({ mensaje: 'Error al eliminar producto.' });
            res.json({ mensaje: 'Producto eliminado con éxito', producto });
        });
    });
});

app.post('/api/reservas', verificarToken, (req, res) => {
    const { claseId, horario } = req.body;
    const usuarioId = req.usuarioId;

    const query = `INSERT INTO reservas_clases (usuario_id, clase_id, horario) VALUES (?, ?, ?)`;
    db.run(query, [usuarioId, claseId, horario], function (err) {
        if (err) return res.status(500).json({ mensaje: 'Error al registrar la reserva.' });
        res.status(201).json({ mensaje: '¡Clase reservada con éxito!', id: this.lastID });
    });
});

app.get('/api/reservas', verificarToken, (req, res) => {
    const query = `
        SELECT r.id, r.clase_id, r.horario, u.id as usuario_id, u.nombre, u.email
        FROM reservas_clases r
        JOIN usuarios u ON r.usuario_id = u.id
        WHERE r.usuario_id = ?
    `;
    db.all(query, [req.usuarioId], (err, reservas) => {
        if (err) return res.status(500).json({ mensaje: 'Error al obtener las reservas.' });
        res.json(reservas);
    });
});

app.get('/api/admin/reservas', verificarToken, verificarAdmin, (req, res) => {
    const query = `
        SELECT r.id, r.clase_id, r.horario, u.id as usuario_id, u.nombre, u.email
        FROM reservas_clases r
        JOIN usuarios u ON r.usuario_id = u.id
    `;
    db.all(query, [], (err, reservas) => {
        if (err) return res.status(500).json({ mensaje: 'Error al obtener todas las reservas.' });
        res.json(reservas);
    });
});

app.delete('/api/reservas/:id', verificarToken, (req, res) => {
    const { id } = req.params;
    const usuarioId = req.usuarioId;

    const query = `DELETE FROM reservas_clases WHERE id = ? AND usuario_id = ?`;
    db.run(query, [id, usuarioId], function (err) {
        if (err) return res.status(500).json({ mensaje: 'Error al cancelar la reserva.' });
        res.json({ mensaje: 'Reserva cancelada con éxito' });
    });
});

app.post('/api/crear-preferencia', verificarToken, async (req, res) => {
    if (!MP_ACCESS_TOKEN) {
        return res.status(500).json({ mensaje: 'Mercado Pago no está configurado en el servidor (falta MP_ACCESS_TOKEN).' });
    }

    try {
        const { titulo, precio } = req.body;

        const preference = new Preference(client);
        const result = await preference.create({
            body: {
                items: [
                    {
                        title: titulo || 'Membresía Capfit Gym',
                        quantity: 1,
                        unit_price: Number(precio) || 25000,
                        currency_id: 'ARS'
                    }
                ],
                back_urls: {
                    success: FRONTEND_URL,
                    failure: FRONTEND_URL,
                    pending: FRONTEND_URL
                }
            }
        });

        res.json({ init_point: result.init_point });
    } catch (error) {
        console.error('Error al crear preferencia de Mercado Pago:', error);
        res.status(500).json({ mensaje: 'Error al procesar el pago con Mercado Pago.' });
    }
});

app.post('/api/tickets', verificarToken, (req, res) => {
    const { concepto, monto } = req.body;
    const usuarioId = req.usuarioId;
    const codigoTicket = 'CAPFIT-' + Math.floor(100000 + Math.random() * 900000);
    const fecha = new Date().toLocaleDateString();

    const query = `INSERT INTO tickets (usuario_id, concepto, monto, codigo_ticket, fecha) VALUES (?, ?, ?, ?, ?)`;
    db.run(query, [usuarioId, concepto, monto, codigoTicket, fecha], function (err) {
        if (err) return res.status(500).json({ mensaje: 'Error al generar el ticket.' });
        res.status(201).json({ mensaje: 'Ticket generado', codigo_ticket: codigoTicket });
    });
});

app.post('/api/usuarios/membresia', verificarToken, (req, res) => {
    const usuarioId = req.usuarioId;
    const fechaExpiracion = new Date(new Date().getTime() + (30 * 24 * 60 * 60 * 1000)).toISOString();

    db.run(
        `UPDATE usuarios SET membresia_expiracion = ? WHERE id = ?`,
        [fechaExpiracion, usuarioId],
        function (err) {
            if (err) {
                return res.status(500).json({ mensaje: 'Error al actualizar la membresía en la base de datos.' });
            }
            res.json({ mensaje: 'Membresía activada con éxito', membresia_expiracion: fechaExpiracion });
        }
    );
});

app.get('/api/usuarios/perfil', verificarToken, (req, res) => {
    const usuarioId = req.usuarioId;
    db.get(`SELECT id, nombre, email, rol, membresia_expiracion FROM usuarios WHERE id = ?`, [usuarioId], (err, row) => {
        if (err || !row) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }
        res.json(row);
    });
});

app.post('/api/productos/comprar', verificarToken, async (req, res) => {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ mensaje: 'No hay productos en la compra.' });
    }

    let transactionStarted = false;

    try {
        for (const item of items) {
            const cantidad = Number(item.cantidad);
            if (!item.id || !Number.isFinite(cantidad) || cantidad <= 0) {
                return res.status(400).json({ mensaje: 'Cantidad o producto inválido.' });
            }
        }

        await dbRun('BEGIN TRANSACTION');
        transactionStarted = true;

        for (const item of items) {
            const cantidad = Number(item.cantidad);
            const prod = await dbGet(`SELECT stock, nombre FROM productos WHERE id = ?`, [item.id]);
            if (!prod || prod.stock < cantidad) {
                await dbRun('ROLLBACK');
                return res.status(400).json({ mensaje: 'Stock insuficiente o producto inexistente.' });
            }

            const result = await dbRun(
                `UPDATE productos SET stock = stock - ? WHERE id = ? AND stock >= ?`,
                [cantidad, item.id, cantidad]
            );
            if (!result || result.changes === 0) {
                await dbRun('ROLLBACK');
                return res.status(400).json({ mensaje: 'Error al actualizar el stock o stock insuficiente.' });
            }
        }

        await dbRun('COMMIT');
        res.json({ mensaje: 'Compra procesada con éxito y stock actualizado.' });
    } catch (error) {
        if (transactionStarted) {
            try {
                await dbRun('ROLLBACK');
            } catch (_) {
            }
        }
        res.status(400).json({ mensaje: error.message || 'Error al procesar la compra.' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto http://localhost:${PORT}`);
});