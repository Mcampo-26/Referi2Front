import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import useUsuariosStore from '../store/useUsuariosStore';

export const ProtectedRoute = ({ element, redirectTo = "/Login" }) => {
  const { isAuthenticated } = useUsuariosStore((state) => ({
    isAuthenticated: state.isAuthenticated,
  }));

  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    // Aquí podría haber una lógica para validar el token con el backend si es necesario
    if (token && !isAuthenticated) {
      // Simular la autenticación o revalidar el token
      // Suponer que existe una acción para validar o reestablecer la autenticidad
    }
    setAuthChecked(true);
  }, [isAuthenticated]);

  if (!authChecked) {
    return <div>Loading...</div>; // O cualquier componente de carga
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return element;
};

