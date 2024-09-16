import axios from 'axios';
import { URL } from './config'; // Importa la URL desde la configuración

// Crear instancia de Axios
const axiosInstance = axios.create({
  baseURL: URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Función para cargar jwt-decode dinámicamente
const loadJwtDecode = async () => {
  const module = await import('jwt-decode');
  return module.default || module; // Asegura que siempre obtengas la función correcta
};

// Función para verificar si el token ha expirado
const isTokenExpired = async (token) => {
  if (!token) return true; // Considera el token como expirado si no está presente

  try {
    const jwt_decode = await loadJwtDecode(); // Cargar jwt-decode dinámicamente
    const decoded = jwt_decode(token); // Decodifica el token usando jwt_decode
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
    // Verifica si la URL de la solicitud incluye '/createPayment'
    if (config.url.includes('/createPayment')) {
      config.baseURL = URL;
    }

    // No se enviará el token en las solicitudes
    console.info('Configuración de la solicitud sin token de autorización.');

    return config;
  },
  (error) => {
    console.error('Error en interceptor de solicitud:', error);
    return Promise.reject(error);
  }
);

export default axiosInstance;
