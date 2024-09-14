import { create } from 'zustand';
import axios from 'axios';
import { URL } from '../utilities/config';

const useServiciosStore = create((set, get) => ({
  servicios: [],
  loading: false,
  error: null,

  // Obtener todos los servicios
  getAllServicios: async () => {
    if (get().loading || get().servicios.length > 0) return; // Evitar múltiples llamadas
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${URL}/Servicio/all`);
      console.log('Servicios obtenidos en el store:', response.data);
      set({
        servicios: response.data,
        loading: false,
      });
    } catch (error) {
      console.error('Error al obtener todos los servicios:', error.response || error.message);
      set({ loading: false, error: 'Error al obtener todos los servicios' });
    }
  },

  // Obtener servicios por empresa
  getServiciosByEmpresaId: async (empresaId) => {
    if (get().loading || get().servicios.some((servicio) => servicio.empresaId === empresaId)) return; // Evitar llamadas repetidas
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${URL}/Servicio/byEmpresa/${empresaId}`);
      console.log('Servicios por empresa:', response.data);
      set({
        servicios: response.data,
        loading: false,
      });
    } catch (error) {
      console.error('Error al obtener servicios por empresa:', error.response || error.message);
      set({ loading: false, error: 'Error al obtener servicios por empresa' });
    }
  },

  createServicio: async (servicio) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`${URL}/Servicio/create`, servicio);
      const nuevoServicio = response.data;
      console.log('Servicio creado:', nuevoServicio);
      set((state) => ({
        servicios: [...state.servicios, nuevoServicio],
        loading: false,
      }));
      return nuevoServicio;
    } catch (error) {
      console.error('Error al crear servicio:', error.response || error.message);
      set({ loading: false, error: 'Error al crear servicio' });
    }
  },

  deleteServicio: async (id) => {
    set({ loading: true, error: null });
    try {
      await axios.delete(`${URL}/Servicio/delete/${id}`);
      console.log('Servicio eliminado:', id);
      set((state) => ({
        servicios: state.servicios.filter((servicio) => servicio._id !== id),
        loading: false,
      }));
    } catch (error) {
      console.error('Error al eliminar servicio:', error.response || error.message);
      set({ loading: false, error: 'Error al eliminar servicio' });
    }
  },

  updateServicio: async ({ servicioId, updatedServicio }) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.put(`${URL}/Servicio/update/${servicioId}`, updatedServicio);
      const updatedServicioData = response.data;
      console.log('Servicio actualizado:', updatedServicioData);
      set((state) => ({
        servicios: state.servicios.map((servicio) =>
          servicio._id === servicioId ? updatedServicioData : servicio
        ),
        loading: false,
      }));
    } catch (error) {
      console.error('Error al actualizar servicio:', error.response || error.message);
      set({ loading: false, error: 'Error al actualizar servicio' });
    }
  },
}));

export default useServiciosStore;
