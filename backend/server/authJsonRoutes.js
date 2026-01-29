import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, '../data/db.json');

const router = express.Router();

// Función auxiliar para leer db.json
const readDB = async () => {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(data);
};

// Generar ID único
const generateId = () => {
    return Math.random().toString(36).substring(2, 6);
};

// Función auxiliar para escribir db.json
const writeDB = async (data) => {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
};

// POST /api/auth-json/register - Registro de usuario
router.post('/register', async (req, res) => {
    const { dni, password, nombre, apellidos, email, movil, direccion, provincia, municipio, tipo } = req.body;

    try {
        console.log('📝 BODY COMPLETO RECIBIDO:', JSON.stringify(req.body, null, 2));
        console.log('📝 Intentando registrar usuario en JSON:', { dni, nombre, email });
        
        if (!dni || !password || !nombre || !email || !movil) {
            console.log('❌ Faltan campos requeridos');
            console.log('  - DNI:', dni);
            console.log('  - Password:', password ? '***' : 'VACÍO');
            console.log('  - Nombre:', nombre);
            console.log('  - Email:', email);
            console.log('  - Móvil:', movil);
            return res.status(400).json({ 
                message: 'Faltan campos requeridos',
                missing: {
                    dni: !dni,
                    password: !password,
                    nombre: !nombre,
                    email: !email,
                    movil: !movil
                }
            });
        }

        const db = await readDB();
        
        const existingUser = db.clientes.find(c => 
            c.dni === dni.toUpperCase() || c.email === email || c.movil === movil
        );
        
        if (existingUser) {
            console.log('❌ Usuario ya existe:', dni);
            return res.status(400).json({ message: 'El usuario ya existe' });
        }

        // Hash de la contraseña
        const passwordHash = await bcrypt.hash(password, 10);

        const newUser = {
            id: generateId(),
            dni: dni.toUpperCase(),
            nombre,
            apellidos: apellidos || '',
            email,
            movil,
            direccion: direccion || '',
            provincia: provincia || '',
            municipio: municipio || '',
            tipo: tipo || 'user',
            fecha_alta: new Date().toISOString().split('T')[0],
            historico: false,
            lopd: true,
            password: passwordHash
        };

        db.clientes.push(newUser);
        await writeDB(db);
        
        console.log('✅ Usuario registrado exitosamente en JSON:', dni);
        res.status(201).json({ 
            message: 'Usuario registrado exitosamente', 
            success: true,
            data: { id: newUser.id, nombre: newUser.nombre }
        });
    } catch (error) {
        console.error('❌ Error en el registro JSON:', error);
        res.status(500).json({ message: 'Error en el servidor: ' + error.message });
    }
});

// POST /api/auth-json/login - Login de usuario
router.post('/login', async (req, res) => {
    const { dni, password } = req.body;

    try {
        console.log('🔐 Intentando login en JSON:', dni);
        
        const db = await readDB();
        const user = db.clientes.find(c => c.dni === dni.toUpperCase());
        
        if (!user) {
            console.log('❌ Usuario no encontrado:', dni);
            return res.status(400).json({ message: 'Usuario no encontrado' });
        }

        // Verificar que el usuario tenga contraseña
        if (!user.password || user.password === '') {
            console.log('❌ Usuario sin contraseña configurada');
            return res.status(400).json({ message: 'Usuario sin contraseña configurada. Contacte al administrador.' });
        }

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) {
            console.log('❌ Contraseña incorrecta');
            return res.status(400).json({ message: 'Contraseña incorrecta' });
        }

        if (user.historico) {
            console.log('❌ Usuario inactivo');
            return res.status(400).json({ message: 'Usuario inactivo' });
        }

        const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

        const token = jwt.sign(
            {
                dni: user.dni,
                rol: user.tipo || 'user',
                tipo: user.tipo || 'user',
                nombre: user.nombre
            },
            JWT_SECRET,
            { expiresIn: '2h' }
        );

        console.log('✅ Login exitoso:', dni);
        res.json({ token, tipo: user.tipo, nombre: user.nombre });
    } catch (error) {
        console.error('❌ Error en login JSON:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

// GET /api/auth-json/check-admin - Verificar si es admin
router.get('/check-admin', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.json({ isAdmin: false, name: '' });

    const token = authHeader.split(' ')[1];
    try {
        const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
        const payload = jwt.verify(token, JWT_SECRET);
        
        const db = await readDB();
        const user = db.clientes.find(c => c.dni === payload.dni);
        
        if (!user) return res.json({ isAdmin: false, name: '' });

        res.json({ 
            isAdmin: user.tipo === 'admin' || user.tipo === 'administrador', 
            name: user.nombre 
        });
    } catch (error) {
        res.json({ isAdmin: false, name: '' });
    }
});

export default router;
