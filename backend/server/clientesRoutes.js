import express from 'express'
import jwt from 'jsonwebtoken'
import Cliente from '../modelos/Cliente.js'
import { authMiddleware, adminMiddleware } from './middleware/auth.js'
const router = express.Router()

// ⚠️ IMPORTANTE: Este endpoint debe ir ANTES de /:id para que no sea capturado
router.get('/usuario', authMiddleware, async (req, res) => {
    try {
        console.log('🔍 Buscando usuario con DNI:', req.user.dni);
        const cliente = await Cliente.findOne({ dni: req.user.dni }).select('-passwordHash');
        if (!cliente) {
            console.log('❌ Cliente no encontrado para DNI:', req.user.dni);
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }
        console.log('✅ Cliente encontrado:', cliente.nombre);
        res.json(cliente);
    } catch (error) {
        console.error('❌ Error al obtener cliente:', error);
        res.status(500).json({ message: 'Error al obtener cliente' });
    }
})

router.post('/registro', async (req, res) => {
  try {
    const { nombre, dni, email, movil, direccion, password } = req.body
    if (!nombre || !dni || !email || !movil || !password) return res.status(400).json({ error: 'Faltan campos' })

    const exists = await Cliente.findOne({ $or: [{ dni: dni.toUpperCase() }, { email }, { movil }] })
    if (exists) return res.status(409).json({ error: 'DNI, email o móvil ya existe' })

    const nuevoCliente = new Cliente({
      nombre: req.body.nombre,
      dni: req.body.dni,
      email: req.body.email,
      movil: req.body.movil,
      direccion: req.body.direccion,
      passwordHash: req.body.password, // o como lo manejes
      fecha_alta: new Date(), // <-- aquí se guarda la fecha de alta
      // ...otros campos...
    })
    await nuevoCliente.save()
    res.json({ success: true, data: { id: nuevoCliente._id, nombre: nuevoCliente.nombre } })
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
    const clients = await Cliente.find(filter)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select('-passwordHash') // fecha_alta sí se envía
    res.json({ total, page: Number(page), limit: Number(limit), data: clients })
  } catch (err) { res.status(500).json({ error: 'Error' }) }
})

export default router
