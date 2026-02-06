import express from 'express'
import processOrder from './checkoutHelper.js'

const router = express.Router()

// Simple in-memory pending orders store (small, ephemeral)
const pendingOrders = new Map()

// Create Stripe Checkout Session
router.post('/create-session', async (req, res) => {
  try {
    const { items, customer } = req.body
    if (!items || items.length === 0) return res.status(400).json({ message: 'No items' })

  // Create a temporary order id and store the order server-side briefly
  const orderId = `ord_${Date.now()}_${Math.floor(Math.random() * 10000)}`
  // Ensure metodoPago is set (tarjeta in this flow)
  const orderCustomer = { ...(customer || {}), metodoPago: (customer?.metodoPago || 'tarjeta') }
  pendingOrders.set(orderId, { items, customer: orderCustomer })

    // Lazy import stripe so the server won't crash if stripe isn't installed
    let stripePkg
    try {
      stripePkg = await import('stripe')
    } catch (err) {
      console.error('Stripe package not installed:', err)
      return res.status(500).json({ message: 'Stripe package not installed on server. Run `npm install stripe`' })
    }

    const stripe = stripePkg.default(process.env.STRIPE_SECRET_KEY)

    const line_items = items.map(it => ({
      price_data: {
        currency: 'eur',
        product_data: { name: `${it.marca || ''} ${it.modelo || ''}`.trim() },
        unit_amount: Math.round((it.precio || 0) * 100)
      },
      quantity: it.cantidad || 1
    }))

    const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items,
      metadata: { orderId },
      success_url: `${FRONTEND_URL}/tabla-success?orderId=${orderId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${FRONTEND_URL}/tabla-cancel?orderId=${orderId}`
    })

    res.json({ url: session.url })
  } catch (err) {
    console.error('Error creating stripe session:', err)
    res.status(500).json({ message: 'Error creando sesión de pago' })
  }
})

// Confirm session and create invoice (called from frontend success page)
router.post('/confirm-session', async (req, res) => {
  try {
    const { orderId, session_id } = req.body
    if (!orderId || !session_id) return res.status(400).json({ message: 'orderId y session_id requeridos' })

    const order = pendingOrders.get(orderId)
    if (!order) return res.status(404).json({ message: 'Orden no encontrada o expiró' })

    // Lazy import stripe
    let stripePkg
    try {
      stripePkg = await import('stripe')
    } catch (err) {
      console.error('Stripe package not installed:', err)
      return res.status(500).json({ message: 'Stripe package not installed on server. Run `npm install stripe`' })
    }

    const stripe = stripePkg.default(process.env.STRIPE_SECRET_KEY)
    const session = await stripe.checkout.sessions.retrieve(session_id)

    if (!session || session.payment_status !== 'paid') {
      return res.status(400).json({ message: 'Pago no confirmado' })
    }

    // Process order: decrement stock and create invoice. Mark pagoConfirmado
    try {
      const customerConfirmed = { ...(order.customer || {}), pagoConfirmado: true }
      const result = await processOrder(order.items, customerConfirmed)
      // Remove pending order
      pendingOrders.delete(orderId)
      return res.json({ success: true, invoice: result.invoice })
    } catch (err) {
      console.error('Error processing order after stripe confirm:', err)
      if (err.stockErrors) return res.status(400).json({ stockErrors: err.stockErrors })
      return res.status(500).json({ message: err.message || 'Error creando factura' })
    }
  } catch (err) {
    console.error('Error confirming stripe session:', err)
    res.status(500).json({ message: 'Error confirmando pago' })
  }
})

export default router
