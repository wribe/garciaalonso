import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { authMiddleware, adminMiddleware } from './middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, '../data/db.json');

const router = express.Router();

// Función auxiliar para leer db.json
const readDB = async () => {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(data);
};

// Función auxiliar para escribir db.json
const writeDB = async (data) => {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
};

// Generar ID único
const generateId = () => {
    return Math.random().toString(36).substring(2, 6);
};

// GET /api/clientes-json/usuario - Obtener cliente logueado
router.get('/usuario', authMiddleware, async (req, res) => {
    try {
        console.log('🔍 Buscando usuario con DNI:', req.user.dni);
        const db = await readDB();
        const cliente = db.clientes.find(c => c.dni === req.user.dni);
        
        if (!cliente) {
            console.log('❌ Cliente no encontrado para DNI:', req.user.dni);
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }
        
        // No enviar password
        const { password, ...clienteSinPassword } = cliente;
        console.log('✅ Cliente encontrado:', cliente.nombre);
        res.json(clienteSinPassword);
    } catch (error) {
        console.error('❌ Error al obtener cliente:', error);
        res.status(500).json({ message: 'Error al obtener cliente' });
    }
});

// POST /api/clientes-json/registro - Registrar nuevo cliente
router.post('/registro', async (req, res) => {
    try {
        const { dni, password, nombre, apellidos, email, movil, direccion, provincia, municipio, tipo } = req.body;
        
        console.log('📝 Intentando registrar cliente:', { dni, nombre, email });
        
        if (!dni || !password || !nombre || !email || !movil) {
            console.log('❌ Faltan campos requeridos');
            return res.status(400).json({ message: 'Faltan campos requeridos' });
        }

        const db = await readDB();
        
        // Verificar si ya existe
        const existe = db.clientes.find(c => 
            c.dni === dni.toUpperCase() || c.email === email || c.movil === movil
        );
        
        if (existe) {
            console.log('❌ Cliente ya existe:', dni);
            return res.status(409).json({ message: 'DNI, email o móvil ya existe' });
        }

        // Hash de la contraseña
        const passwordHash = await bcrypt.hash(password, 10);

        // Crear nuevo cliente
        const nuevoCliente = {
            id: generateId(),
            dni: dni.toUpperCase(),
            nombre,
            apellidos: apellidos || '',
            email,
            movil,
            direccion: direccion || '',
            provincia: provincia || '',
            municipio: municipio || '',
            fecha_alta: new Date().toISOString().split('T')[0],
            historico: false,
            lopd: true,
            password: passwordHash,
            tipo: tipo || 'user'
        };

        db.clientes.push(nuevoCliente);
        await writeDB(db);

        console.log('✅ Cliente registrado exitosamente:', dni);
        res.status(201).json({ 
            success: true, 
            message: 'Cliente registrado exitosamente',
            data: { id: nuevoCliente.id, nombre: nuevoCliente.nombre }
        });
    } catch (error) {
        console.error('❌ Error en el registro:', error);
        res.status(500).json({ message: 'Error en el servidor: ' + error.message });
    }
});

// PUT /api/clientes-json/:id - Actualizar cliente
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = { ...req.body };
        
        // No permitir actualizar password o id directamente
        delete updates.password;
        delete updates.id;

        const db = await readDB();
        const index = db.clientes.findIndex(c => c.id === id);
        
        if (index === -1) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }

        // Verificar conflictos con otros clientes
        if (updates.dni || updates.email || updates.movil) {
            const conflicto = db.clientes.find(c => 
                c.id !== id && (
                    (updates.dni && c.dni === updates.dni.toUpperCase()) ||
                    (updates.email && c.email === updates.email) ||
                    (updates.movil && c.movil === updates.movil)
                )
            );
            
            if (conflicto) {
                return res.status(409).json({ error: 'DNI, email o móvil ya en uso' });
            }
        }

        // Actualizar cliente
        db.clientes[index] = { ...db.clientes[index], ...updates };
        await writeDB(db);

        console.log('✅ Cliente actualizado:', id);
        res.json({ success: true });
    } catch (error) {
        console.error('❌ Error actualizando cliente:', error);
        res.status(500).json({ error: 'Error actualizando cliente' });
    }
});

// DELETE /api/clientes-json/:id - Marcar cliente como histórico
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const db = await readDB();
        const index = db.clientes.findIndex(c => c.id === id);
        
        if (index === -1) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }

        db.clientes[index].historico = true;
        await writeDB(db);

        console.log('✅ Cliente marcado como histórico:', id);
        res.json({ success: true });
    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({ error: 'Error' });
    }
});

// GET /api/clientes-json - Listar clientes (solo admin)
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { q, page = 1, limit = 10 } = req.query;
        const db = await readDB();
        
        let clientes = db.clientes;
        
        // Filtrar por búsqueda
        if (q) {
            const query = q.toLowerCase();
            clientes = clientes.filter(c =>
                c.dni.toLowerCase().includes(query) ||
                c.nombre.toLowerCase().includes(query) ||
                (c.apellidos && c.apellidos.toLowerCase().includes(query)) ||
                c.email.toLowerCase().includes(query) ||
                c.movil.includes(query)
            );
        }

        const total = clientes.length;
        const start = (page - 1) * limit;
        const paginados = clientes.slice(start, start + parseInt(limit));

        // Quitar passwords
        const clientesSinPassword = paginados.map(({ password, ...rest }) => rest);

        res.json({ 
            total, 
            page: Number(page), 
            limit: Number(limit), 
            data: clientesSinPassword 
        });
    } catch (error) {
        console.error('❌ Error listando clientes:', error);
        res.status(500).json({ error: 'Error' });
    }
});

// GET /api/clientes-json/perfil/:id - Obtener perfil de cliente
router.get('/perfil/:id', authMiddleware, async (req, res) => {
    try {
        const db = await readDB();
        const cliente = db.clientes.find(c => c.id === req.params.id);
        
        if (!cliente) {
            return res.status(404).json({ error: 'No encontrado' });
        }

        const { password, ...clienteSinPassword } = cliente;
        res.json(clienteSinPassword);
    } catch (error) {
        res.status(500).json({ error: 'Error' });
    }
});

export default router;
