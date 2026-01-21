<template>
    <div class="container-fluid px-0">

        <div class="container py-4">

            <!-- Formulario de creación -->
            <div v-if="isAdmin" class="p-4 mb-4 border rounded bg-light shadow-sm">
                <h3 class="mb-3">{{ noticiaEditando ? 'Editar Noticia' : 'Nueva Noticia' }}</h3>
                
                <div class="mb-3">
                    <label for="titulo" class="form-label fw-bold fs-5">Título:</label>
                    <input v-model="nuevoTitulo" type="text" class="form-control bg-body-secondary" id="titulo" 
                            placeholder="Ingresa el título de la noticia" />
                </div>

                <div class="mb-3">
                    <label for="contenido" class="form-label fw-bold fs-5">Contenido:</label>
                    <textarea v-model="nuevoContenido" class="form-control bg-body-secondary" id="contenido"
                        rows="6" placeholder="Escribe el contenido de la noticia..."></textarea>
                </div>

                <div class="text-center mt-3">
                    <button @click="guardarNoticia" class="btn btn-primary fw-bold me-2">
                        <i class="bi bi-save"></i> {{ noticiaEditando ? 'ACTUALIZAR' : 'GRABAR' }}
                    </button>
                    <button v-if="noticiaEditando" @click="cancelarEdicion" class="btn btn-secondary fw-bold">
                        <i class="bi bi-x-circle"></i> CANCELAR
                    </button>
                </div>
            </div>


            <!-- Tabla (no se modifica estructura) -->
            <table class="table table-borderless mt-3">
                <tbody>
                    <template v-for="noticia in noticias" :key="noticia.id">
                        <!-- Fila 1: título y fecha -->
                        <tr>
                            <td>
                                <div class="d-flex justify-content-between">
                                    <strong class="text-dark">{{ noticia.titulo }}</strong>
                                    <small class="text-muted">{{ formatFecha(noticia.fecha) }}</small>
                                </div>
                            </td>
                        </tr>
                        <!-- Fila 2: contenido con mostrar más/menos -->
                        <tr>
                            <td class="bg-light p-3 rounded">
                                <span>
                                    {{ isExpanded[noticia.id]
                                        ? noticia.contenido
                                        : noticia.contenido.slice(0, 200) + '...' }}
                                </span>
                                <a href="#" @click.prevent="toggleExpand(noticia.id)"
                                    class="float-end text-decoration-none fw-bold small">
                                    {{ isExpanded[noticia.id] ? 'Mostrar menos...' : 'Seguir leyendo...' }}
                                </a>
                            </td>
                        </tr>
                        <!-- Fila 3: espacio y botones -->
                        <tr>
                            <td class="pt-2 pb-4">
                                <div v-if="isAdmin" class="d-flex justify-content-start">
                                    <button class="btn btn-sm btn-outline-secondary me-2"
                                        @click="editarNoticia(noticia.id)">
                                        <i class="bi bi-pencil"></i> Editar
                                    </button>
                                    <button class="btn btn-sm btn-outline-danger" @click="eliminarNoticia(noticia.id)">
                                        <i class="bi bi-trash"></i> Eliminar
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </template>
                </tbody>
            </table>
        </div>

    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Swal from 'sweetalert2'
import {
    getNoticias,
    addNoticia,
    updateNoticia,
    deleteNoticia
} from '@/api/noticias'
import { checkAdmin } from '@/api/authApi.js'

// Estados reactivos
const nuevoTitulo = ref('')
const nuevoContenido = ref('')
const noticias = ref([])
const isExpanded = ref({})
const noticiaEditando = ref(null)
const isAdmin = ref(false)

// 🔹 Cargar noticias al montar el componente
onMounted(async () => {
    // Verificar si es admin mediante API
    try {
        const adminCheck = await checkAdmin();
        isAdmin.value = adminCheck.isAdmin;
    } catch (error) {
        console.error('Error verificando admin:', error);
        isAdmin.value = false;
    }
    await cargarNoticias()
})

// 🔹 Función para obtener noticias desde la API
async function cargarNoticias() {
    try {
        const data = await getNoticias()
        // Filtramos las publicadas y las ordenamos de más reciente a más antigua
        noticias.value = data
            .filter(n => n.publicado !== false)
            .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    } catch (error) {
        console.error('Error cargando noticias:', error)
        Swal.fire('Error', 'No se pudieron cargar las noticias.', 'error')
    }
}

// 🔹 Guardar (agregar o actualizar) noticia
async function guardarNoticia() {
    if (!nuevoTitulo.value.trim() || !nuevoContenido.value.trim()) {
        Swal.fire('Campos incompletos', 'Debe completar todos los campos.', 'warning')
        return
    }

    try {
        if (noticiaEditando.value) {
            // 🟡 Actualizar noticia existente
            await updateNoticia(noticiaEditando.value.id, {
                titulo: nuevoTitulo.value,
                contenido: nuevoContenido.value,
                fecha: new Date().toISOString(),
                publicado: true
            })

            Swal.fire('Actualizado', 'La noticia ha sido actualizada correctamente.', 'success')
            noticiaEditando.value = null
        } else {
            // 🟢 Crear nueva noticia
            await addNoticia({
                titulo: nuevoTitulo.value,
                contenido: nuevoContenido.value,
                fecha: new Date().toISOString(),
                publicado: true
            })

            Swal.fire('Guardado', 'La noticia ha sido creada correctamente.', 'success')
        }

        nuevoTitulo.value = ''
        nuevoContenido.value = ''
        await cargarNoticias()
    } catch (error) {
        console.error('Error guardando noticia:', error)
        Swal.fire('Error', 'No se pudo guardar la noticia.', 'error')
    }
}

// 🔹 Eliminar noticia (con confirmación)
async function eliminarNoticia(id) {
    const confirm = await Swal.fire({
        title: '¿Eliminar noticia?',
        text: 'Esta acción no se puede deshacer.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6'
    })

    if (!confirm.isConfirmed) return

    try {
        await deleteNoticia(id)
        await cargarNoticias()
        Swal.fire('Eliminada', 'La noticia ha sido eliminada correctamente.', 'success')
    } catch (error) {
        console.error('Error eliminando noticia:', error)
        Swal.fire('Error', 'No se pudo eliminar la noticia.', 'error')
    }
}

// 🔹 Editar noticia
function editarNoticia(id) {
    const noticia = noticias.value.find(n => n.id === id)
    if (!noticia) return

    nuevoTitulo.value = noticia.titulo
    nuevoContenido.value = noticia.contenido
    noticiaEditando.value = noticia

    // Desplazar hacia arriba al formulario
    window.scrollTo({ top: 0, behavior: 'smooth' })

    Swal.fire({
        title: 'Modo edición',
        text: 'Ahora puedes modificar la noticia y volver a grabar.',
        icon: 'info',
        confirmButtonText: 'Entendido',
        timer: 2000
    })
}

// 🔹 Cancelar edición
function cancelarEdicion() {
    nuevoTitulo.value = ''
    nuevoContenido.value = ''
    noticiaEditando.value = null
}

// 🔹 Expandir/colapsar contenido
function toggleExpand(id) {
    isExpanded.value[id] = !isExpanded.value[id]
}

// 🔹 Formatear fecha
function formatFecha(fecha) {
    return new Date(fecha).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}
</script>



<style scoped>
textarea {
    resize: none;
}
</style>