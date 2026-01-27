import express from 'express';
import Factura from '../modelos/Factura.js';

const router = express.Router();

// GET todas las facturas
router.get('/', async (req, res) => {
    try {
        const facturas = await Factura.find().sort({ fecha: -1 });
        
        console.log('📄 Facturas encontradas:', facturas.length);
        res.json(facturas);
    } catch (error) {
        console.error('❌ Error al obtener facturas:', error);
        res.status(500).json({ message: 'Error al obtener facturas', error: error.message });
    }
});

// GET factura por ID
router.get('/:id', async (req, res) => {
    try {
        const factura = await Factura.findById(req.params.id);
        
        if (!factura) {
            return res.status(404).json({ message: 'Factura no encontrada' });
        }
        
        res.json(factura);
    } catch (error) {
        console.error('❌ Error al obtener factura:', error);
        res.status(500).json({ message: 'Error al obtener factura', error: error.message });
    }
});

// GET factura por número de factura
router.get('/numero/:numeroFactura', async (req, res) => {
    try {
        const factura = await Factura.findOne({ numeroFactura: req.params.numeroFactura });
        
        if (!factura) {
            return res.status(404).json({ message: 'Factura no encontrada' });
        }
        
        res.json(factura);
    } catch (error) {
        console.error('❌ Error al obtener factura:', error);
        res.status(500).json({ message: 'Error al obtener factura', error: error.message });
    }
});

// POST crear nueva factura (usado por checkout)
router.post('/', async (req, res) => {
    try {
        // Verificar que no exista una factura con el mismo número
        const existe = await Factura.findOne({ numeroFactura: req.body.numeroFactura });
        if (existe) {
            return res.status(400).json({ message: 'Ya existe una factura con ese número' });
        }
        
        const nuevaFactura = new Factura(req.body);
        await nuevaFactura.save();
        
        console.log('✅ Factura creada en MongoDB:', nuevaFactura.numeroFactura);
        res.status(201).json(nuevaFactura);
    } catch (error) {
        console.error('❌ Error al crear factura:', error);
        res.status(500).json({ message: 'Error al crear factura', error: error.message });
    }
});

export default router;

