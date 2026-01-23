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
    
    console.log('\n========================================');
    console.log('📧 NUEVO MENSAJE DE CONTACTO');
    console.log('========================================');
    console.log('   De:', nombre, `(${email})`);
    console.log('   Asunto:', asunto || 'Sin asunto');
    console.log('   Mensaje:', mensaje.substring(0, 50) + (mensaje.length > 50 ? '...' : ''));
    console.log('========================================');
    
    if (!nombre || !email || !mensaje) {
        console.log('❌ ERROR: Faltan campos requeridos\n');
        return res.status(400).json({ error: 'Faltan campos' });
    }

    if (!resendClient) {
        console.warn('⚠️  Email deshabilitado pero formulario recibido\n');
        return res.json({ success: true, message: 'Mensaje recibido (email deshabilitado)' })
    }

    try {
        // Enviar email al administrador
        const result = await resendClient.emails.send({
            from: 'onboarding@resend.dev',
            to: process.env.ADMIN_EMAIL || 'admin@domain.test',
            subject: `📧 Formulario de Contacto: ${asunto || 'Sin asunto'}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #0d6efd; border-bottom: 3px solid #0d6efd; padding-bottom: 10px;">
                        📧 Nuevo mensaje de contacto
                    </h2>
                    
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 10px 0;">
                            <strong style="color: #495057;">Nombre:</strong> ${nombre}
                        </p>
                        <p style="margin: 10px 0;">
                            <strong style="color: #495057;">Email:</strong> 
                            <a href="mailto:${email}" style="color: #0d6efd;">${email}</a>
                        </p>
                        <p style="margin: 10px 0;">
                            <strong style="color: #495057;">Asunto:</strong> ${asunto || 'Sin asunto'}
                        </p>
                    </div>
                    
                    <div style="background: #ffffff; padding: 20px; border-left: 4px solid #0d6efd; margin: 20px 0;">
                        <h3 style="color: #495057; margin-top: 0;">Mensaje:</h3>
                        <p style="color: #212529; line-height: 1.6; white-space: pre-wrap;">${mensaje}</p>
                    </div>
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; color: #6c757d; font-size: 12px;">
                        <p>📅 Fecha: ${new Date().toLocaleString('es-ES')}</p>
                        <p>🌐 Enviado desde el formulario de contacto web</p>
                    </div>
                </div>
            `
        })
        
        console.log('✅ EMAIL ENVIADO CORRECTAMENTE AL ADMIN');
        console.log('   Email ID:', result.id);
        console.log('   Destino:', process.env.ADMIN_EMAIL || 'admin@domain.test');
        console.log('========================================\n');
        
        res.json({ success: true, message: 'Mensaje enviado correctamente', emailId: result.id })
    } catch (err) {
        console.error('❌ ERROR AL ENVIAR EMAIL DE CONTACTO');
        console.error('   Error:', err.message);
        console.log('========================================\n');
        res.status(500).json({ error: 'Error al enviar email', details: err.message })
    }
})

export default router