import express from 'express';
import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const resendClient = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Endpoint para probar el envío de emails antes del examen
router.get('/test-email', async (req, res) => {
  console.log('\n========================================');
  console.log('🧪 PRUEBA DE EMAIL PARA EL EXAMEN');
  console.log('========================================');
  
  if (!resendClient) {
    console.log('❌ ERROR: RESEND_API_KEY no configurada');
    return res.status(500).json({ 
      success: false, 
      error: 'Resend no configurado',
      config: {
        RESEND_API_KEY: process.env.RESEND_API_KEY ? 'Configurada ✅' : 'NO configurada ❌',
        ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'NO configurado ❌'
      }
    });
  }

  try {
    console.log('📧 Enviando email de prueba...');
    console.log('   Destino:', process.env.ADMIN_EMAIL || 'admin@domain.test');
    
    const result = await resendClient.emails.send({
      from: 'onboarding@resend.dev',
      to: process.env.ADMIN_EMAIL || 'admin@domain.test',
      subject: '✅ Prueba de Email - Sistema Funcionando',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #28a745; text-align: center;">
            ✅ Sistema de Emails Funcionando
          </h1>
          
          <div style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h2 style="color: #155724; margin-top: 0;">Email de Prueba Exitoso</h2>
            <p style="color: #155724; margin: 0;">
              Este email confirma que el sistema de envío de correos está funcionando correctamente.
            </p>
          </div>
          
          <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #495057;">Configuración Actual:</h3>
            <ul style="color: #6c757d;">
              <li><strong>Pasarela:</strong> Resend</li>
              <li><strong>API Key:</strong> Configurada ✅</li>
              <li><strong>Email Admin:</strong> ${process.env.ADMIN_EMAIL || 'admin@domain.test'}</li>
              <li><strong>Fecha Prueba:</strong> ${new Date().toLocaleString('es-ES')}</li>
            </ul>
          </div>
          
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <h4 style="color: #856404; margin-top: 0;">✨ Funcionalidades Activas:</h4>
            <ol style="color: #856404;">
              <li>📧 Formulario de Contacto → Email al admin</li>
              <li>💬 Chat IA → Email al admin con cada consulta</li>
              <li>🧪 Endpoint de prueba: /api/test/test-email</li>
            </ol>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
            <p style="color: #6c757d; font-size: 12px;">
              🚀 Sistema preparado para el examen<br>
              Fecha: ${new Date().toLocaleString('es-ES')}
            </p>
          </div>
        </div>
      `
    });

    console.log('✅ Email enviado correctamente');
    console.log('   ID del email:', result.id);
    console.log('========================================\n');

    res.json({
      success: true,
      message: 'Email de prueba enviado correctamente',
      emailId: result.id,
      config: {
        RESEND_API_KEY: 'Configurada ✅',
        ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@domain.test',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.log('❌ Error al enviar email:', error.message);
    console.log('========================================\n');
    
    res.status(500).json({
      success: false,
      error: 'Error al enviar email de prueba',
      details: error.message
    });
  }
});

// Endpoint para ver el estado de la configuración
router.get('/status', (req, res) => {
  const status = {
    resend: {
      configured: !!resendClient,
      apiKey: process.env.RESEND_API_KEY ? 'Configurada ✅' : 'NO configurada ❌'
    },
    admin: {
      email: process.env.ADMIN_EMAIL || 'NO configurado ❌',
      configured: !!process.env.ADMIN_EMAIL
    },
    endpoints: {
      contacto: '/api/contacto',
      chat: '/api/chat/message',
      testEmail: '/api/test/test-email'
    },
    ready: !!(resendClient && process.env.ADMIN_EMAIL)
  };

  console.log('\n📊 Estado del Sistema de Emails:');
  console.log('   Resend:', status.resend.configured ? '✅' : '❌');
  console.log('   Admin Email:', status.admin.configured ? '✅' : '❌');
  console.log('   Sistema listo:', status.ready ? '✅ SÍ' : '❌ NO\n');

  res.json(status);
});

export default router;
