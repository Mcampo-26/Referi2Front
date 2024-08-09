import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const WelcomeAnimation = () => {
  const navigate = useNavigate();

  useEffect(() => {
    MySwal.fire({
      title: '¡Bienvenido a Referidos!',
      text: 'Nos alegra tenerte aquí.',
      icon: 'success',
      showConfirmButton: false,
      timer: 3000, // El tiempo que la alerta estará visible (en milisegundos)
      didOpen: () => {
        // Añadir una clase para animar la alerta, si lo deseas
        Swal.getPopup().classList.add('swal2-animate'); // Asegúrate de definir esta clase en tu CSS
      },
      willClose: () => {
        // Usar navigate para redirigir al usuario después de que la alerta se cierre
        navigate('/Referidos');
      }
    });
  }, [navigate]);

  return null; // No necesitamos renderizar nada en este componente
};

export default WelcomeAnimation;
