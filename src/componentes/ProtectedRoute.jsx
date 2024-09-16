import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import useUsuariosStore from '../store/useUsuariosStore';
import axiosInstance from '../utilities/axiosInstance'; // Importa tu instancia de Axios

export const ProtectedRoute = ({ element, redirectTo = "/Login" }) => {
  const { isAuthenticated, setAuthenticated } = useUsuariosStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    setAuthenticated: state.setAuthenticated, // Asegúrate de tener un setter en tu store
  }));

  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');

    const checkAuth = async () => {
      if (token && !isAuthenticated) {
        try {
          const response = await axiosInstance.get('/validate-token', { headers: { Authorization: `Bearer ${token}` } });
          if (response.data.valid) {
            setAuthenticated(true);
          } else {
            setAuthenticated(false);
          }
        } catch (error) {
          console.error('Error validando el token:', error);
          setAuthenticated(false);
        }
      }
      setAuthChecked(true);
    };

    checkAuth();
  }, [isAuthenticated, setAuthenticated]);

  if (!authChecked) {
    return <div>Loading...</div>; // O cualquier componente de carga
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return element;
};
