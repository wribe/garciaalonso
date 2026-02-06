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
import { clearCart as clearCartUtil } from '@/utils/cartUtils.js'
import { useCestaStore } from '../store/cesta.js'

const route = useRoute()
const router = useRouter()
const cesta = useCestaStore()

function formatPrecio(precio) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(precio || 0)
}

function formatKm(km) {
  if (!km) return '0 km'
  return new Intl.NumberFormat('es-ES').format(km) + ' km'
}

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

    // Build full styled invoice HTML to match Cart.vue style
    const facturaId = invoice?.numeroFactura || `FAC-${Date.now()}`
    const fechaActual = new Date(invoice?.createdAt || Date.now()).toLocaleDateString('es-ES')

  const html = `<!DOCTYPE html>
    <html><head><meta charset="utf-8"><title>Factura ${facturaId}</title>
    <style>
    @media print { @page { margin: 0 } body { margin: 1cm } }
    body{font-family:Arial,Helvetica,sans-serif;color:#333}
    .header{background:linear-gradient(135deg,#0d6efd 0%,#0a58ca 100%);color:white;padding:30px;margin:-1cm -1cm 20px -1cm}
    .invoice-info{display:flex;justify-content:space-between;margin-bottom:30px;background:#f8f9fa;padding:20px;border-radius:8px}
    table{width:100%;border-collapse:collapse;margin:30px 0}
    thead{background:#0d6efd;color:white}
    th,td{border:1px solid #dee2e6;padding:12px;text-align:left}
    .totals{margin-top:30px;text-align:right}.totals table{margin-left:auto;width:300px}
    .total-row{background:#198754;color:white;font-size:1.3em;font-weight:bold}
    .footer{margin-top:50px;padding-top:20px;border-top:2px solid #dee2e6;text-align:center;color:#666;font-size:0.9em}
    </style>
    </head><body>
    <div class="header"><h1>🚗 EmpresaTeis</h1><p>Venta de Vehículos de Ocasión</p><p>📍 Vigo, Pontevedra | ☎️ +34 986 123 456 | ✉️ info@empresateis.com</p></div>

    <div class="invoice-number">FACTURA Nº <strong>${facturaId}</strong></div>

    <div class="invoice-info">
      <div>
        <h3>📋 Datos de Facturación</h3>
        <p><strong>Cliente:</strong> ${invoice.customer?.nombre || 'Cliente'}</p>
        <p><strong>DNI/NIF:</strong> ${invoice.customer?.dni || ''}</p>
        <p><strong>Email:</strong> ${invoice.customer?.email || ''}</p>
        <p><strong>Teléfono:</strong> ${invoice.customer?.telefono || ''}</p>
        <p><strong>Dirección:</strong> ${invoice.customer?.direccion || ''}</p>
        <p><strong>Ciudad:</strong> ${invoice.customer?.ciudad || ''} - CP: ${invoice.customer?.codigoPostal || ''}</p>
      </div>
      <div style="text-align:right;">
        <h3>📅 Información de la Factura</h3>
        <p><strong>Fecha:</strong> ${fechaActual}</p>
        <p><strong>Método de Pago:</strong> ${invoice.metodoPago || 'Tarjeta'}</p>
        <p><strong>Estado:</strong> <span style="color:#198754;font-weight:bold;">✓ PAGADO</span></p>
      </div>
    </div>

    <table><thead><tr><th>Vehículo</th><th>Matrícula</th><th>Año</th><th>Kilómetros</th><th style="text-align:center;">Cant.</th><th style="text-align:right;">Precio Unit.</th><th style="text-align:right;">Subtotal</th></tr></thead><tbody>
    ${invoice.items.map(item => `
      <tr>
        <td><strong>${item.marca} ${item.modelo}</strong></td>
        <td>${item.matricula || 'N/A'}</td>
        <td>${item.anio || ''}</td>
        <td>${formatKm(item.kilometros || 0)}</td>
        <td style="text-align:center;"><strong>${item.cantidad || 1}</strong></td>
        <td style="text-align:right;">${formatPrecio(item.precio)}</td>
        <td style="text-align:right;"><strong>${formatPrecio((item.precio || 0) * (item.cantidad || 1))}</strong></td>
      </tr>
    `).join('')}
    </tbody></table>

    <div class="totals">
      <table>
        <tr><td><strong>Subtotal:</strong></td><td style="text-align:right;">${formatPrecio(invoice.subtotal)}</td></tr>
        <tr><td><strong>IVA (21%):</strong></td><td style="text-align:right;">${formatPrecio(invoice.iva)}</td></tr>
        <tr class="total-row"><td><strong>TOTAL:</strong></td><td style="text-align:right;"><strong>${formatPrecio(invoice.total)}</strong></td></tr>
      </table>
    </div>

    <div class="footer"><p><strong>¡Gracias por su compra!</strong></p><p>EmpresaTeis S.L. | CIF: B-36123456 | Registro Mercantil de Pontevedra</p><p style="margin-top:20px;font-size:0.8em;color:#999;">Documento generado el ${new Date().toLocaleString('es-ES')}</p></div>

  <script>(function(){
    // Use onafterprint when available to detect when the user finished the print/save dialog.
    function notifyAndClose() {
      try{
        if (window.opener && typeof window.opener.postMessage === 'function') {
          window.opener.postMessage({ invoicePrinted: true, facturaId: '${facturaId}' }, '*')
        }
      } catch(e) { /* ignore */ }
      try { window.close() } catch(e) { /* ignore */ }
    }

    if ('onafterprint' in window) {
      window.onafterprint = notifyAndClose
    } else if (window.matchMedia) {
      // Some browsers fire a media query change for print; listen for it
      try {
        const mq = window.matchMedia('print')
        mq.addEventListener ? mq.addEventListener('change', (m) => { if (!m.matches) notifyAndClose() }) : mq.addListener((m) => { if (!m.matches) notifyAndClose() })
      } catch(e) { /* ignore */ }
    }

    // Trigger print; onafterprint will notify when done in browsers that support it.
    try { window.print() } catch(e) { /* ignore */ }

    // Fallback: if after a while nothing happened, attempt to notify/close anyway
    setTimeout(notifyAndClose, 5000)
  })()<\/script>
  </body></html>`

    // Listen for child window postMessage to know when the user finished printing/saving
    function handleMessage(e) {
      try {
        if (e?.data && e.data.invoicePrinted && e.data.facturaId === facturaId) {
          pdfDownloaded = true
          // close child if still open
          try { if (winRef && !winRef.closed) winRef.close() } catch (err) { /* ignore */ }
        }
      } catch (err) { /* ignore */ }
    }
    window.addEventListener('message', handleMessage)

    function cleanup() {
      try { window.removeEventListener('message', handleMessage) } catch (e) { /* ignore */ }
    }

    // Helper to generate and download a PDF immediately (so user always gets a file)
    let pdfDownloaded = false
    async function generatePdfAndDownload(invoiceObj, facturaIdStr, fechaStr) {
      try {
        const { default: jsPDF } = await import('jspdf')
        await import('jspdf-autotable')
        const doc = new jsPDF({ unit: 'pt', format: 'a4' })
        doc.setFontSize(16)
        doc.text('EmpresaTeis - Factura', 40, 50)
        doc.setFontSize(10)
        doc.text(`Factura: ${facturaIdStr}`, 40, 70)
        doc.text(`Fecha: ${fechaStr}`, 40, 85)
        doc.setFontSize(12)
        doc.text('Datos de facturación:', 40, 110)
        doc.setFontSize(10)
        const cliente = invoiceObj.customer || {}
        doc.text(`Nombre: ${cliente.nombre || ''}`, 40, 125)
        doc.text(`DNI: ${cliente.dni || ''}`, 40, 140)
        doc.text(`Email: ${cliente.email || ''}`, 40, 155)

        const items = (invoiceObj.items || []).map(it => [
          `${it.marca || ''} ${it.modelo || ''}`,
          it.matricula || '',
          it.anio || '',
          it.cantidad || 1,
          new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR'}).format(it.precio || 0),
          new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR'}).format((it.precio || 0) * (it.cantidad || 1))
        ])

        // @ts-ignore
        doc.autoTable({ startY: 180, head: [['Vehículo','Matrícula','Año','Cant.','Precio unit.','Subtotal']], body: items, styles: { fontSize: 10 } })
        const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : 400
        doc.text(`Subtotal: ${new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR'}).format(invoiceObj.subtotal || 0)}`, 350, finalY)
        doc.text(`IVA: ${new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR'}).format(invoiceObj.iva || 0)}`, 350, finalY + 15)
        doc.setFontSize(12)
        doc.text(`TOTAL: ${new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR'}).format(invoiceObj.total || 0)}`, 350, finalY + 35)

        const pdfName = `factura-${facturaIdStr}.pdf`
        try {
          // Prefer explicit blob download (more reliable in some browsers)
          const pdfBlob = doc.output && typeof doc.output === 'function'
            ? doc.output('blob')
            : null
          if (pdfBlob) {
            const url = URL.createObjectURL(pdfBlob)
            const a = document.createElement('a')
            a.href = url
            a.download = pdfName
            a.style.display = 'none'
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
            pdfDownloaded = true
          } else {
            // Fallback to jsPDF save if output('blob') unavailable
            doc.save(pdfName)
            pdfDownloaded = true
          }
        } catch (errSave) {
          // As last resort, try doc.save
          try { doc.save(pdfName); pdfDownloaded = true } catch(e) { console.error('No se pudo forzar descarga inmediata:', e) }
        }
      } catch (err) {
        console.error('Error generating immediate PDF:', err)
      }
    }

    // Start immediate PDF download in background (await so browser prompts)
    await generatePdfAndDownload(invoice, facturaId, fechaActual)

    // Open a new window and write the invoice HTML. Some browsers block popups
    // so we add fallbacks: try window.open + document.write, otherwise create
    // a blob URL and open that, and as last resort navigate the current window.
    let openedNew = false
    let winRef = null
    try {
      const win = window.open('', '_blank', 'width=900,height=700')
      if (win && win.document) {
        // We have a new window/tab and a reference to it: write invoice and keep ref
        win.document.write(html)
        win.document.close()
        openedNew = true
        winRef = win
          // If we already downloaded the PDF programmatically, close the new tab
          // to avoid leaving a blank invoice tab open for the user.
          if (pdfDownloaded) {
            try {
              // small delay to ensure document write completes in the child
              setTimeout(() => {
                try { winRef.close() } catch (e) { console.warn('No se pudo cerrar la pestaña de factura automáticamente:', e) }
              }, 300)
            } catch (e) { console.warn('Error intentando cerrar la pestaña inmediatamente tras descarga:', e) }
          }
        // Try to trigger print from the parent (more reliable than relying on child script)
        try {
          winRef.focus()
          if (typeof winRef.print === 'function') {
            winRef.print()
          }
        } catch (e) {
          console.warn('No se pudo invocar print() en la ventana hija:', e)
        }
      } else {
        // Try opening via blob URL directly (window.open may return a ref here)
        const blob = new Blob([html], { type: 'text/html' })
        const url = URL.createObjectURL(blob)
        const newWin = window.open(url, '_blank')
        if (newWin) {
          // We have a reference to the new window
          openedNew = true
          winRef = newWin
          // If PDF was downloaded already, close the opened window to keep UX tidy
          if (pdfDownloaded) {
            try { setTimeout(() => { try { winRef.close() } catch(e) { console.warn('No se pudo cerrar la pestaña de factura automáticamente:', e) } }, 300) } catch(e) { console.warn(e) }
          }
          try {
            newWin.focus()
            if (typeof newWin.print === 'function') {
              newWin.print()
            }
          } catch (e) {
            console.warn('No se pudo invocar print() en la ventana abierta con blob:', e)
          }
        } else {
          // Fallback to anchor click (last attempt to bypass popup blockers)
          const a = document.createElement('a')
          a.href = url
          a.target = '_blank'
          a.rel = 'noopener noreferrer'
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          openedNew = true
          winRef = null
        }
      }
    } catch (err) {
      console.error('Error opening invoice window/tab:', err)
      openedNew = false
      winRef = null
    }

    let printAttempted = false
    let printSucceeded = false
    if (openedNew && winRef) {
      // Wait until the newly opened window is closed by the user, or until a max timeout
      try {
        // Try to invoke print on the child window
        try {
          if (typeof winRef.print === 'function') {
            printAttempted = true
            winRef.print()
            printSucceeded = true
          }
        } catch (e) {
          console.warn('Error invoking print on child window:', e)
        }

        await new Promise((resolve) => {
        const start = Date.now()
        const maxWait = 5 * 60 * 1000 // 5 minutes max
        const iv = setInterval(() => {
          try {
            if (winRef.closed) {
              clearInterval(iv)
              resolve()
            } else if (Date.now() - start > maxWait) {
              clearInterval(iv)
              resolve()
            }
          } catch (e) {
            // Accessing winRef.closed can throw in some cross-origin cases; stop waiting
            clearInterval(iv)
            resolve()
          }
        }, 500)
      })
      } catch (errWait) {
        console.warn('Error waiting for child window to close:', errWait)
      }
      // Attempt to close the invoice tab automatically if the PDF was downloaded
      // and the window is still open (best-effort). This helps return the user
      // to the app without leaving an extra tab.
      try {
        if (pdfDownloaded && winRef && !winRef.closed) {
          try { winRef.close() } catch (e) { console.warn('No se pudo cerrar la pestaña de factura después de descarga:', e) }
        }
      } catch (e) { /* ignore */ }

      // If we couldn't trigger print, fallback to generating a PDF and downloading it
      if (!printSucceeded) {
        try {
          // If we already downloaded an immediate PDF, skip regenerating it here
          if (!pdfDownloaded) {
            const { default: jsPDF } = await import('jspdf')
            await import('jspdf-autotable')
            const doc = new jsPDF({ unit: 'pt', format: 'a4' })
            // Simple header
            doc.setFontSize(16)
            doc.text('EmpresaTeis - Factura', 40, 50)
            doc.setFontSize(10)
            doc.text(`Factura: ${facturaId}`, 40, 70)
            doc.text(`Fecha: ${fechaActual}`, 40, 85)
            // Cliente
            doc.setFontSize(12)
            doc.text('Datos de facturación:', 40, 110)
            doc.setFontSize(10)
            const cliente = invoice.customer || {}
            doc.text(`Nombre: ${cliente.nombre || ''}`, 40, 125)
            doc.text(`DNI: ${cliente.dni || ''}`, 40, 140)
            doc.text(`Email: ${cliente.email || ''}`, 40, 155)

            // Items table
            const items = (invoice.items || []).map(it => [
              `${it.marca || ''} ${it.modelo || ''}`,
              it.matricula || '',
              it.anio || '',
              it.cantidad || 1,
              (it.precio || 0).toFixed(2),
              ((it.precio || 0) * (it.cantidad || 1)).toFixed(2)
            ])
            // @ts-ignore
            doc.autoTable({
              startY: 180,
              head: [['Vehículo','Matric.','Año','Cant.','Precio unit.','Subtotal']],
              body: items,
              styles: { fontSize: 10 }
            })

            // Totals
            const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : 400
            doc.text(`Subtotal: ${new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR'}).format(invoice.subtotal || 0)}`, 350, finalY)
            doc.text(`IVA: ${new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR'}).format(invoice.iva || 0)}`, 350, finalY + 15)
            doc.setFontSize(12)
            doc.text(`TOTAL: ${new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR'}).format(invoice.total || 0)}`, 350, finalY + 35)

            const pdfName = `factura-${facturaId}.pdf`
            try {
              const pdfBlob = doc.output && typeof doc.output === 'function' ? doc.output('blob') : null
              if (pdfBlob) {
                const url = URL.createObjectURL(pdfBlob)
                const a = document.createElement('a')
                a.href = url
                a.download = pdfName
                a.style.display = 'none'
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
                URL.revokeObjectURL(url)
                pdfDownloaded = true
              } else {
                doc.save(pdfName)
                pdfDownloaded = true
              }
            } catch (errSave2) {
              try { doc.save(pdfName); pdfDownloaded = true } catch (e) { console.error('Fallback PDF save failed:', e) }
            }
            pdfDownloaded = true
          } else {
            console.info('PDF was already downloaded earlier; skipping fallback PDF generation.')
          }
        } catch (errPdf) {
          console.error('Fallback PDF generation failed:', errPdf)
        }
      }

      cleanup()
      router.push('/')
    } else if (openedNew && !winRef) {
      // Opened via blob/anchor but we don't have a reference: show brief notice then go home
      setTimeout(() => { cleanup(); router.push('/') }, 800)
    } else {
      // If we couldn't open a new tab (popup blocked), show a link the user can
      // click to open the invoice, then redirect to home after they acknowledge.
      const blob = new Blob([html], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      await Swal.fire({
        icon: 'info',
        title: 'Factura generada',
        html: `La factura se ha generado, pero el navegador bloqueó la apertura automática. <br><a target="_blank" rel="noopener noreferrer" href="${url}">Abrir factura en nueva pestaña</a>`,
        confirmButtonText: 'Ir a inicio'
      })
      cleanup()
      router.push('/')
    }

    // Clear cart (Pinia + legacy util for compatibility)
    try { cesta.clearCart() } catch (e) { /* ignore */ }
    try { clearCartUtil() } catch (e) { /* ignore */ }
    window.dispatchEvent(new Event('cartUpdated'))
    window.dispatchEvent(new Event('stockUpdated'))

    // Mostrar un mensaje breve y redirigir automáticamente a la página principal
    await Swal.fire({
      title: 'Gracias',
      html: 'Pago procesado y factura generada. Volviendo a la página principal...',
      icon: 'success',
      timer: 5000,
      showConfirmButton: false,
      willClose: () => {
        // nothing here; router.push handled after await
      }
    })

    cleanup()
    router.push('/')
  } catch (err) {
    console.error('Error confirmando pago:', err)
    Swal.fire('Error', err.response?.data?.message || 'No se pudo confirmar el pago', 'error')
    cleanup()
    router.push('/')
  }
})
</script>

<style scoped></style>
