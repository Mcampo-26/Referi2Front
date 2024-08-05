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
  empresa: null, // Añadir estado para la empresa

  getQrs: async (page = 1, limit = 10) => {
    set({ loading: true, error: null });
    const userRole = localStorage.getItem('userRole');
    const userId = localStorage.getItem('userId');

    try {
      if (userRole === 'SuperAdmin') {
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
      } else if (userRole === 'Admin' && userId) {
        const { empresa } = useQrStore.getState(); // Obtener la empresa del estado
        if (empresa) {
          const response = await axios.get(`${URL}/Qr/empresa/${empresa._id}`, {
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
        } else {
          set({ loading: false, error: 'No se encontró la empresa para el usuario' });
        }
      } else {
        set({ loading: false, error: 'No autorizado para ver estos QR' });
      }
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
      const token = localStorage.getItem('token'); // Obtén el token del sessionStorage
      if (!token) {
        throw new Error('Token no disponible');
      }
  
      const response = await axios.get(`${URL}/Qr/assigned/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}` // Incluye el token en los encabezados
        }
      });
      
      set({ qrs: response.data, loading: false });
    } catch (error) {
      console.error('Error al obtener los QR Codes asignados:', error.response || error.message);
      set({ loading: false, error: 'Error al obtener los QR Codes asignados' });
    }
  },

  getQrById: async (id) => {
    set({ loading: true, error: null, qr: null });
    try {
      const token = localStorage.getItem('token'); // Obtener el token del localStorage
  
      if (!token) {
        throw new Error('No autorizado. Token no proporcionado.');
      }
  
      const response = await axios.get(`${URL}/Qr/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
  
      set({ qr: response.data, loading: false });
      return response.data;
    } catch (error) {
      console.error('Error al obtener QR por ID:', error.response || error.message);
      set({ loading: false, error: 'Error al obtener QR por ID' });
      return null; // Asegúrate de devolver null en caso de error
    }
  },

  createQr: async (qr) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`${URL}/Qr/create`, qr, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const nuevoQr = response.data.newQr;
      set((state) => ({
        qrs: [...state.qrs, nuevoQr],
        loading: false,
      }));
      return nuevoQr;
    } catch (error) {
      console.error('Error al crear QR:', error.response || error.message);
      set({ loading: false, error: 'Error al crear QR' });
      throw error; // Asegúrate de lanzar el error para manejarlo en handleGenerateClick
    }
  },

  updateQr: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.put(`${URL}/Qr/update/${id}`, data);
      set((state) => ({
        qrs: state.qrs.map((qr) =>
          qr._id === id ? { ...qr, ...response.data.qr } : qr
        ),
        loading: false,
      }));
      return response.data;
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
            qr._id === id ? { ...qr, usageCount: response.data.usageCount, isUsed: response.data.usageCount >= qr.maxUsageCount } : qr
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
      throw error;
    }
  },

  // Nuevo método para generar y almacenar el PDF
  generatePdf: async (qrId) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`${URL}/Qr/generate-pdf/${qrId}`);
      set({ loading: false });
      return response.data;
    } catch (error) {
      console.error('Error al generar PDF:', error.response || error.message);
      set({ loading: false, error: 'Error al generar PDF' });
      throw error;
    }
  },

  // Nuevo método para obtener el PDF
  getPdf: async (qrId) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${URL}/Qr/pdf/${qrId}`, {
        responseType: 'blob',
      });
      const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
      set({ loading: false });
      return URL.createObjectURL(pdfBlob);
    } catch (error) {
      console.error('Error al obtener PDF:', error.response || error.message);
      set({ loading: false, error: 'Error al obtener PDF' });
      throw error;
    }
  },

}));

export default useQrStore;
