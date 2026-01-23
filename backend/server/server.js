import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import clientesRouter from './clientesRoutes.js';
import modelosRouter from './modelosRoutes.js'
import contactoRouter from './contactoRoutes.js'
import authRoutes from './authRoutes.js';
import ventasRouter from './ventasRoutes.js'
import checkoutRouter from './checkoutRoutes.js'
import printRouter from './printRoutes.js'
import articulosRouter from './articulosRoutes.js'
import tallerRouter from './tallerRoutes.js'
import chatRouter from './chatRoutes.js'
import testEmailRouter from './testEmailRoutes.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const MONGODB_URI = process.env.MONGODB_URI
if (!MONGODB_URI) {
    console.error('Falta MONGODB_URI en .env'); process.exit(1)
}

await mongoose.connect(MONGODB_URI)
console.log('Conectado a MongoDB')

const app = express()
app.use(cors()); app.use(express.json())

// Servir archivos estáticos desde la carpeta uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.use('/api/auth', authRoutes);
app.use('/api/clientes', clientesRouter);
app.use('/api/modelos', modelosRouter)
app.use('/api/contacto', contactoRouter)
app.use('/api/ventas', ventasRouter)
app.use('/api/checkout', checkoutRouter)
app.use('/api/print', printRouter)
app.use('/api/articulos', articulosRouter)
app.use('/api/taller', tallerRouter)
app.use('/api/chat', chatRouter)
app.use('/api/test', testEmailRouter)

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en puerto ${PORT}`);
});

