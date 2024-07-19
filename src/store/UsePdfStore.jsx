// store/usePdfStore.js
import create from 'zustand';
import axios from 'axios';
import { URL } from '../utilities/config'; // Asegúrate de que esta URL sea correcta

const usePdfStore = create((set) => ({
  pdfs: [],
  loading: false,
  error: null,
  getPdfs: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${URL}/pdf/get`);
      set({ pdfs: response.data, loading: false });
    } catch (error) {
      set({ loading: false, error: error.message });
    }
  },
  createPdf: async (pdf) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`${URL}/pdf/create`, pdf);
      set((state) => ({
        pdfs: [...state.pdfs, response.data],
        loading: false,
      }));
    } catch (error) {
      set({ loading: false, error: error.message });
    }
  },
  updatePdf: async (id, pdf) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.put(`${URL}/pdf/update/${id}`, pdf);
      set((state) => ({
        pdfs: state.pdfs.map((p) => (p._id === id ? response.data : p)),
        loading: false,
      }));
    } catch (error) {
      set({ loading: false, error: error.message });
    }
  },
  deletePdf: async (id) => {
    set({ loading: true, error: null });
    try {
      await axios.delete(`${URL}/pdf/delete/${id}`);
      set((state) => ({
        pdfs: state.pdfs.filter((p) => p._id !== id),
        loading: false,
      }));
    } catch (error) {
      set({ loading: false, error: error.message });
    }
  },
  downloadPdf: async (id) => {
    try {
      const response = await axios.get(`${URL}/pdf/download/${id}`, {
        responseType: 'blob', // Important
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'document.pdf'); // or any other extension
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Failed to download PDF', error);
    }
  }
}));

export default usePdfStore;
