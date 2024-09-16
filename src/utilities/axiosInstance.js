import axios from 'axios';
const jwt_decode = (await import('jwt-decode')).default;
import { URL } from './config'; // Importa ambas URLs

const axiosInstance = axios.create({
  baseURL: process.env.BACKEND_URL || 'https://referido2back.onrender.com', // Asegúrate de que esta URL sea correcta
  headers: {
    'Content-Type': 'application/json',
  },
});


// Función para verificar si el token ha expirado
const isTokenExpired = (token) => {
  try {
    const decoded = jwt_decode(token);
    const currentTime = Date.now() / 1000; // Convertir milisegundos a segundos
    return decoded.exp < currentTime; // Verifica si la expiración es menor que el tiempo actual
  } catch (error) {
    console.error('Error al decodificar el token:', error);
    return true; // Asume que el token ha expirado si hay algún problema
  }
};

// Interceptor de solicitud de Axios
axiosInstance.interceptors.request.use(
  async (config) => {
    // Comentar o eliminar cualquier lógica relacionada con Ngrok
    // if (config.url.includes('/createPayment')) {
    //   config.baseURL = URL; // Esta parte ya no es necesaria
    // }

    let token = localStorage.getItem('token');
    if (!token) {
      await new Promise(resolve => setTimeout(resolve, 50)); // Retraso de 50ms
      token = localStorage.getItem('token');
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.error('Error en interceptor de solicitud:', error);
    return Promise.reject(error);
  }
);

export default axiosInstance;
