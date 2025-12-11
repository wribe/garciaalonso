import axios from "axios";

const API_URL = 'http://localhost:5000/api/articulos'

export const getArticulos = () => {
    return axios.get(API_URL)
        .then(res => res.data)
}

export const getArticulosById = (id) => {
    return axios.get(`${API_URL}/${id}`)
        .then(res => res.data)
}

export const addArticulo = (formData) => {
    return axios.post(API_URL, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    }).then(res => res.data);
}

export const deleteArticulo = (id) => {
    return axios.delete(`${API_URL}/${id}`)
        .then(res => res.data)
}

export const updateArticulo = (id, articuloActualizado) => {
    return axios.put(`${API_URL}/${id}`, articuloActualizado)
        .then(res => res.data)
}


/*import axios from "axios";

const API_URL = "http://localhost:5000/api/articulos";

// Obtener todos los artículos
export async function getArticulos() {
    const res = await axios.get(API_URL);
    return res.data;
}

// Obtener artículo por ID
export async function getArticuloById(id) {
    const res = await axios.get(`${API_URL}/${id}`);
    return res.data;
}

// Crear artículo
export async function addArticulo(formData) {
    const res = await axios.post(API_URL, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return res.data;
}

// Actualizar artículo
export async function updateArticulo(id, articulo) {
    const res = await axios.put(`${API_URL}/${id}`, articulo);
    return res.data;
}

// Eliminar artículo
export async function deleteArticulo(id) {
    await axios.delete(`${API_URL}/${id}`);
}*/

