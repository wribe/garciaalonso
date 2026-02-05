// backend/server/noticiasRoutes.js
import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ruta al archivo db.json
const DB_PATH = path.join(__dirname, '../data/db.json');

// 📰 Obtener todas las noticias
router.get('/', async (req, res) => {
    try {
        const data = await fs.readFile(DB_PATH, 'utf8');
        const db = JSON.parse(data);
        const noticias = db.noticias || [];
        
        // Ordenar por fecha descendente (más reciente primero)
        noticias.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        
        res.json(noticias);
    } catch (error) {
        console.error('Error obteniendo noticias:', error);
        res.status(500).json({ error: 'Error al obtener las noticias' });
    }
});

// 📰 Obtener una noticia por ID
router.get('/:id', async (req, res) => {
    try {
        const data = await fs.readFile(DB_PATH, 'utf8');
        const db = JSON.parse(data);
        const noticia = db.noticias?.find(n => n.id === req.params.id);
        
        if (!noticia) {
            return res.status(404).json({ error: 'Noticia no encontrada' });
        }
        
        res.json(noticia);
    } catch (error) {
        console.error('Error obteniendo noticia:', error);
        res.status(500).json({ error: 'Error al obtener la noticia' });
    }
});

// 📰 Crear una noticia (admin)
router.post('/', async (req, res) => {
    try {
        const { titulo, contenido, fecha, publicado } = req.body;
        if (!titulo || !contenido) return res.status(400).json({ error: 'Faltan campos' });

        const data = await fs.readFile(DB_PATH, 'utf8');
        const db = JSON.parse(data);
        db.noticias = db.noticias || [];

        // generar id corto tipo hex de 4 caracteres
        const id = require('crypto').randomBytes(2).toString('hex');
        const nueva = { id, titulo, contenido, fecha: fecha || new Date().toISOString(), publicado: publicado !== false };
        db.noticias.push(nueva);

        await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
        res.status(201).json(nueva);
    } catch (error) {
        console.error('Error creando noticia:', error);
        res.status(500).json({ error: 'Error al crear la noticia' });
    }
});

// 📰 Actualizar una noticia por id (admin)
router.put('/:id', async (req, res) => {
    try {
        const { titulo, contenido, fecha, publicado } = req.body;
        const data = await fs.readFile(DB_PATH, 'utf8');
        const db = JSON.parse(data);
        db.noticias = db.noticias || [];

        const idx = db.noticias.findIndex(n => n.id === req.params.id);
        if (idx === -1) return res.status(404).json({ error: 'Noticia no encontrada' });

        const updated = { ...db.noticias[idx], titulo: titulo ?? db.noticias[idx].titulo, contenido: contenido ?? db.noticias[idx].contenido, fecha: fecha ?? db.noticias[idx].fecha };
        if (typeof publicado !== 'undefined') updated.publicado = publicado;

        db.noticias[idx] = updated;
        await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
        res.json(updated);
    } catch (error) {
        console.error('Error actualizando noticia:', error);
        res.status(500).json({ error: 'Error al actualizar la noticia' });
    }
});

// 📰 Eliminar una noticia por id (admin) - borra físicamente
router.delete('/:id', async (req, res) => {
    try {
        const data = await fs.readFile(DB_PATH, 'utf8');
        const db = JSON.parse(data);
        db.noticias = db.noticias || [];

        const idx = db.noticias.findIndex(n => n.id === req.params.id);
        if (idx === -1) return res.status(404).json({ error: 'Noticia no encontrada' });

        const removed = db.noticias.splice(idx, 1)[0];
        await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
        res.json({ success: true, removed });
    } catch (error) {
        console.error('Error eliminando noticia:', error);
        res.status(500).json({ error: 'Error al eliminar la noticia' });
    }
});

export default router;
