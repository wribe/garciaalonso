import axios from 'axios'
//  librería de JavaScript que actúa como un cliente HTTP 
// para realizar solicitudes entre el navegador y el servidor,
// URL base de la "API" - usando el backend real con db.json
const API_URL = '/api/clientes-json'

// Función para obtener la lista de clientes desde la API

export const getClientes = (mostrarHistorico) => {
    let url = `${API_URL}?_sort=apellidos&_order=asc`;

    if (!mostrarHistorico) {
        // Solo clientes con histórico = true
        url += `&historico=true`;
    }
    else {
        // Todos los clientes, sin filtrar por histórico
        url += ``;
    }

    const token = sessionStorage.getItem('token');
    return axios.get(url, {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
    }).then(res => res.data);
};


//Funcion para eliminar un cliente por su id pasando historico a false
//Si quieres eliminarla fisicamente, usa axios.delete
export const deleteCliente = (id) => {
    const token = sessionStorage.getItem('token');
    return axios.patch(`${API_URL}/${id}`, { historico: false }, {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
    }).then(res => res.data)
}

// Función para agregar cliente nuevo
export const addCliente = (nuevoCliente) => {
    const token = sessionStorage.getItem('token');
    return axios.post(API_URL, nuevoCliente, {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
    }).then(res => res.data)
}
// Función para actualizar un cliente por su id
export const updateCliente = (id, clienteActualizado) => {
    const token = sessionStorage.getItem('token');
    return axios.put(`${API_URL}/${id}`, clienteActualizado, {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
    }).then(res => res.data)
}

// 🔹 Buscar cliente por DNI
export const getClientePorDni = async (dni) => {
    try {
        const token = sessionStorage.getItem('token');
        // Si tu API permite filtrar por DNI (ej. JSON-Server), puedes hacer:
        const response = await axios.get(`${API_URL}?dni=${dni}`, {
            headers: { Authorization: token ? `Bearer ${token}` : '' }
        });
        // Si devuelve un array, retornamos el primer resultado o null si no hay ninguno
        return response.data.length > 0 ? response.data[0] : null;
    } catch (error) {
        console.error('Error buscando cliente por DNI:', error);
        throw error;
    }
};

// Nueva función sugerida: obtener cliente por DNI desde otra API
export async function getDni() {
    const token = sessionStorage.getItem('token');
    if (!token) return undefined;
    const res = await axios.get('/api/clientes-json/usuario', {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data.dni;
}

// Función para loguear usuario
export async function loginUsuario(dni, password) {
    const res = await axios.post("/api/auth-json/login", { dni, password });
    return res.data;
}

// Nueva función: obtener cliente logueado
export async function getClienteLogueado() {
    const token = sessionStorage.getItem('token');
    if (!token) return null;

    try {
        const response = await axios.get('/api/clientes-json/usuario', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Respuesta backend usuario:', response.data); // <-- Añade esto
        return response.data;
    } catch (error) {
        console.error('Error obteniendo cliente logueado:', error);
        return null;
    }
}

