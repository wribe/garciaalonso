import express from 'express'
import dotenv from 'dotenv'
dotenv.config()

import { Resend } from 'resend'

const router = express.Router()
const RESEND_API_KEY = process.env.RESEND_API_KEY
let resendClient = null
if (RESEND_API_KEY) resendClient = new Resend(RESEND_API_KEY)
else console.warn('WARN: RESEND_API_KEY no definida. Email deshabilitado.')

router.post('/', async (req, res) => {
    const { nombre, email, asunto, mensaje } = req.body
    if (!nombre || !email || !mensaje) return res.status(400).json({ error: 'Faltan campos' })

    if (!resendClient) {
        return res.status(503).json({ error: 'Servicio email no configurado' })
    }

    try {
        await resendClient.emails.send({
            from: 'no-reply@tu-dominio.com',
            to: process.env.ADMIN_EMAIL || 'admin@domain.test',
            subject: asunto || `Contacto de ${nombre}`,
            html: `<p>De: ${nombre} (${email})</p><p>${mensaje}</p>`
        })
        res.json({ success: true })
    } catch (err) {
        console.error('Error enviando email:', err)
        res.status(500).json({ error: 'Error al enviar email' })
    }
})

export default router