import axios from 'axios';
import { URL } from './config'; // Asegúrate de que esta es la URL correcta de tu backend

const axiosInstance = axios.create({
  baseURL: URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// axiosInstance.js
axiosInstance.interceptors.request.use(async (config) => {
  let token = localStorage.getItem('token');
  if (!token) {
    // Espera un breve momento y vuelve a verificar
    await new Promise(resolve => setTimeout(resolve, 50)); // Retraso de 50ms
    token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log('No hay token disponible después de la reintento.');
    }
  } else {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  console.error('Error en interceptor de solicitud:', error);
  return Promise.reject(error);
});

export default axiosInstance;