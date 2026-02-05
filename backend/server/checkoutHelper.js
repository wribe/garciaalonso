import Articulo from '../modelos/Articulo.js'
import Factura from '../modelos/Factura.js'

/**
 * Procesa un pedido: valida stock, decrementa artículos y crea factura en MongoDB.
 * Retorna el objeto invoice si tiene éxito.
 * Lanza un error con .stockErrors si hay problemas de stock.
 */
export async function processOrder(items, customer = {}) {
  if (!items || !Array.isArray(items) || items.length === 0) {
    const err = new Error('No items')
    err.status = 400
    throw err
  }

  const purchased = []
  const stockErrors = []

  for (const it of items) {
    const cantidad = it.cantidad || 1
    const articulo = await Articulo.findById(it.id)
    if (articulo) {
      if (articulo.stock >= cantidad) {
        const stockAnterior = articulo.stock
        articulo.stock -= cantidad
        if (articulo.stock === 0) articulo.estado = 'vendido'
        else if (articulo.stock <= 1) articulo.estado = 'a_pedido'
        await articulo.save()
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
        stockErrors.push({
          marca: articulo.marca,
          modelo: articulo.modelo,
          disponible: articulo.stock,
          solicitado: cantidad
        })
      }
    } else {
      stockErrors.push({ marca: it.marca || 'Desconocido', modelo: it.modelo || 'Desconocido', disponible: 0, solicitado: cantidad })
    }
  }

  if (stockErrors.length > 0) {
    const err = new Error('Stock insuficiente')
    err.stockErrors = stockErrors
    err.status = 400
    throw err
  }

  if (purchased.length === 0) {
    const err = new Error('No se pudo procesar ningún artículo')
    err.status = 400
    throw err
  }

  const subtotal = purchased.reduce((s, p) => s + ((p.precio || 0) * (p.cantidad || 1)), 0)
  const iva = subtotal * 0.21
  const total = subtotal + iva

  const nuevaFactura = new Factura({
    numeroFactura: `FAC-${Date.now()}`,
    fecha: new Date(),
    cliente: customer || {
      nombre: 'Cliente General', dni: '', direccion: '', email: '', telefono: ''
    },
    items: purchased,
    subtotal,
    iva,
    total,
    estadoPago: 'pagado',
    metodoPago: customer?.metodoPago || 'efectivo'
  })

  await nuevaFactura.save()

  return {
    invoice: {
      invoiceId: nuevaFactura._id,
      numeroFactura: nuevaFactura.numeroFactura,
      customer: customer || null,
      items: purchased,
      subtotal,
      iva,
      total,
      createdAt: nuevaFactura.fecha
    }
  }
}

export default processOrder
