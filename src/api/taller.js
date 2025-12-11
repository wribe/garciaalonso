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

import axios from "axios"

const API_URL = "http://localhost:3000/taller"

// Obtener todas las citas
export async function getCitasTaller() {
    const res = await axios.get(API_URL)
    return res.data
}

// Añadir cita
export async function addCitaTaller(cita) {
    const res = await axios.post(API_URL, cita)
    return res.data
}

// Actualizar cita
export async function updateCitaTaller(id, cita) {
    const res = await axios.put(`${API_URL}/${id}`, cita)
    return res.data
}

// Eliminar cita
export async function deleteCitaTaller(id) {
    await axios.delete(`${API_URL}/${id}`)
}
