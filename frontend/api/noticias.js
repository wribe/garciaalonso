import axios from 'axios'

const API_URL = 'http://localhost:3000/noticias'

// 🔹 Obtener todas las noticias, ordenadas por fecha descendente
export const getNoticias = (titulo) => {
    let url = `${API_URL}?_sort=fecha&_order=desc`

    // Si se pasa un título, filtramos por él (por coincidencia parcial)
    if (titulo) {
        url += `&titulo_like=${encodeURIComponent(titulo)}`
    }

    return axios.get(url)
        .then(res => res.data)
        .catch(err => {
            console.error('Error al obtener las noticias:', err);
            throw err;
        });
};

// 🔹 Eliminar una noticia (marcar como no publicada)
// Si quieres eliminarla físicamente del JSON-Server, usa axios.delete
/*export const deleteNoticia = (id) => {
    return axios.patch(`${API_URL}/${id}`, { publicado: false })
        .then(res => res.data)
}*/
export const deleteNoticia = (id) => {
    return axios.delete(`${API_URL}/${id}`)
        .then(res => res.data)
}

// 🔹 Agregar una noticia nueva
export const addNoticia = (nuevaNoticia) => {
    // Se asegura de que tenga una fecha actual si no viene incluida
    const noticiaConFecha = {
        ...nuevaNoticia,
        fecha: nuevaNoticia.fecha || new Date().toISOString(),
        publicado: true
    }

    return axios.post(API_URL, noticiaConFecha)
        .then(res => res.data)
}
/*
export const addNoticia = (nuevaNoticia) => {
    return axios.post(API_URL, nuevaNoticia)
        .then(res => res.data)
}*/


// 🔹 Actualizar una noticia existente
export const updateNoticia = (id, noticiaActualizada) => {
    return axios.put(`${API_URL}/${id}`, noticiaActualizada)
                .then(res => res.data)
}

// 🔹 Buscar noticia por título exacto
export const getNoticiaPorTitulo = async (titulo) => {
    try {
        const response = await axios.get(`${API_URL}?titulo=${encodeURIComponent(titulo)}`)
        return response.data.length > 0 ? response.data[0] : null
    } catch (error) {
        console.error('Error buscando noticia por título:', error)
        throw error
    }
}