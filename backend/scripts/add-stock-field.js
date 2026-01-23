// Script para agregar el campo stock a todos los artículos existentes
import mongoose from 'mongoose'
import Articulo from '../modelos/Articulo.js'
import dotenv from 'dotenv'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:abc123@localhost:27017/bbdd?authSource=admin'

async function addStockField() {
    try {
        await mongoose.connect(MONGODB_URI)
        console.log('✅ Conectado a MongoDB')

        // Actualizar todos los artículos que no tienen el campo stock
        const result = await Articulo.updateMany(
            { stock: { $exists: false } },
            { 
                $set: { 
                    stock: 5 // Valor por defecto: 5 unidades disponibles
                } 
            }
        )

        console.log(`✅ ${result.modifiedCount} artículos actualizados con el campo stock`)

        // Actualizar estado según el stock
        const articulos = await Articulo.find()
        for (const art of articulos) {
            if (art.stock === 0) {
                art.estado = 'vendido'
            } else if (art.stock <= 2) {
                art.estado = 'a_pedido'
            } else {
                art.estado = 'disponible'
            }
            await art.save()
        }

        console.log('✅ Estados actualizados según el stock')
        
        await mongoose.connection.close()
        console.log('✅ Conexión cerrada')
    } catch (error) {
        console.error('❌ Error:', error)
        process.exit(1)
    }
}

addStockField()
