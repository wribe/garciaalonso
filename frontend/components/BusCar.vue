<template>
  <div class="container my-4">
    <h2>Buscador Global</h2>
    <div class="input-group mb-3">
      <input 
        v-model="q" 
        type="text" 
        class="form-control" 
        placeholder="Buscar por matrícula, DNI, móvil, marca, modelo, servicio..." 
        @keyup.enter="search"
      />
      <button class="btn btn-primary" @click="search">
        <i class="bi bi-search"></i> Buscar
      </button>
    </div>

    <div v-if="loading" class="text-center my-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Buscando...</span>
      </div>
    </div>

    <div v-if="!loading && results.length === 0 && searched" class="alert alert-info">
      No se encontraron resultados para "{{ q }}"
    </div>

    <div v-if="results.length > 0">
      <h5 class="mb-3">Resultados encontrados ({{ results.length }})</h5>
      
      <!-- Clientes -->
      <div v-if="clientesResults.length" class="mb-4">
        <h6 class="text-primary"><i class="bi bi-people-fill"></i> Clientes ({{ clientesResults.length }})</h6>
        <ul class="list-group mb-3">
          <li v-for="r in clientesResults" :key="r._id" class="list-group-item list-group-item-action">
            <router-link :to="'/admin/clientes'" class="text-decoration-none text-dark d-block">
              <strong>{{ r.nombre }}</strong>
              <span class="badge bg-primary ms-2">Cliente</span>
              <i class="bi bi-arrow-right-circle float-end text-primary"></i>
              <div class="text-muted small">
                DNI: {{ r.dni }} | Teléfono: {{ r.telefono }} | Email: {{ r.email }}
              </div>
            </router-link>
          </li>
        </ul>
      </div>

      <!-- Vehículos -->
      <div v-if="vehiculosResults.length" class="mb-4">
        <h6 class="text-success"><i class="bi bi-car-front-fill"></i> Vehículos ({{ vehiculosResults.length }})</h6>
        <ul class="list-group mb-3">
          <li v-for="r in vehiculosResults" :key="r._id" class="list-group-item list-group-item-action">
            <router-link :to="'/modelos'" class="text-decoration-none text-dark d-block">
              <strong>{{ r.marca }} {{ r.modelo }}</strong>
              <span class="badge bg-success ms-2">Vehículo</span>
              <i class="bi bi-arrow-right-circle float-end text-success"></i>
              <div class="text-muted small">
                <span v-if="r.matricula">Matrícula: {{ r.matricula }} | </span>
                Año: {{ r.anio }} | 
                Precio: {{ r.precio }}€ | 
                <span v-if="r.ubicacion">{{ r.ubicacion.ciudad }}, {{ r.ubicacion.provincia }}</span>
              </div>
            </router-link>
          </li>
        </ul>
      </div>

      <!-- Citas del Taller -->
      <div v-if="citasResults.length" class="mb-4">
        <h6 class="text-warning"><i class="bi bi-calendar-check-fill"></i> Citas del Taller ({{ citasResults.length }})</h6>
        <ul class="list-group mb-3">
          <li v-for="r in citasResults" :key="r._id" class="list-group-item list-group-item-action">
            <router-link :to="'/citas'" class="text-decoration-none text-dark d-block">
              <strong>{{ r.nombre_cliente }}</strong>
              <span class="badge bg-warning text-dark ms-2">Cita</span>
              <i class="bi bi-arrow-right-circle float-end text-warning"></i>
              <div class="text-muted small">
                Matrícula: {{ r.matricula }} | 
                Servicio: {{ r.servicio_taller }} | 
                Fecha: {{ formatearFecha(r.fecha_cita) }} | 
                Estado: {{ r.estado_cita }}
              </div>
            </router-link>
          </li>
        </ul>
      </div>

      <!-- Ventas -->
      <div v-if="ventasResults.length" class="mb-4">
        <h6 class="text-danger"><i class="bi bi-cart-fill"></i> Ventas ({{ ventasResults.length }})</h6>
        <ul class="list-group mb-3">
          <li v-for="r in ventasResults" :key="r._id" class="list-group-item list-group-item-action">
            <router-link :to="'/ventas'" class="text-decoration-none text-dark d-block">
              <strong>{{ r.nombre }} {{ r.modelo }}</strong>
              <span class="badge bg-danger ms-2">Venta</span>
              <i class="bi bi-arrow-right-circle float-end text-danger"></i>
              <div class="text-muted small">
                Precio: {{ r.precio }}€ | 
                Año: {{ r.año }}
              </div>
            </router-link>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import axios from 'axios'

const q = ref('')
const results = ref([])
const loading = ref(false)
const searched = ref(false)

const clientesResults = computed(() => results.value.filter(r => r._type === 'cliente'))
const vehiculosResults = computed(() => results.value.filter(r => r._type === 'vehiculo'))
const citasResults = computed(() => results.value.filter(r => r._type === 'cita'))
const ventasResults = computed(() => results.value.filter(r => r._type === 'venta'))

function formatearFecha(fecha) {
  if (!fecha) return 'N/A'
  const date = new Date(fecha)
  const dia = String(date.getDate()).padStart(2, '0')
  const mes = String(date.getMonth() + 1).padStart(2, '0')
  const anio = date.getFullYear()
  return `${dia}/${mes}/${anio}`
}

async function search() {
  if (!q.value.trim()) {
    return
  }

  results.value = []
  loading.value = true
  searched.value = true

  const searchTerm = q.value.trim().toLowerCase()

  // 1. Buscar en CLIENTES (por DNI, nombre, teléfono, email)
  try {
    const token = sessionStorage.getItem('token')
    const r1 = await axios.get('/api/clientes', { 
      params: { q: q.value, page: 1, limit: 50 }, 
      headers: { Authorization: token ? `Bearer ${token}` : '' } 
    })
    if (r1.data && r1.data.data) {
      results.value.push(...r1.data.data.map(x => ({ 
        ...x, 
        _type: 'cliente'
      })))
    }
  } catch (error) {
    console.error('Error buscando clientes:', error)
  }

  // 2. Buscar en ARTÍCULOS/VEHÍCULOS (por matrícula, marca, modelo, tipo)
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
      results.value.push(...filtered.map(x => ({ ...x, _type: 'vehiculo' })))
    }
  } catch (error) {
    console.error('Error buscando vehículos:', error)
  }

  // 3. Buscar en CITAS DEL TALLER (por matrícula, nombre cliente, móvil, servicio)
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
      results.value.push(...filtered.map(x => ({ ...x, _type: 'cita' })))
    }
  } catch (error) {
    console.error('Error buscando citas:', error)
  }

  // 4. Buscar en VENTAS (por nombre, modelo, marca)
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
      results.value.push(...filtered.map(x => ({ ...x, _type: 'venta' })))
    }
  } catch (error) {
    console.error('Error buscando ventas:', error)
  }

  loading.value = false
}
</script>

<style scoped>
.container {
  max-width: 900px;
}

h2 {
  color: #0d6efd;
  margin-bottom: 1.5rem;
}

.input-group {
  margin-bottom: 1.5rem;
}

.list-group-item-action {
  cursor: pointer;
  transition: all 0.2s ease;
}

.list-group-item-action:hover {
  background-color: #f8f9fa;
  transform: translateX(5px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.list-group-item-action:hover .bi-arrow-right-circle {
  transform: translateX(5px);
}

.bi-arrow-right-circle {
  transition: transform 0.2s ease;
}

.badge {
  font-size: 0.75rem;
  padding: 0.35em 0.65em;
}

h6 {
  font-weight: 600;
  padding: 0.5rem 0;
  border-bottom: 2px solid currentColor;
  margin-bottom: 1rem;
}

.spinner-border {
  width: 3rem;
  height: 3rem;
}
</style>