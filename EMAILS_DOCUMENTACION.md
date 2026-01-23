# 📧 Sistema de Emails - Contacto y Chat IA

## ✅ Implementación Completada

Este documento describe el sistema de envío de emails implementado para el formulario de contacto y el chat de IA.

---

## 🔧 Configuración

### Variables de Entorno (.env)

```env
RESEND_API_KEY=re_NSHkq1AD_L6bRgyDUaY3diodCqzk8JeWE
ADMIN_EMAIL=admin@garciaalonso.com
```

### Paquetes Instalados

- `resend` - Pasarela de email para envío de correos

---

## 📝 Funcionalidad del Formulario de Contacto

### Backend: `contactoRoutes.js`

**Características:**
- ✅ Validación de campos requeridos (nombre, email, mensaje)
- ✅ Envío de email al administrador con formato HTML profesional
- ✅ Manejo de errores robusto
- ✅ Logs detallados de cada envío
- ✅ Respuestas apropiadas al frontend

**Email enviado al admin incluye:**
- 👤 Nombre del usuario
- 📧 Email del usuario (con enlace mailto)
- 📋 Asunto del mensaje
- 💬 Contenido del mensaje
- 📅 Fecha y hora del envío
- 🌐 Origen (formulario web)

**Ejemplo de uso:**
```bash
curl -X POST http://localhost:5000/api/contacto \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan García",
    "email": "juan@example.com",
    "asunto": "Consulta sobre vehículos",
    "mensaje": "Quisiera información sobre los modelos disponibles"
  }'
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Mensaje enviado correctamente"
}
```

---

## 💬 Funcionalidad del Chat IA

### Backend: `chatRoutes.js`

**Características:**
- ✅ Envío automático de email al admin con cada consulta
- ✅ Email incluye pregunta del usuario y respuesta de la IA
- ✅ Funciona tanto con Gemini API como en modo fallback
- ✅ No bloquea la respuesta al usuario (envío asíncrono)
- ✅ Formato HTML profesional para mejor lectura
- ✅ Manejo de errores sin afectar la experiencia del usuario

**Email enviado al admin incluye:**
- ❓ Pregunta original del usuario
- 🤖 Respuesta generada por la IA (Gemini o fallback)
- 📅 Fecha y hora de la consulta
- 🎨 Formato visual diferenciado para pregunta y respuesta

**Ejemplo de uso:**
```bash
curl -X POST http://localhost:5000/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "¿Cuáles son sus horarios?",
    "history": []
  }'
```

**Respuesta:**
```json
{
  "success": true,
  "response": "🕒 Nuestro horario de atención es de Lunes a Viernes de 9:00 a 18:00. ¿Necesitas algo más?"
}
```

---

## 🎯 Flujo de Funcionamiento

### Formulario de Contacto

1. **Usuario** → Completa formulario en `ContacTo.vue`
2. **Frontend** → Envía datos a `/api/contacto`
3. **Backend** → Valida datos y envía email vía Resend
4. **Admin** → Recibe email con todos los detalles
5. **Usuario** → Recibe confirmación visual (SweetAlert2)

### Chat IA

1. **Usuario** → Escribe mensaje en `ChatWidget.vue`
2. **Frontend** → Envía mensaje a `/api/chat/message`
3. **Backend** → Procesa con Gemini AI o fallback local
4. **Backend** → Envía email al admin (sin esperar)
5. **Frontend** → Muestra respuesta al usuario
6. **Admin** → Recibe email con la conversación

---

## 🔍 Verificación de Funcionamiento

### Logs del Backend

Los emails exitosos se registran en los logs:

```bash
tail -f /tmp/backend.log | grep "Email"
```

**Salida esperada:**
```
✅ Email de contacto enviado al admin desde usuario@example.com
```

### Prueba Manual

**Contacto:**
```bash
curl -X POST http://localhost:5000/api/contacto \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Test","email":"test@test.com","asunto":"Prueba","mensaje":"Test"}'
```

**Chat:**
```bash
curl -X POST http://localhost:5000/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message":"Hola","history":[]}'
```

---

## 🎨 Formato de Emails

### Email de Contacto

```html
📧 Nuevo mensaje de contacto
────────────────────────
Nombre: [Nombre del usuario]
Email: [email@usuario.com]
Asunto: [Asunto del mensaje]

Mensaje:
[Contenido del mensaje del usuario]

📅 Fecha: [DD/MM/YYYY HH:MM:SS]
🌐 Enviado desde el formulario de contacto web
```

### Email del Chat

```html
💬 Nueva consulta en el Chat

Pregunta del usuario:
[Mensaje del usuario]

Respuesta de la IA:
[Respuesta generada por Gemini/fallback]

Fecha: [DD/MM/YYYY HH:MM:SS]
```

---

## ⚠️ Manejo de Errores

### Sin Resend API Key

- **Contacto:** Devuelve success pero indica "email deshabilitado"
- **Chat:** Funciona normalmente, no envía email

### Error en el Envío

- **Contacto:** Devuelve error 500 con detalles
- **Chat:** Usuario recibe respuesta normal, error solo en logs

### Validación de Datos

- Campos requeridos validados en backend
- Formato de email verificado
- Mensajes de error claros al frontend

---

## 📊 Resumen de Estado

| Funcionalidad | Estado | Email al Admin | Logs |
|--------------|--------|----------------|------|
| Formulario Contacto | ✅ Activo | ✅ Sí | ✅ Sí |
| Chat IA | ✅ Activo | ✅ Sí | ✅ Sí |
| Resend API | ✅ Configurado | - | - |
| Admin Email | ✅ Configurado | - | - |

---

## 🚀 Próximos Pasos (Opcionales)

1. **Email de confirmación al usuario**: Enviar copia al email del remitente
2. **Almacenar consultas**: Guardar mensajes en MongoDB
3. **Panel de administración**: Ver todos los mensajes desde la web
4. **Notificaciones push**: Avisar al admin en tiempo real
5. **Respuestas automáticas**: Plantillas de respuesta rápida

---

## 📞 Contacto de Soporte

Para dudas sobre la implementación, contactar al desarrollador.

**Fecha de implementación:** 23 de Enero de 2026
**Versión:** 1.0.0
