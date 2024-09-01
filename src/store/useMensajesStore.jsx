import { create } from 'zustand';
import axios from 'axios';
import { URL } from '../utilities/config';

const useMensajesStore = create((set) => ({
  messages: [],
  loading: false,
  error: null,

  // Obtener todos los mensajes de un usuario con paginación
  getMessagesByUser: async (userId, page = 1, limit = 10) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${URL}/Mensajes/${userId}?page=${page}&limit=${limit}`);
      set((state) => ({
        ...state,
        messages: response.data.messages,
        loading: false,
      }));
    } catch (error) {
      console.error('Error al obtener los mensajes:', error.response || error.message);
      set({ loading: false, error: 'Error al obtener los mensajes' });
    }
  },

  // Crear un nuevo mensaje
  createMessage: async (message) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`${URL}/Mensajes/create`, message); 
      const newMessage = response.data;
      set((state) => ({
        ...state,
        messages: [newMessage, ...state.messages],
        loading: false,
      }));
      return newMessage;
    } catch (error) {
      console.error('Error al crear mensaje:', error.response || error.message);
      set({ loading: false, error: 'Error al crear mensaje' });
    }
  },

  // Obtener el conteo de mensajes no leídos para un usuario específico
  getUnreadMessagesCountByUser: async (userId) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${URL}/Mensajes/${userId}?page=1&limit=1000`); // Obtener todos los mensajes
      const unreadMessagesCount = response.data.messages.filter(
        (message) => message.recipient._id === userId && !message.read
      ).length;
      return unreadMessagesCount;
    } catch (error) {
      console.error('Error al obtener el conteo de mensajes no leídos:', error.response || error.message);
      set({ loading: false, error: 'Error al obtener el conteo de mensajes no leídos' });
      return 0;
    }
  },

  // Marcar un mensaje como leído
  markMessageAsRead: async (messageId) => {
    set({ loading: true, error: null });
    try {
      await axios.patch(`${URL}/Mensajes/${messageId}/read`);
      set((state) => ({
        ...state,
        messages: state.messages.map((message) =>
          message._id === messageId ? { ...message, read: true } : message
        ),
        loading: false,
      }));
    } catch (error) {
      console.error('Error al marcar el mensaje como leído:', error.response || error.message);
      set({ loading: false, error: 'Error al marcar el mensaje como leído' });
    }
  },

  // Eliminar un mensaje
  deleteMessage: async (messageId) => {
    set({ loading: true, error: null });
    try {
      await axios.delete(`${URL}/Mensajes/${messageId}`);
      set((state) => ({
        ...state,
        messages: state.messages.filter((message) => message._id !== messageId),
        loading: false,
      }));
    } catch (error) {
      console.error('Error al eliminar el mensaje:', error.response || error.message);
      set({ loading: false, error: 'Error al eliminar el mensaje' });
    }
  },
}));

export default useMensajesStore;
