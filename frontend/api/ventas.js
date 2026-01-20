import axios from 'axios'
export const listVentas = async (page = 1, limit = 12) => {
    const res = await axios.get('/api/ventas', { params: { page, limit } })
    return res.data
}
export const getVenta = async (id) => {
    const res = await axios.get(`/api/ventas/${id}`)
    return res.data
}