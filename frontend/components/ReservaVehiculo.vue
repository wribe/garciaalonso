<template>
    <div class="container my-5">
        <div class="row justify-content-center">
            <div class="col-lg-10">
                <div class="card shadow-lg border-0">
                    <div class="card-header bg-primary text-white py-3">
                        <h3 class="mb-0 text-center">
                            <i class="bi bi-bookmark-check me-2"></i>Solicitud de Reserva de Vehículo
                        </h3>
                    </div>
                    
                    <div class="card-body p-4">
                        <!-- Mensaje cuando las reservas están deshabilitadas -->
                        <div v-if="!reservasHabilitadas" class="alert alert-warning text-center py-4">
                            <i class="bi bi-exclamation-triangle" style="font-size: 3rem;"></i>
                            <h4 class="mt-3">Reservas temporalmente deshabilitadas</h4>
                            <p class="text-muted">
                                En este momento no se pueden realizar nuevas reservas.<br>
                                Por favor, póngase en contacto con nosotros para más información.
                            </p>
                            <router-link to="/contacto" class="btn btn-primary me-2">
                                <i class="bi bi-envelope"></i> Contactar
                            </router-link>
                            <router-link to="/ventas" class="btn btn-outline-secondary">
                                <i class="bi bi-arrow-left"></i> Volver al catálogo
                            </router-link>
                        </div>

                        <template v-else>
                        <!-- Información del vehículo seleccionado -->
                        <div v-if="vehiculoSeleccionado" class="alert alert-info mb-4">
                            <div class="row align-items-center">
                                <div class="col-md-3">
                                    <img 
                                        :src="vehiculoSeleccionado.imagen ? `/uploads/${vehiculoSeleccionado.imagen}` : '/placeholder-car.png'" 
                                        class="img-fluid rounded"
                                        style="max-height: 120px; object-fit: cover;"
                                        @error="e => e.target.src = '/placeholder-car.png'"
                                    >
                                </div>
                                <div class="col-md-6">
                                    <h5 class="mb-1">{{ vehiculoSeleccionado.marca }} {{ vehiculoSeleccionado.modelo }}</h5>
                                    <p class="mb-1 text-muted">
                                        <i class="bi bi-calendar3"></i> {{ vehiculoSeleccionado.anio }} · 
                                        <i class="bi bi-speedometer2"></i> {{ formatKm(vehiculoSeleccionado.kilometros) }}
                                    </p>
                                    <p v-if="vehiculoSeleccionado.matricula" class="mb-0">
                                        <i class="bi bi-hash"></i> {{ vehiculoSeleccionado.matricula }}
                                    </p>
                                </div>
                                <div class="col-md-3 text-end">
                                    <h4 class="text-success mb-0">{{ formatPrecio(vehiculoSeleccionado.precio) }}</h4>
                                </div>
                            </div>
                        </div>

                        <!-- Selector de vehículo si no viene por URL -->
                        <div v-else class="mb-4">
                            <label class="form-label fw-bold">
                                <i class="bi bi-car-front me-1"></i> Seleccionar Vehículo *
                            </label>
                            <select v-model="vehiculoId" class="form-select" required @change="cargarVehiculo">
                                <option value="">-- Seleccione un vehículo --</option>
                                <option 
                                    v-for="v in vehiculosDisponibles" 
                                    :key="v._id" 
                                    :value="v._id"
                                >
                                    {{ v.marca }} {{ v.modelo }} ({{ v.anio }}) - {{ formatPrecio(v.precio) }}
                                </option>
                            </select>
                        </div>

                        <form @submit.prevent="enviarReserva">
                            <h5 class="text-primary border-bottom pb-2 mb-3">
                                <i class="bi bi-person me-2"></i>Datos del Solicitante
                            </h5>

                            <div class="row g-3">
                                <!-- Nombre -->
                                <div class="col-md-6">
                                    <label class="form-label">Nombre *</label>
                                    <input 
                                        v-model="solicitante.nombre" 
                                        type="text" 
                                        class="form-control" 
                                        required
                                        placeholder="Introduce tu nombre"
                                    >
                                </div>

                                <!-- Apellidos -->
                                <div class="col-md-6">
                                    <label class="form-label">Apellidos *</label>
                                    <input 
                                        v-model="solicitante.apellidos" 
                                        type="text" 
                                        class="form-control" 
                                        required
                                        placeholder="Introduce tus apellidos"
                                    >
                                </div>

                                <!-- DNI -->
                                <div class="col-md-4">
                                    <label class="form-label">DNI/NIE *</label>
                                    <input 
                                        v-model="solicitante.dni" 
                                        type="text" 
                                        class="form-control" 
                                        required
                                        placeholder="12345678A"
                                        @blur="validarDni"
                                        :class="{ 'is-invalid': !dniValido && solicitante.dni }"
                                    >
                                    <div v-if="!dniValido && solicitante.dni" class="invalid-feedback">
                                        DNI/NIE no válido
                                    </div>
                                </div>

                                <!-- Email -->
                                <div class="col-md-4">
                                    <label class="form-label">Email *</label>
                                    <input 
                                        v-model="solicitante.email" 
                                        type="email" 
                                        class="form-control" 
                                        required
                                        placeholder="tu@email.com"
                                    >
                                </div>

                                <!-- Teléfono -->
                                <div class="col-md-4">
                                    <label class="form-label">Teléfono *</label>
                                    <input 
                                        v-model="solicitante.telefono" 
                                        type="tel" 
                                        class="form-control" 
                                        required
                                        placeholder="612345678"
                                        @blur="validarTelefono"
                                        :class="{ 'is-invalid': !telefonoValido && solicitante.telefono }"
                                    >
                                    <div v-if="!telefonoValido && solicitante.telefono" class="invalid-feedback">
                                        Teléfono no válido (9 dígitos, empieza por 6 o 7)
                                    </div>
                                </div>

                                <!-- Dirección -->
                                <div class="col-md-6">
                                    <label class="form-label">Dirección</label>
                                    <input 
                                        v-model="solicitante.direccion" 
                                        type="text" 
                                        class="form-control"
                                        placeholder="Calle, número, piso..."
                                    >
                                </div>

                                <!-- Ciudad -->
                                <div class="col-md-4">
                                    <label class="form-label">Ciudad</label>
                                    <input 
                                        v-model="solicitante.ciudad" 
                                        type="text" 
                                        class="form-control"
                                        placeholder="Tu ciudad"
                                    >
                                </div>

                                <!-- Código Postal -->
                                <div class="col-md-2">
                                    <label class="form-label">C. Postal</label>
                                    <input 
                                        v-model="solicitante.codigoPostal" 
                                        type="text" 
                                        class="form-control"
                                        placeholder="36200"
                                        maxlength="5"
                                    >
                                </div>
                            </div>

                            <h5 class="text-primary border-bottom pb-2 mb-3 mt-4">
                                <i class="bi bi-credit-card me-2"></i>Preferencias de Pago
                            </h5>

                            <div class="row g-3">
                                <!-- Método de pago preferido -->
                                <div class="col-md-6">
                                    <label class="form-label">Método de pago preferido</label>
                                    <select v-model="metodoPagoPreferido" class="form-select">
                                        <option value="efectivo">Efectivo</option>
                                        <option value="tarjeta">Tarjeta de crédito/débito</option>
                                        <option value="transferencia">Transferencia bancaria</option>
                                        <option value="financiacion">Financiación</option>
                                    </select>
                                </div>

                                <!-- Observaciones -->
                                <div class="col-12">
                                    <label class="form-label">Observaciones o comentarios</label>
                                    <textarea 
                                        v-model="observaciones" 
                                        class="form-control" 
                                        rows="3"
                                        placeholder="Indica cualquier información adicional, preguntas, horario de contacto preferido, etc."
                                    ></textarea>
                                </div>
                            </div>

                            <!-- Información importante -->
                            <div class="alert alert-warning mt-4">
                                <h6><i class="bi bi-info-circle me-2"></i>Información importante:</h6>
                                <ul class="mb-0 small">
                                    <li>La reserva tiene una validez de <strong>7 días</strong>.</li>
                                    <li>Nos pondremos en contacto contigo en un plazo de <strong>24-48 horas</strong>.</li>
                                    <li>La reserva <strong>no implica compromiso de compra</strong> hasta que no se confirme.</li>
                                    <li>Puedes cancelar la reserva en cualquier momento sin coste.</li>
                                </ul>
                            </div>

                            <!-- Aceptar términos -->
                            <div class="form-check mt-3">
                                <input 
                                    type="checkbox" 
                                    class="form-check-input" 
                                    id="aceptaTerminos" 
                                    v-model="aceptaTerminos"
                                    required
                                >
                                <label class="form-check-label" for="aceptaTerminos">
                                    Acepto los <router-link to="/avisolegal" target="_blank">términos y condiciones</router-link> 
                                    y la <router-link to="/politicaprivacidad" target="_blank">política de privacidad</router-link> *
                                </label>
                            </div>

                            <!-- Botones -->
                            <div class="d-flex justify-content-between mt-4">
                                <router-link to="/ventas" class="btn btn-outline-secondary">
                                    <i class="bi bi-arrow-left me-1"></i> Volver al catálogo
                                </router-link>
                                <button 
                                    type="submit" 
                                    class="btn btn-primary btn-lg"
                                    :disabled="enviando || !aceptaTerminos || !vehiculoId"
                                >
                                    <span v-if="enviando">
                                        <span class="spinner-border spinner-border-sm me-2"></span>
                                        Enviando...
                                    </span>
                                    <span v-else>
                                        <i class="bi bi-bookmark-check me-2"></i>Solicitar Reserva
                                    </span>
                                </button>
                            </div>
                        </form>
                        </template>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import Swal from 'sweetalert2'

const route = useRoute()
const router = useRouter()

const vehiculoId = ref('')
const vehiculoSeleccionado = ref(null)
const vehiculosDisponibles = ref([])
const enviando = ref(false)
const aceptaTerminos = ref(false)
const reservasHabilitadas = ref(true)

// Datos del solicitante
const solicitante = ref({
    nombre: '',
    apellidos: '',
    dni: '',
    email: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    codigoPostal: ''
})

const metodoPagoPreferido = ref('efectivo')
const observaciones = ref('')

// Validaciones
const dniValido = ref(true)
const telefonoValido = ref(true)

// Cargar datos al montar
onMounted(async () => {
    // Verificar si las reservas están habilitadas
    await verificarReservasHabilitadas()
    
    // Si viene un ID de vehículo por URL
    if (route.query.vehiculo) {
        vehiculoId.value = route.query.vehiculo
        await cargarVehiculo()
    }
    
    // Cargar vehículos disponibles para el selector
    await cargarVehiculosDisponibles()
    
    // Cargar datos del usuario si está logueado
    await cargarDatosUsuario()
})

// Verificar si las reservas están habilitadas
const verificarReservasHabilitadas = async () => {
    try {
        const response = await axios.get('/api/reservas/config/estado')
        reservasHabilitadas.value = response.data.habilitadas
    } catch (error) {
        console.log('Error al verificar configuración de reservas')
        reservasHabilitadas.value = true
    }
}

// Cargar vehículos disponibles
const cargarVehiculosDisponibles = async () => {
    try {
        const response = await axios.get('/api/articulos')
        vehiculosDisponibles.value = response.data.filter(v => 
            v.estado === 'disponible' && v.stock > 0
        )
    } catch (error) {
        console.error('Error al cargar vehículos:', error)
    }
}

// Cargar vehículo seleccionado
const cargarVehiculo = async () => {
    if (!vehiculoId.value) {
        vehiculoSeleccionado.value = null
        return
    }
    
    try {
        const response = await axios.get(`/api/articulos/${vehiculoId.value}`)
        vehiculoSeleccionado.value = response.data
    } catch (error) {
        console.error('Error al cargar vehículo:', error)
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo cargar la información del vehículo'
        })
    }
}

// Cargar datos del usuario logueado
const cargarDatosUsuario = async () => {
    const token = sessionStorage.getItem('token')
    if (!token) return
    
    try {
        const response = await axios.get('/api/clientes-json/usuario', {
            headers: { Authorization: `Bearer ${token}` }
        })
        
        const cliente = response.data
        solicitante.value = {
            nombre: cliente.nombre || '',
            apellidos: cliente.apellidos || '',
            dni: cliente.dni || '',
            email: cliente.email || '',
            telefono: cliente.movil || '',
            direccion: cliente.direccion || '',
            ciudad: cliente.municipio || '',
            codigoPostal: cliente.codigoPostal || ''
        }
    } catch (error) {
        console.log('Usuario no logueado o error al cargar datos')
    }
}

// Validar DNI
const validarDni = () => {
    const dni = solicitante.value.dni.toUpperCase().trim()
    if (!dni) {
        dniValido.value = true
        return
    }
    
    // Expresión regular para DNI español o NIE
    const dniRegex = /^[0-9]{8}[A-Z]$/
    const nieRegex = /^[XYZ][0-9]{7}[A-Z]$/
    
    dniValido.value = dniRegex.test(dni) || nieRegex.test(dni)
}

// Validar teléfono
const validarTelefono = () => {
    const telefono = solicitante.value.telefono.trim()
    if (!telefono) {
        telefonoValido.value = true
        return
    }
    
    const telefonoRegex = /^[67]\d{8}$/
    telefonoValido.value = telefonoRegex.test(telefono)
}

// Formatear precio
const formatPrecio = (precio) => {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR'
    }).format(precio || 0)
}

// Formatear kilómetros
const formatKm = (km) => {
    if (!km) return '0 km'
    return new Intl.NumberFormat('es-ES').format(km) + ' km'
}

// Enviar reserva
const enviarReserva = async () => {
    // Validaciones
    if (!vehiculoId.value) {
        Swal.fire({
            icon: 'warning',
            title: 'Vehículo requerido',
            text: 'Por favor, selecciona un vehículo para reservar'
        })
        return
    }
    
    if (!dniValido.value) {
        Swal.fire({
            icon: 'warning',
            title: 'DNI no válido',
            text: 'Por favor, introduce un DNI/NIE válido'
        })
        return
    }
    
    if (!telefonoValido.value) {
        Swal.fire({
            icon: 'warning',
            title: 'Teléfono no válido',
            text: 'El teléfono debe tener 9 dígitos y empezar por 6 o 7'
        })
        return
    }
    
    enviando.value = true
    
    try {
        const response = await axios.post('/api/reservas', {
            vehiculoId: vehiculoId.value,
            solicitante: solicitante.value,
            metodoPagoPreferido: metodoPagoPreferido.value,
            observaciones: observaciones.value
        })
        
        await Swal.fire({
            icon: 'success',
            title: '¡Reserva solicitada!',
            html: `
                <p>Tu solicitud de reserva ha sido registrada correctamente.</p>
                <p><strong>Vehículo:</strong> ${vehiculoSeleccionado.value?.marca} ${vehiculoSeleccionado.value?.modelo}</p>
                <p class="text-muted small">Nos pondremos en contacto contigo en las próximas 24-48 horas para confirmar la reserva.</p>
            `,
            confirmButtonText: 'Aceptar'
        })
        
        // Redirigir al catálogo
        router.push('/ventas')
        
    } catch (error) {
        console.error('Error al crear reserva:', error)
        Swal.fire({
            icon: 'error',
            title: 'Error al procesar la reserva',
            text: error.response?.data?.message || 'No se pudo procesar la solicitud. Por favor, inténtalo de nuevo.'
        })
    } finally {
        enviando.value = false
    }
}
</script>

<style scoped>
.card {
    border-radius: 15px;
    overflow: hidden;
}

.card-header {
    border-bottom: none;
}

.form-control:focus,
.form-select:focus {
    border-color: #0d6efd;
    box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.15);
}

.btn-primary {
    padding: 10px 30px;
}
</style>
