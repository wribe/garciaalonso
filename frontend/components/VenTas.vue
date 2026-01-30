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
                        <span v-if="item.tipo" class="badge bg-primary position-absolute top-0 start-0 m-2">
                            {{ item.tipo }}
                        </span>
                        <span 
                            :class="getEstadoBadgeClass(item)"
                            class="badge position-absolute top-0 end-0 m-2"
                        >
                            {{ getEstadoTexto(item) }}
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
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <h4 class="text-success mb-0">{{ formatPrecio(item.precio) }}</h4>
                            </div>
                            
                            <div v-if="item.stock > 0" class="text-muted small mb-2">
                                <i class="bi bi-box-seam"></i> Stock: {{ item.stock }} {{ item.stock === 1 ? 'unidad' : 'unidades' }}
                            </div>
                            
                            <div class="d-grid gap-2">
                                <button class="btn btn-outline-primary" @click="abrirModal(item)">
                                    <i class="bi bi-eye"></i> Ver detalles
                                </button>
                                <button 
                                    class="btn btn-success" 
                                    @click="agregarCarrito(item)"
                                    :disabled="!item.stock || item.stock === 0"
                                >
                                    <i class="bi bi-cart-plus"></i> 
                                    {{ item.stock && item.stock > 0 ? 'Añadir a la cesta' : 'Sin stock' }}
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
import { ref, computed, onMounted, onBeforeUnmount, onUnmounted } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'
import ProductoModal from './ProductoModal.vue'
import { getCart, saveCart, migrateOldCart, getCartCount } from '@/utils/cartUtils.js'

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
        // Filtrar solo vehículos disponibles para venta (excluir vendidos y reservados)
        items.value = res.data.filter(v => {
            const estado = v.estado || 'disponible'
            const stock = v.stock || 0
            // Mostrar si tiene stock disponible, independientemente del estado
            return stock > 0 && estado !== 'vendido' && estado !== 'reservado'
        })
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
    // Verificar stock disponible
    if (!item.stock || item.stock === 0) {
        Swal.fire({
            icon: 'error',
            title: 'Sin stock',
            text: 'Este vehículo no está disponible actualmente',
            timer: 2000
        })
        return
    }

    const cart = getCart()
    
    // Verificar si ya está en el carrito
    const existente = cart.find(c => c.id === item._id)
    
    // Calcular cantidad total que se tendría en el carrito
    const cantidadEnCarrito = existente ? existente.cantidad : 0
    
    if (cantidadEnCarrito >= item.stock) {
        Swal.fire({
            icon: 'warning',
            title: 'Stock insuficiente',
            text: `Solo hay ${item.stock} ${item.stock === 1 ? 'unidad disponible' : 'unidades disponibles'} de este vehículo`,
            timer: 2500
        })
        return
    }
    
    if (existente) {
        // Si ya existe, incrementar la cantidad
        existente.cantidad++
        Swal.fire({
            icon: 'success',
            title: '¡Cantidad actualizada!',
            text: `Ahora tienes ${existente.cantidad} unidades de ${item.marca} ${item.modelo}`,
            timer: 2000,
            showConfirmButton: false
        })
    } else {
        // Si no existe, agregarlo con cantidad 1
        cart.push({
            id: item._id,
            matricula: item.matricula,
            marca: item.marca,
            modelo: item.modelo,
            anio: item.anio,
            kilometros: item.kilometros,
            precio: item.precio,
            imagen: item.imagen,
            tipo: item.tipo,
            cantidad: 1,
            stockDisponible: item.stock // Guardar el stock disponible
        })
        
        Swal.fire({
            icon: 'success',
            title: '¡Añadido!',
            text: `${item.marca} ${item.modelo} añadido a la cesta`,
            timer: 2000,
            showConfirmButton: false
        })
    }
    
    saveCart(cart)
    actualizarContadorCarrito()
    
    // Disparar evento para actualizar el contador en NavBar
    window.dispatchEvent(new Event('cartUpdated'))

    // Cerrar modal si está abierto
    if (modalItem.value) {
        modalItem.value = null
    }
}

// Actualizar contador del carrito
function actualizarContadorCarrito() {
    cartCount.value = getCartCount()
}

// Obtener texto del estado según el stock
function getEstadoTexto(item) {
    if (!item.stock || item.stock === 0) {
        return 'VENDIDO'
    } else if (item.stock <= 2) {
        return 'A PEDIDO'
    } else {
        return 'DISPONIBLE'
    }
}

// Obtener clase CSS del badge según el estado
function getEstadoBadgeClass(item) {
    if (!item.stock || item.stock === 0) {
        return 'bg-danger'
    } else if (item.stock <= 2) {
        return 'bg-warning text-dark'
    } else {
        return 'bg-success'
    }
}

onMounted(() => {
    migrateOldCart() // Migrar carrito antiguo si existe
    cargarVehiculos()
    actualizarContadorCarrito()
    
    // Escuchar evento de actualización de stock
    window.addEventListener('stockUpdated', cargarVehiculos)
    
    // Escuchar evento de actualización de carrito
    window.addEventListener('cartUpdated', actualizarContadorCarrito)
})

onUnmounted(() => {
    // Limpiar el listener al desmontar el componente
    window.removeEventListener('stockUpdated', cargarVehiculos)
    window.removeEventListener('cartUpdated', actualizarContadorCarrito)
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