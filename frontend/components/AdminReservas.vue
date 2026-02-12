<template>
    <div class="container-fluid my-4 p-4 border rounded-4 shadow-lg bg-white">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h4 class="text-primary mb-0">
                <i class="bi bi-bookmark-star me-2"></i>Gestión de Reservas
            </h4>
            
            <!-- Toggle para habilitar/deshabilitar reservas -->
            <div class="d-flex align-items-center">
                <span class="me-3 fw-semibold">Reservas habilitadas:</span>
                <div class="form-check form-switch">
                    <input 
                        class="form-check-input" 
                        type="checkbox" 
                        id="toggleReservas"
                        v-model="reservasHabilitadas"
                        @change="toggleReservasGlobal"
                        style="width: 3rem; height: 1.5rem; cursor: pointer;"
                    >
                    <label class="form-check-label ms-2" for="toggleReservas">
                        <span :class="reservasHabilitadas ? 'text-success' : 'text-danger'">
                            {{ reservasHabilitadas ? 'Sí' : 'No' }}
                        </span>
                    </label>
                </div>
            </div>
        </div>

        <!-- Filtros -->
        <div class="row mb-4">
            <div class="col-md-3">
                <label class="form-label small">Filtrar por estado:</label>
                <select v-model="filtroEstado" class="form-select form-select-sm">
                    <option value="">Todos los estados</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="confirmada">Confirmada</option>
                    <option value="cancelada">Cancelada</option>
                    <option value="expirada">Expirada</option>
                    <option value="completada">Completada</option>
                </select>
            </div>
            <div class="col-md-3">
                <label class="form-label small">Buscar por DNI:</label>
                <input v-model="filtroDni" type="text" class="form-control form-control-sm" placeholder="DNI del cliente...">
            </div>
            <div class="col-md-3">
                <label class="form-label small">Buscar por vehículo:</label>
                <input v-model="filtroVehiculo" type="text" class="form-control form-control-sm" placeholder="Marca o modelo...">
            </div>
            <div class="col-md-3 d-flex align-items-end">
                <button @click="limpiarFiltros" class="btn btn-outline-secondary btn-sm me-2">
                    <i class="bi bi-x-circle"></i> Limpiar
                </button>
                <button @click="cargarReservas" class="btn btn-primary btn-sm">
                    <i class="bi bi-arrow-clockwise"></i> Actualizar
                </button>
            </div>
        </div>

        <!-- Estadísticas rápidas -->
        <div class="row mb-4">
            <div class="col-md-2">
                <div class="card bg-warning bg-opacity-10 border-warning">
                    <div class="card-body text-center py-2">
                        <h5 class="mb-0 text-warning">{{ estadisticas.pendientes }}</h5>
                        <small class="text-muted">Pendientes</small>
                    </div>
                </div>
            </div>
            <div class="col-md-2">
                <div class="card bg-success bg-opacity-10 border-success">
                    <div class="card-body text-center py-2">
                        <h5 class="mb-0 text-success">{{ estadisticas.confirmadas }}</h5>
                        <small class="text-muted">Confirmadas</small>
                    </div>
                </div>
            </div>
            <div class="col-md-2">
                <div class="card bg-danger bg-opacity-10 border-danger">
                    <div class="card-body text-center py-2">
                        <h5 class="mb-0 text-danger">{{ estadisticas.canceladas }}</h5>
                        <small class="text-muted">Canceladas</small>
                    </div>
                </div>
            </div>
            <div class="col-md-2">
                <div class="card bg-secondary bg-opacity-10 border-secondary">
                    <div class="card-body text-center py-2">
                        <h5 class="mb-0 text-secondary">{{ estadisticas.expiradas }}</h5>
                        <small class="text-muted">Expiradas</small>
                    </div>
                </div>
            </div>
            <div class="col-md-2">
                <div class="card bg-primary bg-opacity-10 border-primary">
                    <div class="card-body text-center py-2">
                        <h5 class="mb-0 text-primary">{{ estadisticas.completadas }}</h5>
                        <small class="text-muted">Completadas</small>
                    </div>
                </div>
            </div>
            <div class="col-md-2">
                <div class="card bg-info bg-opacity-10 border-info">
                    <div class="card-body text-center py-2">
                        <h5 class="mb-0 text-info">{{ reservas.length }}</h5>
                        <small class="text-muted">Total</small>
                    </div>
                </div>
            </div>
        </div>

        <!-- Tabla de reservas -->
        <div class="table-responsive">
            <table class="table table-bordered table-striped table-hover table-sm align-middle">
                <thead class="table-primary">
                    <tr>
                        <th class="text-center" style="width: 80px;">ID</th>
                        <th>Vehículo</th>
                        <th>Cliente</th>
                        <th class="text-center">Contacto</th>
                        <th class="text-center">Fecha Reserva</th>
                        <th class="text-center">Expira</th>
                        <th class="text-center">Estado</th>
                        <th class="text-center" style="width: 180px;">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="cargando">
                        <td colspan="8" class="text-center py-4">
                            <div class="spinner-border text-primary" role="status">
                                <span class="visually-hidden">Cargando...</span>
                            </div>
                        </td>
                    </tr>
                    <tr v-else-if="reservasFiltradas.length === 0">
                        <td colspan="8" class="text-center py-4 text-muted">
                            <i class="bi bi-inbox" style="font-size: 2rem;"></i>
                            <p class="mb-0 mt-2">No hay reservas para mostrar</p>
                        </td>
                    </tr>
                    <tr v-for="(reserva, index) in reservasPaginadas" :key="reserva._id">
                        <td class="text-center">
                            <small class="text-muted">#{{ index + 1 + (currentPage - 1) * itemsPerPage }}</small>
                        </td>
                        <td>
                            <strong>{{ reserva.vehiculo?.marca }} {{ reserva.vehiculo?.modelo }}</strong>
                            <br>
                            <small class="text-muted">
                                {{ reserva.vehiculo?.matricula || 'Sin matrícula' }} · 
                                {{ formatPrecio(reserva.vehiculo?.precio) }}
                            </small>
                        </td>
                        <td>
                            <strong>{{ reserva.solicitante?.nombre }} {{ reserva.solicitante?.apellidos }}</strong>
                            <br>
                            <small class="text-muted">DNI: {{ reserva.solicitante?.dni }}</small>
                        </td>
                        <td class="text-center">
                            <a :href="`tel:${reserva.solicitante?.telefono}`" class="text-decoration-none">
                                <i class="bi bi-telephone"></i> {{ reserva.solicitante?.telefono }}
                            </a>
                            <br>
                            <a :href="`mailto:${reserva.solicitante?.email}`" class="text-decoration-none small">
                                {{ reserva.solicitante?.email }}
                            </a>
                        </td>
                        <td class="text-center">
                            {{ formatFecha(reserva.fechaReserva) }}
                        </td>
                        <td class="text-center">
                            <span :class="estaExpirada(reserva) ? 'text-danger' : ''">
                                {{ formatFecha(reserva.fechaExpiracion) }}
                            </span>
                        </td>
                        <td class="text-center">
                            <span class="badge" :class="getEstadoClass(reserva.estado)">
                                {{ reserva.estado?.toUpperCase() }}
                            </span>
                        </td>
                        <td class="text-center">
                            <div class="btn-group btn-group-sm">
                                <button 
                                    v-if="reserva.estado === 'pendiente'"
                                    @click="cambiarEstado(reserva, 'confirmada')"
                                    class="btn btn-success"
                                    title="Confirmar reserva"
                                >
                                    <i class="bi bi-check-lg"></i>
                                </button>
                                <button 
                                    v-if="reserva.estado === 'pendiente' || reserva.estado === 'confirmada'"
                                    @click="cambiarEstado(reserva, 'cancelada')"
                                    class="btn btn-danger"
                                    title="Cancelar reserva"
                                >
                                    <i class="bi bi-x-lg"></i>
                                </button>
                                <button 
                                    v-if="reserva.estado === 'confirmada'"
                                    @click="cambiarEstado(reserva, 'completada')"
                                    class="btn btn-primary"
                                    title="Marcar como completada (vendida)"
                                >
                                    <i class="bi bi-bag-check"></i>
                                </button>
                                <button 
                                    @click="verDetalles(reserva)"
                                    class="btn btn-info"
                                    title="Ver detalles"
                                >
                                    <i class="bi bi-eye"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Paginación -->
        <div class="d-flex justify-content-center my-3">
            <button 
                class="btn btn-outline-primary btn-sm me-2" 
                @click="currentPage--"
                :disabled="currentPage <= 1"
            >
                <i class="bi bi-chevron-left"></i>
            </button>
            <span class="mx-3 align-self-center text-muted">
                Página {{ currentPage }} de {{ totalPages }}
            </span>
            <button 
                class="btn btn-outline-primary btn-sm" 
                @click="currentPage++"
                :disabled="currentPage >= totalPages"
            >
                <i class="bi bi-chevron-right"></i>
            </button>
        </div>

        <!-- Modal de detalles -->
        <div v-if="reservaSeleccionada" class="modal-backdrop-custom" @click.self="reservaSeleccionada = null">
            <div class="modal-dialog modal-lg modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title">
                            <i class="bi bi-bookmark-check me-2"></i>Detalles de la Reserva
                        </h5>
                        <button type="button" class="btn-close btn-close-white" @click="reservaSeleccionada = null"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-6">
                                <h6 class="text-primary border-bottom pb-2">
                                    <i class="bi bi-car-front me-2"></i>Vehículo
                                </h6>
                                <p><strong>Marca/Modelo:</strong> {{ reservaSeleccionada.vehiculo?.marca }} {{ reservaSeleccionada.vehiculo?.modelo }}</p>
                                <p><strong>Matrícula:</strong> {{ reservaSeleccionada.vehiculo?.matricula || 'N/A' }}</p>
                                <p><strong>Año:</strong> {{ reservaSeleccionada.vehiculo?.anio }}</p>
                                <p><strong>Precio:</strong> {{ formatPrecio(reservaSeleccionada.vehiculo?.precio) }}</p>
                            </div>
                            <div class="col-md-6">
                                <h6 class="text-primary border-bottom pb-2">
                                    <i class="bi bi-person me-2"></i>Solicitante
                                </h6>
                                <p><strong>Nombre:</strong> {{ reservaSeleccionada.solicitante?.nombre }} {{ reservaSeleccionada.solicitante?.apellidos }}</p>
                                <p><strong>DNI:</strong> {{ reservaSeleccionada.solicitante?.dni }}</p>
                                <p><strong>Email:</strong> {{ reservaSeleccionada.solicitante?.email }}</p>
                                <p><strong>Teléfono:</strong> {{ reservaSeleccionada.solicitante?.telefono }}</p>
                                <p v-if="reservaSeleccionada.solicitante?.direccion">
                                    <strong>Dirección:</strong> {{ reservaSeleccionada.solicitante?.direccion }}, 
                                    {{ reservaSeleccionada.solicitante?.ciudad }} {{ reservaSeleccionada.solicitante?.codigoPostal }}
                                </p>
                            </div>
                        </div>
                        <div class="row mt-3">
                            <div class="col-12">
                                <h6 class="text-primary border-bottom pb-2">
                                    <i class="bi bi-info-circle me-2"></i>Información de la Reserva
                                </h6>
                                <p><strong>Fecha de reserva:</strong> {{ formatFechaCompleta(reservaSeleccionada.fechaReserva) }}</p>
                                <p><strong>Fecha de expiración:</strong> {{ formatFechaCompleta(reservaSeleccionada.fechaExpiracion) }}</p>
                                <p><strong>Estado:</strong> <span class="badge" :class="getEstadoClass(reservaSeleccionada.estado)">{{ reservaSeleccionada.estado?.toUpperCase() }}</span></p>
                                <p><strong>Método de pago preferido:</strong> {{ reservaSeleccionada.metodoPagoPreferido }}</p>
                                <div v-if="reservaSeleccionada.observaciones">
                                    <strong>Observaciones:</strong>
                                    <p class="bg-light p-2 rounded mt-1">{{ reservaSeleccionada.observaciones }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" @click="reservaSeleccionada = null">
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'

const reservas = ref([])
const cargando = ref(false)
const reservasHabilitadas = ref(true)
const reservaSeleccionada = ref(null)

// Filtros
const filtroEstado = ref('')
const filtroDni = ref('')
const filtroVehiculo = ref('')

// Paginación
const currentPage = ref(1)
const itemsPerPage = 10

// Cargar reservas al montar
onMounted(async () => {
    await cargarReservas()
    await cargarConfiguracion()
})

// Cargar reservas
const cargarReservas = async () => {
    cargando.value = true
    try {
        const response = await axios.get('/api/reservas')
        reservas.value = response.data
    } catch (error) {
        console.error('Error al cargar reservas:', error)
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudieron cargar las reservas'
        })
    } finally {
        cargando.value = false
    }
}

// Cargar configuración de reservas habilitadas
const cargarConfiguracion = async () => {
    try {
        const response = await axios.get('/api/reservas/config/estado')
        reservasHabilitadas.value = response.data.habilitadas
    } catch (error) {
        console.log('Configuración no encontrada, usando valor por defecto')
        reservasHabilitadas.value = true
    }
}

// Toggle reservas globales
const toggleReservasGlobal = async () => {
    try {
        await axios.put('/api/reservas/config/estado', {
            habilitadas: reservasHabilitadas.value
        })
        
        Swal.fire({
            icon: 'success',
            title: reservasHabilitadas.value ? 'Reservas habilitadas' : 'Reservas deshabilitadas',
            text: reservasHabilitadas.value 
                ? 'Los usuarios ahora pueden hacer reservas' 
                : 'Los usuarios no podrán hacer nuevas reservas',
            timer: 2000,
            showConfirmButton: false
        })
    } catch (error) {
        console.error('Error al cambiar configuración:', error)
        // Revertir el cambio
        reservasHabilitadas.value = !reservasHabilitadas.value
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo cambiar la configuración'
        })
    }
}

// Estadísticas
const estadisticas = computed(() => {
    return {
        pendientes: reservas.value.filter(r => r.estado === 'pendiente').length,
        confirmadas: reservas.value.filter(r => r.estado === 'confirmada').length,
        canceladas: reservas.value.filter(r => r.estado === 'cancelada').length,
        expiradas: reservas.value.filter(r => r.estado === 'expirada').length,
        completadas: reservas.value.filter(r => r.estado === 'completada').length
    }
})

// Filtrar reservas
const reservasFiltradas = computed(() => {
    return reservas.value.filter(r => {
        const coincideEstado = !filtroEstado.value || r.estado === filtroEstado.value
        const coincideDni = !filtroDni.value || r.solicitante?.dni?.toLowerCase().includes(filtroDni.value.toLowerCase())
        const coincideVehiculo = !filtroVehiculo.value || 
            `${r.vehiculo?.marca} ${r.vehiculo?.modelo}`.toLowerCase().includes(filtroVehiculo.value.toLowerCase())
        return coincideEstado && coincideDni && coincideVehiculo
    })
})

// Paginación
const totalPages = computed(() => Math.ceil(reservasFiltradas.value.length / itemsPerPage))

const reservasPaginadas = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage
    const end = start + itemsPerPage
    return reservasFiltradas.value.slice(start, end)
})

// Limpiar filtros
const limpiarFiltros = () => {
    filtroEstado.value = ''
    filtroDni.value = ''
    filtroVehiculo.value = ''
    currentPage.value = 1
}

// Cambiar estado de reserva
const cambiarEstado = async (reserva, nuevoEstado) => {
    const mensajes = {
        confirmada: '¿Confirmar esta reserva?',
        cancelada: '¿Cancelar esta reserva? El vehículo volverá a estar disponible.',
        completada: '¿Marcar como completada? El vehículo se marcará como vendido.'
    }
    
    const result = await Swal.fire({
        title: mensajes[nuevoEstado],
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí',
        cancelButtonText: 'No'
    })
    
    if (!result.isConfirmed) return
    
    try {
        await axios.put(`/api/reservas/${reserva._id}`, { estado: nuevoEstado })
        await cargarReservas()
        
        Swal.fire({
            icon: 'success',
            title: 'Estado actualizado',
            timer: 1500,
            showConfirmButton: false
        })
    } catch (error) {
        console.error('Error al cambiar estado:', error)
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo actualizar el estado'
        })
    }
}

// Ver detalles
const verDetalles = (reserva) => {
    reservaSeleccionada.value = reserva
}

// Utilidades
const formatPrecio = (precio) => {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR'
    }).format(precio || 0)
}

const formatFecha = (fecha) => {
    if (!fecha) return 'N/A'
    return new Date(fecha).toLocaleDateString('es-ES')
}

const formatFechaCompleta = (fecha) => {
    if (!fecha) return 'N/A'
    return new Date(fecha).toLocaleString('es-ES')
}

const estaExpirada = (reserva) => {
    return new Date(reserva.fechaExpiracion) < new Date() && reserva.estado === 'pendiente'
}

const getEstadoClass = (estado) => {
    const clases = {
        pendiente: 'bg-warning text-dark',
        confirmada: 'bg-success',
        cancelada: 'bg-danger',
        expirada: 'bg-secondary',
        completada: 'bg-primary'
    }
    return clases[estado] || 'bg-secondary'
}
</script>

<style scoped>
.modal-backdrop-custom {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1050;
}

.form-switch .form-check-input:checked {
    background-color: #198754;
    border-color: #198754;
}
</style>
