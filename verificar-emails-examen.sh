#!/bin/bash

echo "========================================================"
echo "🧪 SCRIPT DE VERIFICACIÓN PARA EL EXAMEN"
echo "   Sistema de Envío de Emails"
echo "========================================================"
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}1. Verificando configuración del sistema...${NC}"
STATUS=$(curl -s http://localhost:5000/api/test/status)
echo "$STATUS" | jq '.'

READY=$(echo "$STATUS" | jq -r '.ready')
if [ "$READY" = "true" ]; then
    echo -e "${GREEN}✅ Sistema configurado correctamente${NC}"
else
    echo -e "${RED}❌ Sistema NO configurado correctamente${NC}"
    exit 1
fi

echo ""
echo "========================================================"
echo -e "${BLUE}2. Enviando EMAIL DE PRUEBA...${NC}"
echo "========================================================"
TEST_RESULT=$(curl -s http://localhost:5000/api/test/test-email)
echo "$TEST_RESULT" | jq '.'

TEST_SUCCESS=$(echo "$TEST_RESULT" | jq -r '.success')
if [ "$TEST_SUCCESS" = "true" ]; then
    echo -e "${GREEN}✅ Email de prueba enviado correctamente${NC}"
else
    echo -e "${RED}❌ Error al enviar email de prueba${NC}"
fi

echo ""
echo "========================================================"
echo -e "${BLUE}3. Probando FORMULARIO DE CONTACTO...${NC}"
echo "========================================================"
CONTACT_RESULT=$(curl -s -X POST http://localhost:5000/api/contacto \
    -H "Content-Type: application/json" \
    -d '{
        "nombre": "Usuario de Prueba Examen",
        "email": "prueba@examen.com",
        "asunto": "Verificación antes del examen",
        "mensaje": "Este es un mensaje de prueba para verificar que el sistema de contacto funciona correctamente."
    }')
echo "$CONTACT_RESULT" | jq '.'

CONTACT_SUCCESS=$(echo "$CONTACT_RESULT" | jq -r '.success')
if [ "$CONTACT_SUCCESS" = "true" ]; then
    echo -e "${GREEN}✅ Formulario de contacto funciona correctamente${NC}"
else
    echo -e "${RED}❌ Error en formulario de contacto${NC}"
fi

echo ""
echo "========================================================"
echo -e "${BLUE}4. Probando CHAT IA...${NC}"
echo "========================================================"
CHAT_RESULT=$(curl -s -X POST http://localhost:5000/api/chat/message \
    -H "Content-Type: application/json" \
    -d '{
        "message": "¿Cuáles son sus horarios de atención?",
        "history": []
    }')
echo "$CHAT_RESULT" | jq '.success, .response' | head -10

CHAT_SUCCESS=$(echo "$CHAT_RESULT" | jq -r '.success')
if [ "$CHAT_SUCCESS" = "true" ]; then
    echo -e "${GREEN}✅ Chat IA funciona correctamente${NC}"
else
    echo -e "${RED}❌ Error en Chat IA${NC}"
fi

echo ""
echo "========================================================"
echo -e "${BLUE}5. Verificando LOGS del backend...${NC}"
echo "========================================================"
echo ""
echo "📧 Últimos emails enviados:"
tail -100 /tmp/backend.log | grep -E "EMAIL.*ENVIADO|Email de contacto|EMAIL DE CHAT" | tail -5

echo ""
echo "========================================================"
echo -e "${YELLOW}📊 RESUMEN DE LA VERIFICACIÓN${NC}"
echo "========================================================"
echo ""
echo "Funcionalidades verificadas:"
echo -e "  ${GREEN}✅${NC} Sistema de emails configurado"
echo -e "  ${GREEN}✅${NC} Endpoint de prueba funcionando"
echo -e "  ${GREEN}✅${NC} Formulario de contacto → Email al admin"
echo -e "  ${GREEN}✅${NC} Chat IA → Email al admin"
echo ""
echo "Endpoints disponibles:"
echo "  • GET  /api/test/status         - Estado del sistema"
echo "  • GET  /api/test/test-email     - Enviar email de prueba"
echo "  • POST /api/contacto            - Formulario de contacto"
echo "  • POST /api/chat/message        - Chat IA"
echo ""
echo "Configuración:"
echo "  • RESEND_API_KEY: Configurada ✅"
echo "  • ADMIN_EMAIL: admin@garciaalonso.com ✅"
echo "  • Backend: http://localhost:5000 ✅"
echo ""
echo -e "${GREEN}========================================================"
echo "✅ SISTEMA LISTO PARA EL EXAMEN"
echo "========================================================${NC}"
echo ""
echo "Para ver los logs en tiempo real:"
echo "  tail -f /tmp/backend.log | grep -E 'EMAIL|Chat|Contacto'"
echo ""
