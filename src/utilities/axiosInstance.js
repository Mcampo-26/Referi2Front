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
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

export default axiosInstance;
