<template>
  <div class="mx-auto mt-2 p-3 pb-5 border rounded-3 shadow-sm min-vh-75 bg-light">
    <h3 class="text-center my-2">Registro de Clientes</h3>
    <!-- Formulario -->
    <form @submit.prevent="guardarCliente" class="mb-4">
      <!-- DNI con validación visual -->
      <div class="mb-3 row align-items-center">
        <!-- Columna DNI -->
        <div class="col-md-4 d-flex align-items-center">
          <label for="dni" class="form-label mb-0 w-25 me-5">DNI: </label>
          <div class="flex-grow-1 d-flex align-items-center">
            <input type="text" id="dni" v-model="nuevoCliente.dni" @blur="validarDni"
              class="form-control w-auto w-25 text-center ms-4" :class="[
                { 'is-invalid': !dniValido },
                { 'readonly-input': editando },
              ]" :readonly="editando" required oninvalid="this.setCustomValidity('Por favor, rellene este campo')"
              oninput="this.setCustomValidity('')" />
            <button type="button" class="btn btn btn-primary ms-3 border-0 shadow-none rounded-0"
              @click="buscarClientePorDNI(nuevoCliente.dni)" :disabled="editando" :aria-disabled="String(editando)"
              title="Buscar por DNI">
              <i class="bi bi-search"></i>
            </button>

            <div v-if="!dniValido" class="invalid-feedback">
              DNI o NIE inválido.
            </div>
          </div>
        </div>
        <!-- RadioButtons -->
        <div class="col-md-3 d-flex align-items-center me-5">
          <label for="tipoCliente" class="form-label me-4 ms-5 mb-0 text-nowrap">Tipo Cliente:</label>
          <input type="radio" name="tipoCliente" id="tipoClienteParticular" value="particular" class="me-1"
            v-model="nuevoCliente.tipoCliente" checked required />
          <label class="me-4">Particular</label>
          <input type="radio" name="tipoCliente" id="tipoClienteEmpresa" value="empresa" class="me-1"
            v-model="nuevoCliente.tipoCliente" required />
          <label>Empresa</label>
        </div>

        <!-- Columna Fecha de Alta a la derecha -->
        <div class="col-md-4 ms-auto d-flex align-items-center">
          <label for="fecha_alta" class="form-label me-2 mb-0 text-nowrap">Fecha de Alta:</label>
          <input type="date" id="fecha_alta" v-model="nuevoCliente.fecha_alta" class="form-control w-auto" required
            oninvalid="this.setCustomValidity('Por favor, rellene este campo')" oninput="this.setCustomValidity('')" />

          <!-- Botón recargar -->
          <div class="col-md-1 ms-auto d-flex align-items-center me-3">
            <button type="button" class="btn btn btn-primary me-4 border-0 shadow-none rounded-0"
              @click="refrescarPagina" title="Refrescar Página">
              <i class="bi bi-arrow-clockwise"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Nombre y Apellidos -->
      <div class="mb-3 row g-3 align-items-center">
        <!-- Nombre -->
        <div class="col-md-5 d-flex align-items-center">
          <label for="nombre" class="form-label mb-0 text-nowrap w-25">Nombre:</label>
          <input type="text" id="nombre" v-model="nuevoCliente.nombre" class="form-control flex-grow-1"
            @blur="capitalizarTexto('nombre')" required />
        </div>

        <!-- Apellidos -->
        <div class="col-md-4 d-flex align-items-center ms-5">
          <label for="apellidos" class="form-label me-4 mb-0 text-nowrap">Apellidos:</label>
          <input type="text" id="apellidos" v-model="nuevoCliente.apellidos" class="form-control flex-grow-1"
            @blur="capitalizarTexto('apellidos')" required />
        </div>
      </div>

      <!-- Email y Móvil -->
      <div class="mb-3 row g-3 align-items-center">
        <!-- Email -->
        <div class="col-md-5 d-flex align-items-center">
          <label for="email" class="form-label mb-0 text-nowrap w-25">Email:</label>
          <input type="email" id="email" v-model="nuevoCliente.email" class="form-control flex-grow-1"
            @blur="validarEmail" :class="{ 'is-invalid': !emailValido }" required />
        </div>

        <!-- Móvil -->
        <div class="col-md-3 d-flex align-items-center">
          <label for="movil" class="form-label me-4 ms-5 mb-0 text-nowrap">Móvil:</label>
          <input type="tel" id="movil" v-model="nuevoCliente.movil" @blur="validarMovil"
            class="form-control flex-grow-1 text-center" :class="{ 'is-invalid': !movilValido }" />
        </div>
      </div>

      <!-- Dirección, Provincia y Municipio -->
      <div class="mb-3 row g-3 align-items-center">
        <!-- Dirección -->
        <div class="col-md-5 d-flex align-items-center">
          <label for="direccion" class="form-label mb-0 w-25 text-nowrap">Dirección:</label>
          <input type="text" id="direccion" v-model="nuevoCliente.direccion" class="form-control flex-grow-1" />
        </div>

        <!-- Provincia -->
        <div class="col-md-3 d-flex align-items-center">
          <label for="provincia" class="form-label me-2 ms-5 mb-0 text-nowrap">Provincia:</label>
          <select id="provincia" v-model="nuevoCliente.provincia" class="form-select flex-grow-1 w-25"
            @change="filtrarMunicipios">
            <option disabled value="">Seleccione provincia</option>
            <option v-for="prov in provincias" :key="prov.id" :value="prov.nm">
              {{ prov.nm }}
            </option>
          </select>
        </div>

        <!-- Municipio -->
        <div class="col-md-3 d-flex align-items-center">
          <label for="municipio" class="form-label me-2 ms-4 mb-0 text-nowrap">Municipio:</label>
          <select id="municipio" v-model="nuevoCliente.municipio" class="form-select flex-grow-1 w-auto">
            <option disabled value="">Seleccione municipio</option>
            <option v-for="mun in municipiosFiltrados" :key="mun.id" :value="mun.nm">
              {{ mun.nm }}
            </option>
          </select>
        </div>
      </div>
      <!-- Contraseña y Repetir Contraseña -->
      <div class="mb-3 row g-3 align-items-center justify-content-center">
        <div class="col-md-4 d-flex align-items-center">
          <label for="password" class="form-label mb-0 text-nowrap flex-shrink-0 me-2">Contraseña:</label>
          <input
            type="password"
            id="password"
            v-model="nuevoCliente.password"
            class="form-control flex-grow-1"
            :required="!editando"
            autocomplete="new-password"
          />
        </div>
        <div class="col-md-4 d-flex align-items-center ms-4">
          <label for="repetirPassword" class="form-label mb-0 text-nowrap flex-shrink-0 me-2">Repetir Contraseña:</label>
          <input
            type="password"
            id="repetirPassword"
            v-model="repetirPassword"
            class="form-control flex-grow-1"
            :required="!editando"
            autocomplete="new-password"
          />
        </div>
      </div>
      <!-- Aceptar condiciones + Histórico -->
      <div class="mb-4">
        <div class="d-flex align-items-center justify-content-between position-relative">
          <!-- Espacio izquierdo vacío para equilibrar -->
          <div style="flex: 1"></div>

          <!-- Aceptar condiciones y términos (centro absoluto) -->
          <div class="position-absolute start-50 translate-middle-x">
            <div class="form-check d-flex align-items-center">
              <input type="checkbox" id="avisoLegal" class="form-check-input me-2" v-model="nuevoCliente.lopd"
                required />
              <label for="AvisoLegal" class="form-check-label mb-0 text-nowrap">
                Aceptar términos y condiciones:
                <a target="_blank" class="text-decoration-none" href="/avisolegal">
                  Aviso Legal
                </a>
              </label>
            </div>
          </div>

          <!-- Histórico (derecha) -->
          <div v-if="admin" class="ms-auto me-5">
            <div class="form-switch d-flex align-items-center">
              <input type="checkbox" id="historico" v-model="mostrarHistorico" class="form-check-input me-2"
                @change="cargarClientes" />
              <label for="historico" class="form-check-label mb-0">Histórico</label>
            </div>
          </div>
        </div>
      </div>
      <!-- Botones centrados -->
      <div class="d-flex justify-content-center align-items-center gap-3">
        <button type="submit" class="btn btn-primary border-0 shadow-none rounded-0">
          {{ editando ? "Modificar Cliente" : "Guardar" }}
        </button>
        <button 
          v-if="admin" 
          type="button" 
          class="btn btn-success border-0 shadow-none rounded-0"
          @click="imprimirListadoClientes"
          title="Descargar listado de clientes en PDF">
          <i class="bi bi-printer-fill me-2"></i>Imprimir Listado
        </button>
      </div>
    </form>
  </div>

  <!--Aceptar condiciones + Histórico
  <div class="mb-4">
    <div class="d-flex align-items-center justify-content-between position-relative">
      Espacio izquierdo vacío para equilibrar 
      <div style="flex: 1"></div>

      Aceptar condiciones y términos (centro absoluto) 
      <div class="position-absolute start-50 translate-middle-x">
        <div class="form-check d-flex align-items-center">
          <input type="checkbox" id="avisoLegal" class="form-check-input me-2" v-model="nuevoCliente.lopd" required />
          <label for="AvisoLegal" class="form-check-label mb-0 text-nowrap">
            Aceptar términos y condiciones:
            <a target="_blank" class="text-decoration-none" href="/avisolegal">
              Aviso Legal
            </a>
          </label>
        </div>
      </div>

      Histórico (derecha) 
      <div class="ms-auto me-5">
        <div class="form-switch d-flex align-items-center">
          <input type="checkbox" id="historico" v-model="mostrarHistorico" class="form-check-input me-2"
            @change="cargarClientes" />
          <label for="historico" class="form-check-label mb-0">Histórico</label>
        </div>
      </div>
    </div>
  </div>-->

  <!-- Botón centrado (centro) 
  <div class="d-flex justify-content-center align-items-center">
    <button type="submit" class="btn btn-primary border-0 shadow-none rounded-0">
      {{ editando ? "Modificar Cliente" : "Guardar" }}
    </button>
  </div>-->

  <!-- Lista de Clientes -->
  <div v-if="admin" class="table-responsive">
    <h4 class="text-center w-100">Listado Clientes</h4>
    <table class="table table-bordered table-striped table-hover table-sm align-middle">
      <thead class="table-primary">
        <tr>
          <th class="text-center" scope="col">ID</th>
          <th scope="col">Apellidos</th>
          <th scope="col">Nombre</th>
          <th class="text-center" scope="col">Móvil</th>
          <th class="text-center" scope="col">Municipio</th>
          <th class="text-center" scope="col" style="width: 150px">
            Acciones
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(cliente, index) in clientesPaginados" :key="cliente.id || index">
          <th scope="row" class="text-center">{{ (currentPage - 1) * clientesPerPage + index + 1 }}</th>
          <td>{{ cliente.apellidos }}</td>
          <td>{{ cliente.nombre }}</td>
          <td class="text-center">{{ cliente.movil }}</td>
          <td class="text-center">{{ cliente.municipio }}</td>
          <td class="text-start">

            <button @click="eliminarCliente(cliente.movil)"
              class="btn btn-danger btn-sm border-0 ms-4 me-2 shadow-none rounded-0">
              <i class="bi bi-trash"></i>
            </button>

            <button @click="editarCliente(cliente.movil)" class="btn btn-warning btn-sm shadow-none rounded-0"
              title="Editar cliente" aria-label="Editar cliente">
              <i class="bi bi-pencil"></i>
            </button>

            <button v-if="cliente.historico === false" @click="activarCliente(cliente)"
              class="btn btn-secondary btn-sm ms-2 border-0 shadow-none rounded-0" title="Activar cliente">
              <i class="bi bi-person-check"></i>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Navegación de página-->
  <div v-if="admin" class="d-flex justify-content-center my-3">
    <button class="btn btn-outline-primary btn-sm me-2 rounded-0 border-1 shadow-none" @click="beforePagina"
      :disabled="currentPage <= 1">
      <i class="bi bi-chevron-left "></i>
    </button>
    <span class="mx-3 align-self-center text-muted">Página {{ currentPage }}</span>
    <button class="btn btn-outline-primary btn-sm rounded-0 border-1 shadow-none" @click="nextPagina"
      :disabled="currentPage >= totalPages">
      <i class="bi bi-chevron-right "></i>
    </button>
  </div>

</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import provmuniData from "../../backend/data/provmuni.json";
import Swal from "sweetalert2";
import { getClientes, deleteCliente, addCliente, updateCliente, getClientePorDni, getDni, getClienteLogueado } from "@/api/clientes.js";
import { registerUsuario, loginUsuario, checkAdmin } from "@/api/authApi.js";
import bcrypt from "bcryptjs";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const router = useRouter();

/* =================================== SCRIPT CRUD =================================== */
const clienteVacio = {
  dni: "",
  nombre: "",
  apellidos: "",
  email: "",
  movil: "",
  direccion: "",
  provincia: "",
  municipio: "",
  fecha_alta: "",
  tipoCliente: "user",
  historico: false,
  lopd: false,
  password: ""
}

const nuevoCliente = ref({
  ...clienteVacio
});

const repetirPassword = ref("");

const editando = ref(false);
const clienteEditandoId = ref(null);

const mostrarHistorico = ref(false);

const numClientes = ref(0);
const currentPage = ref(1);
const clientesPerPage = ref(10);

const isAdmin = ref(false);
const admin = ref(false)

/// se carga en el onmounted ya que necesita llamar al back
var dni;

/// Computed: verifica si está editando su propio perfil
const editingCurrentUser = computed(() => {
  return nuevoCliente.value.dni === dni && editando.value;
});

/// Función Listar Clientes con get
const clientes = ref([]);

/// Cargar clientes al montar el componente
// Zona Cargar clientes Al Montar el componente 
onMounted(async () => {
  const adminCheck = await checkAdmin();
  admin.value = adminCheck.isAdmin;
  isAdmin.value = adminCheck.isAdmin;

  if (isAdmin.value) {
    cargarClientes();
  }

  // SI NO ESTÁS EDITANDO, CARGA TUS DATOS EN EL FORMULARIO
  if (!editando.value) {
    const cliente = await getClienteLogueado();
    console.log('Datos de mi perfil:', cliente);
    if (cliente) {
      nuevoCliente.value = { 
        ...cliente, 
        password: "",
        tipoCliente: cliente.tipo || "user" // Mapear tipo -> tipoCliente
      };
      nuevoCliente.value.fecha_alta = formatearFechaParaInput(cliente.fecha_alta);
      
      // Activar modo edición para usuarios que están viendo su propio perfil
      if (!isAdmin.value) {
        editando.value = true;
        clienteEditandoId.value = cliente.id;
      }
    }
  }
});

const updateTabla = () => {
  getClientes(mostrarHistorico.value)
    .then(data => {
      clientes.value = data
      numClientes.value = data.length
    })
    .catch(error => {
      console.error('Error cargando clientes:', error);
      if (error.response?.status === 401) {
        // Token inválido o expirado
        Swal.fire({
          icon: 'warning',
          title: 'Sesión expirada',
          text: 'Por favor, inicie sesión nuevamente',
          showConfirmButton: true
        });
      }
    })
}

///avanzar y retroceder

// Métodos de paginación
const beforePagina = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const nextPagina = () => {
  //redondear hacia arriba para mostrar la última página aunque no esté completa

  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const clientesPaginados = computed(() => {
  const start = (currentPage.value - 1) * clientesPerPage.value
  const end = start + clientesPerPage.value
  return clientes.value.slice(start, end)
})


const cargarClientes = () => {
  updateTabla()
  Swal.fire({
    icon: 'success',
    title: "Listando Clientes...",
    showConfirmButton: false,
    timer: 1500
  });
}

const totalPages = computed(() => {
  return Math.ceil(numClientes.value / clientesPerPage.value)
})


const guardarCliente = async () => {
  // Validar contraseñas
  if (nuevoCliente.value.password !== repetirPassword.value) {
    Swal.fire({
      icon: 'error',
      title: 'Error en contraseña',
      text: 'Las contraseñas no coinciden.',
      showConfirmButton: true
    });
    return;
  }

  // Validar duplicados solo si estás creando (no si editando)
  if (!editando.value) {
    const duplicado = clientes.value.find(cliente =>
      cliente.dni === nuevoCliente.value.dni ||
      cliente.movil === nuevoCliente.value.movil ||
      cliente.email === nuevoCliente.value.email
    );
    if (duplicado) {
      Swal.fire({
        icon: 'error',
        title: 'DNI, móvil o email duplicados',
        showConfirmButton: false,
        timer: 2000
      });
      return;
    }
  }

  // Confirmación antes de guardar
  const result = await Swal.fire({
    title: editando.value ? '¿Desea modificar este cliente?' : '¿Desea grabar este cliente?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: editando.value ? 'Modificar' : 'Grabar',
    cancelButtonText: 'Cancelar'
  });

  if (!result.isConfirmed) return;

  try {
    if (editando.value) {
      // MODIFICAR CLIENTE EXISTENTE
      const datosActualizados = { ...nuevoCliente.value };
      if (nuevoCliente.value.password) {
        const salt = bcrypt.genSaltSync(10);
        datosActualizados.password = bcrypt.hashSync(nuevoCliente.value.password, salt);
      } else {
        delete datosActualizados.password;
      }
      await updateCliente(clienteEditandoId.value, datosActualizados); // <-- MODIFICA EL EXISTENTE

      Swal.fire({
        icon: 'success',
        title: 'Cliente modificado',
        showConfirmButton: false,
        timer: 1500
      });
    } else {
      // CREAR NUEVO CLIENTE
      await registerUsuario({
        dni: nuevoCliente.value.dni,
        password: nuevoCliente.value.password,
        nombre: nuevoCliente.value.nombre,
        apellidos: nuevoCliente.value.apellidos,
        email: nuevoCliente.value.email,
        movil: nuevoCliente.value.movil,
        direccion: nuevoCliente.value.direccion,
        provincia: nuevoCliente.value.provincia,
        municipio: nuevoCliente.value.municipio,
        fecha_alta: nuevoCliente.value.fecha_alta,
        tipo: nuevoCliente.value.tipoCliente,
        lopd: nuevoCliente.value.lopd
      });

      Swal.fire({
        icon: 'success',
        title: 'Cliente agregado',
        showConfirmButton: false,
        timer: 1500
      });
    }

    // Reset formulario y estado
    nuevoCliente.value = { ...clienteVacio };
    editando.value = false;
    clienteEditandoId.value = null;
    repetirPassword.value = "";

    // Refrescar lista completa
    updateTabla();

  } catch (error) {
    console.error('Error al guardar cliente:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error al guardar cliente',
      text: error?.response?.data?.message || error.message || 'Inténtelo de nuevo o contacte con el administrador.',
      showConfirmButton: false,
      timer: 3000
    });
  }
};

// Funcion Eliminar Cliente con patch (histórico a false)
const eliminarCliente = async (movil) => {
  // Refrescar lista desde la API
  cargarClientes();
  // Buscar cliente completo (que incluye el ID)
  const clienteAEliminar = clientes.value.find(cliente => cliente.movil === movil);

  if (!clienteAEliminar) {
    Swal.fire({
      icon: 'error',
      title: 'Cliente no encontrado',
      showConfirmButton: false,
      timer: 1500
    });
    return;
  }

  // Pedir confirmación antes de eliminar
  const result = await Swal.fire({
    title: `¿Eliminar al cliente ${clienteAEliminar.nombre} ${clienteAEliminar.apellidos}?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  });


  // Si no confirma, salir
  if (!result.isConfirmed) return;

  // Si confirma, eliminar cliente usando la API y movil como ID
  await deleteCliente(clienteAEliminar.id);
  // Refrescar la lista desde la "API"
  cargarClientes(); // <-- Solo llama a la función, no asignes el resultado

  Swal.fire({
    icon: 'success',
    title: 'Cliente eliminado',
    showConfirmButton: false,
    timer: 1500
  });
};


// Función Editar Cliente (carga datos en el formulario)
const editarCliente = (movil) => {
  const cliente = clientes.value.find((c) => c.movil === movil);
  nuevoCliente.value = { ...cliente, password: "" };
  editando.value = true;
  clienteEditandoId.value = cliente.id; // <-- ESTA LÍNEA ES CLAVE
  nuevoCliente.value.fecha_alta = formatearFechaParaInput(cliente.fecha_alta);
}


const activarCliente = async (cliente) => {
  const confirmacion = await Swal.fire({
    title: `¿Activar cliente ${cliente.nombre} ${cliente.apellidos}?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Activar',
    cancelButtonText: 'Cancelar'
  });

  if (!confirmacion.isConfirmed) return;

  try {
    // Crear una copia del cliente con historico en true
    const clienteActivado = { ...cliente, historico: false };

    // Llamar a la API para actualizar
    const actualizado = await updateCliente(cliente.id, clienteActivado);

    // Actualizar la lista local (opcional, también puedes volver a cargar todo)
    const index = clientes.value.findIndex(c => c.id === cliente.id);
    if (index !== -1) {
      clientes.value[index] = actualizado;
    }

    Swal.fire({
      icon: 'success',
      title: 'Cliente reactivado',
      showConfirmButton: false,
      timer: 1500
    });

    // Recargar lista actualizada
    cargarClientes();

  } catch (error) {
    console.error('Error al reactivar cliente:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error al activar cliente',
      text: 'Por favor, intenta de nuevo.',
      timer: 1500
    });
  }
};

///CODIGO BUSQUEDA COMPONENTES

const buscarClientePorDNI = async (dni) => {
  if (!dni || dni.trim() === '') {
    Swal.fire({
      icon: 'warning',
      title: 'Debe introducir un DNI antes de buscar.',
      timer: 1500,
      showConfirmButton: false
    });
    return;
  }

  try {
    const cliente = await getClientePorDni(dni.trim().toUpperCase());
    console.log('Datos de mi perfil:', cliente); // <-- Añade esto

    if (!cliente) {
      Swal.fire({
        icon: 'info',
        title: 'Cliente no encontrado',
        text: 'No existe ningún cliente con ese DNI.',
        timer: 1500,
        showConfirmButton: false
      });
      return;
    }

    // ✅ Cargar los datos en el formulario
    nuevoCliente.value = { ...cliente, password: "" };
    nuevoCliente.value.fecha_alta = formatearFechaParaInput(cliente.fecha_alta);

    // Actualiza lista de municipios si cambia la provincia
    filtrarMunicipios();
    nuevoCliente.value.municipio = cliente.municipio;

    //opcional
    editando.value = true;
    clienteEditandoId.value = cliente.id;

    Swal.fire({
      icon: 'success',
      title: 'Cliente encontrado y cargado',
      timer: 1500,
      showConfirmButton: false
    });
  } catch (error) {
    console.error('Error buscando cliente por DNI:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error al buscar cliente',
      text: 'Verifique la conexión o contacte con el administrador.',
      timer: 2000,
      showConfirmButton: false
    });
  }
}
const vaciarFormulario = async () => {
  nuevoCliente.value = { ...clienteVacio };
  repetirPassword.value = "";
  editando.value = false;
  clienteEditandoId.value = null;

  dniValido.value = true;
  movilValido.value = true;
  emailValido.value = true;
}

// Función para refrescar/limpiar el formulario (alias de vaciarFormulario)
const refrescarPagina = () => {
  vaciarFormulario();
  Swal.fire({
    icon: 'success',
    title: 'Formulario limpiado',
    showConfirmButton: false,
    timer: 1000
  });
}

/* =================================== SCRIPT AUXILIARES =================================== */

// Estado de validez del DNI/NIE si la estructura de datos es más compleja se usa reactive
const dniValido = ref(true); // Por defecto es válido y no muestra error al iniciar

// Función para validar DNI y NIE
const validarDniNie = (valor) => {
  const letras = "TRWAGMYFPDXBNJZSQVHLCKE";
  const dniRegex = /^[0-9]{8}[A-Z]$/;
  const nieRegex = /^[XYZ][0-9]{7}[A-Z]$/;

  valor = valor.toUpperCase();

  if (dniRegex.test(valor)) {
    const numero = parseInt(valor.slice(0, 8), 10);
    const letra = valor.charAt(8);
    return letra === letras[numero % 23]; //sale con true si es válido
  } else if (nieRegex.test(valor)) {
    const nie = valor.replace("X", "0").replace("Y", "1").replace("Z", "2");
    const numero = parseInt(nie.slice(0, 8), 10);
    const letra = valor.charAt(8);
    return letra === letras[numero % 23]; //sale con true si es válido
  }
  return false;
};

// Validar al salir del campo
const validarDni = () => {
  const dni = nuevoCliente.value.dni.trim().toUpperCase();
  dniValido.value = validarDniNie(dni);
};

// Función única: capitaliza y asigna en el mismo paso
const capitalizarTexto = (campo) => {
  const texto = nuevoCliente.value[campo] ?? "";
  nuevoCliente.value[campo] = texto
    .toLowerCase()
    .split(" ")
    .map((palabra) => {
      if (!palabra) return "";
      return palabra.charAt(0).toLocaleUpperCase() + palabra.slice(1);
    })
    .join(" ");
};

// Validar email
const emailValido = ref(true);
const validarEmail = () => {
  const email = nuevoCliente.value.email.trim();
  // Expresión simple para email válido
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  emailValido.value = regex.test(email);
};

// Validar móvil
const movilValido = ref(true);
const movilRegex = /^[67]\d{8}$/;

const validarMovil = () => {
  const movil = nuevoCliente.value.movil.trim();

  if (movil === "") {
    movilValido.value = true; // Vacío = válido (opcional)
    return true;
  }

  if (movil.charAt(0) === "6" || movil.charAt(0) === "7") {
    movilValido.value = movilRegex.test(movil);
    return movilValido.value;
  } else {
    movilValido.value = false;
    return false;
  }
};

// Provincias y municipios
const provincias = ref(provmuniData.provincias); // Array de provincias
const municipios = ref(provmuniData.municipios); // Array de municipios para filtrarlos
const municipiosFiltrados = ref([]); // vacío pero contendrá los municipios filtrados

const filtrarMunicipios = () => {
  // nombre de la provincia elegida en el <select>
  const nombreProv = nuevoCliente.value.provincia;

  // 1️⃣ buscar en provincias el objeto con ese nombre
  const prov = provincias.value.find((p) => p.nm === nombreProv);
  if (!prov) {
    municipiosFiltrados.value = [];
    return;
  }

  // 2️⃣ los dos primeros dígitos del id de la provincia
  const codigoProv = prov.id.slice(0, 2);

  // 3️⃣ filtrar los municipios cuyo id empiece por esos dos dígitos
  municipiosFiltrados.value = municipios.value.filter((m) =>
    m.id.startsWith(codigoProv)
  );

  // 4️⃣ opcional: resetear el municipio si ya no corresponde
  nuevoCliente.value.municipio = "";
};

// conversor fecha
function formatearFechaParaInput(fecha) {
  if (!fecha) return '';

  // Detecta formato dd/mm/yyyy
  if (fecha.includes('/')) {
    const [dd, mm, yyyy] = fecha.split('/');
    return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
  }

  // Detecta formato yyyy-mm-dd
  if (fecha.includes('-')) {
    const partes = fecha.split('-');
    if (partes.length === 3) return fecha.slice(0, 10); // solo yyyy-mm-dd
  }

  // Detecta formato ISO (ejemplo: 2026-01-21T00:00:00.000Z)
  if (fecha.length >= 10 && fecha[4] === '-' && fecha[7] === '-') {
    return fecha.slice(0, 10);
  }

  return '';
}

// Función para imprimir/descargar listado de clientes en PDF
const imprimirListadoClientes = async () => {
  try {
    // Mostrar indicador de carga
    Swal.fire({
      title: 'Generando PDF...',
      text: 'Por favor espere',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // Obtener todos los clientes (sin filtro de paginación)
    const todosLosClientes = await getClientes(mostrarHistorico.value);

    // Crear documento PDF
    const doc = new jsPDF('landscape'); // Orientación horizontal para más columnas

    // Título
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('Listado de Clientes - García Alonso', doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });

    // Fecha de generación y total de clientes en la misma línea
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    const fechaHoy = new Date().toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Fecha a la izquierda
    doc.text(`Generado el: ${fechaHoy}`, 14, 22);
    
    // Total de clientes a la derecha
    doc.setFont(undefined, 'bold');
    doc.text(`Total de clientes: ${todosLosClientes.length}`, pageWidth - 14, 22, { align: 'right' });
    doc.setFont(undefined, 'normal');

    // Preparar datos para la tabla
    const datosTabla = todosLosClientes.map((cliente, index) => [
      index + 1,
      cliente.dni || '-',
      cliente.apellidos || '-',
      cliente.nombre || '-',
      cliente.email || '-',
      cliente.movil || '-',
      cliente.direccion || '-',
      cliente.municipio || '-',
      cliente.provincia || '-',
      cliente.fecha_alta ? formatearFechaParaInput(cliente.fecha_alta) : '-',
      cliente.tipo || cliente.tipoCliente || 'user',
      cliente.historico ? 'Sí' : 'No'
    ]);

    // Generar tabla con autoTable
    autoTable(doc, {
      startY: 28,
      head: [['#', 'DNI', 'Apellidos', 'Nombre', 'Email', 'Móvil', 'Dirección', 'Municipio', 'Provincia', 'Fecha Alta', 'Tipo', 'Activo']],
      body: datosTabla,
      styles: {
        fontSize: 8,
        cellPadding: 2,
        overflow: 'linebreak',
      },
      headStyles: {
        fillColor: [13, 110, 253], // Color azul Bootstrap primary
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center'
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' }, // #
        1: { cellWidth: 20, halign: 'center' }, // DNI
        2: { cellWidth: 30 }, // Apellidos
        3: { cellWidth: 25 }, // Nombre
        4: { cellWidth: 40 }, // Email
        5: { cellWidth: 20, halign: 'center' }, // Móvil
        6: { cellWidth: 35 }, // Dirección
        7: { cellWidth: 25 }, // Municipio
        8: { cellWidth: 25 }, // Provincia
        9: { cellWidth: 22, halign: 'center' }, // Fecha Alta
        10: { cellWidth: 15, halign: 'center' }, // Tipo
        11: { cellWidth: 15, halign: 'center' } // Activo
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      margin: { top: 28 }
    });

    // Descargar el PDF
    const nombreArchivo = `Listado_Clientes_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(nombreArchivo);

    // Cerrar el indicador de carga y mostrar éxito
    Swal.fire({
      icon: 'success',
      title: 'PDF generado',
      text: `Se ha descargado el archivo: ${nombreArchivo}`,
      timer: 2500,
      showConfirmButton: false
    });

  } catch (error) {
    console.error('Error generando PDF:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error al generar PDF',
      text: 'No se pudo generar el listado. Por favor, inténtelo de nuevo.',
      showConfirmButton: true
    });
  }
};
</script>

<style scoped>
.is-invalid {
  border-color: #f28b82 !important;
  background-color: #ffe6e6;
}

.invalid-feedback {
  display: block;
}

#app>main>div>form>div:nth-child(2)>div.col-md-6.d-flex.align-items-center.ms-auto {
  margin-left: 48px !important;
}

.gestion-clientes {
  width: 95%;
  max-width: none;
  margin: 0 auto;
  padding: 2rem 0;
}

.form-control {
  width: 100%;
}
</style>
