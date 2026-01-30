import axios from 'axios'
//  librería de JavaScript que actúa como un cliente HTTP 
// para realizar solicitudes entre el navegador y el servidor,
// URL base de la "API" - usando el backend real con db.json
const API_URL = '/api/clientes-json'

// Función para obtener la lista de clientes desde la API
export const getClientes = async (mostrarHistorico) => {
    try {
        const token = sessionStorage.getItem('token');
        if (!token) {
            console.error('No hay token de sesión');
            return [];
        }

        // El backend devuelve todos los clientes paginados
        // Parámetros: q (búsqueda), page, limit
        const res = await axios.get(`${API_URL}?page=1&limit=1000`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        // El backend devuelve { total, page, limit, data }
        let clientes = res.data.data || [];

        // Filtrar por histórico en el frontend
        // Si mostrarHistorico está marcado (true): mostrar todos
        // Si no está marcado (false): solo mostrar históricos (historico: true)
        if (!mostrarHistorico) {
            clientes = clientes.filter(c => c.historico === true);
        }

        // Ordenar por apellidos
        clientes.sort((a, b) => {
            const apellidoA = (a.apellidos || '').toLowerCase();
            const apellidoB = (b.apellidos || '').toLowerCase();
            return apellidoA.localeCompare(apellidoB);
        });

        return clientes;
    } catch (error) {
        console.error('Error obteniendo clientes:', error);
        if (error.response?.status === 401) {
            console.error('Token inválido o expirado. Por favor, inicie sesión nuevamente.');
        }
        throw error;
    }
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
    
    console.log('🔍 getClienteLogueado - Token presente:', !!token);
    
    if (!token) {
        console.log('❌ No hay token en sessionStorage');
        return null;
    }

    try {
        console.log('📡 Llamando a /api/clientes-json/usuario...');
        const response = await axios.get('/api/clientes-json/usuario', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Respuesta backend usuario:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Error obteniendo cliente logueado:', error);
        console.error('   Status:', error.response?.status);
        console.error('   Message:', error.response?.data?.message);
        
        if (error.response?.status === 401) {
            console.error('   Token inválido o expirado');
        }
        
        return null;
    }
}

