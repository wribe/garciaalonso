import express from "express";
import dotenv from 'dotenv';
import { Resend } from "resend";

dotenv.config()
/*
const RESEND_API_KEY = process.env.RESEND_API_KEY
let resend = null
if (RESEND_API_KEY) {
    resend = new Resend(RESEND_API_KEY)
} else {
    console.warn('WARN: RESEND_API_KEY no definida. El servicio de email quedará deshabilitado.')
}
*/
const router = express.Router();

// Inicializar Resend sólo si tenemos API key
// Inicializar Resend con la API Key
const resend = new Resend(process.env.RESEND_API_KEY);

// Ruta POST para enviar correo
router.post("/contacto", async (req, res) => {
    const { nombre, email, asunto, mensaje } = req.body;

    // Validar campos
    if (!nombre || !email || !asunto || !mensaje) {
        return res.status(400).json({
            success: false,
            message: "Todos los campos son obligatorios"
        });
    }

    if (!resend) { //Esto ver si hay que dejarlo
        // No configurado: devolver respuesta controlada
        return res.status(503).json({ error: 'Servicio de email no configurado' })
    }

    try {
        // Enviar correo con Resend
        await resend.emails.send({
            from: "Contacto <onboarding@resend.dev>",
            to: [process.env.EMAIL_TO], // Tu email configurado en .env
            subject: `Nuevo mensaje de contacto: ${asunto}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #0d6efd;">Nuevo mensaje de contacto</h2>
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                        <p><strong>Nombre:</strong> ${nombre}</p>
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Asunto:</strong> ${asunto}</p>
                    </div>
                    <div style="margin: 20px 0;">
                        <h3 style="color: #0d6efd;">Mensaje:</h3>
                        <p style="white-space: pre-wrap;">${mensaje}</p>
                    </div>
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #dee2e6;">
                    <p style="color: #6c757d; font-size: 12px;">
                        Este mensaje fue enviado desde el formulario de contacto de tu sitio web.
                    </p>
                </div>
            `,
        });

        console.log("Correo enviado exitosamente:");
        res.status(200).json({
            success: true,
            message: "Correo enviado correctamente",
        });

    } catch (error) {
        console.error("Error en el servidor:", error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor",
            error: error.message
        });
    }
});

export default router;