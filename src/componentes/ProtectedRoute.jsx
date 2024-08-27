import React from "react";
import { Navigate } from "react-router-dom";
import useUsuariosStore from '../store/useUsuariosStore';

export  const ProtectedRoute = ({ element }) => {
  const { isAuthenticated } = useUsuariosStore((state) => ({
    isAuthenticated: state.isAuthenticated,
  }));

  if (!isAuthenticated) {
    return <Navigate to="/Login" />;
  }

  return element;
};
