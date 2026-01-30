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

export default router;
