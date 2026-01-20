import axios from 'axios';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Cliente from '../modelos/Cliente.js';

export const login = async (req, res) => {
    const { dni, password } = req.body;

    try {
        const user = await Cliente.findOne({ dni });
        if (!user) return res.status(400).json({ message: 'Usuario no encontrado' });

        const ok = await user.checkPassword(password);
        if (!ok) return res.status(400).json({ message: 'Contraseña incorrecta' });

        if (!user.activo) return res.status(400).json({ message: 'Usuario inactivo' });

        const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

        const token = jwt.sign(
            {
                dni: user.dni,
                rol: user.rol || 'user',
                nombre: user.nombre
            },
            JWT_SECRET,
            { expiresIn: '2h' }
        );

        // Devuelve el tipo en la respuesta
        res.json({ token, tipo: user.tipo, nombre: user.nombre });
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

/////////////// MEJOR EN UN FICHERO APARTE authMiddleware.js

// Middleware: verificar JWT
// Se usa en rutas que requieren autenticación
// Verifica el token enviado en el header Authorization


export const verificarToken = (req, res, next) => {
    const authHeader = req.headers.authorization; // Authorization: Bearer <token>

    if (!authHeader) return res.status(401).json({ mensaje: "Token no recibido" });

    const token = authHeader.split(" ")[1]; // separar "Bearer" del token

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // guardar info del usuario en req
        next(); // continuar al controlador
    } catch (err) {
        return res.status(403).json({ mensaje: "Token inválido" });
    }
};


/// TAMBIEN EN EL FICHERO APARTE authMiddleware.js
// Middleware: solo admin
export const soloAdmin = (req, res, next) => {
    if (req.user?.tipo !== "admin") {
        return res.status(403).json({ mensaje: "Acceso solo para administradores" });
    }
    next();
};

// Función para verificar si el token pertenece a un admin
export const checkAdmin = async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.json({ isAdmin: false, name: '' });

    const token = authHeader.split(' ')[1];
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const user = await Cliente.findOne({ dni: payload.dni });
        if (!user) return res.json({ isAdmin: false, name: '' });

        res.json({ isAdmin: user.tipo === 'admin' || user.rol === 'admin', name: user.nombre });
    } catch (error) {
        res.json({ isAdmin: false, name: '' });
    }
};

/*export const checkAdmin = (req, res) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return res.status(401).json({ isAdmin: false, mensaje: "Token no proporcionado" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const isAdmin = decoded.tipo === "admin";
        console.log(decoded);
        
        
        res.json({ 
            isAdmin, 
            tipo: decoded.tipo,
            dni: decoded.dni,
            name: decoded.name
        });
    } catch (err) {
        return res.status(403).json({ isAdmin: false, mensaje: "Token inválido o expirado" });
    }
};*/

// Función para verificar el token y devolver el DNI contenido en él
export const checkDni = (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ valid: false, message: "Token no proporcionado" });
    }

    const token = authHeader.split(" ")[1];

    try {
        // Decodificar el token y extraer el DNI directamente de él
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // El DNI viene del token, no del cliente, por lo que es confiable
        return res.json({
            valid: true,
            message: "Token válido",
            dni: decoded.dni,
            tipo: decoded.tipo,
            name: decoded.name
        });
    } catch (err) {
        return res.status(403).json({ valid: false, message: "Token inválido o expirado" });
    }
};

// Registro de usuario
export const register = async (req, res) => {
    const { dni, password, nombre, email, movil, direccion, tipo } = req.body;

    try {
        const existingUser = await Cliente.findOne({ dni });
        if (existingUser) {
            return res.status(400).json({ message: 'El usuario ya existe' });
        }

        const newUser = new Cliente({
            dni,
            nombre,
            email,
            movil,
            direccion,
            tipo: tipo || 'user', // <-- aquí debe ser tipo
            passwordHash: password
        });

        await newUser.save();

        res.status(201).json({ message: 'Usuario registrado exitosamente' });
    } catch (error) {
        console.error('Error en el registro:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

export default {
    register,
    // ...otras funciones
};