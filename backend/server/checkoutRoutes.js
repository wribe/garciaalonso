import express from 'express'
import ModeloVenta from '../modelos/ModeloVenta.js'
import Articulo from '../modelos/Articulo.js'
import { v4 as uuidv4 } from 'uuid'
const router = express.Router()

router.post('/', async (req, res) => {
    try {
        const { items, customer } = req.body
        if (!items || !Array.isArray(items) || items.length === 0) return res.status(400).json({ error: 'No items' })

        console.log('=== CHECKOUT DEBUG ===')
        console.log('Items recibidos:', JSON.stringify(items, null, 2))

        const invoiceId = uuidv4()
        const purchased = []
        
        // Actualizar stock de cada artículo
        for (const it of items) {
            const cantidad = it.cantidad || 1
            console.log(`\nProcesando item: ${it.id}, cantidad: ${cantidad}`)
            
            // Buscar en Articulo (la colección de artículos/vehículos)
            const articulo = await Articulo.findById(it.id)
            console.log(`Artículo encontrado:`, articulo ? {
                id: articulo._id,
                marca: articulo.marca,
                modelo: articulo.modelo,
                stock_antes: articulo.stock
            } : 'NO ENCONTRADO')
            
            if (articulo) {
                // Verificar que hay suficiente stock
                if (articulo.stock >= cantidad) {
                    const stockAnterior = articulo.stock
                    articulo.stock -= cantidad
                    
                    console.log(`Stock: ${stockAnterior} -> ${articulo.stock}`)
                    
                    // Actualizar estado según el stock restante
                    if (articulo.stock === 0) {
                        articulo.estado = 'vendido'
                    } else if (articulo.stock <= 2) {
                        articulo.estado = 'a_pedido'
                    }
                    
                    console.log(`Estado actualizado: ${articulo.estado}`)
                    
                    await articulo.save()
                    console.log('Artículo guardado exitosamente')
                    
                    purchased.push({ 
                        id: articulo._id, 
                        matricula: articulo.matricula, 
                        marca: articulo.marca, 
                        modelo: articulo.modelo, 
                        anio: articulo.anio, 
                        kilometros: articulo.kilometros, 
                        precio: articulo.precio,
                        cantidad: cantidad
                    })
                } else {
                    console.log(`Stock insuficiente: disponible ${articulo.stock}, solicitado ${cantidad}`)
                }
            }
        }

        console.log('=== FIN CHECKOUT DEBUG ===\n')

        const total = purchased.reduce((s, p) => s + ((p.precio || 0) * (p.cantidad || 1)), 0)
        const invoice = { 
            invoiceId, 
            customer: customer || null, 
            items: purchased, 
            total, 
            createdAt: new Date() 
        }
        
        res.json({ success: true, invoice })
    } catch (err) { 
        console.error('ERROR EN CHECKOUT:', err); 
        res.status(500).json({ error: 'Error al procesar la compra' }) 
    }
})

export default router