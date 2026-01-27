# 📋 Migración a Sistema JSON

## ✅ Cambios Implementados

Se ha modificado el sistema para usar `db.json` como base de datos para ciertos módulos, manteniendo MongoDB para otros.

---

## 🗂️ Estructura Actual del Sistema

### **1. Clientes → `db.json`**
- **Endpoint nuevo:** `/api/clientes-json`
- **Auth nuevo:** `/api/auth-json` (login/registro)
- **Migración:** 2 clientes migrados de MongoDB a JSON
- **Total en JSON:** 26 clientes

### **2. Facturas → MongoDB** ✨
- **Endpoint:** `/api/facturas`
- **Base de datos:** MongoDB (colección `facturas`)
- **Se crean automáticamente** al hacer checkout en `/api/checkout`
- **Incluye:** Datos del cliente, items, subtotal, IVA, total, método de pago

### **3. Citas/Taller → `db.json`**
- **Ya existía:** Mantiene la estructura actual
- **Endpoint:** `/api/taller`

### **4. Artículos → MongoDB**
- **Mantiene MongoDB** como base de datos principal
- **Endpoint:** `/api/articulos`
- **Razón:** Tiene más elementos y funcionalidades que Modelos

### **5. Modelos → Eliminado**
- **Motivo:** Artículos y Modelos eran lo mismo
- **Se mantiene solo:** Artículos

---

## 📁 Estructura del `db.json`

```json
{
  "clientes": [
    {
      "id": "a1b2",
      "dni": "12345678A",
      "nombre": "Juan",
      "apellidos": "García",
      "email": "juan@example.com",
      "movil": "600000000",
      "direccion": "Calle Principal 123",
      "provincia": "Madrid",
      "municipio": "Madrid",
      "fecha_alta": "2026-01-27",
      "historico": false,
      "lopd": true,
      "password": "$2a$10$...", // Hash bcrypt
      "tipo": "user" // o "admin"
    }
  ],
  "taller": [
    {
      "id": "...",
      "matricula": "...",
      "movilCliente": "...",
      "fechaCita": "...",
      "servicioTaller": "...",
      "estadoCita": "Pendiente",
      "acepta": true
    }
  ],
  "noticias": [
    {
      "id": "...",
      "titulo": "...",
      "contenido": "...",
      "fecha": "..."
    }
  ]
}
```

**Nota:** Las facturas y artículos **NO** están en `db.json`, se almacenan en **MongoDB**.
  ],
  "noticias": [...]
}
```

---

## 🔌 Nuevos Endpoints

### Clientes (JSON)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/clientes-json/usuario` | Obtener cliente logueado | ✅ |
| POST | `/api/clientes-json/registro` | Registrar nuevo cliente | ❌ |
| PUT | `/api/clientes-json/:id` | Actualizar cliente | ✅ |
| DELETE | `/api/clientes-json/:id` | Marcar como histórico | ✅ Admin |
| GET | `/api/clientes-json` | Listar clientes | ✅ Admin |
| GET | `/api/clientes-json/perfil/:id` | Ver perfil | ✅ |

### Auth (JSON)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth-json/register` | Registrar usuario |
| POST | `/api/auth-json/login` | Login usuario |
| GET | `/api/auth-json/check-admin` | Verificar si es admin |

### Facturas (MongoDB)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/facturas` | Crear factura (automático en checkout) |
| GET | `/api/facturas` | Listar todas las facturas |
| GET | `/api/facturas/:id` | Obtener factura por ID |
| GET | `/api/facturas/numero/:numeroFactura` | Obtener factura por número |

---

## 🔄 Migración de Clientes

### Script de migración creado:
```bash
node backend/migrate-clientes-to-json.js
```

**Resultado de la migración:**
- ✅ 2 clientes migrados de MongoDB
- ⏭️  0 clientes saltados (no había duplicados)
- 📄 Total en JSON: 26 clientes

**Clientes migrados:**
1. `39499742W` - Carmen
2. `55555555K` - Admin

---

## 📝 Archivos Creados/Modificados

### Nuevos Archivos:
1. `backend/server/clientesJsonRoutes.js` - Gestión de clientes en JSON
2. `backend/server/authJsonRoutes.js` - Auth para clientes JSON
3. `backend/server/facturasRoutes.js` - Gestión de facturas en **MongoDB**
4. `backend/modelos/Factura.js` - Modelo Mongoose para facturas
5. `backend/migrate-clientes-to-json.js` - Script de migración

### Archivos Modificados:
1. `backend/server/server.js` - Añadidas nuevas rutas
2. `backend/server/checkoutRoutes.js` - Guarda facturas en **MongoDB** (no en JSON)
3. `backend/data/db.json` - Solo clientes, taller y noticias (NO facturas ni artículos)

---

## 🚀 Cómo Usar el Nuevo Sistema

### Registro de Cliente:
```bash
curl -X POST http://localhost:5000/api/auth-json/register \
  -H "Content-Type: application/json" \
  -d '{
    "dni": "12345678Z",
    "password": "mipassword",
    "nombre": "Juan",
    "apellidos": "García",
    "email": "juan@test.com",
    "movil": "600000000"
  }'
```

### Login:
```bash
curl -X POST http://localhost:5000/api/auth-json/login \
  -H "Content-Type: application/json" \
  -d '{
    "dni": "12345678Z",
    "password": "mipassword"
  }'
```

### Crear Factura (checkout):
```bash
curl -X POST http://localhost:5000/api/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"id": "articulo_id", "cantidad": 1}],
    "customer": {
      "nombre": "Juan García",
      "dni": "12345678Z",
      "metodoPago": "tarjeta"
    }
  }'
```

### Listar Facturas:
```bash
curl http://localhost:5000/api/facturas
```

---

## ⚠️ Notas Importantes

### Compatibilidad:
- **MongoDB sigue activo** para artículos y otras colecciones
- **Endpoints antiguos (`/api/clientes`, `/api/auth`)** siguen funcionando
- **Nuevos clientes** deben usar `/api/auth-json` y `/api/clientes-json`

### Passwords:
- Se usa **bcrypt** para hash de contraseñas
- El hash se almacena en el campo `password` del JSON

### IDs:
- MongoDB usa `_id` (ObjectId)
- JSON usa `id` (string de 4 caracteres)

---

## 🔧 Próximos Pasos (Opcional)

1. **Migrar artículos a JSON** si se necesita
2. **Actualizar frontend** para usar `/api/auth-json` y `/api/clientes-json`
3. **Eliminar rutas MongoDB** si ya no se necesitan
4. **Añadir endpoint de noticias** en JSON

---

## 📊 Estado Actual

| Módulo | Base de Datos | Estado |
|--------|---------------|--------|
| Clientes | JSON (db.json) | ✅ Migrado |
| Facturas | **MongoDB** | ✅ Implementado |
| Citas/Taller | JSON (db.json) | ✅ Existente |
| Noticias | JSON (db.json) | ✅ Existente |
| Artículos | **MongoDB** | ✅ Activo |
| Modelos | ~~MongoDB~~ | ❌ Eliminado |

---

## 🎯 Resumen de Arquitectura

### 📁 JSON (db.json):
- Clientes (26)
- Citas/Taller
- Noticias

### 🗄️ MongoDB:
- Artículos (vehículos)
- Facturas (invoices)

---

**Fecha:** 27 de Enero de 2026  
**Estado:** ✅ Sistema JSON implementado y funcionando
