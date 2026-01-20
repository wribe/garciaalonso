import express from 'express'
import ModeloVenta from '../modelos/ModeloVenta.js'
const router = express.Router()

router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 12 } = req.query
        const skip = (page - 1) * limit
        const total = await ModeloVenta.countDocuments({ disponible: true })
        const items = await ModeloVenta.find({ disponible: true }).skip(skip).limit(parseInt(limit))
        res.json({ total, page: Number(page), limit: Number(limit), data: items })
    } catch (err) { console.error(err); res.status(500).json({ error: 'Error' }) }
})

router.get('/:id', async (req, res) => {
    try {
        const item = await ModeloVenta.findById(req.params.id)
        if (!item) return res.status(404).json({ error: 'No encontrado' })
        res.json(item)
    } catch (err) { res.status(500).json({ error: 'Error' }) }
})

export default router