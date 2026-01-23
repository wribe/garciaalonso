import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Inicializar Resend para enviar emails
let resendClient = null;
if (process.env.RESEND_API_KEY) {
  resendClient = new Resend(process.env.RESEND_API_KEY);
} else {
  console.warn('WARN: RESEND_API_KEY no definida. Email desde chat deshabilitado.');
}

// Función para enviar email al admin sobre consulta del chat
const sendChatNotificationEmail = async (userMessage, chatResponse) => {
  if (!resendClient) {
    console.log('⚠️  Email desde chat deshabilitado (sin Resend API key)');
    return false;
  }
  
  try {
    console.log('\n========================================');
    console.log('💬 ENVIANDO EMAIL DE CHAT AL ADMIN');
    console.log('========================================');
    console.log('   Pregunta:', userMessage.substring(0, 50) + (userMessage.length > 50 ? '...' : ''));
    console.log('   Respuesta:', chatResponse.substring(0, 50) + (chatResponse.length > 50 ? '...' : ''));
    
    const result = await resendClient.emails.send({
      from: 'onboarding@resend.dev',
      to: process.env.ADMIN_EMAIL || 'admin@domain.test',
      subject: '💬 Nueva consulta del Chat IA',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0d6efd; border-bottom: 3px solid #0d6efd; padding-bottom: 10px;">
            💬 Nueva consulta en el Chat IA
          </h2>
          
          <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #856404; margin-top: 0;">❓ Pregunta del usuario:</h3>
            <p style="color: #212529; line-height: 1.6; white-space: pre-wrap;">${userMessage}</p>
          </div>
          
          <div style="background: #d1ecf1; border-left: 4px solid #0d6efd; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #0c5460; margin-top: 0;">🤖 Respuesta de la IA:</h3>
            <p style="color: #212529; line-height: 1.6; white-space: pre-wrap;">${chatResponse}</p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; color: #6c757d; font-size: 12px;">
            <p>📅 Fecha: ${new Date().toLocaleString('es-ES')}</p>
            <p>🌐 Chat IA - Sistema García Alonso</p>
          </div>
        </div>
      `
    });
    
    console.log('✅ EMAIL DE CHAT ENVIADO CORRECTAMENTE');
    console.log('   Email ID:', result.id);
    console.log('   Destino:', process.env.ADMIN_EMAIL || 'admin@domain.test');
    console.log('========================================\n');
    
    return true;
  } catch (error) {
    console.error('❌ ERROR AL ENVIAR EMAIL DE CHAT');
    console.error('   Error:', error.message);
    console.log('========================================\n');
    return false;
  }
};

// Función para generar respuestas locales
const generateFallbackResponse = (message) => {
  const text = message.toLowerCase();
  
  if (text.includes('horario') || text.includes('hora')) {
    return '🕒 Nuestro horario de atención es de Lunes a Viernes de 9:00 a 18:00. ¿Necesitas algo más?';
  }
  if (text.includes('precio') || text.includes('coste') || text.includes('cuanto')) {
    return '💰 Para información sobre precios y presupuestos personalizados, puedes visitar nuestra sección de ventas o contactarnos directamente.';
  }
  if (text.includes('contacto') || text.includes('teléfono') || text.includes('email')) {
    return '📞 Puedes contactarnos:\n• Teléfono: 600-000-000\n• Email: contacto@empresa.com\n• Dirección: Visítanos en nuestra sede';
  }
  if (text.includes('servicio') || text.includes('taller') || text.includes('reparación')) {
    return '🔧 Ofrecemos servicios completos de taller y mantenimiento. Puedes solicitar una cita en nuestra sección de Citas del Taller.';
  }
  if (text.includes('coche') || text.includes('vehículo') || text.includes('modelo')) {
    return '🚗 Consulta nuestra sección de Modelos y Ventas para ver todos los vehículos disponibles. ¿Buscas algo en particular?';
  }
  if (text.includes('hola') || text.includes('hi') || text.includes('buenos')) {
    return '¡Hola! 👋 Soy tu asistente virtual. Puedo ayudarte con información sobre horarios, precios, servicios, contacto y nuestros vehículos. ¿En qué puedo ayudarte?';
  }
  
  return `Gracias por tu mensaje. Actualmente estoy en modo básico. Puedo ayudarte con:\n\n• 🕒 Horarios de atención\n• 📞 Información de contacto\n• 🔧 Servicios de taller\n• 🚗 Modelos y ventas\n• 💰 Información de precios\n\n¿Sobre qué te gustaría saber?`;
};

// Inicializar Gemini AI sólo si tenemos API key
let genAI = null;
if (process.env.GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  } catch (err) {
    console.warn('No se pudo inicializar Gemini AI:', err.message);
    genAI = null;
  }
}

// Ruta para enviar mensajes al chat
router.post("/message", async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: "El mensaje es requerido" });
    }

    // Si no hay API key, devolver un fallback local inmediatamente
    if (!genAI) {
      console.log('Chat en modo local (sin Gemini API key)');
      const fallback = generateFallbackResponse(message);
      return res.json({ success: true, response: fallback });
    }

    // Usar el modelo Gemini 2.5 Flash (rápido y con mejores límites de cuota)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Configurar el contexto del chat si hay historial
    let chat;
    if (history && history.length > 0) {
      // Convertir el historial al formato de Gemini
      const formattedHistory = history.map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      }));

      chat = model.startChat({
        history: formattedHistory,
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.9,
          topP: 1,
          topK: 40,
        },
      });
    } else {
      chat = model.startChat({
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.9,
          topP: 1,
          topK: 40,
        },
      });
    }

    // Enviar el mensaje y obtener la respuesta con timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout de Gemini API')), 8000);
    });
    
    const result = await Promise.race([
      chat.sendMessage(message),
      timeoutPromise
    ]);
    
    const response = await result.response;
    const text = response.text();

    // Enviar email al admin con la consulta y respuesta (sin esperar)
    sendChatNotificationEmail(message, text).catch(err => 
      console.log('No se pudo enviar email de notificación:', err.message)
    );

    res.json({
      success: true,
      response: text,
    });
  } catch (error) {
    console.error("Error en el chat de Gemini:", error);
    
    // Si hay timeout o error con Gemini, devolver fallback
    const fallback = generateFallbackResponse(req.body.message);
    
    // Enviar email al admin incluso en modo fallback
    sendChatNotificationEmail(req.body.message, fallback).catch(err => 
      console.log('No se pudo enviar email de notificación:', err.message)
    );
    
    res.json({
      success: true,
      response: fallback,
      fallbackMode: true
    });
  }
});

export default router;