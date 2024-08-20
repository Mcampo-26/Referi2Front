import { create } from 'zustand';
import axiosInstance from '../utilities/axiosInstance';

export const usePaymentStore = create((set) => ({
  paymentLoading: false,
  paymentError: null,
  paymentInitPoint: null,

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

      // Imprimir el payload para verificarlo
      console.log('Payload enviado:', JSON.stringify(payload, null, 2));

      const response = await axiosInstance.post('/Pagos/create_preference', payload);
      
      const initPointUrl = response.data.init_point;
      set({ paymentInitPoint: initPointUrl, paymentLoading: false });
      return initPointUrl;
    } catch (error) {
      console.error('Error al crear la preferencia de pago:', error.response || error.message);
      set({ paymentError: 'Hubo un problema al procesar tu pago.', paymentLoading: false });
      throw error;
    }
  }
}));


export default usePaymentStore;
