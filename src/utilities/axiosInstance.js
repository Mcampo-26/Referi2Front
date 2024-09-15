import axios from 'axios';
const jwt_decode = (await import('jwt-decode')).default;
import { URL } from './config'; // Importa la URL

const axiosInstance = axios.create({
  baseURL: URL,
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
    // Cambia la base URL a NGROK_URL si la ruta es /createPayment
    if (config.url.includes('/createPayment')) {
      config.baseURL = URL;
    }

    let token = localStorage.getItem('token');
    if (token && isTokenExpired(token)) {
      console.warn('Token expirado. Redirigiendo al inicio de sesión...');
      localStorage.removeItem('token'); // Eliminar el token expirado
      window.location.href = '/login'; // Redirigir al usuario al inicio de sesión
      return Promise.reject('Token expirado');
    }

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
