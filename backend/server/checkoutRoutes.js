import express from 'express'
import processOrder from './checkoutHelper.js'

const router = express.Router()

router.post('/', async (req, res) => {
  try {
    const { items, customer } = req.body
    const result = await processOrder(items, customer)
    res.json({ success: true, invoice: result.invoice })
  } catch (err) {
    console.error('ERROR EN CHECKOUT:', err)
    if (err.stockErrors) return res.status(400).json({ error: 'Stock insuficiente', stockErrors: err.stockErrors })
    res.status(err.status || 500).json({ error: err.message || 'Error al procesar la compra' })
  }
})

export default router