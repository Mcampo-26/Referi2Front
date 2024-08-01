import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export const Error404 = () => {
  const navigate = useNavigate();

  const handleNavigateBack = () => {
    navigate(-1); // Navegar a la página anterior
  };

  return (
    <div className="bg-gray-200 w-full h-screen flex items-center justify-center px-4 md:px-0">
      <div className="bg-white border border-gray-200 flex flex-col items-center justify-center px-4 md:px-8 lg:px-24 py-8 rounded-lg shadow-2xl">
        <p className="text-6xl md:text-7xl lg:text-9xl font-bold tracking-wider text-gray-300">404</p>
        <p className="text-2xl md:text-3xl lg:text-5xl font-bold tracking-wider text-gray-500 mt-4">Disculpas... página en construcción.</p>
        
        <div className="w-full max-w-md mt-4">
        <img
            src="https://media.istockphoto.com/id/1487651614/es/vector/error-del-sistema-problema-de-software-o-falla-del-sistema-alerta-de-seguridad-o-falla-de.jpg?s=612x612&w=0&k=20&c=sNwAxFKGxdbJi6pmwdDBVec6w-mgIM8jQX3KLhm4Xvw="
            alt="error 404"
            className="w-full h-auto"
          />
        </div>
        <Button
          variant="contained"
          color="primary"
          startIcon={<ArrowBackIcon />}
          onClick={handleNavigateBack}
          className="mt-6"
        >
          Volver atrás
        </Button>
      </div>
    </div>
  );
};

export default Error404;
