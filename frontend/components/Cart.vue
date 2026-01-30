<template>
    <div class="container my-5">
        <div class="row">
            <div class="col-12">
                <h1 class="text-primary mb-4">
                    <i class="bi bi-cart3"></i> Carrito de Compra
                </h1>
            </div>
        </div>

        <!-- Carrito vacío -->
        <div v-if="!items.length" class="row">
            <div class="col-12">
                <div class="alert alert-info text-center py-5">
                    <i class="bi bi-cart-x" style="font-size: 4rem;"></i>
                    <h3 class="mt-3">Tu carrito está vacío</h3>
                    <p class="text-muted">Añade vehículos a tu carrito para continuar</p>
                    <router-link to="/ventas" class="btn btn-primary mt-3">
                        <i class="bi bi-shop"></i> Ir al catálogo
                    </router-link>
                </div>
            </div>
        </div>

        <!-- Carrito con productos -->
        <div v-else class="row">
            <!-- Lista de productos -->
            <div class="col-lg-8">
                <div class="card shadow-sm mb-4">
                    <div class="card-header bg-primary text-white">
                        <h5 class="mb-0"><i class="bi bi-list-ul"></i> Productos ({{ totalItems }})</h5>
                    </div>
                    <div class="card-body p-0">
                        <div v-for="(item, idx) in items" :key="idx" class="cart-item">
                            <div class="row align-items-center g-0">
                                <!-- Imagen -->
                                <div class="col-md-3">
                                    <img 
                                        :src="getImageUrl(item.imagen)"
                                        class="img-fluid rounded"
                                        style="height: 150px; width: 100%; object-fit: cover;"
                                        @error="handleImageError"
                                    >
                                </div>

                                <!-- Detalles -->
                                <div class="col-md-5 p-3">
                                    <h5 class="mb-2">{{ item.marca }} {{ item.modelo }}</h5>
                                    <p class="text-muted mb-1">
                                        <small>
                                            <i class="bi bi-calendar3"></i> {{ item.anio }} · 
                                            <i class="bi bi-speedometer2"></i> {{ formatKm(item.kilometros) }}
                                        </small>
                                    </p>
                                    <p v-if="item.matricula" class="text-muted mb-0">
                                        <small><i class="bi bi-hash"></i> {{ item.matricula }}</small>
                                    </p>
                                    <span v-if="item.tipo" class="badge bg-primary mt-2">{{ item.tipo }}</span>
                                </div>

                                <!-- Precio y acciones -->
                                <div class="col-md-4 p-3">
                                    <h4 class="text-success mb-2">{{ formatPrecio(item.precio) }}</h4>
                                    
                                    <!-- Control de cantidad -->
                                    <div class="d-flex align-items-center justify-content-center mb-3">
                                        <button 
                                            class="btn btn-sm btn-outline-secondary" 
                                            @click="decrementarCantidad(idx)"
                                            :disabled="item.cantidad <= 1"
                                        >
                                            <i class="bi bi-dash"></i>
                                        </button>
                                        <span class="mx-3 fw-bold">{{ item.cantidad || 1 }}</span>
                                        <button 
                                            class="btn btn-sm btn-outline-secondary" 
                                            @click="incrementarCantidad(idx)"
                                        >
                                            <i class="bi bi-plus"></i>
                                        </button>
                                    </div>
                                    
                                    <p class="text-muted mb-2">
                                        <small>Subtotal: {{ formatPrecio(item.precio * (item.cantidad || 1)) }}</small>
                                    </p>
                                    
                                    <button class="btn btn-danger btn-sm w-100" @click="eliminar(idx)">
                                        <i class="bi bi-trash"></i> Eliminar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Resumen del pedido -->
            <div class="col-lg-4">
                <div class="card shadow-sm sticky-top" style="top: 20px;">
                    <div class="card-header bg-success text-white">
                        <h5 class="mb-0"><i class="bi bi-calculator"></i> Resumen del Pedido</h5>
                    </div>
                    <div class="card-body">
                        <div class="d-flex justify-content-between mb-2">
                            <span>Subtotal:</span>
                            <strong>{{ formatPrecio(subtotal) }}</strong>
                        </div>
                        <div class="d-flex justify-content-between mb-2">
                            <span>IVA (21%):</span>
                            <strong>{{ formatPrecio(iva) }}</strong>
                        </div>
                        <hr>
                        <div class="d-flex justify-content-between mb-3">
                            <h5>Total:</h5>
                            <h4 class="text-success">{{ formatPrecio(total) }}</h4>
                        </div>

                        <div class="d-grid gap-2">
                            <button class="btn btn-success btn-lg" @click="iniciarCheckout">
                                <i class="bi bi-credit-card"></i> Proceder al Pago
                            </button>
                            <button class="btn btn-outline-primary" @click="imprimirPresupuesto">
                                <i class="bi bi-printer"></i> Imprimir Presupuesto
                            </button>
                            <router-link to="/ventas" class="btn btn-outline-secondary">
                                <i class="bi bi-arrow-left"></i> Seguir Comprando
                            </router-link>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal de Checkout -->
        <div v-if="mostrarModalCheckout" class="modal-backdrop-custom" @click.self="mostrarModalCheckout = false">
            <div class="modal-dialog modal-lg modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title"><i class="bi bi-credit-card"></i> Finalizar Compra</h5>
                        <button type="button" class="btn-close btn-close-white" @click="mostrarModalCheckout = false"></button>
                    </div>
                    <div class="modal-body">
                        <form @submit.prevent="procesarPago">
                            <h6 class="text-primary mb-3">Datos de Facturación</h6>
                            
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Nombre completo *</label>
                                    <input v-model="datosFacturacion.nombre" type="text" class="form-control" required>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">DNI/NIF *</label>
                                    <input v-model="datosFacturacion.dni" type="text" class="form-control" required>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Email *</label>
                                    <input v-model="datosFacturacion.email" type="email" class="form-control" required>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Teléfono *</label>
                                    <input v-model="datosFacturacion.telefono" type="tel" class="form-control" required>
                                </div>
                            </div>

                            <div class="mb-3">
                                <label class="form-label">Dirección *</label>
                                <input v-model="datosFacturacion.direccion" type="text" class="form-control" required>
                            </div>

                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Ciudad *</label>
                                    <input v-model="datosFacturacion.ciudad" type="text" class="form-control" required>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Código Postal *</label>
                                    <input v-model="datosFacturacion.codigoPostal" type="text" class="form-control" required>
                                </div>
                            </div>

                            <hr class="my-4">

                            <h6 class="text-primary mb-3">Método de Pago</h6>
                            
                            <div class="mb-3">
                                <select v-model="metodoPago" class="form-select" required>
                                    <option value="">Seleccionar método...</option>
                                    <option value="tarjeta">Tarjeta de Crédito/Débito</option>
                                    <option value="transferencia">Transferencia Bancaria</option>
                                    <option value="financiacion">Financiación</option>
                                </select>
                            </div>

                            <div v-if="metodoPago === 'tarjeta'" class="payment-method-details">
                                <div class="mb-3">
                                    <label class="form-label">Número de tarjeta</label>
                                    <input v-model="datosTarjeta.numero" type="text" class="form-control" placeholder="**** **** **** ****" maxlength="19">
                                </div>
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Fecha de expiración</label>
                                        <input v-model="datosTarjeta.expiracion" type="text" class="form-control" placeholder="MM/AA" maxlength="5">
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">CVV</label>
                                        <input v-model="datosTarjeta.cvv" type="text" class="form-control" placeholder="***" maxlength="3">
                                    </div>
                                </div>
                            </div>

                            <div v-if="metodoPago === 'transferencia'" class="alert alert-info">
                                <i class="bi bi-info-circle"></i>
                                <strong>Datos bancarios:</strong><br>
                                IBAN: ES12 1234 5678 9012 3456 7890<br>
                                Concepto: Pedido #{{ Date.now() }}
                            </div>

                            <div v-if="metodoPago === 'financiacion'" class="alert alert-info">
                                <i class="bi bi-info-circle"></i>
                                Un asesor se pondrá en contacto contigo para gestionar la financiación.
                            </div>

                            <div class="alert alert-success mt-3">
                                <strong>Total a pagar:</strong> {{ formatPrecio(total) }}
                            </div>

                            <div class="d-grid gap-2">
                                <button type="submit" class="btn btn-success btn-lg" :disabled="procesando">
                                    <span v-if="procesando">
                                        <span class="spinner-border spinner-border-sm me-2"></span>
                                        Procesando...
                                    </span>
                                    <span v-else>
                                        <i class="bi bi-check-circle"></i> Confirmar Compra
                                    </span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import Swal from 'sweetalert2'
import { getCart, saveCart, clearCart, migrateOldCart } from '@/utils/cartUtils.js'

const router = useRouter()
const items = ref([])
const mostrarModalCheckout = ref(false)
const procesando = ref(false)
const metodoPago = ref('')

// Cargar carrito al montar el componente
onMounted(() => {
    migrateOldCart() // Migrar carrito antiguo si existe
    items.value = getCart()
})

const datosFacturacion = ref({
    nombre: '',
    dni: '',
    email: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    codigoPostal: ''
})

const datosTarjeta = ref({
    numero: '',
    expiracion: '',
    cvv: ''
})

// Cálculos
const totalItems = computed(() => items.value.reduce((total, item) => total + (item.cantidad || 1), 0))
const subtotal = computed(() => items.value.reduce((sum, item) => sum + ((item.precio || 0) * (item.cantidad || 1)), 0))
const iva = computed(() => subtotal.value * 0.21)
const total = computed(() => subtotal.value + iva.value)

// Formatear precio
function formatPrecio(precio) {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR'
    }).format(precio || 0)
}

// Formatear kilómetros
function formatKm(km) {
    if (!km) return '0 km'
    return new Intl.NumberFormat('es-ES').format(km) + ' km'
}

// Obtener URL de imagen
function getImageUrl(imagen) {
    return imagen ? `/uploads/${imagen}` : '/placeholder-car.png'
}

// Manejar error de imagen
function handleImageError(e) {
    e.target.src = '/placeholder-car.png'
}

// Incrementar cantidad
function incrementarCantidad(index) {
    const item = items.value[index]
    
    if (!item.cantidad) {
        item.cantidad = 1
    }
    
    // Validar stock disponible
    if (item.stockDisponible && item.cantidad >= item.stockDisponible) {
        Swal.fire({
            icon: 'warning',
            title: 'Stock limitado',
            text: `Solo hay ${item.stockDisponible} ${item.stockDisponible === 1 ? 'unidad disponible' : 'unidades disponibles'} de este vehículo`,
            timer: 2500
        })
        return
    }
    
    item.cantidad++
    saveCart(items.value)
    
    // Disparar evento para actualizar el contador en NavBar
    window.dispatchEvent(new Event('cartUpdated'))
}

// Decrementar cantidad
function decrementarCantidad(index) {
    if (!items.value[index].cantidad) {
        items.value[index].cantidad = 1
    }
    if (items.value[index].cantidad > 1) {
        items.value[index].cantidad--
        saveCart(items.value)
        
        // Disparar evento para actualizar el contador en NavBar
        window.dispatchEvent(new Event('cartUpdated'))
    }
}

// Eliminar del carrito
function eliminar(index) {
    Swal.fire({
        title: '¿Eliminar producto?',
        text: '¿Estás seguro de que quieres eliminar este vehículo del carrito?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            items.value.splice(index, 1)
            saveCart(items.value)
            
            // Disparar evento para actualizar el contador en NavBar
            window.dispatchEvent(new Event('cartUpdated'))
            
            Swal.fire('Eliminado', 'El producto ha sido eliminado del carrito', 'success')
        }
    })
}

// Validar stock antes de checkout
async function validarStockDisponible() {
    try {
        // Obtener stock actualizado de todos los items
        const itemsActualizados = await Promise.all(
            items.value.map(async (item) => {
                try {
                    const response = await axios.get(`/api/articulos/${item.id}`)
                    return {
                        ...item,
                        stockActual: response.data.stock
                    }
                } catch (error) {
                    console.error(`Error al obtener stock de ${item.id}:`, error)
                    return {
                        ...item,
                        stockActual: 0
                    }
                }
            })
        )
        
        // Verificar si algún item tiene stock insuficiente
        const itemsSinStock = itemsActualizados.filter(item => item.cantidad > item.stockActual)
        
        if (itemsSinStock.length > 0) {
            const errorList = itemsSinStock.map(item => 
                `${item.marca} ${item.modelo}: Solicitado ${item.cantidad}, disponible ${item.stockActual}`
            ).join('<br>')
            
            await Swal.fire({
                icon: 'warning',
                title: 'Stock insuficiente',
                html: `
                    <p>Algunos artículos ya no tienen stock suficiente:</p>
                    <div style="text-align: left; margin: 10px 0;">
                        ${errorList}
                    </div>
                    <p><small>Actualizando el carrito...</small></p>
                `,
                timer: 3000,
                showConfirmButton: false
            })
            
            // Actualizar el stock disponible en el carrito
            items.value = itemsActualizados.map(item => ({
                ...item,
                stockDisponible: item.stockActual
            }))
            saveCart(items.value)
            
            return false
        }
        
        return true
    } catch (error) {
        console.error('Error al validar stock:', error)
        return true // Continuar con el checkout si hay error en la validación
    }
}

// Iniciar checkout
async function iniciarCheckout() {
    // Validar stock antes de abrir el modal
    const stockValido = await validarStockDisponible()
    if (!stockValido) {
        return
    }
    
    // Cargar datos del usuario logueado desde la API
    const token = sessionStorage.getItem('token')
    if (token) {
        try {
            // Obtener datos completos del cliente desde el JSON
            const response = await axios.get('/api/clientes-json/usuario', {
                headers: { Authorization: `Bearer ${token}` }
            })
            
            const cliente = response.data
            
            // Autocompletar el formulario con los datos del cliente
            datosFacturacion.value = {
                nombre: `${cliente.nombre || ''} ${cliente.apellidos || ''}`.trim() || cliente.nombre || '',
                dni: cliente.dni || '',
                email: cliente.email || '',
                telefono: cliente.movil || '',
                direccion: cliente.direccion || '',
                ciudad: cliente.municipio || '',
                codigoPostal: cliente.codigoPostal || ''
            }
            
            console.log('✅ Datos del cliente cargados:', datosFacturacion.value)
        } catch (error) {
            console.error('Error al cargar datos del cliente:', error)
            // Si hay error, intentar cargar al menos el nombre de sessionStorage
            const userName = sessionStorage.getItem('userName')
            if (userName) {
                datosFacturacion.value.nombre = userName
            }
        }
    }
    
    mostrarModalCheckout.value = true
}

// Procesar pago
async function procesarPago() {
    if (!metodoPago.value) {
        Swal.fire('Error', 'Por favor selecciona un método de pago', 'error')
        return
    }

    procesando.value = true

    try {
        const response = await axios.post('/api/checkout', {
            items: items.value,
            customer: datosFacturacion.value,
            metodoPago: metodoPago.value,
            subtotal: subtotal.value,
            iva: iva.value,
            total: total.value
        })

        const facturaId = response.data.invoice?.invoiceId || `FAC-${Date.now()}`

        // Generar y descargar factura en PDF automáticamente
        generarFacturaPDF(facturaId)

        // Limpiar carrito
        clearCart()
        items.value = []
        mostrarModalCheckout.value = false
        
        // Disparar evento para actualizar el contador en NavBar
        window.dispatchEvent(new Event('cartUpdated'))
        
        // Disparar evento para recargar el stock en VenTas
        window.dispatchEvent(new Event('stockUpdated'))

        // Mostrar éxito
        await Swal.fire({
            icon: 'success',
            title: '¡Compra Realizada!',
            html: `
                <p>Tu pedido ha sido procesado correctamente.</p>
                <p><strong>Número de factura:</strong> ${facturaId}</p>
                <p>La factura se ha descargado automáticamente.</p>
                <p>Recibirás un email con los detalles de tu compra.</p>
            `,
            confirmButtonText: 'Aceptar'
        })

        // Redirigir
        router.push('/')
    } catch (error) {
        console.error('Error en checkout:', error)
        
        // Si hay errores de stock, mostrar información detallada
        if (error.response?.data?.stockErrors) {
            const stockErrors = error.response.data.stockErrors
            const errorList = stockErrors.map(err => 
                `${err.marca} ${err.modelo}: Disponible ${err.disponible}, solicitado ${err.solicitado}`
            ).join('<br>')
            
            await Swal.fire({
                icon: 'warning',
                title: 'Stock insuficiente',
                html: `
                    <p>Algunos artículos no tienen stock suficiente:</p>
                    <div style="text-align: left; margin: 10px 0;">
                        ${errorList}
                    </div>
                    <p><small>Por favor, actualiza las cantidades en tu carrito.</small></p>
                `,
                confirmButtonText: 'Actualizar carrito'
            })
            
            // Recargar la página del carrito para actualizar el stock
            window.location.reload()
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error en el pago',
                text: error.response?.data?.message || 'No se pudo procesar el pago. Por favor, inténtalo de nuevo.',
            })
        }
    } finally {
        procesando.value = false
    }
}

// Generar factura en PDF
function generarFacturaPDF(facturaId) {
    /* eslint-disable */
    const fechaActual = new Date().toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    })

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Factura ${facturaId}</title>
            <meta charset="UTF-8">
            <style>
                @media print {
                    @page { margin: 0; }
                    body { margin: 1cm; }
                }
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                }
                .header {
                    background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%);
                    color: white;
                    padding: 30px;
                    margin: -1cm -1cm 20px -1cm;
                }
                .header h1 {
                    margin: 0;
                    font-size: 2em;
                }
                .header p {
                    margin: 5px 0;
                    opacity: 0.9;
                }
                .invoice-info {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 30px;
                    background: #f8f9fa;
                    padding: 20px;
                    border-radius: 8px;
                }
                .invoice-info div {
                    flex: 1;
                }
                .invoice-info h3 {
                    color: #0d6efd;
                    margin-top: 0;
                    font-size: 1.1em;
                    border-bottom: 2px solid #0d6efd;
                    padding-bottom: 5px;
                }
                .invoice-number {
                    text-align: right;
                    font-size: 1.2em;
                    color: #0d6efd;
                    font-weight: bold;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 30px 0;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                thead {
                    background: #0d6efd;
                    color: white;
                }
                th, td {
                    border: 1px solid #dee2e6;
                    padding: 12px;
                    text-align: left;
                }
                tbody tr:nth-child(even) {
                    background-color: #f8f9fa;
                }
                tbody tr:hover {
                    background-color: #e9ecef;
                }
                .totals {
                    margin-top: 30px;
                    text-align: right;
                }
                .totals table {
                    margin-left: auto;
                    width: 300px;
                    box-shadow: none;
                }
                .totals td {
                    border: none;
                    padding: 8px 12px;
                }
                .total-row {
                    background: #198754 !important;
                    color: white;
                    font-size: 1.3em;
                    font-weight: bold;
                }
                .footer {
                    margin-top: 50px;
                    padding-top: 20px;
                    border-top: 2px solid #dee2e6;
                    text-align: center;
                    color: #666;
                    font-size: 0.9em;
                }
                .highlight {
                    background: #fff3cd;
                    padding: 2px 6px;
                    border-radius: 3px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🚗 EmpresaTeis</h1>
                <p>Venta de Vehículos de Ocasión</p>
                <p>📍 Vigo, Pontevedra | ☎️ +34 986 123 456 | ✉️ info@empresateis.com</p>
            </div>

            <div class="invoice-number">
                FACTURA Nº <span class="highlight">${facturaId}</span>
            </div>

            <div class="invoice-info">
                <div>
                    <h3>📋 Datos de Facturación</h3>
                    <p><strong>Cliente:</strong> ${datosFacturacion.value.nombre}</p>
                    <p><strong>DNI/NIF:</strong> ${datosFacturacion.value.dni}</p>
                    <p><strong>Email:</strong> ${datosFacturacion.value.email}</p>
                    <p><strong>Teléfono:</strong> ${datosFacturacion.value.telefono}</p>
                    <p><strong>Dirección:</strong> ${datosFacturacion.value.direccion}</p>
                    <p><strong>Ciudad:</strong> ${datosFacturacion.value.ciudad} - CP: ${datosFacturacion.value.codigoPostal}</p>
                </div>
                <div style="text-align: right;">
                    <h3>📅 Información de la Factura</h3>
                    <p><strong>Fecha:</strong> ${fechaActual}</p>
                    <p><strong>Método de Pago:</strong> ${metodoPago.value === 'tarjeta' ? 'Tarjeta' : metodoPago.value === 'transferencia' ? 'Transferencia' : 'Financiación'}</p>
                    <p><strong>Estado:</strong> <span style="color: #198754; font-weight: bold;">✓ PAGADO</span></p>
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th style="width: 35%;">Vehículo</th>
                        <th>Matrícula</th>
                        <th>Año</th>
                        <th>Kilómetros</th>
                        <th style="text-align: center;">Cant.</th>
                        <th style="text-align: right;">Precio Unit.</th>
                        <th style="text-align: right;">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${items.value.map(item => `
                        <tr>
                            <td><strong>${item.marca} ${item.modelo}</strong></td>
                            <td>${item.matricula || 'N/A'}</td>
                            <td>${item.anio}</td>
                            <td>${formatKm(item.kilometros)}</td>
                            <td style="text-align: center;"><strong>${item.cantidad || 1}</strong></td>
                            <td style="text-align: right;">${formatPrecio(item.precio)}</td>
                            <td style="text-align: right;"><strong>${formatPrecio(item.precio * (item.cantidad || 1))}</strong></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <div class="totals">
                <table>
                    <tr>
                        <td><strong>Subtotal:</strong></td>
                        <td style="text-align: right;">${formatPrecio(subtotal.value)}</td>
                    </tr>
                    <tr>
                        <td><strong>IVA (21%):</strong></td>
                        <td style="text-align: right;">${formatPrecio(iva.value)}</td>
                    </tr>
                    <tr class="total-row">
                        <td><strong>TOTAL:</strong></td>
                        <td style="text-align: right;"><strong>${formatPrecio(total.value)}</strong></td>
                    </tr>
                </table>
            </div>

            <div class="footer">
                <p><strong>¡Gracias por su compra!</strong></p>
                <p>Esta factura ha sido generada electrónicamente y es válida sin firma.</p>
                <p>EmpresaTeis S.L. | CIF: B-36123456 | Registro Mercantil de Pontevedra</p>
                <p style="margin-top: 20px; font-size: 0.8em; color: #999;">
                    Documento generado el ${new Date().toLocaleString('es-ES')}
                </p>
            </div>

            <script type="text/javascript">
                window.onload = function() {
                    window.print();
                    setTimeout(function() {
                        window.close();
                    }, 1000);
                }
            <\/script>
        </body>
        </html>
    `
    /* eslint-enable */

    const ventana = window.open('', '_blank', 'width=800,height=600')
    ventana.document.write(html)
    ventana.document.close()
}

// Imprimir presupuesto
async function imprimirPresupuesto() {
    /* eslint-disable */
    // Pedir datos del cliente si no están disponibles
    const { value: formValues } = await Swal.fire({
        title: 'Datos del Cliente',
        html: `
            <input id="swal-nombre" class="swal2-input" placeholder="Nombre completo" value="${datosFacturacion.value.nombre || ''}">
            <input id="swal-dni" class="swal2-input" placeholder="DNI/NIF" value="${datosFacturacion.value.dni || ''}">
            <input id="swal-email" class="swal2-input" placeholder="Email" value="${datosFacturacion.value.email || ''}">
            <input id="swal-telefono" class="swal2-input" placeholder="Teléfono" value="${datosFacturacion.value.telefono || ''}">
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Generar Presupuesto',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
            return {
                nombre: document.getElementById('swal-nombre').value,
                dni: document.getElementById('swal-dni').value,
                email: document.getElementById('swal-email').value,
                telefono: document.getElementById('swal-telefono').value
            }
        }
    })

    if (!formValues) return

    const fechaActual = new Date().toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    })
    const presupuestoId = `PRES-${Date.now()}`

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Presupuesto ${presupuestoId}</title>
            <meta charset="UTF-8">
            <style>
                @media print {
                    @page { margin: 0; }
                    body { margin: 1cm; }
                }
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                }
                .header {
                    background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
                    color: white;
                    padding: 30px;
                    margin: -1cm -1cm 20px -1cm;
                }
                .header h1 {
                    margin: 0;
                    font-size: 2em;
                }
                .header p {
                    margin: 5px 0;
                    opacity: 0.9;
                }
                .invoice-info {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 30px;
                    background: #f8f9fa;
                    padding: 20px;
                    border-radius: 8px;
                }
                .invoice-info div {
                    flex: 1;
                }
                .invoice-info h3 {
                    color: #6c757d;
                    margin-top: 0;
                    font-size: 1.1em;
                    border-bottom: 2px solid #6c757d;
                    padding-bottom: 5px;
                }
                .presupuesto-number {
                    text-align: right;
                    font-size: 1.2em;
                    color: #6c757d;
                    font-weight: bold;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 30px 0;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                thead {
                    background: #6c757d;
                    color: white;
                }
                th, td {
                    border: 1px solid #dee2e6;
                    padding: 12px;
                    text-align: left;
                }
                tbody tr:nth-child(even) {
                    background-color: #f8f9fa;
                }
                tbody tr:hover {
                    background-color: #e9ecef;
                }
                .totals {
                    margin-top: 30px;
                    text-align: right;
                }
                .totals table {
                    margin-left: auto;
                    width: 300px;
                    box-shadow: none;
                }
                .totals td {
                    border: none;
                    padding: 8px 12px;
                }
                .total-row {
                    background: #0d6efd !important;
                    color: white;
                    font-size: 1.3em;
                    font-weight: bold;
                }
                .footer {
                    margin-top: 50px;
                    padding-top: 20px;
                    border-top: 2px solid #dee2e6;
                    color: #666;
                    font-size: 0.9em;
                }
                .alert-info {
                    background: #cfe2ff;
                    border: 1px solid #0d6efd;
                    padding: 15px;
                    border-radius: 8px;
                    margin: 20px 0;
                }
                .highlight {
                    background: #fff3cd;
                    padding: 2px 6px;
                    border-radius: 3px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🚗 EmpresaTeis</h1>
                <p>Venta de Vehículos de Ocasión</p>
                <p>📍 Vigo, Pontevedra | ☎️ +34 986 123 456 | ✉️ info@empresateis.com</p>
            </div>

            <div class="presupuesto-number">
                PRESUPUESTO Nº <span class="highlight">${presupuestoId}</span>
            </div>

            <div class="invoice-info">
                <div>
                    <h3>👤 Datos del Cliente</h3>
                    <p><strong>Nombre:</strong> ${formValues.nombre}</p>
                    <p><strong>DNI/NIF:</strong> ${formValues.dni}</p>
                    <p><strong>Email:</strong> ${formValues.email}</p>
                    <p><strong>Teléfono:</strong> ${formValues.telefono}</p>
                </div>
                <div style="text-align: right;">
                    <h3>📅 Información del Presupuesto</h3>
                    <p><strong>Fecha:</strong> ${fechaActual}</p>
                    <p><strong>Validez:</strong> 30 días</p>
                    <p><strong>Estado:</strong> <span style="color: #0d6efd; font-weight: bold;">⏳ PENDIENTE</span></p>
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th style="width: 35%;">Vehículo</th>
                        <th>Matrícula</th>
                        <th>Año</th>
                        <th>Kilómetros</th>
                        <th style="text-align: center;">Cant.</th>
                        <th style="text-align: right;">Precio Unit.</th>
                        <th style="text-align: right;">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${items.value.map(item => `
                        <tr>
                            <td><strong>${item.marca} ${item.modelo}</strong></td>
                            <td>${item.matricula || 'N/A'}</td>
                            <td>${item.anio}</td>
                            <td>${formatKm(item.kilometros)}</td>
                            <td style="text-align: center;"><strong>${item.cantidad || 1}</strong></td>
                            <td style="text-align: right;">${formatPrecio(item.precio)}</td>
                            <td style="text-align: right;"><strong>${formatPrecio(item.precio * (item.cantidad || 1))}</strong></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <div class="totals">
                <table>
                    <tr>
                        <td><strong>Subtotal:</strong></td>
                        <td style="text-align: right;">${formatPrecio(subtotal.value)}</td>
                    </tr>
                    <tr>
                        <td><strong>IVA (21%):</strong></td>
                        <td style="text-align: right;">${formatPrecio(iva.value)}</td>
                    </tr>
                    <tr class="total-row">
                        <td><strong>TOTAL ESTIMADO:</strong></td>
                        <td style="text-align: right;"><strong>${formatPrecio(total.value)}</strong></td>
                    </tr>
                </table>
            </div>

            <div class="alert-info">
                <strong>ℹ️ Información Importante:</strong>
                <ul style="margin: 10px 0; padding-left: 20px;">
                    <li>Este presupuesto tiene una validez de 30 días desde la fecha de emisión.</li>
                    <li>Los precios pueden variar según disponibilidad.</li>
                    <li>Incluye IVA (21%) y garantía legal de 1 año.</li>
                    <li>Posibilidad de financiación sin intereses.</li>
                </ul>
            </div>

            <div class="footer">
                <p><strong>¿Interesado? Contáctanos para finalizar tu compra</strong></p>
                <p>☎️ +34 986 123 456 | ✉️ ventas@empresateis.com</p>
                <p>EmpresaTeis S.L. | CIF: B-36123456 | Registro Mercantil de Pontevedra</p>
                <p style="margin-top: 20px; font-size: 0.8em; color: #999;">
                    Documento generado el ${new Date().toLocaleString('es-ES')}
                </p>
            </div>

            <script type="text/javascript">
                window.onload = function() {
                    window.print();
                    setTimeout(function() {
                        window.close();
                    }, 1000);
                }
            <\/script>
        </body>
        </html>
    `
    /* eslint-enable */
    
    const ventana = window.open('', '_blank', 'width=800,height=600')
    ventana.document.write(html)
    ventana.document.close()
}
</script>

<style scoped>
.cart-item {
    border-bottom: 1px solid #dee2e6;
    padding: 1rem 0;
}

.cart-item:last-child {
    border-bottom: none;
}

.cart-item:hover {
    background-color: #f8f9fa;
}

.modal-backdrop-custom {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1050;
    backdrop-filter: blur(3px);
    overflow-y: auto;
    padding: 20px;
}

.modal-content {
    border: none;
    border-radius: 15px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.payment-method-details {
    background-color: #f8f9fa;
    padding: 1rem;
    border-radius: 10px;
}
</style>