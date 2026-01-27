import mongoose from 'mongoose';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import Cliente from './modelos/Cliente.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'data/db.json');

async function migrateClientes() {
    try {
        console.log('🔄 Iniciando migración de clientes de MongoDB a JSON...\n');
        
        // Conectar a MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Conectado a MongoDB');
        
        // Leer JSON actual
        const dbJson = await fs.readFile(DB_PATH, 'utf-8');
        const db = JSON.parse(dbJson);
        console.log(`📄 JSON actual tiene ${db.clientes.length} clientes`);
        
        // Obtener clientes de MongoDB
        const clientesMongo = await Cliente.find({});
        console.log(`📊 MongoDB tiene ${clientesMongo.length} clientes\n`);
        
        if (clientesMongo.length === 0) {
            console.log('⚠️  No hay clientes en MongoDB para migrar');
            await mongoose.disconnect();
            return;
        }
        
        // Migrar cada cliente
        let migrados = 0;
        let saltados = 0;
        
        for (const cliente of clientesMongo) {
            // Verificar si ya existe en JSON
            const existeEnJson = db.clientes.find(c => c.dni === cliente.dni);
            
            if (existeEnJson) {
                console.log(`⏭️  Saltando ${cliente.dni} - ${cliente.nombre} (ya existe en JSON)`);
                saltados++;
                continue;
            }
            
            // Convertir y añadir al JSON
            const clienteJson = {
                id: Math.random().toString(36).substring(2, 6),
                dni: cliente.dni,
                nombre: cliente.nombre,
                apellidos: '',
                email: cliente.email,
                movil: cliente.movil,
                direccion: cliente.direccion || '',
                provincia: '',
                municipio: '',
                fecha_alta: cliente.fecha_alta ? 
                    new Date(cliente.fecha_alta).toISOString().split('T')[0] : 
                    new Date().toISOString().split('T')[0],
                historico: !cliente.activo,
                lopd: true,
                password: cliente.passwordHash || '',
                tipo: cliente.tipo || cliente.rol || 'user'
            };
            
            db.clientes.push(clienteJson);
            console.log(`✅ Migrado: ${cliente.dni} - ${cliente.nombre}`);
            migrados++;
        }
        
        // Guardar JSON actualizado
        await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
        
        console.log('\n========================================');
        console.log('📊 RESUMEN DE MIGRACIÓN');
        console.log('========================================');
        console.log(`✅ Clientes migrados: ${migrados}`);
        console.log(`⏭️  Clientes saltados: ${saltados}`);
        console.log(`📄 Total en JSON ahora: ${db.clientes.length}`);
        console.log('========================================\n');
        
        await mongoose.disconnect();
        console.log('✅ Desconectado de MongoDB');
        console.log('🎉 Migración completada exitosamente!');
        
    } catch (error) {
        console.error('❌ Error en la migración:', error);
        await mongoose.disconnect();
        process.exit(1);
    }
}

migrateClientes();
