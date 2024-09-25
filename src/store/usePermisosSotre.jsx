import { create } from 'zustand';
import axios from 'axios';
import { URL } from '../utilities/config';  // Asegúrate de ajustar la URL según tu configuración

const usePermisosStore = create((set) => ({
  roles: [],
  permisos: {},
  loading: false,
  error: null,

  // Crear o actualizar un rol con permisos
  createRoleWithPermissions: async (roleData) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`${URL}/permisos/createOrUpdate`, roleData);  // Cambia '/roles' a '/permisos'
      set((state) => ({
        roles: [...state.roles, response.data.role],
        loading: false,
      }));
      return response.data.role;
    } catch (error) {
      console.error('Error al crear rol con permisos:', error);
      set({ loading: false, error: 'Error al crear rol con permisos' });
      throw error;
    }
  },

  // Obtener los permisos de un rol específico
  getRolePermissions: async (roleId) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${URL}/permisos/permissions/${roleId}`);  // Cambia '/roles' a '/permisos'
      set({
        permisos: response.data,
        loading: false,
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener permisos del rol:', error);
      set({ loading: false, error: 'Error al obtener permisos del rol' });
      throw error;
    }
  },

  // Actualizar los permisos de un rol existente
  updateRolePermissions: async (roleId, permisos) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.put(`${URL}/permisos/permissions/${roleId}`, { permisos });  // Cambia '/roles' a '/permisos'
      set({ loading: false });
      return response.data;
    } catch (error) {
      console.error('Error al actualizar permisos del rol:', error);
      set({ loading: false, error: 'Error al actualizar permisos del rol' });
      throw error;
    }
  },

  // Eliminar un rol por ID
  deleteRoleById: async (roleId) => {
    set({ loading: true, error: null });
    try {
      await axios.delete(`${URL}/permisos/delete/${roleId}`);  // Cambia '/roles' a '/permisos'
      set((state) => ({
        roles: state.roles.filter((role) => role._id !== roleId),
        loading: false,
      }));
    } catch (error) {
      console.error('Error al eliminar rol y permisos:', error);
      set({ loading: false, error: 'Error al eliminar rol y permisos' });
      throw error;
    }
  },
}));

export default usePermisosStore;
