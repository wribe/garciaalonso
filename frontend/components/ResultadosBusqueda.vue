<template>
  <div class="container my-5">
    <div class="row">
      <div class="col-12">
        <div class="d-flex align-items-center mb-4">
          <button @click="$router.back()" class="btn btn-outline-secondary me-3">
            <i class="bi bi-arrow-left"></i> Volver
          </button>
          <h2 class="mb-0">
            <i class="bi bi-search"></i> Resultados de búsqueda
            <span class="text-muted fs-5" v-if="searchTerm"> para "{{ searchTerm }}"</span>
          </h2>
        </div>

        <!-- Indicador de carga -->
        <div v-if="searching" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Buscando...</span>
          </div>
          <p class="mt-3 text-muted">Buscando...</p>
        </div>

        <!-- Sin resultados -->
        <div v-else-if="!searching && totalResults === 0" class="alert alert-info text-center py-5">
          <i class="bi bi-search" style="font-size: 3rem;"></i>
          <h4 class="mt-3">No se encontraron resultados</h4>
          <p class="text-muted">Intenta con otros términos de búsqueda</p>
        </div>

        <!-- Resultados -->
        <div v-else>
          <p class="text-muted mb-4">
            Se encontraron <strong>{{ totalResults }}</strong> resultados
          </p>

          <!-- Clientes -->
          <div v-if="clientesResults.length > 0" class="mb-5">
            <h4 class="border-bottom pb-2 mb-3">
              <i class="bi bi-people-fill text-primary"></i> Clientes ({{ clientesResults.length }})
            </h4>
            <div class="row g-3">
              <div v-for="cliente in clientesResults" :key="cliente.id" class="col-md-6 col-lg-4">
                <div class="card h-100 shadow-sm hover-shadow">
                  <div class="card-body">
                    <div class="d-flex align-items-start">
                      <i class="bi bi-person-circle text-primary fs-2 me-3"></i>
                      <div class="flex-grow-1">
                        <h5 class="card-title mb-1">{{ cliente.nombre }} {{ cliente.apellidos }}</h5>
                        <p class="card-text small text-muted mb-2">
                          <i class="bi bi-credit-card"></i> {{ cliente.dni }}<br>
                          <i class="bi bi-telephone"></i> {{ cliente.movil }}<br>
                          <i class="bi bi-envelope"></i> {{ cliente.email }}
                        </p>
                        <router-link to="/clientes" class="btn btn-sm btn-outline-primary">
                          Ver detalles <i class="bi bi-arrow-right"></i>
                        </router-link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Noticias -->
          <div v-if="noticiasResults.length > 0" class="mb-5">
            <h4 class="border-bottom pb-2 mb-3">
              <i class="bi bi-newspaper text-info"></i> Noticias ({{ noticiasResults.length }})
            </h4>
            <div class="row g-3">
              <div v-for="noticia in noticiasResults" :key="noticia.id" class="col-md-6 col-lg-4">
                <div class="card h-100 shadow-sm hover-shadow">
                  <div class="card-body">
                    <div class="d-flex align-items-start">
                      <i class="bi bi-newspaper text-info fs-2 me-3"></i>
                      <div class="flex-grow-1">
                        <h5 class="card-title mb-2">{{ noticia.titulo }}</h5>
                        <p class="card-text small text-muted mb-2">
                          {{ noticia.descripcion ? noticia.descripcion.substring(0, 100) + '...' : '' }}
                        </p>
                        <p class="small text-muted mb-2">
                          <i class="bi bi-calendar"></i> {{ formatearFecha(noticia.fecha) }}
                        </p>
                        <router-link to="/noticias" class="btn btn-sm btn-outline-info">
                          Leer más <i class="bi bi-arrow-right"></i>
                        </router-link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Modelos -->
          <div v-if="modelosResults.length > 0" class="mb-5">
            <h4 class="border-bottom pb-2 mb-3">
              <i class="bi bi-diagram-3-fill text-secondary"></i> Modelos ({{ modelosResults.length }})
            </h4>
            <div class="row g-3">
              <div v-for="modelo in modelosResults" :key="modelo._id" class="col-md-6 col-lg-4">
                <div class="card h-100 shadow-sm hover-shadow">
                  <div class="card-body">
                    <div class="d-flex align-items-start">
                      <i class="bi bi-diagram-3 text-secondary fs-2 me-3"></i>
                      <div class="flex-grow-1">
                        <h5 class="card-title mb-2">{{ modelo.marca }} {{ modelo.nombre }}</h5>
                        <p class="card-text small text-muted mb-2">
                          <span class="badge bg-secondary">{{ modelo.tipo }}</span>
                        </p>
                        <p class="small text-muted mb-2">
                          {{ modelo.descripcion ? modelo.descripcion.substring(0, 100) + '...' : '' }}
                        </p>
                        <router-link to="/modelos" class="btn btn-sm btn-outline-secondary">
                          Ver detalles <i class="bi bi-arrow-right"></i>
                        </router-link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Vehículos -->
          <div v-if="vehiculosResults.length > 0" class="mb-5">
            <h4 class="border-bottom pb-2 mb-3">
              <i class="bi bi-car-front-fill text-success"></i> Vehículos Disponibles ({{ vehiculosResults.length }})
            </h4>
            <div class="row g-3">
              <div v-for="vehiculo in vehiculosResults" :key="vehiculo._id" class="col-md-6 col-lg-4">
                <div class="card h-100 shadow-sm hover-shadow">
                  <img v-if="vehiculo.imagen" :src="getImageUrl(vehiculo.imagen)" class="card-img-top" 
                       style="height: 200px; object-fit: cover;" alt="Imagen vehículo">
                  <div class="card-body">
                    <h5 class="card-title mb-2">{{ vehiculo.marca }} {{ vehiculo.modelo }}</h5>
                    <p class="card-text small mb-2">
                      <span class="badge bg-success">{{ vehiculo.tipo }}</span>
                      <span class="badge bg-secondary ms-1">{{ vehiculo.anio }}</span>
                    </p>
                    <p class="card-text small text-muted mb-2">
                      <i class="bi bi-fuel-pump"></i> {{ vehiculo.combustible }}<br>
                      <i class="bi bi-speedometer"></i> {{ vehiculo.kilometros }} km<br>
                      <i class="bi bi-geo-alt"></i> {{ vehiculo.ubicacion?.ciudad }}
                    </p>
                    <p class="h5 text-success mb-3">{{ vehiculo.precio }}€</p>
                    <router-link to="/ventas" class="btn btn-sm btn-success">
                      Ver detalles <i class="bi bi-arrow-right"></i>
                    </router-link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Citas -->
          <div v-if="citasResults.length > 0" class="mb-5">
            <h4 class="border-bottom pb-2 mb-3">
              <i class="bi bi-calendar-check-fill text-warning"></i> Citas del Taller ({{ citasResults.length }})
            </h4>
            <div class="row g-3">
              <div v-for="cita in citasResults" :key="cita._id" class="col-md-6 col-lg-4">
                <div class="card h-100 shadow-sm hover-shadow">
                  <div class="card-body">
                    <div class="d-flex align-items-start">
                      <i class="bi bi-calendar-check text-warning fs-2 me-3"></i>
                      <div class="flex-grow-1">
                        <h5 class="card-title mb-2">{{ cita.nombre_cliente }}</h5>
                        <p class="card-text small text-muted mb-2">
                          <i class="bi bi-car-front"></i> {{ cita.matricula }}<br>
                          <i class="bi bi-tools"></i> {{ cita.servicio_taller }}<br>
                          <i class="bi bi-telephone"></i> {{ cita.movil_cliente }}
                        </p>
                        <span class="badge" :class="getBadgeClass(cita.estado_cita)">
                          {{ cita.estado_cita }}
                        </span>
                        <router-link to="/citas" class="btn btn-sm btn-outline-warning mt-2">
                          Ver detalles <i class="bi bi-arrow-right"></i>
                        </router-link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import { checkAdmin } from '@/api/authApi.js'

const route = useRoute()
const searchTerm = ref('')
const searching = ref(true)
const searchResults = ref([])
const isAdmin = ref(false)

// Resultados filtrados por tipo
const clientesResults = computed(() => searchResults.value.filter(r => r._type === 'cliente'))
const noticiasResults = computed(() => searchResults.value.filter(r => r._type === 'noticia'))
const modelosResults = computed(() => searchResults.value.filter(r => r._type === 'modelo'))
const vehiculosResults = computed(() => searchResults.value.filter(r => r._type === 'vehiculo'))
const citasResults = computed(() => searchResults.value.filter(r => r._type === 'cita'))

const totalResults = computed(() => searchResults.value.length)

onMounted(async () => {
  searchTerm.value = route.query.q || ''
  
  // Verificar si es admin
  const adminCheck = await checkAdmin()
  isAdmin.value = adminCheck.isAdmin
  
  if (searchTerm.value) {
    await performSearch()
  } else {
    searching.value = false
  }
})

async function performSearch() {
  searchResults.value = []
  searching.value = true

  const term = searchTerm.value.trim().toLowerCase()
  const token = sessionStorage.getItem('token')

  // 1. Buscar en CLIENTES (solo si es admin)
  if (token && isAdmin.value) {
    try {
      const r1 = await axios.get('/api/clientes-json', { 
        params: { q: searchTerm.value, page: 1, limit: 100 }, 
        headers: { Authorization: `Bearer ${token}` } 
      })
      if (r1.data && r1.data.data) {
        searchResults.value.push(...r1.data.data.map(x => ({ ...x, _type: 'cliente' })))
      }
    } catch (error) {
      console.error('Error buscando clientes:', error)
    }
  }

  // 2. Buscar en NOTICIAS
  try {
    const r2 = await axios.get('/api/noticias')
    if (r2.data) {
      const filtered = r2.data.filter(noticia => {
        return (
          (noticia.titulo && noticia.titulo.toLowerCase().includes(term)) ||
          (noticia.contenido && noticia.contenido.toLowerCase().includes(term)) ||
          (noticia.descripcion && noticia.descripcion.toLowerCase().includes(term))
        )
      })
      searchResults.value.push(...filtered.map(x => ({ ...x, _type: 'noticia' })))
    }
  } catch (error) {
    console.error('Error buscando noticias:', error)
  }

  // 3. Buscar en MODELOS (solo si es admin)
  if (isAdmin.value) {
    try {
      const r3 = await axios.get('/api/modelos')
      if (r3.data) {
        const filtered = r3.data.filter(modelo => {
          return (
            (modelo.nombre && modelo.nombre.toLowerCase().includes(term)) ||
            (modelo.marca && modelo.marca.toLowerCase().includes(term)) ||
            (modelo.descripcion && modelo.descripcion.toLowerCase().includes(term)) ||
            (modelo.tipo && modelo.tipo.toLowerCase().includes(term))
          )
        })
        searchResults.value.push(...filtered.map(x => ({ ...x, _type: 'modelo' })))
      }
    } catch (error) {
      console.error('Error buscando modelos:', error)
    }
  }

  // 4. Buscar en ARTÍCULOS/VEHÍCULOS
  try {
    const r4 = await axios.get('/api/articulos')
    if (r4.data) {
      const filtered = r4.data.filter(art => {
        const stockDisponible = art.stock && art.stock > 0
        return stockDisponible && (
          (art.matricula && art.matricula.toLowerCase().includes(term)) ||
          (art.marca && art.marca.toLowerCase().includes(term)) ||
          (art.modelo && art.modelo.toLowerCase().includes(term)) ||
          (art.tipo && art.tipo.toLowerCase().includes(term)) ||
          (art.combustible && art.combustible.toLowerCase().includes(term)) ||
          (art.descripcion && art.descripcion.toLowerCase().includes(term)) ||
          (art.ubicacion && art.ubicacion.ciudad && art.ubicacion.ciudad.toLowerCase().includes(term)) ||
          (art.ubicacion && art.ubicacion.provincia && art.ubicacion.provincia.toLowerCase().includes(term))
        )
      })
      searchResults.value.push(...filtered.map(x => ({ ...x, _type: 'vehiculo' })))
    }
  } catch (error) {
    console.error('Error buscando vehículos:', error)
  }

  // 5. Buscar en CITAS (solo si es admin)
  if (token && isAdmin.value) {
    try {
      const r5 = await axios.get('/api/taller/citas')
      if (r5.data) {
        const filtered = r5.data.filter(cita => {
          return (
            (cita.matricula && cita.matricula.toLowerCase().includes(term)) ||
            (cita.nombre_cliente && cita.nombre_cliente.toLowerCase().includes(term)) ||
            (cita.movil_cliente && cita.movil_cliente.toLowerCase().includes(term)) ||
            (cita.servicio_taller && cita.servicio_taller.toLowerCase().includes(term)) ||
            (cita.estado_cita && cita.estado_cita.toLowerCase().includes(term))
          )
        })
        searchResults.value.push(...filtered.map(x => ({ ...x, _type: 'cita' })))
      }
    } catch (error) {
      console.error('Error buscando citas:', error)
    }
  }

  searching.value = false
}

function getImageUrl(imagen) {
  if (!imagen) return '/placeholder.jpg'
  if (imagen.startsWith('http')) return imagen
  return `http://localhost:5000${imagen}`
}

function formatearFecha(fecha) {
  if (!fecha) return ''
  const date = new Date(fecha)
  return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
}

function getBadgeClass(estado) {
  const estados = {
    'pendiente': 'bg-warning',
    'confirmada': 'bg-info',
    'completada': 'bg-success',
    'cancelada': 'bg-danger'
  }
  return estados[estado?.toLowerCase()] || 'bg-secondary'
}
</script>

<style scoped>
.hover-shadow {
  transition: transform 0.2s, box-shadow 0.2s;
}

.hover-shadow:hover {
  transform: translateY(-5px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}

.card-img-top {
  border-bottom: 1px solid #dee2e6;
}
</style>
