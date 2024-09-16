import axios from 'axios';
import { URL } from './config'; // Importa la URL desde la configuración

// Crear instancia de Axios
const axiosInstance = axios.create({
  baseURL: URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Función para decodificar JWT sin dependencias externas
const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1]; // Extrae la parte del payload del token
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/'); // Reemplaza los caracteres no válidos
    const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload); // Parsea el JSON
  } catch (error) {
    console.error('Error al decodificar el token:', error);
    return null;
  }
};

// Función para verificar si el token ha expirado
const isTokenExpired = (token) => {
  if (!token) return true; // Considera el token como expirado si no está presente

  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return true; // Si no se puede decodificar o no hay expiración, se considera expirado
  }

  const currentTime = Date.now() / 1000; // Convertir milisegundos a segundos
  return decoded.exp < currentTime; // Verifica si la expiración es menor que el tiempo actual
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
        // Lógica adicional si el token está expirado (redirigir al login, etc.)
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
