import { create } from 'zustand';
import axiosInstance from '../utilities/axiosInstance'; // Importa la instancia configurada

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
      const response = await axiosInstance.get('/usuarios/get', { params: { page, limit } });
      const { usuarios, total, totalPages, currentPage } = response.data;
      set({
        usuarios,
        totalRecords: total,
        totalPages,
        currentPage,
        loading: false,
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
      const response = await axiosInstance.post('/usuarios/create', usuario);
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
      const response = await axiosInstance.put(`/usuarios/update/${id}`, updatedFields);
      const usuarioActualizado = response.data.usuario;
      set((state) => ({
        usuarios: state.usuarios.map((usuario) =>
          usuario._id === id ? usuarioActualizado : usuario
        ),
        loading: false,
      }));

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
      await axiosInstance.delete(`/usuarios/delete/${id}`);
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
      const response = await axiosInstance.post('/usuarios/login', { email, password });
      console.log('Respuesta del servidor:', response.data); // Verifica lo que realmente está devolviendo el servidor
  
      if (response.status === 200) {
        const { usuario, token } = response.data;
        const role = usuario.role ? usuario.role._id : null; // Almacena el ID del rol en lugar del nombre
        const empresaId = usuario.empresa ? usuario.empresa._id : null;
        const empresaName = usuario.empresa ? usuario.empresa.name : null;
  
        // Guardar en localStorage inmediatamente
        localStorage.setItem('usuario', JSON.stringify(usuario));
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('token', token);
        localStorage.setItem('userName', usuario.nombre || '');
        localStorage.setItem('userEmail', usuario.email || '');
        localStorage.setItem('role', role || '');
        localStorage.setItem('empresaId', empresaId || '');
        localStorage.setItem('empresaName', empresaName || '');
        localStorage.setItem('userId', usuario._id);
  
        // Actualizar el estado
        set({
          usuario,
          userId: usuario._id,
          isAuthenticated: true,
          role: role,
          empresaId: empresaId,
          empresaName: empresaName,
          loading: false,
        });
  
        console.log('Token almacenado:', localStorage.getItem('token')); // Verifica si el token se almacenó correctamente
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
    localStorage.clear(); // Elimina todo del localStorage
    set({ usuario: null, userId: null, isAuthenticated: false, role: null });
  },
  





  getUsuariosByEmpresa: async (empresaId) => {
    if (!empresaId || typeof empresaId !== 'string' || empresaId.trim() === '') {
      set({ error: 'ID de empresa no válido', loading: false });
      return;
    }

    set({ loading: true, error: null });

    try {
      const response = await axiosInstance.get(`/usuarios/empresa/${empresaId}`);
      set({
        usuarios: response.data,
        loading: false,
      });
    } catch (error) {
      console.error('Error al obtener usuarios por empresa:', error.response || error.message);
      set({ loading: false, error: 'Error al obtener usuarios por empresa' });
    }
  },

  solicitarRestauracion: async (email) => {
    console.log('Iniciando solicitud de restauración para:', email);
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.post('/usuarios/solicitar-restauracion', { email });
      console.log('Respuesta del servidor:', response.data);
      set({ loading: false });
      return response.data.message;
    } catch (error) {
      console.error('Error al solicitar restauración de contraseña:', error.response || error.message);
      set({ loading: false, error: 'Error al solicitar restauración de contraseña' });
      throw new Error(error.response?.data?.message || 'Error al solicitar restauración de contraseña');
    }
  },

  restaurarPassword: async (token, password) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.post('/usuarios/restaurar-password', { token, password });
      set({ loading: false });
      return response.data.message;
    } catch (error) {
      console.error('Error al restaurar la contraseña:', error.response || error.message);
      set({ loading: false, error: 'Error al restaurar la contraseña' });
      throw new Error(error.response?.data?.message || 'Error al restaurar la contraseña');
    }
  },


  fetchPlanDetails: async () => {
    const userId = get().userId;
  
    if (!userId) {
      set({ error: 'No se pudo obtener el ID del usuario.', loading: false });
      return;
    }
  
    set({ loading: true, error: null });
  
    try {
      const response = await axiosInstance.get(`/Pagos/usuarios/${userId}/plan-details`);
      set({ planDetails: response.data, loading: false });
    } catch (error) {
      console.error('Error al obtener los detalles del plan:', error.response || error.message);
      set({ error: 'No se pudieron cargar los detalles del plan.', loading: false });
    }
  },
  verifyUsuario: async (email, code) => {
    console.log('Datos enviados al servidor:', { email, code }); // Log de los datos enviados
    set({ loading: true, error: null });
    try {
        const response = await axiosInstance.post('/usuarios/verify', { email, code });
        set({ loading: false });
        return response.data.message;
    } catch (error) {
        console.error('Error al verificar usuario:', error.response || error.message);
        set({ loading: false, error: 'Error al verificar usuario' });
        throw new Error(error.response?.data?.message || 'Error al verificar usuario');
    }
},

  

}));

export default useUsuariosStore;
