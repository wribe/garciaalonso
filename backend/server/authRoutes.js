import express from 'express'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import Cliente from '../modelos/Cliente.js'
dotenv.config()

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret'
const JWT_EXPIRES = process.env.JWT_EXPIRES || '8h'

router.post('/login', async (req, res) => {
    try {
        const { dni, password } = req.body
        if (!dni || !password) return res.status(400).json({ error: 'Faltan campos' })
        const cliente = await Cliente.findOne({ dni: dni.toUpperCase() })
        if (!cliente) return res.status(401).json({ error: 'Credenciales inválidas' })
        const ok = await cliente.checkPassword(password)
        if (!ok) return res.status(401).json({ error: 'Credenciales inválidas' })
        const token = jwt.sign({ id: cliente._id, rol: cliente.rol, nombre: cliente.nombre }, JWT_SECRET, { expiresIn: JWT_EXPIRES })
        res.json({ token, nombre: cliente.nombre, rol: cliente.rol, id: cliente._id })
    } catch (err) {
        console.error(err); res.status(500).json({ error: 'Error' })
    }
})

router.get('/check-admin', async (req, res) => {
    try {
        const auth = req.headers.authorization
        if (!auth) return res.json({ isAdmin: false, name: '' })
        const token = auth.split(' ')[1]
        try {
            const payload = jwt.verify(token, JWT_SECRET)
            return res.json({ isAdmin: payload.rol === 'admin', name: payload.nombre || '' })
        } catch {
            return res.json({ isAdmin: false, name: '' })
        }
    } catch (err) { console.error(err); res.json({ isAdmin: false, name: '' }) }
})

export default router