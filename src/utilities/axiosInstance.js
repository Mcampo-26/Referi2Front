// src/utilities/axiosInstance.js
import axios from 'axios';
import { URL } from './config'; // Asegúrate de que la ruta a config.js sea correcta

// Crear instancia de Axios con token de autenticación
const axiosInstance = axios.create({
  baseURL: URL,
  headers: {
    'Content-Type': 'application/json',
    // Puedes agregar más encabezados predeterminados si es necesario
  },
});

// Interceptor para incluir el token en cada solicitud
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default axiosInstance;
