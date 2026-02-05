<template>
  <div class="container my-5 text-center">
    <h2 class="text-success">Pago confirmado ✅</h2>
    <p>Estamos procesando tu pedido y generando la factura...</p>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import Swal from 'sweetalert2'
import { clearCart } from '@/utils/cartUtils.js'

const route = useRoute()
const router = useRouter()

onMounted(async () => {
  const orderId = route.query.orderId
  const session_id = route.query.session_id
  if (!orderId || !session_id) {
    Swal.fire('Error', 'Faltan parámetros de la sesión de pago', 'error')
    return router.push('/')
  }

  try {
    const res = await axios.post('/api/payments/confirm-session', { orderId, session_id })
    const invoice = res.data.invoice

    // Generate invoice popup using a simple window with HTML (same look as before)
    const facturaId = invoice?.numeroFactura || `FAC-${Date.now()}`
    // Open small window and show printable invoice — to keep parity with Cart.vue
    const html = `<html><head><title>Factura ${facturaId}</title></head><body><h1>Factura ${facturaId}</h1><p>Total: ${invoice.total} €</p></body></html>`
    const w = window.open('', '_blank', 'width=800,height=600')
    w.document.write(html)
    w.document.close()
    // Clear cart local storage
    clearCart()
    window.dispatchEvent(new Event('cartUpdated'))
    window.dispatchEvent(new Event('stockUpdated'))

    await Swal.fire('Gracias', 'Pago procesado y factura generada', 'success')
    router.push('/')
  } catch (err) {
    console.error('Error confirmando pago:', err)
    Swal.fire('Error', err.response?.data?.message || 'No se pudo confirmar el pago', 'error')
    router.push('/')
  }
})
</script>

<style scoped>
</style>
