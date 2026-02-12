import Articulo from '../modelos/Articulo.js'
import Factura from '../modelos/Factura.js'

// Cupones válidos con su porcentaje de descuento
const CUPONES_VALIDOS = {
  'DESCUENTO10': 10,
  'DESCUENTO15': 15,
  'DESCUENTO20': 20,
  'BIENVENIDO5': 5,
  'VERANO25': 25,
  'BLACKFRIDAY30': 30
}

/**
 * Valida un cupón y devuelve el porcentaje de descuento
 */
export function validarCupon(codigo) {
  if (!codigo) return { valido: false, descuento: 0 }
  const codigoUpper = codigo.toUpperCase().trim()
  const descuento = CUPONES_VALIDOS[codigoUpper]
  if (descuento) {
    return { valido: true, descuento, codigo: codigoUpper }
  }
  return { valido: false, descuento: 0 }
}

/**
 * Procesa un pedido: valida stock, decrementa artículos y crea factura en MongoDB.
 * Retorna el objeto invoice si tiene éxito.
 * Lanza un error con .stockErrors si hay problemas de stock.
 */
export async function processOrder(items, customer = {}, cuponCodigo = null) {
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
  
  // Calcular descuento si hay cupón válido
  let cuponData = { codigo: null, descuentoPorcentaje: 0, descuentoImporte: 0 }
  if (cuponCodigo) {
    const validacion = validarCupon(cuponCodigo)
    if (validacion.valido) {
      cuponData = {
        codigo: validacion.codigo,
        descuentoPorcentaje: validacion.descuento,
        descuentoImporte: subtotal * (validacion.descuento / 100)
      }
    }
  }
  
  const subtotalConDescuento = subtotal - cuponData.descuentoImporte
  const iva = subtotalConDescuento * 0.21
  const total = subtotalConDescuento + iva

  // Determinar estado de pago: si el cliente indica pagoConfirmado lo respetamos,
  // si el método es efectivo asumimos pago inmediato, en otro caso dejamos 'pendiente'
  const metodoPago = customer?.metodoPago || 'efectivo'
  const estadoPago = customer?.pagoConfirmado
    ? 'pagado'
    : (metodoPago === 'efectivo' ? 'pagado' : 'pendiente')

  const nuevaFactura = new Factura({
    numeroFactura: `FAC-${Date.now()}`,
    fecha: new Date(),
    cliente: customer || {
      nombre: 'Cliente General', dni: '', direccion: '', email: '', telefono: ''
    },
    items: purchased,
    subtotal,
    cupon: cuponData,
    iva,
    total,
    estadoPago,
    metodoPago
  })

  await nuevaFactura.save()

  return {
    invoice: {
      invoiceId: nuevaFactura._id,
      numeroFactura: nuevaFactura.numeroFactura,
      customer: customer || null,
      items: purchased,
      subtotal,
      cupon: cuponData,
      iva,
      total,
      metodoPago,
      estadoPago,
      createdAt: nuevaFactura.fecha
    }
  }
}

export default processOrder
