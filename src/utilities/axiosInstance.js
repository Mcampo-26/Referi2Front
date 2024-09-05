import axios from 'axios';
import { URL } from './config'; // Importa la URL base de producción desde config.js

const axiosInstance = axios.create({
  baseURL: URL,  // Esta es la URL de tu servidor backend en producción
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('Token agregado a la solicitud:', token); // Agrega un log para verificar el token
  } else {
    console.log('No hay token en el localStorage');
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});



export default axiosInstance;
