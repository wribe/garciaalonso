import express from 'express'
import Cliente from '../modelos/Cliente.js'
import ModeloVenta from '../modelos/ModeloVenta.js'
const router = express.Router()

router.get('/cliente/:id', async (req, res) => {
    try {
        const c = await Cliente.findById(req.params.id).select('nombre dni email movil direccion createdAt')
        if (!c) return res.status(404).json({ error: 'No encontrado' })
        res.json({ nombre: c.nombre, dni: c.dni, email: c.email, movil: c.movil, direccion: c.direccion })
    } catch (err) { res.status(500).json({ error: 'Error' }) }
})

router.get('/modelo/:id', async (req, res) => {
    try {
        const m = await ModeloVenta.findById(req.params.id).select('matricula marca modelo año km precio')
        if (!m) return res.status(404).json({ error: 'No encontrado' })
        res.json({ matricula: m.matricula, marca: m.marca, modelo: m.modelo, año: m.año, km: m.km, precio: m.precio })
    } catch (err) { res.status(500).json({ error: 'Error' }) }
})

export default router