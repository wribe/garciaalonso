import express from 'express'
import Articulo from '../modelos/Articulo.js'
import Factura from '../modelos/Factura.js'

const router = express.Router()

router.post('/', async (req, res) => {
    try {
        const { items, customer } = req.body
        if (!items || !Array.isArray(items) || items.length === 0) return res.status(400).json({ error: 'No items' })

        console.log('=== CHECKOUT DEBUG ===')
        console.log('Items recibidos:', JSON.stringify(items, null, 2))

        const purchased = []
        
        // Actualizar stock de cada artículo en MongoDB
        for (const it of items) {
            const cantidad = it.cantidad || 1
            console.log(`\nProcesando item: ${it.id}, cantidad: ${cantidad}`)
            
            // Buscar en Articulo (MongoDB)
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
                        id: articulo._id.toString(), 
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

        const subtotal = purchased.reduce((s, p) => s + ((p.precio || 0) * (p.cantidad || 1)), 0)
        const iva = subtotal * 0.21
        const total = subtotal + iva
        
        // Crear factura en MongoDB
        console.log('💾 Guardando factura en MongoDB...')
        
        const nuevaFactura = new Factura({
            numeroFactura: `FAC-${Date.now()}`,
            fecha: new Date(),
            cliente: customer || {
                nombre: 'Cliente General',
                dni: '',
                direccion: '',
                email: '',
                telefono: ''
            },
            items: purchased,
            subtotal: subtotal,
            iva: iva,
            total: total,
            estadoPago: 'pagado',
            metodoPago: customer?.metodoPago || 'efectivo'
        })
        
        await nuevaFactura.save()
        console.log('✅ Factura guardada en MongoDB:', nuevaFactura.numeroFactura)

        console.log('=== FIN CHECKOUT DEBUG ===\n')

        const invoice = { 
            invoiceId: nuevaFactura._id,
            numeroFactura: nuevaFactura.numeroFactura,
            customer: customer || null, 
            items: purchased, 
            subtotal,
            iva,
            total, 
            createdAt: nuevaFactura.fecha 
        }
        
        res.json({ success: true, invoice })
    } catch (err) { 
        console.error('ERROR EN CHECKOUT:', err); 
        res.status(500).json({ error: 'Error al procesar la compra' }) 
    }
})

export default router