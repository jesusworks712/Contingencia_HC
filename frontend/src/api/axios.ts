import axios from "axios";

// En desarrollo (npm run dev), el frontend corre en :5173 y el backend
// en :8000, por eso hace falta la URL completa.
// En produccion (npm run build servido por FastAPI), ambos viven en el
// mismo origen, asi que basta con rutas relativas ("").
const baseURL = import.meta.env.DEV ? "http://10.50.0.95:8010" : "";

export const api = axios.create({
  baseURL,
});

// Antes de cada peticion, si hay un token guardado, lo mandamos
// automaticamente en el header Authorization.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Si el backend responde 401 (token invalido o expirado), limpiamos
// la sesion local para forzar un nuevo login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
