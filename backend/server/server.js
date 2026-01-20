import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import clientesRouter from './clientesRoutes.js';
import modelosRouter from './modelosRoutes.js'
import contactoRouter from './contactoRoutes.js'
import authRoutes from './authRoutes.js';
import ventasRouter from './ventasRoutes.js'
import checkoutRouter from './checkoutRoutes.js'
import printRouter from './printRoutes.js'

const MONGODB_URI = process.env.MONGODB_URI
if (!MONGODB_URI) {
    console.error('Falta MONGODB_URI en .env'); process.exit(1)
}

await mongoose.connect(MONGODB_URI)
console.log('Conectado a MongoDB')

const app = express()
app.use(cors()); app.use(express.json())

app.use('/api/auth', authRoutes);
app.use('/api/clientes', clientesRouter);
app.use('/api/modelos', modelosRouter)
app.use('/api/contacto', contactoRouter)
app.use('/api/ventas', ventasRouter)
app.use('/api/checkout', checkoutRouter)
app.use('/api/print', printRouter)

app.post('/api/chat', (req, res) => {
    console.log('Chat message:', req.body)
    res.json({ ok: true })
})

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en puerto ${PORT}`);
});

