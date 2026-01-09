import axios from "axios";

const API_URL = "http://localhost:5000/api/contacto";

/*export const enviarContacto = async (formulario) => {
    try {
        const response = await axios.post(API_URL, formulario);
        return response.data;
    } catch (error) {
        console.error("Error al enviar contacto:", error);
        throw error;
    }
};*/

export async function enviarContacto(payload) {
    const res = await fetch('/api/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error('Error al enviar contacto')
    return res.json()
}