import { ref } from "vue";
import axios from "axios";

const API_URL = "http://localhost:3000/taller";

// Estado inicial de la cita
export const nuevaCita = ref({
    id: null,
    matricula: "",
    movilCliente: "",
    fechaCita: "",
    servicioTaller: "",
    estadoCita: "pendiente",
    acepta: false
});

// VALIDACIONES
export const matriculaValida = ref(true);
export const movilValido = ref(true);
export const fechaValida = ref(true);

export const validarMatricula = () => {
    const regex = /^[0-9]{4}[BCDFGHJKLMNPRSTVWXYZ]{3}$/;
    matriculaValida.value = regex.test(
        nuevaCita.value.matricula.trim().toUpperCase()
    );
};

export const validarMovil = () => {
    const regex = /^[67]\d{8}$/;
    movilValido.value = regex.test(nuevaCita.value.movilCliente.trim());
};

export const validarFecha = () => {
    fechaValida.value = !!nuevaCita.value.fechaCita;
};

// CRUD
export const obtenerCitas = async () => {
    try {
        const res = await axios.get(API_URL);
        return res.data;
    } catch (error) {
        console.error("Error al cargar citas:", error);
        return [];
    }
};

export const guardarCita = async () => {
    try {
        validarMatricula();
        validarMovil();
        validarFecha();

        if (!matriculaValida.value || !movilValido.value || !fechaValida.value) {
            alert("❌ Datos inválidos");
            return false;
        }

        if (nuevaCita.value.id) {
            // EDITAR
            await axios.put(`${API_URL}/${nuevaCita.value.id}`, nuevaCita.value);
        } else {
            // CREAR NUEVA
            const allCitas = await obtenerCitas();
            const nuevoId = allCitas.length
                ? Math.max(...allCitas.map(c => c.id)) + 1
                : 1;
            nuevaCita.value.id = nuevoId;

            await axios.post(API_URL, nuevaCita.value);
        }

        return true;
    } catch (error) {
        console.error("Error al guardar la cita:", error.response?.data || error.message);
        alert("❌ Error al guardar la cita");
        return false;
    }
};

export const eliminarCita = async (id) => {
    try {
        await axios.delete(`${API_URL}/${id}`);
    } catch (error) {
        console.error("Error al eliminar la cita:", error.response?.data || error.message);
        alert("❌ Error al eliminar la cita");
    }
};

export const limpiarCita = () => {
    nuevaCita.value = {
        id: null,
        matricula: "",
        movilCliente: "",
        fechaCita: "",
        servicioTaller: "",
        estadoCita: "pendiente",
        acepta: false
    };
};



/*import axios from 'axios'
//  librería de JavaScript que actúa como un cliente HTTP 
// para realizar solicitudes entre el navegador y el servidor,
// URL base de la "API". Si usas json-server local, asegúrate de la IP:
const API_URL = 'http://localhost:3000/citas'

// Función para obtener la lista de clientes desde la API

export const getCitas = () => {
    let url = `${API_URL}?_sort=matricula&_order=asc`;

    return axios.get(url).then(res => res.data);
};


//Funcion para eliminar un cliente por su id pasando historico a false
//Si quieres eliminarla fisicamente, usa axios.delete
export const deleteCita= (id) => {
    return axios.patch(`${API_URL}/${id}`, { acepta: false })
                .then(res => res.data)
}

// Función para agregar cliente nuevo
export const addCita = (nuevaCita) => {
    return axios.post(API_URL, nuevaCita)
                .then(res => res.data)
}
// Función para actualizar un cliente por su id
export const updateCita = (id, citaActualizada) => {
    return axios.put(`${API_URL}/${id}`, citaActualizada)
                .then(res => res.data)
}

import axios from 'axios'

const API_URL = 'http://localhost:3000/taller'

export const getCitas = () => {
    return axios.get(`${API_URL}?_sort=fecha_cita&_order=desc`)
        .then(res => res.data)
}

export const addCita = (nuevaNoticia) => {
    return axios.post(API_URL, nuevaNoticia)
        .then(res => res.data)
}

export const deleteCita = (id) => {
    return axios.delete(`${API_URL}/${id}`)
        .then(res => res.data)
}

export const updateCita = (id, citaActualizada) => {
    return axios.put(`${API_URL}/${id}`, citaActualizada)
        .then(res => res.data)
}

// 🔹 Buscar cliente por DNI
export const getCitaPorMovil = async (movil) => {
    try {
        // Si tu API permite filtrar por DNI (ej. JSON-Server), puedes hacer:
        const response = await axios.get(`${API_URL}?movilCliente=${movil}`);
        // Si devuelve un array, retornamos el primer resultado o null si no hay ninguno
        return response.data.length > 0 ? response.data[0] : null;
    } catch (error) {
        console.error('Error buscando cita por movil:', error);
        throw error;
    }
};*/