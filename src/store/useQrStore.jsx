import { create } from 'zustand';
import axiosInstance from '../utilities/axiosInstance';

export const useQrStore = create((set) => ({
  qrs: [],
  loading: false,
  error: null,
  qr: null,
  totalRecords: 0,
  totalPages: 1,
  currentPage: 1,
  empresa: null, // Estado para la empresa

  createQr: async (qrData) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.post('/Qr/create', qrData);
      const nuevoQr = response.data.newQr;
      set((state) => ({
        qrs: [...state.qrs, nuevoQr],
        loading: false,
        qr: nuevoQr
      }));
      return nuevoQr;
    } catch (error) {
      console.error('Error al crear QR:', error.response || error.message);
      set({ loading: false, error: 'Error al crear QR' });
      throw error;
    }
  },

  getAllQrs: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.get('/Qr/all');
      set({ qrs: response.data, loading: false });
    } catch (error) {
      console.error('Error al obtener todos los QRs:', error.response || error.message);
      set({ loading: false, error: 'Error al obtener todos los QRs' });
    }
  },

  getQrsByEmpresa: async (page = 1, limit = 10) => {
    set({ loading: true, error: null });
  
    // Obtén el ID de la empresa desde localStorage
    const empresaId = localStorage.getItem('empresaId');
  
    if (!empresaId) {
      set({ loading: false, error: 'No se encontró el ID de la empresa en localStorage' });
      return;
    }
  
    try {
      // Realiza la llamada a la API con el ID de la empresa
      const response = await axiosInstance.get(`/Qr/empresa/${empresaId}`, {
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
      console.error('Error al obtener los QRs por empresa:', error.response || error.message);
      set({ loading: false, error: 'Error al obtener los QRs por empresa' });
    }
  },
  

  getQrsByUser: async (userId) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.get(`/Qr/user/${userId}`);
      set({ qrs: response.data, loading: false });
    } catch (error) {
      console.error('Error al obtener los QR Codes por usuario:', error.response || error.message);
      set({ loading: false, error: 'Error al obtener los QR Codes por usuario' });
    }
  },

  getQrsByAssignedUser: async (userId) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.get(`/Qr/assigned/${userId}`);
      set({ qrs: response.data, loading: false });
    } catch (error) {
      console.error('Error al obtener los QR Codes asignados:', error.response || error.message);
      set({ loading: false, error: 'Error al obtener los QR Codes asignados' });
    }
  },

  getQrById: async (id) => {
    set({ loading: true, error: null, qr: null });
    try {
      const response = await axiosInstance.get(`/Qr/${id}`);
      console.log("QR obtenido:", response.data);
  
      set({
        qr: response.data,
        loading: false,
        error: null,
      });
  
      return response.data;
    } catch (error) {
      console.error('Error al obtener QR por ID:', error.response || error.message);
      set({ loading: false, error: 'Error al obtener QR por ID' });
      return null;
    }
  },

  updateQr: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.put(`/Qr/update/${id}`, data);
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
      await axiosInstance.delete(`/Qr/${id}`);
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
      const response = await axiosInstance.post(`/Qr/use/${id}`);
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

  generatePdf: async (qrId) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.post(`/Qr/generate-pdf/${qrId}`);
      set({ loading: false });
      return response.data;
    } catch (error) {
      console.error('Error al generar PDF:', error.response || error.message);
      set({ loading: false, error: 'Error al generar PDF' });
      throw error;
    }
  },

  getPdf: async (qrId) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.get(`/Qr/pdf/${qrId}`, {
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

  generateQrFromBackend: async (qrId) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token no encontrado');
      }
  
      const response = await axiosInstance.post('/Qr/generate', { qrId }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (response.data && response.data.base64Image) {
        set({ loading: false });
        return response.data.base64Image;
      } else {
        throw new Error('Respuesta del servidor no contiene la imagen QR');
      }
    } catch (error) {
      console.error('Error al generar la imagen del QR desde el backend:', error.response || error.message);
      set({ loading: false, error: 'Error al generar la imagen del QR desde el backend' });
      throw error;
    }
  }
}));

export default useQrStore;
