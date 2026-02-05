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
          <li class="nav-item">
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
        <!-- Buscador -->
        <div class="search-container position-relative me-2">
          <div class="input-group input-group-sm">
            <input 
              v-model="q" 
              @keyup.enter="goToSearchPage" 
              class="form-control" 
              placeholder="Buscar en toda la web..."
              style="width:280px;"
            >
            <button class="btn btn-light" @click="goToSearchPage" type="button">
              <i class="bi bi-search"></i>
            </button>
          </div>
        </div>
        
        <router-link class="btn btn-sm btn-light me-2 position-relative" to="/cart">
          <i class="bi bi-cart3"></i>
          <span v-if="cartItemCount > 0" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            {{ cartItemCount }}
          </span>
        </router-link>
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
import { useCestaStore } from '../store/cesta.js'
import { clearAllCarts } from '@/utils/cartUtils.js'
import axios from 'axios'

const isLogueado = ref(false)
const isAdmin = ref(false)
const isUsuario = ref(false)
const userName = ref('')
const q = ref('')
const router = useRouter()

// Pinia store for cart
const cesta = useCestaStore()
const cartItemCount = computed(() => cesta.totalItems)

// Cerrar dropdown al hacer clic fuera
onMounted(async () => {
  cesta.init()
  
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

  // Escuchar cambios en localStorage para compatibilidad (otros scripts)
  window.addEventListener('storage', () => {})
  // Pinia store emits cartUpdated via save() already
})

function logout() {
  sessionStorage.clear()
  clearAllCarts() // Limpiar todos los carritos al cerrar sesión
  isLogueado.value = false
  isAdmin.value = false
  isUsuario.value = false
  userName.value = ''
  window.location.href = '/'
}

function goToSearchPage() {
  if (q.value.trim()) {
    router.push({ path: '/buscar', query: { q: q.value } })
    q.value = ''
  }
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

/* Responsive */
@media (max-width: 768px) {
}
</style>