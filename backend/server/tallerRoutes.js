// server/tallerRoutes.js
import express from 'express';
import Cita from '../modelos/Cita.js';

const router = express.Router();
console.log('Router taller/citas cargado');

// 📋 Obtener todas las citas
router.get('/citas', async (req, res) => {
    try {
        const citas = await Cita.find().sort({ fechaCita: 1 }); // Ordenadas por fecha
        res.json(citas);
    } catch (error) {
        console.error('Error obteniendo citas:', error);
        res.status(500).json({ error: 'Error al obtener las citas' });
    }
});

// 📋 Obtener una cita por ID
router.get('/citas/:id', async (req, res) => {
    try {
        const cita = await Cita.findById(req.params.id);
        if (!cita) {
            return res.status(404).json({ error: 'Cita no encontrada' });
        }
        res.json(cita);
    } catch (error) {
        console.error('Error obteniendo cita:', error);
        res.status(500).json({ error: 'Error al obtener la cita' });
    }
});

// ➕ Crear una nueva cita
router.post('/citas', async (req, res) => {
    try {
        const nuevaCita = new Cita(req.body);
        const citaGuardada = await nuevaCita.save();
        res.status(201).json(citaGuardada);
    } catch (error) {
        console.error('Error creando cita:', error);
        res.status(400).json({ error: error.message });
    }
});

// ✏️ Actualizar una cita
router.put('/citas/:id', async (req, res) => {
    try {
        const citaActualizada = await Cita.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!citaActualizada) {
            return res.status(404).json({ error: 'Cita no encontrada' });
        }
        
        res.json(citaActualizada);
    } catch (error) {
        console.error('Error actualizando cita:', error);
        res.status(400).json({ error: error.message });
    }
});

// 🗑️ Eliminar una cita
router.delete('/citas/:id', async (req, res) => {
    try {
        const citaEliminada = await Cita.findByIdAndDelete(req.params.id);
        
        if (!citaEliminada) {
            return res.status(404).json({ error: 'Cita no encontrada' });
        }
        
        res.json({ mensaje: 'Cita eliminada correctamente', cita: citaEliminada });
    } catch (error) {
        console.error('Error eliminando cita:', error);
        res.status(500).json({ error: 'Error al eliminar la cita' });
    }
});

// 📊 Obtener citas por matrícula
router.get('/citas/matricula/:matricula', async (req, res) => {
    try {
        const citas = await Cita.find({ 
            matricula: req.params.matricula.toUpperCase() 
        }).sort({ fechaCita: -1 });
        res.json(citas);
    } catch (error) {
        console.error('Error buscando citas por matrícula:', error);
        res.status(500).json({ error: 'Error al buscar citas' });
    }
});

// 📊 Obtener citas por estado
router.get('/citas/estado/:estado', async (req, res) => {
    try {
        const citas = await Cita.find({ 
            estadoCita: req.params.estado 
        }).sort({ fechaCita: 1 });
        res.json(citas);
    } catch (error) {
        console.error('Error buscando citas por estado:', error);
        res.status(500).json({ error: 'Error al buscar citas' });
    }
});

export default router;
