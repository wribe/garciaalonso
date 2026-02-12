<template>
  <div class="container-fluid my-4 p-4 border rounded-4 shadow-lg bg-white">
    <h4 class="text-center mb-4 fw-semibold text-primary border-bottom pb-2 mt-2">
      <i class="bi bi-car-front me-2"></i>Registro de Vehículos
    </h4>

    <form @submit.prevent="guardarVehiculo" class="mb-2 mt-1">
      <!-- FILA: Tipo, Marca, Modelo, Estado -->
      <div class="row g-1 align-items-center">
        <div class="col d-flex align-items-center">
          <label class="form-label mb-0 me-1 text-nowrap small">Tipo:</label>
          <div class="form-check form-check-inline mb-0">
            <input class="form-check-input" type="radio" id="tipo-coche" value="coche" v-model="vehiculo.tipo" />
            <label class="form-check-label small" for="tipo-coche">Coche</label>
          </div>
          <div class="form-check form-check-inline mb-0">
            <input class="form-check-input" type="radio" id="tipo-furgoneta" value="furgoneta"
              v-model="vehiculo.tipo" />
            <label class="form-check-label small" for="tipo-furgoneta">Furgoneta</label>
          </div>
          <div class="form-check form-check-inline mb-0">
            <input class="form-check-input" type="radio" id="tipo-moto" value="moto" v-model="vehiculo.tipo" />
            <label class="form-check-label small" for="tipo-moto">Moto</label>
          </div>
        </div>

        <div class="col d-flex align-items-center">
          <label for="marca" class="form-label mb-0 me-1 text-nowrap small">Marca:</label>
          <input type="text" id="marca" v-model="vehiculo.marca" @blur="capitalizarTexto('marca')"
            class="form-control form-control-sm rounded-0 shadow-none border" required />
        </div>

        <div class="col d-flex align-items-center">
          <label for="modelo" class="form-label mb-0 me-1 text-nowrap small">Modelo:</label>
          <input type="text" id="modelo" v-model="vehiculo.modelo" @blur="capitalizarTexto('modelo')"
            class="form-control form-control-sm rounded-0 shadow-none border" required />
        </div>

        <div class="col d-flex align-items-center">
          <label for="matricula" class="form-label mb-0 me-1 text-nowrap small">Matrícula:</label>
          <input type="text" id="matricula" v-model="vehiculo.matricula" @blur="convertirMatriculaMayusculas"
            class="form-control form-control-sm rounded-0 shadow-none border" />
        </div>

        <div class="col d-flex align-items-center">
          <label for="anio" class="form-label mb-0 me-1 text-nowrap small">Año:</label>
          <input type="number" id="anio" v-model="vehiculo.anio"
            class="form-control form-control-sm rounded-0 shadow-none border text-end" required />
        </div>

        <div class="col-auto d-flex align-items-center">
          <label class="form-label mb-0 me-1 small">Estado:</label>
          <select v-model="vehiculo.estado"
            class="form-select form-select-sm d-inline-block w-auto rounded shadow-none border">
            <option value="disponible">Disponible</option>
            <option value="vendido">Vendido</option>
            <option value="reservado">Reservado</option>
          </select>
        </div>
      </div>

      <!-- FILA: Año, Kilómetros, Precio -->
      <div class="row g-3 align-items-center mt-2">
        <div class="col-12 col-md-2 d-flex align-items-center">
          <label for="kilometros" class="form-label mb-0 me-3 text-nowrap">Kilómetros:</label>
          <input type="number" id="kilometros" v-model="vehiculo.kilometros"
            class="form-control rounded-0 shadow-none border text-end" required />
        </div>

        <div class="col-12 col-md-2 d-flex align-items-center">
          <label for="precio" class="form-label mb-0 me-3 text-nowrap">Precio (€):</label>
          <input type="number" id="precio" v-model="vehiculo.precio"
            class="form-control rounded-0 shadow-none border text-end" required />
        </div>

        <div class="col-12 col-md-2 d-flex align-items-center">
          <label for="combustible" class="form-label mb-0 me-3 text-nowrap">Combustible:</label>
          <select id="combustible" v-model="vehiculo.combustible" class="form-select rounded-0 shadow-none border">
            <option disabled value="">Seleccione</option>
            <option>Gasolina</option>
            <option>Diésel</option>
            <option>Híbrido</option>
            <option>GLP</option>
            <option>Eléctrico</option>
          </select>
        </div>

        <div class="col-12 col-md-3 d-flex align-items-center">
          <label class="form-label mb-0 me-3 text-nowrap">Transmisión:</label>
          <div class="d-flex align-items-center">
            <div class="form-check form-check-inline">
              <input class="form-check-input" type="radio" id="transmision-manual" value="coche"
                v-model="vehiculo.transmision" />
              <label class="form-check-label" for="transmision-manual">Manual</label>
            </div>
            <div class="form-check form-check-inline">
              <input class="form-check-input" type="radio" id="transmision-automatica" value="automatica"
                v-model="vehiculo.transmision" />
              <label class="form-check-label" for="transmision-automatica">Automática</label>
            </div>
          </div>
        </div>

        <div class="col-12 col-md-2 d-flex align-items-center">
          <label for="potencia" class="form-label mb-0 me-3 text-nowrap">Potencia (CV):</label>
          <input type="number" id="potencia" v-model="vehiculo.potencia_cv"
            class="form-control rounded-0 shadow-none border text-end" />
        </div>
      </div>
      <!-- FILA: Descripción -->
      <div class="col g-2 mt-3">
        <label for="descripcion" class="form-label">Descripción:</label>
        <textarea id="descripcion" v-model="vehiculo.descripcion" rows="3"
          class="form-control rounded shadow-none border mb-2" placeholder="Describe el estado, revisiones, etc.">
          </textarea>
      </div>

      <!-- FILA: Imagen del vehículo-->
      <div class="row g-3 align-items-center mb-3">
        <div class="col-12 col-md-3 d-flex align-items-center">
          <label for="foto" class="form-label mb-0 me-2 text-nowrap">Imagen del Vehículo:</label>
          <input type="file" id="foto" accept="image/*" @change="onFileChange"
            class="form-control-file col-md-10 border rounded-0 shadow-none btn-file-azul" />
        </div>
      </div>

      <h6 class="text-center fw-semibold bg-primary-subtle py-1 rounded">
        <i class="bi bi-person me-2"></i>Cliente Ubicación
      </h6>
      <!-- FILA: Ubicación -->
      <div class="row g-3 align-items-center mt-3">
        <div class="col-12 col-md-4">
          <label for="provincia" class="form-label">Provincia:</label>
          <select id="provincia" v-model="vehiculo.ubicacion.provincia" class="form-select rounded shadow-none border"
            @change="filtrarCiudades">
            <option disabled value="">Seleccione provincia</option>
            <option v-for="prov in provincias" :key="prov.id" :value="prov.nm">{{ prov.nm }}</option>
          </select>
        </div>

        <div class="col-12 col-md-4">
          <label for="ciudad" class="form-label">Ciudad:</label>
          <select id="ciudad" v-model="vehiculo.ubicacion.ciudad" class="form-select rounded shadow-none border">
            <option disabled value="">Seleccione ciudad</option>
            <option v-for="mun in municipiosFiltrados" :key="mun.id" :value="mun.nm">{{ mun.nm }}</option>
          </select>
        </div>

        <div class="col-12 col-md-4">
          <label for="fecha_publicacion" class="form-label">Fecha Publicación:</label>
          <input type="date" id="fecha_publicacion" v-model="vehiculo.fecha_publicacion"
            class="form-control rounded shadow-none border" />
        </div>
      </div>

      <!-- FILA: Contacto -->
      <div class="row g-3 align-items-center mt-3">
        <div class="col-12 col-md-4">
          <label for="contacto_nombre" class="form-label">Nombre Contacto:</label>
          <input type="text" id="contacto_nombre" v-model="vehiculo.contacto.nombre"
            @blur="capitalizarContacto('nombre')" class="form-control rounded shadow-none border" />
        </div>
        <div class="col-12 col-md-4">
          <label for="contacto_telefono" class="form-label">Teléfono:</label>
          <input type="tel" id="contacto_telefono" v-model="vehiculo.contacto.telefono" @blur="validarTelefono"
            class="form-control rounded shadow-none border text-center" :class="{ 'is-invalid': !telefonoValido }" />
          <div v-if="!telefonoValido" class="invalid-feedback">
            Teléfono inválido (debe empezar por 6 o 7 y tener 9 dígitos).
          </div>
        </div>
        <div class="col-12 col-md-4">
          <label for="contacto_email" class="form-label">Email:</label>
          <input type="email" id="contacto_email" v-model="vehiculo.contacto.email" @blur="validarEmail"
            class="form-control rounded shadow-none border" :class="{ 'is-invalid': !emailValido }" />
          <div v-if="!emailValido" class="invalid-feedback">
            Email inválido.
          </div>
        </div>
      </div>

      <!-- FILA: botón -->
      <div class="d-flex align-items-center justify-content-center mt-3">
        <div>
          <button type="button" @click="limpiarFormulario"
            class="btn btn-secondary rounded border shadow-none px-3 me-2" title="Limpiar formulario">
            <i class="bi bi-arrow-clockwise"></i>
          </button>
          <button v-if="editando" @click.prevent="eliminarVehiculo(vehiculoEditandoId)"
            class="btn btn-danger rounded border shadow-none px-4 me-2" type="button">
            <i class="bi bi-trash me-1"></i>Eliminar
          </button>
          <button class="btn btn-primary rounded border shadow-none px-4" type="submit">{{ editando ?
            "Modificar" : "Guardar" }}</button>
        </div>
      </div>
    </form>

    <!-- Tabla de vehículos -->
    <div class="table-responsive mt-5">
      <h4 class="text-center w-100 mb-3">Listado de Vehículos</h4>
      <table class="table table-bordered table-striped table-hover table-sm align-middle">
        <thead class="table-primary">
          <tr>
            <th class="text-center">Matrícula</th>
            <th class="text-center">Marca</th>
            <th class="text-center">Modelo</th>
            <th class="text-center">Precio</th>
            <th class="text-center">Estado</th>
            <th class="text-center">Contacto</th>
            <th class="text-center w-10">Acciones</th>
          </tr>
          <!-- Fila de filtros -->
          <tr class="table-light">
            <th></th>
            <th>
              <select v-model="filtroMarca" class="form-select form-select-sm border-0 shadow-none">
                <option value="">Todas las marcas</option>
                <option v-for="marca in marcasUnicas" :key="marca" :value="marca">{{ marca }}</option>
              </select>
            </th>
            <th></th>
            <th>
              <select v-model="filtroPrecio" class="form-select form-select-sm border-0 shadow-none">
                <option value="">Todos los precios</option>
                <option value="0-5000">Hasta 5.000€</option>
                <option value="5000-10000">5.000€ - 10.000€</option>
                <option value="10000-20000">10.000€ - 20.000€</option>
                <option value="20000-30000">20.000€ - 30.000€</option>
                <option value="30000-50000">30.000€ - 50.000€</option>
                <option value="50000-100000">50.000€ - 100.000€</option>
                <option value="100000-999999999">Más de 100.000€</option>
              </select>
            </th>
            <th>
              <select v-model="filtroEstado" class="form-select form-select-sm border-0 shadow-none">
                <option value="">Todos</option>
                <option value="disponible">Disponible</option>
                <option value="vendido">Vendido</option>
                <option value="reservado">Reservado</option>
              </select>
            </th>
            <th></th>
            <th class="text-center">
              <button @click="limpiarFiltros" class="btn btn-outline-secondary btn-sm" title="Limpiar filtros">
                <i class="bi bi-x-circle"></i>
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="vehiculoItem in vehiculosPaginados" :key="vehiculoItem._id">
            <th class="text-center">
              {{ vehiculoItem.matricula }}
            </th>
            <td>{{ vehiculoItem.marca }}</td>
            <td>{{ vehiculoItem.modelo }}</td>
            <td class="text-end">{{ formatPrecio(vehiculoItem.precio) }}</td>
            <td class="text-center"><span class="badge" :class="getEstadoClass(vehiculoItem.estado)">
                {{ displayEstado(vehiculoItem.estado) }}
              </span></td>
            <td class="small">
              <strong>{{ vehiculoItem.contacto.nombre }}</strong> |
              <i class="bi bi-telephone me-1"></i>{{ vehiculoItem.contacto.telefono }}
            </td>
            <td class="text-center">
              <button @click="editarVehiculo(vehiculoItem)"
                class="btn btn-warning btn-sm border-0 shadow-none rounded-0" title="Editar vehículo">
                <i class="bi bi-pencil"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Navegación de página -->
      <div class="d-flex justify-content-center my-3">
        <button class="btn btn-outline-primary btn-sm me-2 rounded-0 border-1 shadow-none" @click="beforePagina"
          :disabled="currentPage <= 1">
          <i class="bi bi-chevron-left"></i>
        </button>
        <span class="mx-3 align-self-center text-muted">Página {{ currentPage }} de {{ totalPages }}</span>
        <button class="btn btn-outline-primary btn-sm rounded-0 border-1 shadow-none" @click="nextPagina"
          :disabled="currentPage >= totalPages">
          <i class="bi bi-chevron-right"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import Swal from "sweetalert2"
import { ref, computed, onMounted } from "vue"
import { addArticulo, getArticulos, updateArticulo, deleteArticulo } from "@/api/articulos.js"
import provmuniData from "../../backend/data/provmuni.json"

const vehiculos = ref([]);
const currentPage = ref(1);
const vehiculosPerPage = 10;

// Filtros de la tabla
const filtroMarca = ref('');
const filtroEstado = ref('');
const filtroPrecio = ref('');

const vehiculo = ref({
  tipo: "",
  matricula: "",
  marca: "",
  modelo: "",
  anio: "",
  estado: "",
  kilometros: "",
  precio: "",
  combustible: "",
  transmision: "",
  potencia_cv: "",
  descripcion: "",
  ubicacion: {
    provincia: "",
    ciudad: ""
  },
  contacto: {
    nombre: "",
    telefono: "",
    email: ""
  },
  fecha_publicacion: "",
  estado: "disponible"
})

const editando = ref(false);
const vehiculoEditandoId = ref(null);

// Cargar vehículos al montar
onMounted(async () => {
  await cargarVehiculos();
});

const cargarVehiculos = async () => {
  try {
    const data = await getArticulos();
    // Forzar reactividad creando un nuevo array
    vehiculos.value = [...data];
    console.log('🔄 Vehículos recargados:', vehiculos.value.length);
  } catch (error) {
    console.error("Error al cargar vehículos:", error);
  }
};

// Paginación
const vehiculosFiltrados = computed(() => {
  return vehiculos.value.filter(v => {
    const coincideMarca = !filtroMarca.value || v.marca === filtroMarca.value;
    const coincideEstado = !filtroEstado.value || v.estado === filtroEstado.value;
    
    // Filtro por precio
    let coincidePrecio = true;
    if (filtroPrecio.value) {
      const [min, max] = filtroPrecio.value.split('-').map(Number);
      const precio = Number(v.precio) || 0;
      coincidePrecio = precio >= min && precio <= max;
    }
    
    return coincideMarca && coincideEstado && coincidePrecio;
  });
});

const vehiculosPaginados = computed(() => {
  const start = (currentPage.value - 1) * vehiculosPerPage;
  const end = start + vehiculosPerPage;
  return vehiculosFiltrados.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(vehiculosFiltrados.value.length / vehiculosPerPage);
});

// Obtener marcas únicas para el filtro
const marcasUnicas = computed(() => {
  const marcas = vehiculos.value.map(v => v.marca).filter(Boolean);
  return [...new Set(marcas)].sort();
});

// Limpiar filtros
const limpiarFiltros = () => {
  filtroMarca.value = '';
  filtroEstado.value = '';
  filtroPrecio.value = '';
  currentPage.value = 1;
};

// Formatear precio
const formatPrecio = (precio) => {
  if (!precio && precio !== 0) return '-';
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(precio);
};

const beforePagina = () => {
  if (currentPage.value > 1) currentPage.value--;
};

const nextPagina = () => {
  if (currentPage.value < totalPages.value) currentPage.value++;
};

// Cargar provincias y municipios desde JSON
const provincias = ref(provmuniData.provincias);
const municipios = ref(provmuniData.municipios);
const municipiosFiltrados = ref([]);

// Filtrar municipios según provincia seleccionada
const filtrarCiudades = () => {
  const nombreProv = vehiculo.value.ubicacion.provincia;
  const prov = provincias.value.find((p) => p.nm === nombreProv);
  if (!prov) {
    municipiosFiltrados.value = [];
    return;
  }
  const codigoProv = prov.id.slice(0, 2);
  municipiosFiltrados.value = municipios.value.filter((m) =>
    m.id.startsWith(codigoProv)
  );
  // Preserve existing ciudad if it still belongs to the selected provincia
  const ciudadActual = vehiculo.value?.ubicacion?.ciudad || '';
  const existe = municipiosFiltrados.value.some(m => m.nm === ciudadActual);
  if (!existe) {
    vehiculo.value.ubicacion.ciudad = "";
  }
};

const capitalizarTexto = (campo) => {
  const texto = vehiculo.value[campo] ?? "";
  if (texto.trim() === "") return;
  vehiculo.value[campo] = texto
    .toLowerCase()
    .split(" ")
    .map((palabra) => {
      if (!palabra) return "";
      return palabra.charAt(0).toUpperCase() + palabra.slice(1);
    })
    .join(" ");
};

const capitalizarContacto = (campo) => {
  const texto = vehiculo.value.contacto[campo] ?? "";
  if (texto.trim() === "") return;
  vehiculo.value.contacto[campo] = texto
    .toLowerCase()
    .split(" ")
    .map((palabra) => {
      if (!palabra) return "";
      return palabra.charAt(0).toUpperCase() + palabra.slice(1);
    })
    .join(" ");
};

// Validar teléfono
const telefonoValido = ref(true);
const telefonoRegex = /^[67]\d{8}$/;

const validarTelefono = () => {
  const telefono = vehiculo.value.contacto.telefono.trim();

  if (telefono === "") {
    telefonoValido.value = true; // Vacío = válido (opcional)
    return true;
  }

  if (telefono.charAt(0) === "6" || telefono.charAt(0) === "7") {
    telefonoValido.value = telefonoRegex.test(telefono);
    return telefonoValido.value;
  } else {
    telefonoValido.value = false;
    return false;
  }
};

// Validar email
const emailValido = ref(true);
const validarEmail = () => {
  const email = vehiculo.value.contacto.email.trim();
  if (email === "") {
    emailValido.value = true; // Vacío = válido (opcional)
    return true;
  }
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  emailValido.value = regex.test(email);
};

// Enviar datos al backend
const guardarVehiculo = async () => {
  // Validar campos obligatorios
  if (!vehiculo.value.tipo) {
    Swal.fire({
      icon: 'error',
      title: 'Campo obligatorio',
      text: 'Debe seleccionar el tipo de vehículo.',
      showConfirmButton: true
    });
    return;
  }

  if (!vehiculo.value.marca || !vehiculo.value.modelo || !vehiculo.value.anio) {
    Swal.fire({
      icon: 'error',
      title: 'Campos obligatorios',
      text: 'Marca, modelo y año son campos obligatorios.',
      showConfirmButton: true
    });
    return;
  }

  if (!vehiculo.value.kilometros || !vehiculo.value.precio) {
    Swal.fire({
      icon: 'error',
      title: 'Campos obligatorios',
      text: 'Kilómetros y precio son campos obligatorios.',
      showConfirmButton: true
    });
    return;
  }

  if (!vehiculo.value.combustible) {
    Swal.fire({
      icon: 'error',
      title: 'Campo obligatorio',
      text: 'Debe seleccionar el tipo de combustible.',
      showConfirmButton: true
    });
    return;
  }

  if (!vehiculo.value.transmision) {
    Swal.fire({
      icon: 'error',
      title: 'Campo obligatorio',
      text: 'Debe seleccionar el tipo de transmisión.',
      showConfirmButton: true
    });
    return;
  }

  if (!vehiculo.value.ubicacion.provincia || !vehiculo.value.ubicacion.ciudad) {
    Swal.fire({
      icon: 'error',
      title: 'Campos obligatorios',
      text: 'Provincia y ciudad son campos obligatorios.',
      showConfirmButton: true
    });
    return;
  }

  if (!vehiculo.value.contacto.nombre || !vehiculo.value.contacto.telefono || !vehiculo.value.contacto.email) {
    Swal.fire({
      icon: 'error',
      title: 'Datos de contacto incompletos',
      text: 'Nombre, teléfono y email de contacto son obligatorios.',
      showConfirmButton: true
    });
    return;
  }

  // Validar teléfono antes de guardar
  if (!telefonoValido.value) {
    Swal.fire({
      icon: 'error',
      title: 'Teléfono inválido',
      text: 'El teléfono debe empezar por 6 o 7 y tener 9 dígitos.',
      showConfirmButton: true
    });
    return;
  }

  // Validar email antes de guardar
  if (!emailValido.value) {
    Swal.fire({
      icon: 'error',
      title: 'Email inválido',
      text: 'Por favor, introduce un email válido.',
      showConfirmButton: true
    });
    return;
  }

  try {

    const formData = new FormData();

    if (archivo.value) {
      formData.append('imagen', archivo.value);
    }

    formData.append('vehiculo', JSON.stringify(vehiculo.value));

    if (editando.value) {
      // Modificar vehículo existente
      const actualizado = await updateArticulo(vehiculoEditandoId.value, formData);

      if (actualizado && actualizado._id) {
        // Recargar lista ANTES de mostrar el mensaje
        await cargarVehiculos();
        
        Swal.fire({
          icon: "success",
          title: "Vehículo modificado",
          text: "El vehículo ha sido actualizado correctamente.",
          timer: 2000,
          showConfirmButton: false
        });
      }
      editando.value = false;
      vehiculoEditandoId.value = null;
    } else {
      // Agregar nuevo vehículo
      const nuevo = await addArticulo(formData);

      if (nuevo && nuevo._id) {
        // Recargar lista ANTES de mostrar el mensaje
        await cargarVehiculos();
        
        Swal.fire({
          icon: "success",
          title: "Vehículo guardado",
          text: "El vehículo ha sido guardado correctamente.",
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        console.error("Error al guardar el vehículo");
      }
    }

    // Ya no necesitamos recargar aquí porque ya se recargó arriba
    // await cargarVehiculos();

    // Limpiar formulario
    Object.assign(vehiculo.value, {
      tipo: "",
      matricula: "",
      marca: "",
      modelo: "",
      anio: "",
      estado: "disponible",
      kilometros: "",
      precio: "",
      combustible: "",
      transmision: "",
      potencia_cv: "",
      descripcion: "",
      ubicacion: {
        provincia: "",
        ciudad: ""
      },
      contacto: {
        nombre: "",
        telefono: "",
        email: ""
      },
      fecha_publicacion: ""
    });
    archivo.value = null;
    // Limpiar el input de archivo
    const inputFoto = document.getElementById('foto');
    if (inputFoto) {
      inputFoto.value = '';
    }

  } catch (error) {
    console.error("Error al guardar:", error);
  }
};

const archivo = ref(null);

const onFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    archivo.value = file;
  }
};

// Limpiar formulario
const limpiarFormulario = () => {
  Object.assign(vehiculo.value, {
    tipo: "",
    matricula: "",
    marca: "",
    modelo: "",
    anio: "",
    estado: "disponible",
    kilometros: "",
    precio: "",
    combustible: "",
    transmision: "",
    potencia_cv: "",
    descripcion: "",
    ubicacion: {
      provincia: "",
      ciudad: ""
    },
    contacto: {
      nombre: "",
      telefono: "",
      email: ""
    },
    fecha_publicacion: ""
  });

  archivo.value = null;
  editando.value = false;
  vehiculoEditandoId.value = null;
  telefonoValido.value = true;
  emailValido.value = true;

  // Limpiar el input de archivo
  const inputFoto = document.getElementById('foto');
  if (inputFoto) {
    inputFoto.value = '';
  }
};

// Editar vehículo
const editarVehiculo = (vehiculoData) => {
  vehiculo.value = { ...vehiculoData };
  
  // Convertir fecha ISO a formato yyyy-MM-dd para el input type="date"
  if (vehiculo.value.fecha_publicacion) {
    const fecha = new Date(vehiculo.value.fecha_publicacion);
    vehiculo.value.fecha_publicacion = fecha.toISOString().split('T')[0];
  }
  
  editando.value = true;
  vehiculoEditandoId.value = vehiculoData._id;

  // Filtrar municipios según provincia
  filtrarCiudades();

  // Scroll al formulario
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Eliminar vehículo
const eliminarVehiculo = async (id) => {
  const result = await Swal.fire({
    title: '¿Eliminar este vehículo?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  });

  if (!result.isConfirmed) return;

  try {
    await deleteArticulo(id);
    await cargarVehiculos();

    Swal.fire({
      icon: 'success',
      title: 'Vehículo eliminado',
      showConfirmButton: false,
      timer: 1500
    });
  } catch (error) {
    console.error("Error al eliminar vehículo:", error);
    Swal.fire({
      icon: 'error',
      title: 'Error al eliminar',
      text: 'No se pudo eliminar el vehículo.',
      showConfirmButton: true
    });
  }
};

const getEstadoClass = (estado) => {
  const estadoLower = estado?.toLowerCase();
  if (estadoLower === 'disponible') return 'bg-success';
  if (estadoLower === 'vendido') return 'bg-danger';
  if (estadoLower === 'reservado') return 'bg-warning';
  if (estadoLower === 'a_pedido') return 'bg-warning text-dark';
  return 'bg-secondary';
};

// Mostrar texto legible para el estado
const displayEstado = (estado) => {
  if (!estado) return '';
  const map = {
    disponible: 'Disponible',
    vendido: 'Vendido',
    reservado: 'Reservado',
    a_pedido: 'A pedido'
  };
  return map[estado.toLowerCase()] || estado;
};

</script>