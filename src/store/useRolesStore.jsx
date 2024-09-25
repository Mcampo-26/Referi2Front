import { create } from 'zustand';
import axiosInstance from '../utilities/axiosInstance'; // Usamos axiosInstance

const useRolesStore = create((set) => ({
  roles: [],
  loading: false,
  error: null,

  getAllRoles: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.get('/roles/all');
      set({
        roles: response.data,
        loading: false,
      });
    } catch (error) {
      console.error('Error al obtener todos los roles:', error.response || error.message);
      set({ loading: false, error: 'Error al obtener todos los roles' });
    }
  },

  createRole: async (role) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.post('/roles/create', role); // Usamos axiosInstance
      const nuevoRol = response.data;
      set((state) => ({
        roles: [...state.roles, nuevoRol],
        loading: false,
      }));
      return nuevoRol;
    } catch (error) {
      console.error('Error al crear rol:', error.response || error.message);
      set({ loading: false, error: 'Error al crear rol' });
    }
  },

  getRoleById: async (roleId) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.get(`/roles/${roleId}`); // Usamos axiosInstance
      const role = response.data;
      set((state) => ({
        roles: [...state.roles, role],
        loading: false,
      }));
      return role;
    } catch (error) {
      console.error('Error al obtener rol:', error);
      set({ loading: false, error: 'Error al obtener rol' });
    }
  },

  getRolesByUser: async (empresaId, userRole) => {
    set({ loading: true, error: null });
    try {
      let response;
      if (userRole === "SuperAdmin") {
        response = await axiosInstance.get('/roles/all');
      } else {
        response = await axiosInstance.get(`/roles/empresa/${empresaId}`);
      }

      set({
        roles: response.data,
        loading: false,
      });
    } catch (error) {
      console.error('Error al obtener roles:', error.response || error.message);
      set({ loading: false, error: 'Error al obtener roles' });
    }
  },

  deleteRole: async (id) => {
    set({ loading: true, error: null });
    try {
      await axiosInstance.delete(`/roles/delete/${id}`); // Usamos axiosInstance
      set((state) => ({
        roles: state.roles.filter((role) => role._id !== id),
        loading: false,
      }));
    } catch (error) {
      console.error('Error al eliminar rol:', error.response || error.message);
      set({ loading: false, error: 'Error al eliminar rol' });
    }
  },

  getRolesByEmpresa: async (empresaId) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.get(`/roles/empresa/${empresaId}`); // Usamos axiosInstance
      set({
        roles: response.data,
        loading: false,
      });
    } catch (error) {
      console.error("Error al obtener roles por empresa:", error);
      set({
        loading: false,
        error: 'Error al obtener roles por empresa',
      });
    }
  },

  updateRole: async ({ roleId, updatedRole }) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.put(`/roles/update/${roleId}`, updatedRole); // Usamos axiosInstance
      const updatedRoleData = response.data;
      set((state) => ({
        roles: state.roles.map((role) =>
          role._id === roleId ? updatedRoleData : role
        ),
        loading: false,
      }));
    } catch (error) {
      console.error('Error al actualizar rol:', error.response || error.message);
      set({ loading: false, error: 'Error al actualizar rol' });
    }
  },


}));

export default useRolesStore;
