import create from 'zustand';
import axios from 'axios';
import { URL } from '../utilities/config';

const useRolesStore = create((set) => ({
  roles: [],
  loading: false,
  error: null,

  getAllRoles: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${URL}/roles/all`);
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
      const response = await axios.post(`${URL}/roles/create`, role);
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

  deleteRole: async (id) => {
    set({ loading: true, error: null });
    try {
      await axios.delete(`${URL}/roles/delete/${id}`);
      set((state) => ({
        roles: state.roles.filter((role) => role._id !== id),
        loading: false,
      }));
    } catch (error) {
      console.error('Error al eliminar rol:', error.response || error.message);
      set({ loading: false, error: 'Error al eliminar rol' });
    }
  },

  updateRole: async ({ roleId, updatedRole }) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.put(`${URL}/roles/update/${roleId}`, updatedRole);
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
