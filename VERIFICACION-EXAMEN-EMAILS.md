# 📧 Verificación de Emails para el Examen

## ✅ Sistema Completamente Funcional

El sistema de envío de emails está **100% operativo** y listo para demostración en el examen.

---

## 🚀 Verificación Rápida Antes del Examen

### Opción 1: Script Automático (RECOMENDADO)

```bash
./verificar-emails-examen.sh
```

Este script verifica automáticamente:
- ✅ Configuración del sistema
- ✅ Envío de email de prueba
- ✅ Formulario de contacto
- ✅ Chat IA
- ✅ Logs del backend

### Opción 2: Verificación Manual

#### 1. Estado del Sistema
```bash
curl http://localhost:5000/api/test/status | jq '.'
```

**Salida esperada:**
```json
{
  "resend": { "configured": true },
  "admin": { "email": "admin@garciaalonso.com" },
  "ready": true
}
```

#### 2. Email de Prueba
```bash
curl http://localhost:5000/api/test/test-email
```

#### 3. Formulario de Contacto
```bash
curl -X POST http://localhost:5000/api/contacto \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Test",
    "email": "test@test.com",
    "asunto": "Prueba",
    "mensaje": "Mensaje de prueba"
  }'
```

#### 4. Chat IA
```bash
curl -X POST http://localhost:5000/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message": "Hola", "history": []}'
```

---

## 📊 Funcionalidades Implementadas

### 1. 📧 Formulario de Contacto

**Ubicación:** `frontend/components/ContacTo.vue`

**Funcionalidad:**
- Usuario completa formulario (nombre, email, asunto, mensaje)
- Sistema envía email al admin automáticamente
- Email con formato HTML profesional
- Confirmación visual al usuario (SweetAlert2)

**Email al admin incluye:**
- Nombre del usuario
- Email del usuario (clickable)
- Asunto del mensaje
- Contenido completo
- Fecha y hora

**Verificar en logs:**
```bash
tail -f /tmp/backend.log | grep "CONTACTO"
```

### 2. 💬 Chat IA

**Ubicación:** `frontend/components/ChatWidget.vue`

**Funcionalidad:**
- Chat flotante en todas las páginas
- Usuario escribe consulta
- IA (Gemini) responde
- Email automático al admin con pregunta y respuesta
- Respuestas locales si IA no disponible

**Email al admin incluye:**
- Pregunta del usuario
- Respuesta de la IA
- Fecha y hora
- Formato HTML con colores diferenciados

**Verificar en logs:**
```bash
tail -f /tmp/backend.log | grep "CHAT"
```

---

## 🔍 Demostración para el Examen

### Durante el Examen:

**1. Mostrar Configuración:**
```bash
curl http://localhost:5000/api/test/status | jq '.'
```
Demuestra que Resend está configurado ✅

**2. Enviar Email de Prueba:**
```bash
curl http://localhost:5000/api/test/test-email
```
Demuestra que los emails funcionan ✅

**3. Probar Formulario de Contacto:**
- Ir a la página web
- Completar formulario de contacto
- Mostrar logs: `tail -f /tmp/backend.log`
- Ver mensaje: "✅ EMAIL ENVIADO CORRECTAMENTE AL ADMIN"

**4. Probar Chat IA:**
- Abrir chat flotante en la web
- Escribir mensaje: "¿Cuáles son sus horarios?"
- Ver respuesta de la IA
- Mostrar logs: ver "💬 ENVIANDO EMAIL DE CHAT AL ADMIN"

**5. Mostrar Logs Detallados:**
```bash
tail -50 /tmp/backend.log | grep -E "========|EMAIL|CHAT|CONTACTO"
```

---

## 📝 Logs Visibles para el Examen

Cada acción genera logs claros:

### Contacto:
```
========================================
📧 NUEVO MENSAJE DE CONTACTO
========================================
   De: Juan García (juan@test.com)
   Asunto: Consulta
   Mensaje: ...
========================================
✅ EMAIL ENVIADO CORRECTAMENTE AL ADMIN
   Destino: admin@garciaalonso.com
========================================
```

### Chat IA:
```
========================================
💬 ENVIANDO EMAIL DE CHAT AL ADMIN
========================================
   Pregunta: ¿Horarios?
   Respuesta: Nuestro horario es...
✅ EMAIL DE CHAT ENVIADO CORRECTAMENTE
   Destino: admin@garciaalonso.com
========================================
```

---

## ⚙️ Configuración (.env)

```env
RESEND_API_KEY=re_NSHkq1AD_L6bRgyDUaY3diodCqzk8JeWE
ADMIN_EMAIL=admin@garciaalonso.com
GEMINI_API_KEY=AIzaSyBPAzGJFBU54DYOohy9n9bIDVifzG9QjDo
```

---

## 🎯 Endpoints Disponibles

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/test/status` | GET | Estado del sistema |
| `/api/test/test-email` | GET | Email de prueba |
| `/api/contacto` | POST | Formulario contacto |
| `/api/chat/message` | POST | Chat IA |

---

## 📂 Archivos Clave

### Backend:
- `backend/server/contactoRoutes.js` - Formulario contacto + emails
- `backend/server/chatRoutes.js` - Chat IA + emails
- `backend/server/testEmailRoutes.js` - Endpoints de prueba
- `backend/server/server.js` - Servidor principal

### Frontend:
- `frontend/components/ContacTo.vue` - Formulario contacto
- `frontend/components/ChatWidget.vue` - Chat flotante
- `frontend/App.vue` - Incluye ChatWidget

---

## ✅ Checklist Pre-Examen

- [ ] Backend corriendo: `http://localhost:5000`
- [ ] MongoDB conectado
- [ ] Script de verificación ejecutado: `./verificar-emails-examen.sh`
- [ ] Todos los tests pasan ✅
- [ ] Logs visibles en `/tmp/backend.log`
- [ ] Frontend accesible: `http://localhost:5173`

---

## 🆘 Solución de Problemas

### Si el backend no está corriendo:
```bash
nohup node backend/server/server.js > /tmp/backend.log 2>&1 &
sleep 3
tail -20 /tmp/backend.log
```

### Si hay errores con emails:
```bash
# Verificar configuración
curl http://localhost:5000/api/test/status

# Ver logs detallados
tail -50 /tmp/backend.log
```

### Si el frontend no carga:
```bash
# En terminal separada
npm run dev
```

---

## 📞 Resumen para el Profesor

**Requisito del Examen:**
> "Enviará correos mediante una pasarela email ao admin (comprobaráse antes do exame)"

**Implementación:**
✅ **Pasarela:** Resend (configurada con API key)  
✅ **Contacto:** Envía email al admin con cada mensaje  
✅ **Chat IA:** Envía email al admin con cada consulta  
✅ **Verificable:** Script de prueba + logs detallados  
✅ **Demostrable:** Endpoints de prueba funcionando  

**Comandos de Verificación Rápida:**
```bash
# Ver estado
curl http://localhost:5000/api/test/status | jq .ready

# Enviar prueba
curl http://localhost:5000/api/test/test-email

# Ver logs
tail -f /tmp/backend.log | grep EMAIL
```

---

**Fecha de Verificación:** 23 de Enero de 2026  
**Estado:** ✅ SISTEMA LISTO PARA EL EXAMEN
