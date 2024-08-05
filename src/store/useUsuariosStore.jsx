import create from 'zustand';
import axios from 'axios';
import { URL } from '../utilities/config';

export const useUsuariosStore = create((set, get) => ({
  usuario: JSON.parse(localStorage.getItem('usuario')) || null,
  userId: JSON.parse(localStorage.getItem('usuario'))?._id || null,
  usuarios: [],
  isAuthenticated: localStorage.getItem('isAuthenticated') === 'true' || false,
  loading: false,
  error: null,
  role: localStorage.getItem('role') || null,
  totalRecords: 0,
  totalPages: 1,
  currentPage: 1,

  getUsuarios: async (page = 1, limit = 10) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem('token'); // Obtener el token de LocalStorage
  
      const response = await axios.get(`${URL}/usuarios/get`, {
        params: { page, limit },
        headers: {
          'Authorization': `Bearer ${token}` // Incluir el token en los encabezados
        }
      });
  
      const { usuarios, total, totalPages, currentPage } = response.data;
      console.log('Usuarios obtenidos:', usuarios);
  
      set({
        usuarios,
        totalRecords: total,
        totalPages,
        currentPage,
        loading: false
      });
    } catch (error) {
      console.error('Error al obtener usuarios:', error.response || error.message);
      set({ loading: false, error: 'Error al obtener usuarios' });
    }
  },

  getUsuarioById: (id) => {
    const { usuarios } = get();
    return usuarios.find((usuario) => usuario._id === id);
  },

  createUsuario: async (usuario) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`${URL}/usuarios/create`, usuario);
      const nuevoUsuario = response.data.usuario;
      set((state) => ({
        usuarios: [...state.usuarios, nuevoUsuario],
        loading: false,
      }));
      return nuevoUsuario;
    } catch (error) {
      console.error('Error al crear usuario:', error.response || error.message);
      set({ loading: false, error: error.response?.data?.message || 'Error al crear usuario' });
      throw new Error(error.response?.data?.message || 'Error al crear usuario');
    }
  },

  updateUsuario: async (id, updatedFields) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem('token'); // Obtener el token del localStorage
  
      const response = await axios.put(`${URL}/usuarios/update/${id}`, updatedFields, {
        headers: {
          'Authorization': `Bearer ${token}` // Incluir el token en los encabezados
        }
      });
  
      const usuarioActualizado = response.data.usuario;
  
      set((state) => ({
        usuarios: state.usuarios.map((usuario) =>
          usuario._id === id ? usuarioActualizado : usuario
        ),
        loading: false,
      }));
  
      // Actualiza el usuario en localStorage si es el usuario logueado
      const usuarioLogueado = JSON.parse(localStorage.getItem('usuario'));
      if (usuarioLogueado && usuarioLogueado._id === id) {
        localStorage.setItem('usuario', JSON.stringify(usuarioActualizado));
        const role = usuarioActualizado.role ? (usuarioActualizado.role._id || usuarioActualizado.role) : null;
        if (role) {
          localStorage.setItem('role', role);
        } else {
          localStorage.removeItem('role');
        }
      }
    } catch (error) {
      console.error('Error al actualizar usuario:', error.response || error.message);
      set({ loading: false, error: 'Error al actualizar usuario' });
    }
  },

  deleteUsuario: async (id) => {
    set({ loading: true, error: null });
    try {
      await axios.delete(`${URL}/usuarios/delete/${id}`);
      set((state) => ({
        usuarios: state.usuarios.filter((usuario) => usuario._id !== id),
        loading: false,
      }));
    } catch (error) {
      console.error('Error al eliminar usuario:', error.response || error.message);
      set({ loading: false, error: 'Error al eliminar usuario' });
    }
  },

  loginUsuario: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`${URL}/usuarios/login`, { email, password });
      if (response.status === 200) {
        const usuario = response.data.usuario;
        const token = response.data.token; // Aquí obtienes el token JWT
  
        // Manejar el caso cuando el usuario no tiene rol
        const role = usuario.role ? usuario.role.name : null;
  
        // Manejar el caso cuando el usuario tiene empresa
        const empresaId = usuario.empresa ? usuario.empresa._id : null;
        const empresaName = usuario.empresa ? usuario.empresa.name : null;
  
        set({
          usuario,
          userId: usuario._id,
          isAuthenticated: true,
          role: role,
          empresaId: empresaId,
          empresaName: empresaName,
          loading: false
        });
  
        // Almacena los datos en LocalStorage
        localStorage.setItem('usuario', JSON.stringify(usuario));
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('token', token); // Almacena el token
        if (role) {
          localStorage.setItem('role', role);
        } else {
          localStorage.removeItem('role');
        }
        if (empresaId && empresaName) {
          localStorage.setItem('empresaId', empresaId);
          localStorage.setItem('empresaName', empresaName);
        } else {
          localStorage.removeItem('empresaId');
          localStorage.removeItem('empresaName');
        }
        localStorage.setItem('userId', usuario._id);
        return true;
      } else {
        throw new Error('Authentication failed');
      }
    } catch (error) {
      console.error('Error durante el login:', error);
      set({ error: error.response?.data?.message || 'Login failed', loading: false, isAuthenticated: false });
      return false;
    }
  },
  


  logoutUsuario: () => {
  localStorage.removeItem('usuario');
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('role');
  localStorage.removeItem('userId');
  localStorage.removeItem('token'); // Elimina el token
    set({ usuario: null, userId: null, isAuthenticated: false, role: null });
  },
  

  getUsuariosByEmpresa: async (empresaId) => {
    console.log('Empresa ID:', empresaId);  // Verifica que aquí estás obteniendo un ID válido
    
    // Verificación básica del ID de la empresa
    if (!empresaId || typeof empresaId !== 'string' || empresaId.trim() === '') {
      console.error('ID de empresa no válido');
      set({ error: 'ID de empresa no válido', loading: false });
      return;
    }
  
    set({ loading: true, error: null });
  
    try {
      const token = localStorage.getItem('token'); // Obtener el token de LocalStorage
      console.log('Token enviado:', token); // Verifica que estás obteniendo el token
  
      // Realizar la solicitud a la API
      const response = await axios.get(`${URL}/usuarios/empresa/${empresaId}`, {
        headers: {
          'Authorization': `Bearer ${token}` // Incluir el token en los encabezados
        }
      });
  
      // Verificar la respuesta de la API
      console.log('Respuesta de usuarios por empresa:', response.data);
  
      // Actualizar el estado
      set({
        usuarios: response.data,
        loading: false,
      });
  
    } catch (error) {
      // Capturar errores de la solicitud
      console.error('Error al obtener usuarios por empresa:', error.response || error.message);
  
      // Actualizar el estado con el error
      set({ loading: false, error: 'Error al obtener usuarios por empresa' });
    }
  },
  
  
  
}));

export default useUsuariosStore;
