import { create } from 'zustand';
import axiosInstance from '../utilities/axiosInstance'; // Importa la instancia configurada

export const usePaymentStore = create((set) => ({
  paymentLoading: false,
  paymentError: null,
  selectedPlanDetails: null, // Estado para almacenar el plan seleccionado

  createPayment: async (planName, amount, paymentMethodId, email) => {
    set({ paymentLoading: true, paymentError: null });
    try {
      const payload = {
        description: planName,
        transaction_amount: parseFloat(amount),
        payer_email: email,
      };

      if (paymentMethodId) {
        payload.payment_method_id = paymentMethodId;
      }

      console.log('Payload enviado:', JSON.stringify(payload, null, 2));

      const response = await axiosInstance.post('/Pagos/create_preference', payload);
      
      console.log('Respuesta de Mercado Pago:', response.data);

      const initPointUrl = response.data.init_point;
      
      if (initPointUrl) {
        set({ paymentLoading: false });
        return initPointUrl;
      } else {
        throw new Error('No se recibió un init_point en la respuesta');
      }
    } catch (error) {
      console.error('Error al crear la preferencia de pago:', error.response ? error.response.data : error.message);
      set({ paymentError: 'Hubo un problema al procesar tu pago.', paymentLoading: false });
      throw error;
    }
  },

  savePaymentDetails: async (paymentDetails) => {
    set({ paymentLoading: true, paymentError: null });
    try {
      const response = await axiosInstance.post('/Pagos/save_payment_details', paymentDetails);
      console.log('Detalles de pago guardados:', response.data);
      set({ paymentLoading: false, selectedPlanDetails: paymentDetails });
    } catch (error) {
      console.error('Error al guardar los detalles del pago:', error.response ? error.response.data : error.message);
      set({ paymentError: 'Hubo un problema al guardar los detalles del pago.', paymentLoading: false });
    }
  },

  createPaymentLink: async (productName, price) => {
    set({ paymentLoading: true, paymentError: null });
    try {
      const payload = {
        title: productName,
        unit_price: parseFloat(price),
      };

      const response = await axiosInstance.post('/Pagos/create_payment_link', payload);

      const paymentLink = response.data.init_point; // Asumiendo que esta es la propiedad correcta

      if (paymentLink) {
        set({ paymentLoading: false });
        return paymentLink; // Devuelve el enlace de pago generado
      } else {
        throw new Error('No se recibió un enlace de pago en la respuesta');
      }
    } catch (error) {
      console.error('Error al crear el enlace de pago:', error.response ? error.response.data : error.message);
      set({ paymentError: 'Hubo un problema al generar tu enlace de pago.', paymentLoading: false });
      throw error;
    }
  },

}));

export default usePaymentStore;
