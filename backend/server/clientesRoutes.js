import express from 'express'
import Cliente from '../modelos/Cliente.js'
import { authMiddleware, adminMiddleware } from './middleware/auth.js'
const router = express.Router()

router.post('/registro', async (req, res) => {
  try {
    const { nombre, dni, email, movil, direccion, password } = req.body
    if (!nombre || !dni || !email || !movil || !password) return res.status(400).json({ error: 'Faltan campos' })

    const exists = await Cliente.findOne({ $or: [{ dni: dni.toUpperCase() }, { email }, { movil }] })
    if (exists) return res.status(409).json({ error: 'DNI, email o móvil ya existe' })

    const nuevo = new Cliente({
      nombre, dni: dni.toUpperCase(), email, movil, direccion,
      passwordHash: password
    })
    await nuevo.save()
    res.json({ success: true, data: { id: nuevo._id, nombre: nuevo.nombre } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al registrar' })
  }
})

router.get('/perfil/:id', authMiddleware, async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.params.id).select('-passwordHash')
    if (!cliente) return res.status(404).json({ error: 'No encontrado' })
    res.json(cliente)
  } catch (err) { res.status(500).json({ error: 'Error' }) }
})

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const updates = { ...req.body }
    if (updates.password) delete updates.password
    if (updates.passwordHash) delete updates.passwordHash

    const cliente = await Cliente.findById(req.params.id)
    if (!cliente) return res.status(404).json({ error: 'No existe' })

    if (updates.dni || updates.email || updates.movil) {
      const conflict = await Cliente.findOne({
        _id: { $ne: cliente._id },
        $or: [
          updates.dni ? { dni: updates.dni.toUpperCase() } : null,
          updates.email ? { email: updates.email } : null,
          updates.movil ? { movil: updates.movil } : null
        ].filter(Boolean)
      })
      if (conflict) return res.status(409).json({ error: 'DNI/email/móvil en uso' })
    }

    Object.assign(cliente, updates)
    await cliente.save()
    res.json({ success: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error actualizando' })
  }
})

router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.params.id)
    if (!cliente) return res.status(404).json({ error: 'No existe' })
    cliente.activo = false
    await cliente.save()
    res.json({ success: true })
  } catch (err) { res.status(500).json({ error: 'Error' }) }
})

router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query
    const filter = {}
    if (q) {
      const re = new RegExp(q, 'i')
      filter.$or = [{ dni: q.toUpperCase() }, { movil: re }, { nombre: re }, { email: re }]
    }
    const total = await Cliente.countDocuments(filter)
    const clients = await Cliente.find(filter).skip((page - 1) * limit).limit(parseInt(limit)).select('-passwordHash')
    res.json({ total, page: Number(page), limit: Number(limit), data: clients })
  } catch (err) { res.status(500).json({ error: 'Error' }) }
})

export default router
