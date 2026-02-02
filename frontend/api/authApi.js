// authApi.js
import axios from "axios";

export async function registerUsuario(usuario) {
  // usuario: { dni, password, nombre, email, movil, direccion }
  const res = await axios.post("/api/auth-json/register", usuario);
  return res.data;
}

export async function loginUsuario(dni, password) {
  const res = await axios.post("/api/auth-json/login", { dni, password });
  return res.data;
}

// devuelve { isAdmin: boolean, name: string } de forma segura
export const checkAdmin = async () => {
  const token = sessionStorage.getItem('token');
  if (!token) return { isAdmin: false, name: '' };
  const res = await axios.get("/api/auth-json/check-admin", {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

// alias antiguo si componentes usan esAdmin
export const esAdmin = async () => {
  const r = await checkAdmin()
  return r.isAdmin
}