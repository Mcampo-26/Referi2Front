import create from 'zustand';
import axios from 'axios';
import { URL } from '../utilities/config';

const useEmpresasStore = create((set) => ({
  empresa: null,
  empresas: [],
  loading: false,
  error: null,

  getAllEmpresas: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${URL}/Empresa/all`);
      set({
        empresas: response.data,
        loading: false,
      });
    } catch (error) {
      console.error('Error al obtener todas las empresas:', error.response || error.message);
      set({ loading: false, error: 'Error al obtener todas las empresas' });
    }
  },

  getEmpresaById: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${URL}/Empresa/${id}`);
      set({
        empresa: response.data,
        loading: false,
      });
    } catch (error) {
      console.error('Error al obtener la empresa:', error.response || error.message);
      set({ loading: false, error: 'Error al obtener la empresa' });
    }
  },

  createEmpresa: async (empresa) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`${URL}/Empresa/create`, empresa);
      const nuevaEmpresa = response.data;
      set((state) => ({
        empresas: [...state.empresas, nuevaEmpresa],
        loading: false,
      }));
      return nuevaEmpresa;
    } catch (error) {
      console.error('Error al crear empresa:', error.response || error.message);
      set({ loading: false, error: 'Error al crear empresa' });
    }
  },

  deleteEmpresa: async (id) => {
    set({ loading: true, error: null });
    try {
      await axios.delete(`${URL}/Empresa/delete/${id}`);
      set((state) => ({
        empresas: state.empresas.filter((empresa) => empresa._id !== id),
        loading: false,
      }));
    } catch (error) {
      console.error('Error al eliminar empresa:', error.response || error.message);
      set({ loading: false, error: 'Error al eliminar empresa' });
    }
  },

  updateEmpresa: async ({ empresaId, updatedEmpresa }) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.put(`${URL}/Empresa/update/${empresaId}`, updatedEmpresa);
      const updatedEmpresaData = response.data;
      set((state) => ({
        empresas: state.empresas.map((empresa) =>
          empresa._id === empresaId ? updatedEmpresaData : empresa
        ),
        loading: false,
      }));
    } catch (error) {
      console.error('Error al actualizar empresa:', error.response || error.message);
      set({ loading: false, error: 'Error al actualizar empresa' });
    }
  },
}));

export default useEmpresasStore;
