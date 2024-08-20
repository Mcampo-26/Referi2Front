import axios from 'axios';
import { URL, NGROK_URL } from './config'; // Importa las URLs desde config.js

const axiosInstance = axios.create({
  baseURL: URL,  // URL base general predeterminada
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Cambiar la baseURL a NGROK_URL solo si la URL incluye '/create_preference'
  if (config.url.includes('/create_preference')) {
    config.baseURL = NGROK_URL;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

export default axiosInstance;
