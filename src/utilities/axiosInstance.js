import axios from 'axios';
import { URL } from './config'; // Importa las URLs desde config.js

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

  return config;
}, (error) => {
  return Promise.reject(error);
});

export default axiosInstance;
