<template>
    <div class="container my-5">
        <div class="row mb-4">
            <div class="col-md-12">
                <h1 class="text-primary"><i class="bi bi-cart-check-fill"></i> Catálogo de Vehículos</h1>
                <p class="text-muted">Descubre nuestro catálogo de vehículos disponibles para la venta</p>
            </div>
        </div>

        <!-- Filtros -->
        <div class="row mb-4">
            <div class="col-md-3">
                <input v-model="filtroMarca" class="form-control" placeholder="Buscar por marca...">
            </div>
            <div class="col-md-3">
                <select v-model="filtroTipo" class="form-select">
                    <option value="">Todos los tipos</option>
                    <option value="coche">Coche</option>
                    <option value="moto">Moto</option>
                    <option value="furgoneta">Furgoneta</option>
                </select>
            </div>
            <div class="col-md-3">
                <select v-model="ordenar" class="form-select">
                    <option value="">Ordenar por...</option>
                    <option value="precio-asc">Precio: Menor a Mayor</option>
                    <option value="precio-desc">Precio: Mayor a Menor</option>
                    <option value="anio-desc">Más nuevos</option>
                    <option value="km-asc">Menos kilómetros</option>
                </select>
            </div>
            <div class="col-md-3 text-end">
                <router-link to="/cart" class="btn btn-primary">
                    <i class="bi bi-cart3"></i> Cesta ({{ cartCount }})
                </router-link>
            </div>
        </div>

        <!-- Loading -->
        <div v-if="cargando" class="text-center my-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
        </div>

        <!-- Cards de productos -->
        <div v-else class="row">
            <div v-if="itemsFiltrados.length === 0" class="col-12">
                <div class="alert alert-info text-center">
                    <i class="bi bi-info-circle"></i> No se encontraron vehículos con los filtros seleccionados
                </div>
            </div>
            <div v-for="item in itemsFiltrados" :key="item._id" class="col-lg-4 col-md-6 mb-4">
                <div class="card h-100 shadow-sm product-card">
                    <!-- Imagen -->
                    <div class="position-relative">
                        <img 
                            :src="item.imagen ? `/uploads/${item.imagen}` : '/placeholder-car.png'" 
                            class="card-img-top" 
                            style="height:220px;object-fit:cover;cursor:pointer;"
                            @click="abrirModal(item)"
                            @error="e => e.target.src = '/placeholder-car.png'"
                        >
                        <span class="badge bg-success position-absolute top-0 end-0 m-2">
                            {{ item.estado || 'Disponible' }}
                        </span>
                        <span v-if="item.tipo" class="badge bg-primary position-absolute top-0 start-0 m-2">
                            {{ item.tipo }}
                        </span>
                    </div>
                    
                    <!-- Contenido -->
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title text-primary">{{ item.marca }} {{ item.modelo }}</h5>
                        
                        <div class="mb-2">
                            <span class="badge bg-secondary me-1">
                                <i class="bi bi-calendar3"></i> {{ item.anio }}
                            </span>
                            <span class="badge bg-secondary">
                                <i class="bi bi-speedometer2"></i> {{ formatKm(item.kilometros) }}
                            </span>
                        </div>

                        <div class="text-muted small mb-3">
                            <div v-if="item.combustible">
                                <i class="bi bi-fuel-pump"></i> {{ item.combustible }}
                            </div>
                            <div v-if="item.transmision">
                                <i class="bi bi-gear"></i> {{ item.transmision }}
                            </div>
                            <div v-if="item.ubicacion">
                                <i class="bi bi-geo-alt"></i> {{ item.ubicacion.ciudad }}, {{ item.ubicacion.provincia }}
                            </div>
                        </div>

                        <div class="mt-auto">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <h4 class="text-success mb-0">{{ formatPrecio(item.precio) }}</h4>
                            </div>
                            
                            <div class="d-grid gap-2">
                                <button class="btn btn-outline-primary" @click="abrirModal(item)">
                                    <i class="bi bi-eye"></i> Ver detalles
                                </button>
                                <button class="btn btn-success" @click="agregarCarrito(item)">
                                    <i class="bi bi-cart-plus"></i> Añadir a la cesta
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal de detalles -->
        <ProductoModal 
            v-if="modalItem" 
            :item="modalItem" 
            @close="modalItem = null" 
            @add="agregarCarrito" 
        />
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'
import ProductoModal from './ProductoModal.vue'

const items = ref([])
const modalItem = ref(null)
const cargando = ref(true)
const filtroMarca = ref('')
const filtroTipo = ref('')
const ordenar = ref('')
const cartCount = ref(0)

// Cargar vehículos
const cargarVehiculos = async () => {
    cargando.value = true
    try {
        const res = await axios.get('/api/articulos')
        // Filtrar solo vehículos disponibles para venta
        items.value = res.data.filter(v => v.estado === 'disponible' || !v.estado)
    } catch (error) {
        console.error('Error cargando vehículos:', error)
        Swal.fire('Error', 'No se pudieron cargar los vehículos', 'error')
    } finally {
        cargando.value = false
    }
}

// Filtrar y ordenar vehículos
const itemsFiltrados = computed(() => {
    let resultado = [...items.value]

    // Filtrar por marca
    if (filtroMarca.value) {
        resultado = resultado.filter(v => 
            v.marca && v.marca.toLowerCase().includes(filtroMarca.value.toLowerCase())
        )
    }

    // Filtrar por tipo
    if (filtroTipo.value) {
        resultado = resultado.filter(v => v.tipo === filtroTipo.value)
    }

    // Ordenar
    if (ordenar.value === 'precio-asc') {
        resultado.sort((a, b) => (a.precio || 0) - (b.precio || 0))
    } else if (ordenar.value === 'precio-desc') {
        resultado.sort((a, b) => (b.precio || 0) - (a.precio || 0))
    } else if (ordenar.value === 'anio-desc') {
        resultado.sort((a, b) => (b.anio || 0) - (a.anio || 0))
    } else if (ordenar.value === 'km-asc') {
        resultado.sort((a, b) => (a.kilometros || 0) - (b.kilometros || 0))
    }

    return resultado
})

// Formatear precio
function formatPrecio(precio) {
    if (!precio) return 'Consultar'
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR'
    }).format(precio)
}

// Formatear kilómetros
function formatKm(km) {
    if (!km) return '0 km'
    return new Intl.NumberFormat('es-ES').format(km) + ' km'
}

// Abrir modal
function abrirModal(item) {
    modalItem.value = item
}

// Agregar al carrito
function agregarCarrito(item) {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    
    // Verificar si ya está en el carrito
    const existe = cart.find(c => c.id === item._id)
    if (existe) {
        Swal.fire({
            icon: 'info',
            title: 'Ya en la cesta',
            text: 'Este vehículo ya está en tu cesta',
            timer: 2000
        })
        return
    }

    cart.push({
        id: item._id,
        matricula: item.matricula,
        marca: item.marca,
        modelo: item.modelo,
        anio: item.anio,
        kilometros: item.kilometros,
        precio: item.precio,
        imagen: item.imagen,
        tipo: item.tipo
    })
    
    localStorage.setItem('cart', JSON.stringify(cart))
    actualizarContadorCarrito()
    
    Swal.fire({
        icon: 'success',
        title: '¡Añadido!',
        text: `${item.marca} ${item.modelo} añadido a la cesta`,
        timer: 2000,
        showConfirmButton: false
    })

    // Cerrar modal si está abierto
    if (modalItem.value) {
        modalItem.value = null
    }
}

// Actualizar contador del carrito
function actualizarContadorCarrito() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    cartCount.value = cart.length
}

onMounted(() => {
    cargarVehiculos()
    actualizarContadorCarrito()
})
</script>

<style scoped>
.product-card {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.product-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15) !important;
}

.card-img-top {
    transition: transform 0.3s ease;
}

.product-card:hover .card-img-top {
    transform: scale(1.05);
}

.card-title {
    font-weight: 600;
    font-size: 1.1rem;
}

h1 {
    font-weight: 700;
}

.badge {
    font-size: 0.85rem;
}
</style>