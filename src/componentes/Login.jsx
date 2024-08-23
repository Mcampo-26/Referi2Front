import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import useUsuariosStore from '../store/useUsuariosStore';
import { Box, Button, Typography } from '@mui/material';

const MySwal = withReactContent(Swal);

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAlertActive, setIsAlertActive] = useState(false);
  const [showCookieBanner, setShowCookieBanner] = useState(false);
  const navigate = useNavigate();
  const { loginUsuario, solicitarRestauracion } = useUsuariosStore();

  useEffect(() => {
    const cookiesAccepted = localStorage.getItem('cookiesAccepted');
    if (!cookiesAccepted) {
      setShowCookieBanner(true);
    }
  }, []);

  const handleAcceptCookies = () => {
    localStorage.setItem('cookiesAccepted', 'true');
    setShowCookieBanner(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const isSuccess = await loginUsuario(email, password);

    if (isSuccess) {
      setIsAlertActive(true); // Activar el desenfoque del fondo

      // Mostrar el SweetAlert con la animación y redirección
      MySwal.fire({
        title: '¡Bienvenido a Referidos!',
        icon: 'success',
        showConfirmButton: false,
        timer: 3000,
        customClass: {
          popup: 'swal-custom',
        },
        didOpen: () => {
          const swalPopup = Swal.getPopup();
          if (swalPopup) {
            swalPopup.classList.add('animate-fadeIn');
          }
        },
        willClose: () => {
          const swalPopup = Swal.getPopup();
          if (swalPopup) {
            swalPopup.classList.remove('animate-fadeIn');
            swalPopup.classList.add('animate-fadeOut');
          }
          setIsAlertActive(false); // Desactivar el desenfoque del fondo

          setTimeout(() => {
            navigate('/home');
          }, 500); // Tiempo de espera para asegurar la finalización de la animación
        },
      });
    } else {
      alert('Error en el inicio de sesión');
    }
  };

  const handleForgotPassword = () => {
    MySwal.fire({
      title: 'Restaurar Contraseña',
      input: 'email',
      inputLabel: 'Ingresa tu correo electrónico',
      inputPlaceholder: 'Correo electrónico',
      showCancelButton: true,
      confirmButtonText: 'Enviar enlace de restauración',
      cancelButtonText: 'Cancelar',
      preConfirm: async (email) => {
        try {
          const message = await solicitarRestauracion(email);
          MySwal.fire({
            title: '¡Correo enviado!',
            text: message,
            icon: 'success',
          });
        } catch (error) {
          MySwal.fire({
            title: 'Error',
            text: error.message,
            icon: 'error',
          });
        }
      },
    });
  };

  return (
    <div className={`relative min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-500 bg-no-repeat dark:bg-gray-900 bg-cover ${isAlertActive ? 'blur-bg' : ''}`}>
      {showCookieBanner && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            width: '100%',
            backgroundColor: '#333',
            color: '#fff',
            padding: '16px',
            boxShadow: '0 -2px 10px rgba(0,0,0,0.2)',
            zIndex: 9999,
          }}
        >
          <Typography variant="body1" sx={{ mb: 1 }}>
            Este sitio web utiliza cookies para mejorar la experiencia del usuario. Al continuar navegando, aceptas nuestro uso de cookies.
          </Typography>
          <Button variant="contained" color="primary" onClick={handleAcceptCookies}>
            Aceptar
          </Button>
        </Box>
      )}

      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl z-10 dark:bg-gray-600">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold">¡Bienvenido a Referi2!</h2>
          <p className="mt-2 text-sm text-gray-600">Por favor, inicia sesión en tu cuenta</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <input type="hidden" name="remember" defaultValue="true" />
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">Correo electrónico</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Contraseña</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="mt-5 appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center mt-4">
              <input id="remember_me" name="remember_me" type="checkbox" className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
              <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-900">Recuérdame</label>
            </div>
            <div className="text-sm mt-4">
              <button type="button" className="font-medium text-blue-600 dark:text-blue-500 hover:text-indigo-500" onClick={handleForgotPassword}>
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </div>
          <div>
            <button type="submit" className="mt-5 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Iniciar sesión</button>
          </div>
        </form>
        <div className="flex items-center justify-center mt-5">
          <span className="text-sm">¿No tienes una cuenta?</span>
          <Link to="/register" className="ml-1 font-bold text-sm text-indigo-500 hover:text-indigo-800 dark:text-blue-500 ">Regístrate</Link>
        </div>
      </div>
    </div>
  );
};
