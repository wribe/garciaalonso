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
}*/

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
};