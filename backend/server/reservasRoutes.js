import express from 'express';
import Reserva from '../modelos/Reserva.js';
import Articulo from '../modelos/Articulo.js';

const router = express.Router();

// Configuración global de reservas (en memoria, en producción usar BD)
let configuracionReservas = {
    habilitadas: true
};

// GET configuración de reservas
router.get('/config/estado', (req, res) => {
    res.json(configuracionReservas);
});

// PUT actualizar configuración de reservas
router.put('/config/estado', (req, res) => {
    const { habilitadas } = req.body;
    if (typeof habilitadas === 'boolean') {
        configuracionReservas.habilitadas = habilitadas;
        console.log(`🔧 Reservas ${habilitadas ? 'habilitadas' : 'deshabilitadas'}`);
        res.json({ message: 'Configuración actualizada', configuracion: configuracionReservas });
    } else {
        res.status(400).json({ message: 'Valor inválido' });
    }
});

// GET todas las reservas (para admin)
router.get('/', async (req, res) => {
    try {
        const { estado } = req.query;
        const filtro = estado ? { estado } : {};
        const reservas = await Reserva.find(filtro).sort({ createdAt: -1 });
        res.json(reservas);
    } catch (error) {
        console.error('❌ Error al obtener reservas:', error);
        res.status(500).json({ message: 'Error al obtener reservas', error: error.message });
    }
});

// GET reserva por ID
router.get('/:id', async (req, res) => {
    try {
        const reserva = await Reserva.findById(req.params.id);
        if (!reserva) {
            return res.status(404).json({ message: 'Reserva no encontrada' });
        }
        res.json(reserva);
    } catch (error) {
        console.error('❌ Error al obtener reserva:', error);
        res.status(500).json({ message: 'Error al obtener reserva', error: error.message });
    }
});

// GET reservas por DNI del solicitante
router.get('/cliente/:dni', async (req, res) => {
    try {
        const reservas = await Reserva.find({ 'solicitante.dni': req.params.dni }).sort({ createdAt: -1 });
        res.json(reservas);
    } catch (error) {
        console.error('❌ Error al obtener reservas del cliente:', error);
        res.status(500).json({ message: 'Error al obtener reservas', error: error.message });
    }
});

// POST crear nueva reserva
router.post('/', async (req, res) => {
    try {
        // Verificar si las reservas están habilitadas
        if (!configuracionReservas.habilitadas) {
            return res.status(403).json({ 
                message: 'Las reservas están temporalmente deshabilitadas. Por favor, contacte con nosotros.',
                disabled: true
            });
        }

        const { vehiculoId, solicitante, observaciones, metodoPagoPreferido } = req.body;

        // Validar que el vehículo existe
        const vehiculo = await Articulo.findById(vehiculoId);
        if (!vehiculo) {
            return res.status(404).json({ message: 'Vehículo no encontrado' });
        }

        // Verificar que el vehículo está disponible
        if (vehiculo.estado === 'vendido') {
            return res.status(400).json({ message: 'Este vehículo ya ha sido vendido' });
        }

        if (vehiculo.estado === 'reservado') {
            // Verificar si hay una reserva activa
            const reservaActiva = await Reserva.findOne({
                'vehiculo.id': vehiculoId,
                estado: { $in: ['pendiente', 'confirmada'] }
            });
            if (reservaActiva) {
                return res.status(400).json({ message: 'Este vehículo ya tiene una reserva activa' });
            }
        }

        // Crear la reserva
        const nuevaReserva = new Reserva({
            vehiculo: {
                id: vehiculo._id,
                marca: vehiculo.marca,
                modelo: vehiculo.modelo,
                matricula: vehiculo.matricula,
                anio: vehiculo.anio,
                precio: vehiculo.precio
            },
            solicitante,
            observaciones,
            metodoPagoPreferido
        });

        await nuevaReserva.save();

        // Actualizar estado del vehículo a reservado
        vehiculo.estado = 'reservado';
        await vehiculo.save();

        console.log('✅ Reserva creada:', nuevaReserva._id);
        res.status(201).json({
            message: 'Reserva creada correctamente',
            reserva: nuevaReserva
        });
    } catch (error) {
        console.error('❌ Error al crear reserva:', error);
        res.status(500).json({ message: 'Error al crear reserva', error: error.message });
    }
});

// PUT actualizar estado de reserva
router.put('/:id', async (req, res) => {
    try {
        const { estado, observaciones } = req.body;
        const reserva = await Reserva.findById(req.params.id);

        if (!reserva) {
            return res.status(404).json({ message: 'Reserva no encontrada' });
        }

        // Actualizar campos
        if (estado) reserva.estado = estado;
        if (observaciones) reserva.observaciones = observaciones;

        await reserva.save();

        // Si se cancela o expira, liberar el vehículo
        if (estado === 'cancelada' || estado === 'expirada') {
            const vehiculo = await Articulo.findById(reserva.vehiculo.id);
            if (vehiculo && vehiculo.estado === 'reservado') {
                vehiculo.estado = 'disponible';
                await vehiculo.save();
            }
        }

        // Si se completa, marcar como vendido
        if (estado === 'completada') {
            const vehiculo = await Articulo.findById(reserva.vehiculo.id);
            if (vehiculo) {
                vehiculo.estado = 'vendido';
                await vehiculo.save();
            }
        }

        res.json({ message: 'Reserva actualizada', reserva });
    } catch (error) {
        console.error('❌ Error al actualizar reserva:', error);
        res.status(500).json({ message: 'Error al actualizar reserva', error: error.message });
    }
});

// DELETE eliminar reserva (soft delete - cambiar a cancelada)
router.delete('/:id', async (req, res) => {
    try {
        const reserva = await Reserva.findById(req.params.id);

        if (!reserva) {
            return res.status(404).json({ message: 'Reserva no encontrada' });
        }

        // Liberar el vehículo
        const vehiculo = await Articulo.findById(reserva.vehiculo.id);
        if (vehiculo && vehiculo.estado === 'reservado') {
            vehiculo.estado = 'disponible';
            await vehiculo.save();
        }

        // Marcar como cancelada en lugar de eliminar
        reserva.estado = 'cancelada';
        await reserva.save();

        res.json({ message: 'Reserva cancelada correctamente' });
    } catch (error) {
        console.error('❌ Error al cancelar reserva:', error);
        res.status(500).json({ message: 'Error al cancelar reserva', error: error.message });
    }
});

export default router;
