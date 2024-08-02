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
      const response = await axios.get(`${URL}/usuarios/get`, { params: { page, limit } });
      const { usuarios, total, totalPages, currentPage } = response.data;
      console.log('Usuarios obtenidos:', usuarios); // Verifica que aquí estás obteniendo datos correctos
  
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
      const response = await axios.put(`${URL}/usuarios/update/${id}`, updatedFields);
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
        console.log('Usuario devuelto por la API:', usuario);

        // Manejar el caso cuando el usuario no tiene rol
        const role = usuario.role ? usuario.role.name : null;

        // Manejar el caso cuando el usuario tiene empresa
        const empresaId = usuario.empresa ? usuario.empresa._id : null;
        const empresaName = usuario.empresa ? usuario.empresa.name : null;

        set({
          usuario,
          userId: usuario._id,
          isAuthenticated: true,
          role: role, // Asignar el nombre del rol
          empresaId: empresaId, // Asignar el ID de la empresa
          empresaName: empresaName, // Asignar el nombre de la empresa
          loading: false
        });

        localStorage.setItem('usuario', JSON.stringify(usuario));
        localStorage.setItem('isAuthenticated', 'true');
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
    set({ usuario: null, userId: null, isAuthenticated: false, role: null });
  },

  getUsuariosByEmpresa: async (empresaId) => {
    console.log('Empresa ID:', empresaId);  // Verifica que aquí estás obteniendo un ID válido
    
    if (!empresaId || typeof empresaId !== 'string' || empresaId.trim() === '') {
      console.error('ID de empresa no válido');
      set({ error: 'ID de empresa no válido', loading: false });
      return;
    }
  
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${URL}/usuarios/empresa/${empresaId}`);
      console.log('Respuesta de usuarios por empresa:', response.data);
      set({
        usuarios: response.data,
        loading: false,
      });
    } catch (error) {
      console.error('Error al obtener usuarios por empresa:', error.response || error.message);
      set({ loading: false, error: 'Error al obtener usuarios por empresa' });
    }
  },
  
  
  
}));

export default useUsuariosStore;
