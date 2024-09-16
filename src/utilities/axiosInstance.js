import axios from 'axios';
import { URL } from './config'; // Importa la URL desde la configuración

// Crear instancia de Axios
const axiosInstance = axios.create({
  baseURL: URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Cargar jwt-decode dinámicamente de manera segura
const loadJwtDecode = async () => {
  const module = await import('jwt-decode');
  return module.default || module; // Asegura que siempre obtengas la función correcta
};

// Función para verificar si el token ha expirado
const isTokenExpired = async (token) => {
  if (!token) return true; // Considera el token como expirado si no está presente

  try {
    const jwt_decode = await loadJwtDecode(); // Cargar jwt-decode dinámicamente
    const decoded = jwt_decode(token);
    const currentTime = Date.now() / 1000; // Convertir milisegundos a segundos
    return decoded.exp < currentTime; // Verifica si la expiración es menor que el tiempo actual
  } catch (error) {
    console.error('Error al decodificar el token:', error);
    return true; // Asume que el token ha expirado si hay algún problema
  }
};

// Función para obtener el token de localStorage con manejo de retraso
const getToken = async () => {
  let token = localStorage.getItem('token');
  
  // Espera brevemente en caso de que el token aún no esté disponible
  if (!token) {
    await new Promise(resolve => setTimeout(resolve, 100)); // Aumenta el tiempo de espera si es necesario
    token = localStorage.getItem('token');
  }

  console.log('Token después de la espera:', token);
  return token;
};

// Interceptor de solicitud de Axios
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await getToken(); // Asegura que el token esté presente

    if (token) {
      const tokenExpired = await isTokenExpired(token); // Verifica si el token ha expirado
      if (!tokenExpired) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.warn('Token expirado, por favor inicie sesión de nuevo');
        // Lógica para manejar token expirado (por ejemplo, redirigir a la página de login)
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
