<!-- <template>
    <div class="mx-auto mt-2 p-3 pb-5 border rounded-3 shadow-sm min-vh-75 bg-light">
        <h3 class="text-center my-2">Registro de Citas</h3>
        <!-- Formulario -->
<!--
        <form @submit.prevent="guardarCita" class="mb-4">
            <div class="mb-3 row align-items-center">
                <!-- Columna matricula 
                <div class="col-md-4 d-flex align-items-center">
                    <label for="matricula" class="form-label mb-0 w-25 me-4 ms-3">Matrícula: </label>
                    <div class="flex-grow-1 d-flex align-items-center">
                        <input type="text" id="matricula" v-model="nuevaCita.matricula" @blur="validarMatricula"
                            class="form-control w-auto w-25 text-center ms-4 me-5" :class="[
                                { 'is-invalid': !matriculaValida },
                                { 'readonly-input': editando },
                            ]" :readonly="editando" required
                            oninvalid="this.setCustomValidity('Por favor, rellene este campo')"
                            oninput="this.setCustomValidity('')" />

                        <div v-if="!matriculaValida" class="invalid-feedback">
                            Matrícula inválida.
                        </div>
                    </div>
                
                    <!-- RadioButtons 
                    <div class="d-flex align-items-center me-5">
                        <label for="estadoCita" class="form-label me-4 ms-5 mb-0 text-nowrap">Estado Cita:</label>
                        <input type="radio" name="estadoCita" id="estadoCita" value="pendiente" class="me-1"
                            v-model="nuevaCita.estadoCita" checked required />
                        <label class="me-4">Pendiente</label>
                        <input type="radio" name="estadoCita" id="estadoCita" value="finalizado" class="me-1"
                            v-model="nuevaCita.estadoCita" required />
                        <label class="me-5">Finalizado</label>
                    </div>

                    <!-- Columna Fecha de cita a la derecha 
                    <div class=" ms-auto d-flex align-items-center">
                        <label for="fecha_cita" class="form-label me-4 mb-0 text-nowrap">Fecha de Cita:</label>
                        <input type="date" id="fecha_cita" v-model="nuevaCita.fecha_cita" class="form-control w-auto"
                            required oninvalid="this.setCustomValidity('Por favor, rellene este campo')"
                            oninput="this.setCustomValidity('')" />

                    </div>
                </div>
            </div>

            <!-- Servicio del taller 
            <div class="mb-3 row align-items-center">
                <div class="col-12 col-md-7 d-flex align-items-center">
                    <label for="servicio" class="form-label me-5  mb-0 text-nowrap ms-3">Servicio Cita:</label>
                    <input type="radio" name="servicio" id="servicio" value="revision" class="me-2"
                        v-model="nuevaCita.servicio" required />
                    <label class="me-4">Revisión</label>
                    <input type="radio" name="servicio" id="servicio" value="preITV" class="me-2"
                        v-model="nuevaCita.servicio" required />
                    <label class="me-4">PreITV</label>
                    <input type="radio" name="servicio" id="servicio" value="numaticos" class="me-2"
                        v-model="nuevaCita.servicio" required />
                    <label class="me-4">Neumáticos</label>
                    <input type="radio" name="servicio" id="servicio" value="frenos" class="me-2"
                        v-model="nuevaCita.servicio" required />
                    <label class="me-4">Frenos</label>
                    <input type="radio" name="servicio" id="servicio" value="cambioAceite" class="me-2"
                        v-model="nuevaCita.servicio" required />
                    <label class="me-4 text-nowrap">Cambio de Aceite</label>
                </div>
                <!-- Móvil 
                <div class="col-12 col-md-2 d-flex align-items-center ms-5">
                    <label for="movil" class="form-label me-2 ms-5 mb-0 text-nowrap">Móvil:</label>
                    <input type="tel" id="movil" v-model="nuevaCita.movilCliente" @blur="validarMovil"
                        class="form-control flex-grow-1 text-center" :class="{ 'is-invalid': !movilValido }" />
                </div>

            </div>

            


            <!-- Aceptar condiciones 
            <div class="mb-4">
                <div class="d-flex align-items-center justify-content-between position-relative">
                    <!-- Espacio izquierdo vacío para equilibrar -->
<div style="flex: 1"></div>

<!-- Aceptar condiciones y términos (centro absoluto) 
                    <div class="position-absolute start-50 translate-middle-x">
                        <div class="form-check d-flex align-items-center">
                            <input type="checkbox" id="acepta" class="form-check-input me-2" v-model="nuevaCita.acepta"
                                required />
                            <label for="acepta" class="form-check-label mb-0 text-nowrap">
                                Aceptar términos y condiciones:
                                <a target="_blank" class="text-decoration-none" href="/avisolegal">
                                    Aviso Legal
                                </a>
                            </label>
                        </div>
                    </div>

                </div>
            </div>

            <!-- Botón centrado (centro) 
            <div class="d-flex justify-content-center align-items-center">
                <button type="submit" class="btn btn-primary border-0 shadow-none rounded-0">
                    {{ editando ? "Modificar" : "Guardar" }}
                </button>
            </div>
        </form>
        <!-- Lista de citas 
        <div class="table-responsive">
            <h4 class="text-center w-100">Listado Citas</h4>
            <table class="table table-bordered table-striped table-hover table-sm align-middle">
                <thead class="table-primary">
                    <tr>
                        <th class="text-center" scope="col">ID</th>
                        <th class="text-center" scope="col">Fecha Cita</th>
                        <th class="text-center" scope="col">Matrícula</th>
                        <th class="text-center" scope="col">Móvil</th>
                        <th class="text-center" scope="col">Servicio</th>
                        <th class="text-center" scope="col">Estado Cita</th>
                        <th class="text-center" scope="col" style="width: 150px">
                            Acciones
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(cita, index) in citasPaginadas" :key="cita.id || index">
                        <th scope="row" class="text-center">{{ (currentPage - 1) * citasPorPage + index + 1 }}</th>
                        <td>{{ cita.fecha_cita }}</td>
                        <td>{{ cita.matricula }}</td>
                        <td class="text-center">{{ cita.movilCliente }}</td>
                        <td class="text-center">{{ cita.servicio }}</td>
                        <td class="text-center">{{ cita.estadoCita }}</td>
                        <td class="text-start">

                            <button @click="eliminarCita(cita.movilCliente)"
                                class="btn btn-danger btn-sm border-0 ms-4 me-2 shadow-none rounded-0">
                                <i class="bi bi-trash"></i>
                            </button>

                            <button @click="editarCita(cita.movilCliente)"
                                class="btn btn-warning btn-sm shadow-none rounded-0" title="Editar cita"
                                aria-label="Editar cita">
                                <i class="bi bi-pencil"></i>
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
    <!-- Navegación de página
    <div class="d-flex justify-content-center my-3">
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
import {
    getCitas,
    addCita,
    deleteCita,
    updateCita
} from "@/api/citas.js";
import Swal from "sweetalert2";




//////////////// SCRIPTS CRUD ////////////////////


const nuevaCita = ref({
    matricula: "",
    movilCliente: "",
    fecha_cita: "",
    servicio: "",
    estadoCita: "",
    acepta: false
});






// Declaraciones de estado o variables reactivas
const editando = ref(false); // Estado de edición para el formulario 
const citaEditandoId = ref(null);

const citas = ref([]); // Array de citas cargados desde la API
const numCitas = ref(0); // Número total de citas para paginación

const currentPage = ref(1); // Página actual para paginación
const citasPorPage = 10; // Número de citas por página





///avanzar y retroceder

// Métodos de paginación
const beforePagina = () => {
    if (currentPage.value > 1) {
        currentPage.value--;
    }
};

const nextPagina = () => {
    const totalPages = Math.ceil(numCitas.value / citasPorPage);
    //redondear hacia arriba para mostrar la última página aunque no esté completa
    if (currentPage.value < totalPages) {
        currentPage.value++;
    }
};



/*
Propiedad computada para obtener los clientes en la página actual
computed crea una propiedad reactiva que se actualiza automáticamente
cuando cambia las dependencias (currentPage o clientes)
es decir paso pagina o vuelvo atrás cargando los cloentes de esa página
slice extrae una sección del array clientes
start es el índice inicial y end el indice final (no incluido)
*/
const citasPaginadas = computed(() => {
    const start = (currentPage.value - 1) * citasPorPage;
    const end = start + citasPorPage;
    return citas.value.slice(start, end);
});

// //Propiedad computada para el numero total de paginas
// const totalPages = computed(() => {
//   return Math.ceil(numClientes.value/clientesPorPage)
// })



// Guardar Clientes
const guardarCita = async () => {
    nuevaCita.value.fecha_cita = formatearFechaParaInput(
        nuevaCita.fecha_cita
    );
    // Validar duplicados solo si estás creando (no si editando)
    if (!editando.value) {
        const duplicado = citas.value.find(
            (cita) =>
                cita.matricula === nuevaCita.value.matricula ||
                cita.movilCliente === nuevaCita.value.movilCliente
        );
        if (duplicado) {
            Swal.fire({
                title: "matricula guardada ya en la base de datos",
                showConfirmButton: false,
                timer: 2000,
            });
        }
    }

    // Confirmación antes de guardar
    const result = await Swal.fire({
        title: editando.value
            ? "¿Desea modificar esta cita?"
            : "¿Desea grabar esta cita?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: editando.value ? "Modificar" : "Grabar",
        cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
        if (editando.value) {
            // Modificar cliente (PUT)
            const citaActualizada = await updateCita(
                citaEditandoId.value,
                nuevaCita.value
            );
            // Actualiza el cliente en la lista local
            const index = citas.value.findIndex(
                (c) => c.id === citaEditandoId.value
            );
            if (index !== -1) citas.value[index] = citaActualizada;
            Swal.fire({
                icon: "success",
                title: "Cita modificada",
                showConfirmButton: false,
                timer: 1500,
            });
        } else {
            // Agregar cliente (POST)
            const citaAgregada = await addCita(nuevaCita.value);
            citas.value.push(citaAgregada);
            Swal.fire({
                icon: "success",
                title: "Cita agregada",
                showConfirmButton: false,
                timer: 1500,
            });
        }

        // Reset formulario y estado
        nuevaCita.value = {
            matricula: "",
            movilCliente: "",
            fecha_cita: "",
            servicio: "",
            estadoCita: "",
            acepta: false
        };

        editando.value = false;
        citaEditandoId.value = null;

        // Reset validaciones si tienes (dniValido, movilValido, etc)
        matriculaValida.value = true;
        movilValido.value = true;

        // Refrescar lista completa (opcional)
        citas.value = await getCitas();
    } catch (error) {
        console.error("Error al guardar cita:", error);
        Swal.fire({
            icon: "error",
            title: "Error al guardar cita",
            text: "Inténtelo de nuevo o contacte con el administrador.",
            showConfirmButton: false,
            timer: 1500,
        });
    }
};


// Cargar Clientes
onMounted(async () => {
    cargarCitas();
    currentPage.value = 1;
});

const cargarCitas = () => {
    getCitas(acepta.value).then((data) => {
        citas.value = data;
        numCitas.value = data.length
        currentPage.value = 1
    });
    Swal.fire({
        icon: "success",
        title: "Listando Citas...",
        showConfirmButton: false,
        timer: 1500,
    });
};


/* Cargar Cliente
onMounted(async () => {
  guardarCliente();
});
*/

// Funcion Eliminar Cliente con patch (histórico a false)
const eliminarCita = async (movilCliente) => {
    citas.value = await getCitas();
    const citaAEliminar = citas.value.find(
        (cita) => cita.movilCliente === movilCliente
    );

    if (!citaAEliminar) {
        Swal.fire({
            icon: "error",
            title: "Cita no encontrado",
            showConfirmButton: false,
            timer: 1500,
        });
        return;
    }

    const result = await Swal.fire({
        title: `¿Eliminar la cita ${citaAEliminar.matricula}?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
    });
    if (!result.isConfirmed) return;
    await deleteCita(citaAEliminar.id);
    citas.value = await getCitas();

    Swal.fire({
        icon: "success",
        title: "Cita eliminado",
        showConfirmButton: false,
        timer: 1500,
    });
};

// Cargar los clientes al montar el componente 
onMounted(async () => {
    citas.value = await getCitas();
    Swal.fire({
        icon: "success",
        title: "Listando Citas...",
        showConfirmButton: false,
        timer: 1500,
    });

});

// Función Editar Cliente 
const editarCita = (movilCliente) => {
    const cita = citas.value.find((c) => c.movilCliente === movilCliente);
    if (!cita) {
        Swal.fire({
            icon: "error",
            title: "Cita no encontrado",
            showConfirmButton: false,
            timer: 1500,
        });
        return;
    }
    // Copiar datos al formulario
    nuevaCita.value = { ...cita }; // 🔁 Aquí cargas el formulario con los datos
    editando.value = true;
    // Formatear fecha para el input type="date"
    nuevaCita.value.fecha_cita = formatearFechaParaInput(cita.fecha_cita);
    // Actualiza municipios filtrados según la provincia seleccionada
    filtrarMunicipios();
    nuevaCita.value.servicio = cita.servicio; // 🟢 Ahora estamos en modo edición
    nuevaCita.value.estadoCita = cita.estadoCita;
    citaEditandoId.value = cliente.id;
};

///////////////Función para activar cliente (poner historico en true)
const activarCita = async (cita) => {
    const confirmacion = await Swal.fire({
        title: `¿Activar cita ${cita.matricula}?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Activar",
        cancelButtonText: "Cancelar",
    });

    if (!confirmacion.isConfirmed) return;

    try {
        // Crear una copia del cliente con historico en true
        const citaActivada = { ...cita, acepta: true };

        // Llamar a la API para actualizar
        const actualizado = await updateCita(cita.id, citaActivada);

        // Actualizar la lista local (opcional, también puedes volver a cargar todo)
        const index = citas.value.findIndex((c) => c.id === cita.id);
        if (index !== -1) {
            citas.value[index] = actualizado;
        }

        Swal.fire({
            icon: "success",
            title: "Cita reactivado",
            showConfirmButton: false,
            timer: 1500,
        });

        // Recargar lista actualizada
        await cargarCitas();
    } catch (error) {
        console.error("Error al reactivar cita:", error);
        Swal.fire({
            icon: "error",
            title: "Error al activar cita",
            text: "Por favor, intenta de nuevo.",
            timer: 1500,
        });
    }
};

/////////////////////SCRIPTS AUXILIARES/////////////////////

const matriculaValida = ref(true);


// Conversor de fecha
const formatearFechaParaInput = (fecha) => {
    if (!fecha) return "";
    const partes = fecha.split("/");
    if (partes.length !== 3) return "";
    // formato partes = [dd, mm, yyyy]
    return `${partes[2]}-${partes[1].padStart(2, "0")}-${partes[0].padStart(
        2,
        "0"
    )}`;
};

///// VALIDACIONES /////




// Validar al salir del campo
const validarMatricula = () => {
    nuevaCita.value.matricula = nuevaCita.value.matricula.trim().toUpperCase();

    if (nuevaCita.value.matricula.length <= 10) {
        return true
    } else {
        return false;
    }
};

// Validar Movil
const movilValido = ref(true);
const movilRegex = /^[67]\d{8}$/;

const validarMovil = () => {
    const movil = nuevaCita.value.movil.trim();

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


const agregarCita = () => {
    citas.value.push({ ...nuevaCita.value });
    // Reiniciar el formulario
    nuevaCita.value = {
        matricula: "",
        movilCliente: "",
        fecha_cita: "",
        servicio: "",
        estadoCita: "",
        acepta: false
    };
};


// Función única: capitaliza y asigna en el mismo paso
const capitalizarTexto = (campo) => {
    const texto = nuevaCita.value[campo] ?? "";
    nuevaCita.value[campo] = texto
        .toLowerCase()
        .split(" ")
        .map((palabra) => {
            if (!palabra) return "";
            return palabra.charAt(0).toLocaleUpperCase() + palabra.slice(1);
        })
        .join(" ");
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
</style> -->

<template>
    <div class="container-fluid my-2 p-2 border rounded-0 shadow-sm bg-light">
        <h5 class="text-center bg-primary-subtle py-1">
            <i class="bi bi-wrench me-2"></i>Citas Taller
        </h5>

        <!-- Formulario -->
        <div class="container-lg mx-auto">
            <form @submit.prevent="guardarCita" class="mb-3 mt-2">
                <div class="row g-3 align-items-center">
                    <!-- Matrícula -->
                    <div class="col-12 col-md-3 d-flex align-items-center">
                        <label for="matricula" class="form-label mb-0 me-2 text-nowrap align-middle">Matrícula:</label>
                        <input id="matricula" type="text" v-model="nuevaCita.matricula"
                            class="form-control text-center rounded-0 shadow-none border" @blur="capitalizarMatricula"
                            required />
                    </div>

                    <!-- Móvil Cliente -->
                    <div class="col-12 col-md-3 d-flex align-items-center">
                        <label for="movilCliente" class="form-label mb-0 me-2 text-nowrap align-middle">Móvil
                            Cliente:</label>
                        <input id="movilCliente" type="tel" v-model="nuevaCita.movilCliente"
                            class="form-control text-center rounded-0 shadow-none border" @blur="verificarCliente"
                            required />
                    </div>

                    <!-- Fecha Cita -->
                    <div class="col-12 col-md-3 d-flex align-items-center">
                        <label for="fechaCita" class="form-label mb-0 me-2 text-nowrap align-middle">Fecha Cita:</label>
                        <input id="fechaCita" type="date" v-model="nuevaCita.fechaCita"
                            class="form-control text-center rounded-0 shadow-none border" required />
                    </div>

                    <!-- Botón limpiar -->
                    <div class="col-12 col-md-1 d-flex justify-content-end">
                        <button type="button" class="btn btn-light border rounded-0 shadow-none"
                            title="Limpiar formulario" @click="limpiarFormulario">
                            <i class="bi bi-arrow-clockwise"></i>
                        </button>
                    </div>
                </div>

                <!-- Servicio y Estado -->
                <div class="row g-3 align-items-center mt-2">
                    <div class="col-12 col-md-4 d-flex align-items-center">
                        <label for="servicioTaller"
                            class="form-label mb-0 me-3 text-nowrap align-middle">Servicio:</label>
                        <select id="servicioTaller" v-model="nuevaCita.servicioTaller"
                            class="form-select rounded-0 shadow-none border" required>
                            <option disabled value="">Seleccione servicio</option>
                            <option v-for="servicio in serviciosTaller" :key="servicio" :value="servicio">
                                {{ servicio }}
                            </option>
                        </select>
                    </div>

                    <div class="col-12 col-md-3 ms-4 d-flex align-items-center">
                        <label class="form-label mb-0 me-3 text-nowrap align-middle">Estado:</label>
                        <div class="d-flex gap-3">
                            <div class="form-check">
                                <input class="form-check-input" type="radio" name="estadoCita" id="pendiente"
                                    value="Pendiente" v-model="nuevaCita.estadoCita" required />
                                <label class="form-check-label" for="pendiente">Pendiente</label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="radio" name="estadoCita" id="finalizado"
                                    value="Finalizado" v-model="nuevaCita.estadoCita" />
                                <label class="form-check-label" for="finalizado">Finalizado</label>
                            </div>
                        </div>
                    </div>

                </div>

                <!-- Checkbox centrado -->
                <div class="row g-3 justify-content-center mt-3">
                    <div class="col-auto d-flex align-items-center">
                        <input type="checkbox" id="acepta" v-model="nuevaCita.acepta" class="form-check-input me-2" />
                        <label for="acepta" class="form-check-label">Acepta presupuesto</label>
                    </div>
                </div>

                <!-- Botón justo debajo -->
                <div class="row g-3 justify-content-center mt-2">
                    <div class="col-auto">
                        <button type="submit" class="btn btn-primary px-4 rounded-0 shadow-none">
                            {{ editando ? 'Modificar' : 'Grabar' }}
                        </button>
                    </div>
                </div>

            </form>
        </div>

        <hr class="border border-1 border-secondary rounded">

        <!-- Tabla Citas -->
        <div class="table-responsive mt-1">
            <h6 class="text-center mb-1 bg-secondary text-white">Listado de Citas</h6>
            <table class="table table-bordered table-striped table-hover table-sm align-middle">
                <thead class="table-primary text-center">
                    <tr>
                        <th>ID</th>
                        <th>Matrícula</th>
                        <th>Móvil</th>
                        <th>Fecha</th>
                        <th>Servicio</th>
                        <th>Estado</th>
                        <th>Acepta</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(cita, index) in citas" :key="cita.id">
                        <td class="text-center">{{ index + 1 }}</td>
                        <td class="text-center">{{ cita.matricula }}</td>
                        <td class="text-center">{{ cita.movilCliente }}</td>
                        <td class="text-center">{{ cita.fechaCita }}</td>
                        <td class="text-center">{{ cita.servicioTaller }}</td>
                        <td class="text-center">{{ cita.estadoCita }}</td>
                        <td class="text-center">{{ cita.acepta ? 'Sí' : 'No' }}</td>
                        <td class="text-center">
                            <button class="btn btn-warning btn-sm me-2" @click="editarCita(cita)">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-danger btn-sm" @click="eliminarCita(cita.id)">
                                <i class="bi bi-trash"></i>
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
// Importaciones, Dependencias y Reactividad
import { ref, onMounted } from 'vue'
import Swal from 'sweetalert2'
import { getCitasTaller, addCitaTaller, updateCitaTaller, deleteCitaTaller } from '@/api/taller.js'
import { getClientes } from '@/api/clientes.js'

// Estado reactivo
const citas = ref([])
const editando = ref(false)
const idEditando = ref(null)
const clientes = ref([])



const nuevaCita = ref({
    matricula: '',
    movilCliente: '',
    fechaCita: '',
    servicioTaller: '',
    estadoCita: 'Pendiente',
    acepta: false
})

const serviciosTaller = ref([
    'Revisión',
    'Pre ITV',
    'Neumáticos',
    'Frenos',
    'Cambio de aceite'
])

// Cargar datos al montar
onMounted(async () => {
    await cargarCitas()
    clientes.value = await getClientes()
})

////////// Funciones CRUD

async function cargarCitas() {
    citas.value = await getCitasTaller()
}

async function guardarCita() {
    if (!nuevaCita.value.acepta) {
        Swal.fire({
            icon: 'warning',
            title: 'Debe aceptar el presupuesto antes de guardar.',
            timer: 2000,
            showConfirmButton: false
        })
        return
    }

    if (editando.value) {
        await updateCitaTaller(idEditando.value, nuevaCita.value)
        Swal.fire({ icon: 'success', title: 'Cita modificada', timer: 1500, showConfirmButton: false })
    } else {
        await addCitaTaller(nuevaCita.value)
        Swal.fire({ icon: 'success', title: 'Cita guardada', timer: 1500, showConfirmButton: false })
    }

    await cargarCitas()
    limpiarFormulario()
}

function editarCita(cita) {
    nuevaCita.value = { ...cita }
    idEditando.value = cita.id
    editando.value = true
}

async function eliminarCita(id) {
    const confirm = await Swal.fire({
        title: '¿Eliminar cita?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Eliminar',
        cancelButtonText: 'Cancelar'
    })
    if (!confirm.isConfirmed) return
    await deleteCitaTaller(id)
    await cargarCitas()
    Swal.fire({ icon: 'success', title: 'Cita eliminada', timer: 1500, showConfirmButton: false })
}

///////// Funciones Auxiliares

function limpiarFormulario() {
    nuevaCita.value = {
        matricula: '',
        movilCliente: '',
        fechaCita: '',
        servicioTaller: '',
        estadoCita: 'Pendiente',
        acepta: false
    }
    editando.value = false
    idEditando.value = null
}

function verificarCliente() {
    const movil = nuevaCita.value.movilCliente.trim()
    if (!movil) return
    const existe = clientes.value.some(c => c.movil === movil)
    if (!existe) {
        Swal.fire({
            icon: 'warning',
            title: 'Cliente no encontrado en la base de datos',
            text: 'Verifique el número o regístrelo primero.',
            timer: 2000,
            showConfirmButton: false
        })
    } else {
        Swal.fire({
            icon: 'success',
            title: 'Cliente en Base de Datos',
            timer: 1500,
            showConfirmButton: false
        })
    }
}

function capitalizarMatricula() {
    nuevaCita.value.matricula = nuevaCita.value.matricula.toUpperCase()
}

</script>

<style scoped>
.is-invalid {
    border-color: #f28b82 !important;
    background-color: #ffe6e6;
}
</style>