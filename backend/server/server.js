import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import clientesRouter from './clientesRoutes.js';
import clientesJsonRouter from './clientesJsonRoutes.js';
import facturasRouter from './facturasRoutes.js';
import modelosRouter from './modelosRoutes.js'
import contactoRouter from './contactoRoutes.js'
import authRoutes from './authRoutes.js';
import authJsonRoutes from './authJsonRoutes.js';
import ventasRouter from './ventasRoutes.js'
import checkoutRouter from './checkoutRoutes.js'
import printRouter from './printRoutes.js'
import articulosRouter from './articulosRoutes.js'
import tallerRouter from './tallerRoutes.js'
import chatRouter from './chatRoutes.js'
import testEmailRouter from './testEmailRoutes.js'
import noticiasRouter from './noticiasRoutes.js'
import paymentsRouter from './paymentsRoutes.js'
import Stripe from 'stripe'

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
app.use('/api/auth-json', authJsonRoutes);
app.use('/api/clientes', clientesRouter);
app.use('/api/clientes-json', clientesJsonRouter);
app.use('/api/facturas', facturasRouter);
app.use('/api/modelos', modelosRouter)
app.use('/api/noticias', noticiasRouter)
app.use('/api/contacto', contactoRouter)
app.use('/api/ventas', ventasRouter)
app.use('/api/checkout', checkoutRouter)
app.use('/api/print', printRouter)
app.use('/api/articulos', articulosRouter)
app.use('/api/taller', tallerRouter)
app.use('/api/chat', chatRouter)
app.use('/api/test', testEmailRouter)
app.use('/api/payments', paymentsRouter)

// Configuración de Stripe cargada desde la clave secreta
let stripe
try {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
} catch (err) {
    console.warn('Stripe no está configurado o no está disponible:', err.message)
}

// Ruta alternativa para crear sesión de checkout (ejemplo del curso)
app.post('/crear-checkout-session', async (req, res) => {
    try {
        const { items } = req.body
        if (!items || !Array.isArray(items) || items.length === 0) return res.status(400).json({ error: 'No items' })

        if (!stripe) return res.status(500).json({ error: 'Stripe no configurado en el servidor' })

        const lineItems = items.map(item => ({
            price_data: {
                currency: 'eur',
                product_data: { name: item.nombre || `${item.marca || ''} ${item.modelo || ''}`.trim() },
                unit_amount: Math.round((item.precio || 0) * 100)
            },
            quantity: item.cantidad || 1
        }))

        const FRONTEND = process.env.FRONTEND_URL || 'http://localhost:5173'
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${FRONTEND}/success`,
            cancel_url: `${FRONTEND}/cancel`
        })

        res.json({ url: session.url })
    } catch (error) {
        console.error('Error creating checkout session:', error)
        res.status(500).json({ error: 'Internal Server Error' })
    }
})

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en puerto ${PORT}`);
});

