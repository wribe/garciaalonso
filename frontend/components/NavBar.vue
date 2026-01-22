<template>
  <nav class="navbar navbar-dark bg-primary sticky-top navbar-expand-lg">
    <div class="container-fluid">
      <!-- Marca o logo -->
      <img src="../assets/logoEmpresaTeis.svg" width="50" height="50" />
      <a class="navbar-brand" href="#">EmpresaTeis</a>

      <!-- Botón de hamburguesa en pantallas pequeñas -->
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
        aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- Links de navegación -->
      <div class="collapse navbar-collapse justify-content-center" id="navbarNav">
        <ul class="navbar-nav d-flex justify-content-center w-100 me-5">
          <li class="nav-item">
            <router-link to="/" class="nav-link">Inicio</router-link>
          </li>
          <li v-if="isAdmin" class="nav-item">
            <router-link to="/clientes" class="nav-link">Clientes</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/noticias" class="nav-link">Noticias</router-link>
          </li>
          <li v-if="isAdmin" class="nav-item">
            <router-link to="/modelos" class="nav-link">Modelos</router-link>
          </li>
          <li v-if="isAdmin" class="nav-item">
            <router-link to="/ventas" class="nav-link">Ventas</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/contacto" class="nav-link">Contacto</router-link>
          </li>
          <li v-if="isAdmin" class="nav-item">
            <router-link to="/citas" class="nav-link">Citas</router-link>
          </li>
        </ul>
        <!-- Dropdown de acceso/registro -->
        <div class="dropdown ms-auto">
          <button class="btn btn-primary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
            <i class="bi bi-person fs-2"></i>
          </button>
          <ul class="dropdown-menu dropdown-menu-end">
            <!-- Mostra “Acceso/Registro” se NON hai usuario logueado -->
            <li v-if="!isLogueado"><router-link class="dropdown-item" to="/login">Acceso</router-link></li>
            <li v-if="!isLogueado"><router-link class="dropdown-item" to="/clientes">Registro</router-link></li>
            <!-- Mostra “Cerrar Sesión” se está logueado -->
            <li v-if="isLogueado">
              <router-link class="dropdown-item" to="/clientes">Perfil</router-link>
              <a class="dropdown-item" href="#" @click.prevent="logout">Cerrar Sesión</a>
            </li>
          </ul>
        </div>
      </div>

      <div class="d-flex ms-auto align-items-center position-relative">
        <!-- Buscador con resultados desplegables -->
        <div class="search-container position-relative me-2">
          <div class="input-group input-group-sm">
            <input 
              v-model="q" 
              @keyup="handleSearch" 
              @focus="showDropdown = true"
              class="form-control" 
              placeholder="Buscar en toda la web..."
              style="width:280px;"
            >
            <button class="btn btn-light" @click="handleSearch" type="button">
              <i class="bi bi-search"></i>
            </button>
          </div>
          
          <!-- Dropdown de resultados -->
          <div v-if="showDropdown && (searching || searchResults.length > 0 || (searched && searchResults.length === 0))" 
               class="search-results-dropdown">
            <!-- Loading -->
            <div v-if="searching" class="p-3 text-center">
              <div class="spinner-border spinner-border-sm text-primary" role="status">
                <span class="visually-hidden">Buscando...</span>
              </div>
              <div class="small text-muted mt-2">Buscando...</div>
            </div>
            
            <!-- Sin resultados -->
            <div v-else-if="searched && searchResults.length === 0" class="p-3 text-center text-muted">
              <i class="bi bi-search"></i>
              <div class="small">No se encontraron resultados para "{{ q }}"</div>
            </div>
            
            <!-- Resultados -->
            <div v-else-if="searchResults.length > 0" class="search-results-list">
              <!-- Clientes -->
              <div v-if="clientesResults.length > 0">
                <div class="result-category-header">
                  <i class="bi bi-people-fill text-primary"></i> Clientes ({{ clientesResults.length }})
                </div>
                <router-link 
                  v-for="r in clientesResults.slice(0, 3)" 
                  :key="r._id" 
                  :to="'/admin/clientes'"
                  class="search-result-item"
                  @click="closeSearch"
                >
                  <div class="d-flex align-items-center">
                    <i class="bi bi-person-circle text-primary me-2"></i>
                    <div class="flex-grow-1">
                      <div class="fw-bold small">{{ r.nombre }}</div>
                      <div class="text-muted" style="font-size: 0.75rem;">
                        {{ r.dni }} • {{ r.telefono }}
                      </div>
                    </div>
                    <i class="bi bi-arrow-right text-muted"></i>
                  </div>
                </router-link>
                <div v-if="clientesResults.length > 3" class="text-center py-1 small text-muted">
                  +{{ clientesResults.length - 3 }} más
                </div>
              </div>

              <!-- Vehículos -->
              <div v-if="vehiculosResults.length > 0">
                <div class="result-category-header">
                  <i class="bi bi-car-front-fill text-success"></i> Vehículos ({{ vehiculosResults.length }})
                </div>
                <router-link 
                  v-for="r in vehiculosResults.slice(0, 3)" 
                  :key="r._id" 
                  :to="'/modelos'"
                  class="search-result-item"
                  @click="closeSearch"
                >
                  <div class="d-flex align-items-center">
                    <i class="bi bi-car-front text-success me-2"></i>
                    <div class="flex-grow-1">
                      <div class="fw-bold small">{{ r.marca }} {{ r.modelo }}</div>
                      <div class="text-muted" style="font-size: 0.75rem;">
                        <span v-if="r.matricula">{{ r.matricula }} • </span>{{ r.precio }}€
                      </div>
                    </div>
                    <i class="bi bi-arrow-right text-muted"></i>
                  </div>
                </router-link>
                <div v-if="vehiculosResults.length > 3" class="text-center py-1 small text-muted">
                  +{{ vehiculosResults.length - 3 }} más
                </div>
              </div>

              <!-- Citas -->
              <div v-if="citasResults.length > 0">
                <div class="result-category-header">
                  <i class="bi bi-calendar-check-fill text-warning"></i> Citas ({{ citasResults.length }})
                </div>
                <router-link 
                  v-for="r in citasResults.slice(0, 3)" 
                  :key="r._id" 
                  :to="'/citas'"
                  class="search-result-item"
                  @click="closeSearch"
                >
                  <div class="d-flex align-items-center">
                    <i class="bi bi-calendar-check text-warning me-2"></i>
                    <div class="flex-grow-1">
                      <div class="fw-bold small">{{ r.nombre_cliente }}</div>
                      <div class="text-muted" style="font-size: 0.75rem;">
                        {{ r.matricula }} • {{ r.servicio_taller }}
                      </div>
                    </div>
                    <i class="bi bi-arrow-right text-muted"></i>
                  </div>
                </router-link>
                <div v-if="citasResults.length > 3" class="text-center py-1 small text-muted">
                  +{{ citasResults.length - 3 }} más
                </div>
              </div>

              <!-- Ventas -->
              <div v-if="ventasResults.length > 0">
                <div class="result-category-header">
                  <i class="bi bi-cart-fill text-danger"></i> Ventas ({{ ventasResults.length }})
                </div>
                <router-link 
                  v-for="r in ventasResults.slice(0, 3)" 
                  :key="r._id" 
                  :to="'/ventas'"
                  class="search-result-item"
                  @click="closeSearch"
                >
                  <div class="d-flex align-items-center">
                    <i class="bi bi-cart text-danger me-2"></i>
                    <div class="flex-grow-1">
                      <div class="fw-bold small">{{ r.nombre }} {{ r.modelo }}</div>
                      <div class="text-muted" style="font-size: 0.75rem;">
                        {{ r.precio }}€
                      </div>
                    </div>
                    <i class="bi bi-arrow-right text-muted"></i>
                  </div>
                </router-link>
                <div v-if="ventasResults.length > 3" class="text-center py-1 small text-muted">
                  +{{ ventasResults.length - 3 }} más
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <router-link class="btn btn-sm btn-light me-2" to="/cart">Cesta</router-link>
        <router-link v-if="isAdmin" class="btn btn-sm btn-warning" to="/admin/clientes">Admin</router-link>
      </div>
    </div>
  </nav>
</template>

<script setup>
// Componente NavBar con búsqueda global integrada
import { ref, onMounted, computed } from 'vue'
import { esAdmin, checkAdmin } from '@/api/authApi.js'
import { useRouter } from 'vue-router'
import axios from 'axios'

const isLogueado = ref(false)
const isAdmin = ref(false)
const isUsuario = ref(false)
const userName = ref('')
const q = ref('')
const router = useRouter()

// Variables para búsqueda
const searchResults = ref([])
const searching = ref(false)
const searched = ref(false)
const showDropdown = ref(false)
let searchTimeout = null

// Resultados filtrados por tipo
const clientesResults = computed(() => searchResults.value.filter(r => r._type === 'cliente'))
const vehiculosResults = computed(() => searchResults.value.filter(r => r._type === 'vehiculo'))
const citasResults = computed(() => searchResults.value.filter(r => r._type === 'cita'))
const ventasResults = computed(() => searchResults.value.filter(r => r._type === 'venta'))

// Cerrar dropdown al hacer clic fuera
onMounted(async () => {
  const token = sessionStorage.getItem('token')
  if (!token) {
    isLogueado.value = false
    isAdmin.value = false
    isUsuario.value = false
    userName.value = ''
  } else {
    try {
      isAdmin.value = await esAdmin()
      isUsuario.value = !isAdmin.value
      isLogueado.value = true
      userName.value = sessionStorage.getItem('userName') || ''

      const r = await checkAdmin()
      isAdmin.value = r.isAdmin
    } catch (err) {
      console.error('Error verificando si es admin', err)
      sessionStorage.clear()
      isLogueado.value = false
      isAdmin.value = false
      isUsuario.value = false
      userName.value = ''
    }
  }

  // Cerrar dropdown al hacer clic fuera
  document.addEventListener('click', (e) => {
    const searchContainer = document.querySelector('.search-container')
    if (searchContainer && !searchContainer.contains(e.target)) {
      showDropdown.value = false
    }
  })
})

function logout() {
  sessionStorage.clear()
  isLogueado.value = false
  isAdmin.value = false
  isUsuario.value = false
  userName.value = ''
  window.location.href = '/'
}

function closeSearch() {
  showDropdown.value = false
  q.value = ''
  searchResults.value = []
  searched.value = false
}

async function handleSearch() {
  if (!q.value.trim()) {
    searchResults.value = []
    searched.value = false
    return
  }

  // Debounce: esperar 500ms después de que el usuario deje de escribir
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(async () => {
    await performSearch()
  }, 500)
}

async function performSearch() {
  searchResults.value = []
  searching.value = true
  searched.value = true
  showDropdown.value = true

  const searchTerm = q.value.trim().toLowerCase()

  // 1. Buscar en CLIENTES (solo si está autenticado)
  const token = sessionStorage.getItem('token')
  if (token && isLogueado.value) {
    try {
      const r1 = await axios.get('/api/clientes', { 
        params: { q: q.value, page: 1, limit: 50 }, 
        headers: { Authorization: `Bearer ${token}` } 
      })
      if (r1.data && r1.data.data) {
        searchResults.value.push(...r1.data.data.map(x => ({ 
          ...x, 
          _type: 'cliente'
        })))
      }
    } catch (error) {
      // Silenciar error si no tiene permisos
      if (error.response?.status !== 401 && error.response?.status !== 403) {
        console.error('Error buscando clientes:', error)
      }
    }
  }

  // 2. Buscar en ARTÍCULOS/VEHÍCULOS
  try {
    const r2 = await axios.get('/api/articulos')
    if (r2.data) {
      const filtered = r2.data.filter(art => {
        return (
          (art.matricula && art.matricula.toLowerCase().includes(searchTerm)) ||
          (art.marca && art.marca.toLowerCase().includes(searchTerm)) ||
          (art.modelo && art.modelo.toLowerCase().includes(searchTerm)) ||
          (art.tipo && art.tipo.toLowerCase().includes(searchTerm)) ||
          (art.combustible && art.combustible.toLowerCase().includes(searchTerm)) ||
          (art.ubicacion && art.ubicacion.ciudad && art.ubicacion.ciudad.toLowerCase().includes(searchTerm)) ||
          (art.ubicacion && art.ubicacion.provincia && art.ubicacion.provincia.toLowerCase().includes(searchTerm))
        )
      })
      searchResults.value.push(...filtered.map(x => ({ ...x, _type: 'vehiculo' })))
    }
  } catch (error) {
    // Error silencioso - continuar con otras búsquedas
  }

  // 3. Buscar en CITAS DEL TALLER (solo si está autenticado y es admin)
  if (token && isAdmin.value) {
    try {
      const r3 = await axios.get('/api/taller/citas')
      if (r3.data) {
        const filtered = r3.data.filter(cita => {
          return (
            (cita.matricula && cita.matricula.toLowerCase().includes(searchTerm)) ||
            (cita.nombre_cliente && cita.nombre_cliente.toLowerCase().includes(searchTerm)) ||
            (cita.movil_cliente && cita.movil_cliente.toLowerCase().includes(searchTerm)) ||
            (cita.servicio_taller && cita.servicio_taller.toLowerCase().includes(searchTerm)) ||
            (cita.estado_cita && cita.estado_cita.toLowerCase().includes(searchTerm))
          )
        })
        searchResults.value.push(...filtered.map(x => ({ ...x, _type: 'cita' })))
      }
    } catch (error) {
      // Error silencioso - continuar con otras búsquedas
    }
  }

  // 4. Buscar en VENTAS
  try {
    const r4 = await axios.get('/api/ventas')
    if (r4.data && r4.data.data) {
      const filtered = r4.data.data.filter(venta => {
        return (
          (venta.nombre && venta.nombre.toLowerCase().includes(searchTerm)) ||
          (venta.modelo && venta.modelo.toLowerCase().includes(searchTerm)) ||
          (venta.marca && venta.marca && venta.marca.toLowerCase().includes(searchTerm))
        )
      })
      searchResults.value.push(...filtered.map(x => ({ ...x, _type: 'venta' })))
    }
  } catch (error) {
    // Error silencioso - continuar
  }

  searching.value = false
}
</script>

<style>
.navbar-dark .nav-link {
  color: rgba(255, 255, 255, 0.9);
}

.navbar-dark .nav-link:hover,
.navbar-dark .nav-link:focus {
  color: #fff;
}

img {
  width: 50px;
  height: 50px;
}

/* Estilos para el buscador con dropdown */
.search-container {
  position: relative;
}

.search-results-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 0.5rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  max-height: 500px;
  overflow-y: auto;
  min-width: 400px;
}

.search-results-list {
  max-height: 450px;
  overflow-y: auto;
}

.result-category-header {
  background: #f8f9fa;
  padding: 0.5rem 1rem;
  font-weight: 600;
  font-size: 0.85rem;
  border-bottom: 1px solid #dee2e6;
  position: sticky;
  top: 0;
  z-index: 1;
}

.search-result-item {
  display: block;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #f1f1f1;
  text-decoration: none;
  color: inherit;
  transition: background-color 0.2s ease;
}

.search-result-item:hover {
  background-color: #f8f9fa;
}

.search-result-item:last-child {
  border-bottom: none;
}

/* Scrollbar personalizado */
.search-results-dropdown::-webkit-scrollbar {
  width: 8px;
}

.search-results-dropdown::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.search-results-dropdown::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 10px;
}

.search-results-dropdown::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Responsive */
@media (max-width: 768px) {
  .search-results-dropdown {
    min-width: 300px;
    max-width: 90vw;
  }
}
</style>