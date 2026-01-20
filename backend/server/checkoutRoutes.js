import express from 'express'
import ModeloVenta from '../modelos/ModeloVenta.js'
import { v4 as uuidv4 } from 'uuid'
const router = express.Router()

router.post('/', async (req, res) => {
    try {
        const { items, customer } = req.body
        if (!items || !Array.isArray(items) || items.length === 0) return res.status(400).json({ error: 'No items' })

        const invoiceId = uuidv4()
        const purchased = []
        for (const it of items) {
            const m = await ModeloVenta.findById(it.id)
            if (!m || !m.disponible) continue
            m.disponible = false
            await m.save()
            purchased.push({ id: m._id, matricula: m.matricula, marca: m.marca, modelo: m.modelo, año: m.año, km: m.km, precio: m.precio })
        }

        const invoice = { invoiceId, customer: customer || null, items: purchased, total: purchased.reduce((s, p) => s + (p.precio || 0), 0), createdAt: new Date() }
        res.json({ success: true, invoice })
    } catch (err) { console.error(err); res.status(500).json({ error: 'Error' }) }
})

export default router