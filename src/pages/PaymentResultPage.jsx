import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePaymentStore } from '../store/usePaymentStore'; // Importa tu estado de Zustand
import Swal from 'sweetalert2';

export const PaymentResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { savePaymentDetails } = usePaymentStore(); // Destructura la función que guarda los detalles del pago

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const status = queryParams.get('status');
    const userId = queryParams.get('userId');
    const paymentId = queryParams.get('payment_id');
    const amount = queryParams.get('amount'); // Si puedes obtener el monto del pago

    // Define la fecha de expiración del plan
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 1); // Ejemplo: 1 mes de suscripción

    const handlePaymentResult = async () => {
      if (status === 'approved') {
        try {
          await savePaymentDetails({
            userId,
            planName: 'Nombre del Plan', // Obtén el nombre del plan adecuado desde el backend si es posible
            amount,
            paymentId,
            expiryDate,
            items: [],  // Agrega los ítems específicos si tienes esta información
          });

          await Swal.fire({
            title: '¡Pago Exitoso!',
            text: 'Gracias por tu compra.',
            icon: 'success',
            confirmButtonText: 'OK',
            timer: 3000,
            timerProgressBar: true,
          });
          
          navigate('/'); // Redirige al usuario después de que se cierre el SweetAlert
        } catch (error) {
          await Swal.fire({
            title: 'Error',
            text: 'Hubo un problema al procesar tu pago. Por favor, inténtalo de nuevo.',
            icon: 'error',
            confirmButtonText: 'OK',
          });
          
          navigate('/'); // Redirige al usuario después de que se cierre el SweetAlert
        }
      } else if (status === 'failure') {
        await Swal.fire({
          title: 'Pago Fallido',
          text: 'Tu pago no pudo ser procesado. Por favor, revisa tu método de pago o inténtalo de nuevo.',
          icon: 'error',
          confirmButtonText: 'OK',
        });
        
        navigate('/'); // Redirige al usuario después de que se cierre el SweetAlert
      } else if (status === 'pending') {
        await Swal.fire({
          title: 'Pago Pendiente',
          text: 'Tu pago está pendiente de confirmación. Te notificaremos cuando esté completo.',
          icon: 'info',
          confirmButtonText: 'OK',
        });
        
        navigate('/'); // Redirige al usuario después de que se cierre el SweetAlert
      }
    };

    handlePaymentResult();
  }, [location, navigate, savePaymentDetails]);

  return (
    <div>
      {isLoading && (
        <Box display="flex" justifyContent="center" alignItems="center" mt={4}>
          <CircularProgress />
          <Typography variant="body1" ml={2}>
            Procesando su solicitud, por favor espere...
          </Typography>
        </Box>
      )}
      <div>Procesando resultado del pago...</div>
    </div>
  );
  
}
