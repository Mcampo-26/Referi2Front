import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

export const PaymentResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const status = queryParams.get('status');
    const userId = queryParams.get('userId');
    const paymentId = queryParams.get('payment_id');
    const amount = queryParams.get('amount'); // Si puedes obtener el monto del pago

    // Define la fecha de expiración del plan
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 1); // Ejemplo: 1 mes de suscripción

    if (status === 'approved') {
      // Llama a la API para guardar los detalles del pago
      const savePaymentDetails = async () => {
        try {
          const response = await axios.post('/Pagos/save_payment_details', {
            userId,
            planName: 'Nombre del Plan', // Deberías obtener el nombre del plan adecuado
            amount,
            paymentId,
            expiryDate,
          });
          console.log('Detalles de pago guardados:', response.data);
        } catch (error) {
          console.error('Error al guardar los detalles del pago:', error);
        }
      };

      savePaymentDetails();
    }

    setTimeout(() => {
      navigate('/');
    }, 3000); // Redirige después de 3 segundos
  }, [location, navigate]);

  return <div>Procesando resultado del pago...</div>;
};
