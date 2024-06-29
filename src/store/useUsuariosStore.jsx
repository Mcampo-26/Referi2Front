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
      const response = await axios.get(`${URL}/Usuarios/get`, {
        params: { page, limit }
      });
      const { usuarios, total, totalPages, currentPage } = response.data;
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
      const response = await axios.post(`${URL}/Usuarios/create`, usuario);
      const nuevoUsuario = response.data;
      set((state) => ({
        usuarios: [...state.usuarios, nuevoUsuario],
        loading: false,
      }));
      return nuevoUsuario;
    } catch (error) {
      console.error('Error al crear usuario:', error.response || error.message);
      set({ loading: false, error: 'Error al crear usuario' });
    }
  },

  updateUsuario: async (id, updatedUsuario) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.put(`${URL}/Usuarios/update/${id}`, updatedUsuario);
      set((state) => ({
        usuarios: state.usuarios.map((usuario) =>
          usuario._id === id ? response.data.usuario : usuario
        ),
        loading: false,
      }));
    } catch (error) {
      console.error('Error al actualizar usuario:', error.response || error.message);
      set({ loading: false, error: 'Error al actualizar usuario' });
    }
  },

  deleteUsuario: async (id) => {
    set({ loading: true, error: null });
    try {
      await axios.delete(`${URL}/Usuarios/delete/${id}`);
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
      const response = await axios.post(`${URL}/Usuarios/login`, { email, password });
      if (response.status === 200) {
        const usuario = response.data.usuario;
        set({ 
          usuario, 
          userId: usuario._id,
          isAuthenticated: true, 
          role: usuario.role,
          loading: false 
        });
        localStorage.setItem('usuario', JSON.stringify(usuario));
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('role', usuario.role);
        localStorage.setItem('userId', usuario._id);
        return true;
      } else {
        throw new Error('Authentication failed');
      }
    } catch (error) {
      set({ error: error.response?.data?.message || 'Login failed', loading: false, isAuthenticated: false });
      return false;
    }
  },
  
  logoutUsuario: () => {
    localStorage.removeItem('usuario');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    set({ usuario: null, userId: null, isAuthenticated: false, role: null });
  },
}));

export default useUsuariosStore;
