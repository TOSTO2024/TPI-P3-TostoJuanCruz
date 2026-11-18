import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, 'capfit.db');

const db = new sqlite3.verbose().Database(dbPath, (err) => {
    if (err) {
        console.error('Error al conectar con la base de datos:', err.message);
    } else {
        console.log('Conectado a la base de datos SQLite (capfit.db) con éxito.');
    }
});

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            rol TEXT NOT NULL,
            nombre TEXT NOT NULL,
            dni TEXT UNIQUE,
            fechaNacimiento TEXT,
            membresia_expiracion TEXT
        )
    `, (err) => {
        if (!err) {
            db.run(`
                INSERT OR IGNORE INTO usuarios (id, email, password, rol, nombre) 
                VALUES (1, 'sysadmin@capfit.com', '12345678', 'sysadmin', 'Dueño Supremo')
            `);
            db.run(`
                INSERT OR IGNORE INTO usuarios (id, email, password, rol, nombre) 
                VALUES (2, 'admin@capfit.com', '12345678', 'admin', 'Administrador')
            `);
            db.run(`
                INSERT OR IGNORE INTO usuarios (id, email, password, rol, nombre) 
                VALUES (3, 'cliente@capfit.com', '12345678', 'cliente', 'Cliente promedio')
            `);
        }
    });

    db.run(`
        CREATE TABLE IF NOT EXISTS productos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            precio REAL NOT NULL,
            stock INTEGER DEFAULT 0,
            imagen TEXT,
            descripcion TEXT
        )
    `);
    
    db.run(`
        CREATE TABLE IF NOT EXISTS reservas_clases (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER,
            clase_id INTEGER,
            horario TEXT,
            FOREIGN KEY(usuario_id) REFERENCES usuarios(id)
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS tickets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER,
            concepto TEXT,
            monto REAL,
            codigo_ticket TEXT,
            estado TEXT DEFAULT 'Aprobado',
            fecha TEXT,
            FOREIGN KEY(usuario_id) REFERENCES usuarios(id)
        )
    `);
});

export default db;