<template>
    <div class="modal-backdrop-custom show" @click.self="$emit('close')">
        <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content">
                <!-- Header -->
                <div class="modal-header bg-primary text-white">
                    <h5 class="modal-title">
                        <i class="bi bi-car-front-fill"></i>
                        {{ item.marca }} {{ item.modelo }}
                    </h5>
                    <button type="button" class="btn-close btn-close-white" @click="$emit('close')"></button>
                </div>

                <!-- Body -->
                <div class="modal-body">
                    <div class="row">
                        <!-- Imagen -->
                        <div class="col-md-6">
                            <img 
                                :src="item.imagen ? `/uploads/${item.imagen}` : '/placeholder-car.png'" 
                                class="img-fluid rounded shadow-sm mb-3"
                                style="width:100%; max-height:400px; object-fit:cover;"
                                @error="e => e.target.src = '/placeholder-car.png'"
                            >
                        </div>

                        <!-- Detalles -->
                        <div class="col-md-6">
                            <div class="mb-3">
                                <h3 class="text-success">{{ formatPrecio(item.precio) }}</h3>
                                <span v-if="item.tipo" class="badge bg-primary me-2">{{ item.tipo }}</span>
                                <span class="badge bg-success">{{ item.estado || 'Disponible' }}</span>
                            </div>

                            <div class="info-section">
                                <h6 class="text-primary mb-3">
                                    <i class="bi bi-info-circle"></i> Información General
                                </h6>
                                
                                <div class="info-item">
                                    <i class="bi bi-hash text-muted"></i>
                                    <strong>Matrícula:</strong>
                                    <span>{{ item.matricula || 'N/A' }}</span>
                                </div>

                                <div class="info-item">
                                    <i class="bi bi-calendar3 text-muted"></i>
                                    <strong>Año:</strong>
                                    <span>{{ item.anio }}</span>
                                </div>

                                <div class="info-item">
                                    <i class="bi bi-speedometer2 text-muted"></i>
                                    <strong>Kilómetros:</strong>
                                    <span>{{ formatKm(item.kilometros) }}</span>
                                </div>

                                <div class="info-item">
                                    <i class="bi bi-box-seam text-muted"></i>
                                    <strong>Stock:</strong>
                                    <span :class="item.stock > 0 ? 'text-success' : 'text-danger'">
                                        {{ item.stock > 0 ? `${item.stock} ${item.stock === 1 ? 'unidad' : 'unidades'}` : 'Sin stock' }}
                                    </span>
                                </div>

                                <div class="info-item">
                                    <i class="bi bi-flag text-muted"></i>
                                    <strong>Estado:</strong>
                                    <span 
                                        :class="{
                                            'text-success': item.stock > 2,
                                            'text-warning': item.stock > 0 && item.stock <= 2,
                                            'text-danger': !item.stock || item.stock === 0
                                        }"
                                    >
                                        {{ getEstadoTexto(item) }}
                                    </span>
                                </div>

                                <div v-if="item.combustible" class="info-item">
                                    <i class="bi bi-fuel-pump text-muted"></i>
                                    <strong>Combustible:</strong>
                                    <span>{{ item.combustible }}</span>
                                </div>

                                <div v-if="item.transmision" class="info-item">
                                    <i class="bi bi-gear text-muted"></i>
                                    <strong>Transmisión:</strong>
                                    <span>{{ item.transmision }}</span>
                                </div>

                                <div v-if="item.color" class="info-item">
                                    <i class="bi bi-palette text-muted"></i>
                                    <strong>Color:</strong>
                                    <span>{{ item.color }}</span>
                                </div>

                                <div v-if="item.potencia" class="info-item">
                                    <i class="bi bi-lightning text-muted"></i>
                                    <strong>Potencia:</strong>
                                    <span>{{ item.potencia }} CV</span>
                                </div>
                            </div>

                            <!-- Ubicación -->
                            <div v-if="item.ubicacion" class="info-section mt-3">
                                <h6 class="text-primary mb-3">
                                    <i class="bi bi-geo-alt"></i> Ubicación
                                </h6>
                                <p class="mb-1">
                                    <i class="bi bi-building text-muted"></i>
                                    {{ item.ubicacion.ciudad }}, {{ item.ubicacion.provincia }}
                                </p>
                                <p v-if="item.ubicacion.direccion" class="text-muted small mb-0">
                                    {{ item.ubicacion.direccion }}
                                </p>
                            </div>

                            <!-- Contacto -->
                            <div v-if="item.contacto" class="info-section mt-3">
                                <h6 class="text-primary mb-3">
                                    <i class="bi bi-person-lines-fill"></i> Contacto
                                </h6>
                                <p v-if="item.contacto.nombre" class="mb-1">
                                    <i class="bi bi-person text-muted"></i>
                                    {{ item.contacto.nombre }}
                                </p>
                                <p v-if="item.contacto.telefono" class="mb-1">
                                    <i class="bi bi-telephone text-muted"></i>
                                    <a :href="`tel:${item.contacto.telefono}`">{{ item.contacto.telefono }}</a>
                                </p>
                                <p v-if="item.contacto.email" class="mb-0">
                                    <i class="bi bi-envelope text-muted"></i>
                                    <a :href="`mailto:${item.contacto.email}`">{{ item.contacto.email }}</a>
                                </p>
                            </div>

                            <!-- Descripción -->
                            <div v-if="item.descripcion" class="info-section mt-3">
                                <h6 class="text-primary mb-2">
                                    <i class="bi bi-card-text"></i> Descripción
                                </h6>
                                <p class="text-muted">{{ item.descripcion }}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" @click="$emit('close')">
                        <i class="bi bi-x-circle"></i> Cerrar
                    </button>
                    <button 
                        type="button" 
                        class="btn btn-success" 
                        @click="add"
                        :disabled="!item.stock || item.stock === 0"
                    >
                        <i class="bi bi-cart-plus"></i> 
                        {{ item.stock && item.stock > 0 ? 'Añadir a la cesta' : 'Sin stock' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({ item: Object })
const emit = defineEmits(['close', 'add'])

function add() { 
    emit('add', props.item)
}

function formatPrecio(precio) {
    if (!precio) return 'Consultar'
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR'
    }).format(precio)
}

function formatKm(km) {
    if (!km) return '0 km'
    return new Intl.NumberFormat('es-ES').format(km) + ' km'
}

function getEstadoTexto(item) {
    if (!item.stock || item.stock === 0) {
        return 'VENDIDO'
    } else if (item.stock <= 2) {
        return 'A PEDIDO'
    } else {
        return 'DISPONIBLE'
    }
}
</script>

<style scoped>
.modal-backdrop-custom {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1050;
    backdrop-filter: blur(3px);
}

.modal-dialog {
    max-width: 900px;
    margin: 1rem;
}

.modal-content {
    border: none;
    border-radius: 15px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.modal-header {
    border-top-left-radius: 15px;
    border-top-right-radius: 15px;
    border-bottom: none;
}

.info-section {
    background-color: #f8f9fa;
    padding: 1rem;
    border-radius: 10px;
}

.info-item {
    display: flex;
    align-items: center;
    padding: 0.5rem 0;
    border-bottom: 1px solid #dee2e6;
}

.info-item:last-child {
    border-bottom: none;
}

.info-item i {
    width: 25px;
    margin-right: 0.5rem;
}

.info-item strong {
    min-width: 120px;
    margin-right: 0.5rem;
}

.info-item span {
    color: #495057;
}

.modal-footer {
    border-top: 1px solid #dee2e6;
    padding: 1rem 1.5rem;
}

a {
    color: #0d6efd;
    text-decoration: none;
}

a:hover {
    text-decoration: underline;
}
</style>