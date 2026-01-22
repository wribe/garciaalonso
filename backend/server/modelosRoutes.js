import express from 'express'
import Modelo from '../modelos/Modelo.js'
import ModeloVenta from '../modelos/ModeloVenta.js'
import Articulo from '../modelos/Articulo.js'
const router = express.Router()

// Alta
router.post('/', async (req, res) => {
    try {
        const { matricula, marca, modelo, año, km, precio, imagen } = req.body
        if (!matricula) return res.status(400).json({ error: 'Falta matrícula' })
        const exists = await Modelo.findOne({ matricula: matricula.toUpperCase() })
        if (exists) return res.status(409).json({ error: 'Matrícula ya existe' })

        const nuevo = new Modelo({ matricula, marca, modelo, año, km, precio, imagen })
        await nuevo.save()

        // añadir automáticamente a ventas (ejemplo simple)
        await ModeloVenta.create({
            modeloId: nuevo._id,
            matricula: nuevo.matricula,
            marca: nuevo.marca,
            modelo: nuevo.modelo,
            año: nuevo.año,
            km: nuevo.km,
            precio: nuevo.precio,
            imagen: nuevo.imagen
        })

        res.json({ success: true, data: nuevo })
    } catch (err) { console.error(err); res.status(500).json({ error: 'Error' }) }
})

// Editar (carga datos en formulario en frontend)
router.put('/:id', async (req, res) => {
    try {
        const m = await Modelo.findById(req.params.id)
        if (!m) return res.status(404).json({ error: 'No existe' })
        Object.assign(m, req.body)
        await m.save()
        res.json({ success: true })
    } catch (err) { console.error(err); res.status(500).json({ error: 'Error' }) }
})

// Eliminar definitivo
router.delete('/:id', async (req, res) => {
    try {
        await Modelo.findByIdAndDelete(req.params.id)
        // también borrar de ventas si aplica
        await ModeloVenta.deleteMany({ modeloId: req.params.id })
        res.json({ success: true })
    } catch (err) { res.status(500).json({ error: 'Error' }) }
})

// Buscar por matrícula (busca en Articulo que es donde están los vehículos)
router.get('/buscar', async (req, res) => {
    try {
        const { matricula } = req.query
        if (!matricula) return res.status(400).json({ error: 'Falta matrícula' })
        
        // Buscar en Articulo (donde están los vehículos)
        const vehiculo = await Articulo.findOne({ 
            matricula: { $regex: new RegExp(matricula, 'i') } 
        })
        
        if (!vehiculo) {
            return res.status(404).json({ error: 'No encontrado', mensaje: 'Vehículo no encontrado con esa matrícula' })
        }
        
        res.json(vehiculo)
    } catch (err) { 
        console.error('Error en búsqueda:', err)
        res.status(500).json({ error: 'Error en el servidor' }) 
    }
})

export default router