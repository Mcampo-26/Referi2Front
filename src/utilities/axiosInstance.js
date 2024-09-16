import axios from 'axios';
import jwt_decode from 'jwt-decode'; // Asegúrate de importar jwt-decode correctamente
import { URL } from './config'; // Importa la URL desde la configuración

// Crear instancia de Axios
const axiosInstance = axios.create({
  baseURL: URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Función para verificar si el token ha expirado
const isTokenExpired = (token) => {
  if (!token) return true; // Considera el token como expirado si no está presente

  try {
    const decoded = jwt_decode(token); // Decodifica el token usando jwt-decode
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
    let token = localStorage.getItem('token');
    if (!token) {
      await new Promise(resolve => setTimeout(resolve, 50));
      token = localStorage.getItem('token');
    }

    if (token) {
      const tokenExpired = isTokenExpired(token); // Verifica si el token ha expirado
      if (!tokenExpired) {
        config.headers.Authorization = `Bearer ${token}`; // Agrega el token a las solicitudes
      } else {
        console.warn('Token expirado, por favor inicie sesión de nuevo.');
      }
    } else {
      console.warn('No se encontró el token en localStorage.');
    }

    return config;
  },
  (error) => {
    console.error('Error en interceptor de solicitud:', error);
    return Promise.reject(error);
  }
);

export default axiosInstance;
