import create from 'zustand';
import axios from 'axios';
import { URL } from '../utilities/config';

export const useQrStore = create((set) => ({
  qrs: [],
  loading: false,
  error: null,
  qr: null,
  totalRecords: 0,
  totalPages: 1,
  currentPage: 1,

  getQrs: async (page = 1, limit = 10) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${URL}/Qr/get`, {
        params: { page, limit }
      });
      const { qrs, total, totalPages, currentPage } = response.data;
      set({
        qrs,
        totalRecords: total,
        totalPages,
        currentPage,
        loading: false
      });
    } catch (error) {
      console.error('Error al obtener QRs:', error.response || error.message);
      set({ loading: false, error: 'Error al obtener QRs' });
    }
  },

  getQrsByUser: async (userId) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${URL}/Qr/user/${userId}`);
      set({ qrs: response.data, loading: false });
    } catch (error) {
      console.error('Error al obtener los QR Codes por usuario:', error.response || error.message);
      set({ loading: false, error: 'Error al obtener los QR Codes por usuario' });
    }
  },

  getQrsByAssignedUser: async (userId) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${URL}/Qr/assigned/${userId}`);
      set({ qrs: response.data, loading: false });
    } catch (error) {
      console.error('Error al obtener los QR Codes asignados:', error.response || error.message);
      set({ loading: false, error: 'Error al obtener los QR Codes asignados' });
    }
  },

  getQrById: async (id) => {
    set({ loading: true, error: null, qr: null });
    try {
      const response = await axios.get(`${URL}/Qr/${id}`);
      set({ qr: response.data, loading: false });
      return response.data;
    } catch (error) {
      console.error('Error al obtener QR por ID:', error.response || error.message);
      set({ loading: false, error: 'Error al obtener QR por ID' });
    }
  },

  createQr: async (qr) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`${URL}/Qr/create`, qr);
      const nuevoQr = response.data.newQr;
      set((state) => ({
        qrs: [...state.qrs, nuevoQr],
        loading: false,
      }));
      return nuevoQr;
    } catch (error) {
      console.error('Error al crear QR:', error.response || error.message);
      set({ loading: false, error: 'Error al crear QR' });
    }
  },

  updateQr: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.put(`${URL}/Qr/update/${id}`, data);
      const updatedQr = response.data.qr;
      set((state) => ({
        qrs: state.qrs.map((qr) =>
          qr._id === id ? updatedQr : qr
        ),
        loading: false,
      }));
      return updatedQr;
    } catch (error) {
      console.error('Error al actualizar el QR:', error.response || error.message);
      set({ loading: false, error: 'Error al actualizar el QR' });
      throw error;
    }
  },

  deleteQr: async (id) => {
    set({ loading: true, error: null });
    try {
      await axios.delete(`${URL}/Qr/delete/${id}`);
      set((state) => ({
        qrs: state.qrs.filter((qr) => qr._id !== id),
        loading: false,
      }));
    } catch (error) {
      console.error('Error al eliminar QR:', error.response || error.message);
      set({ loading: false, error: 'Error al eliminar QR' });
    }
  },

  useQr: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`${URL}/Qr/use/${id}`);
      if (response.status === 200) {
        set((state) => ({
          qrs: state.qrs.map((qr) =>
            qr._id === id ? { ...qr, usageCount: response.data.usageCount } : qr
          ),
          loading: false,
        }));
        return response.data.usageCount;
      } else {
        throw new Error('Failed to use QR');
      }
    } catch (error) {
      console.error('Error al usar QR:', error.response || error.message);
      set({ loading: false, error: 'Error al usar QR' });
    }
  },
}));

export default useQrStore;
