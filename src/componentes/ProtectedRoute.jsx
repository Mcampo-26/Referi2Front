import React from "react";
import { Navigate } from "react-router-dom";
import useUsuariosStore from '../store/useUsuariosStore';

const ProtectedRoute = ({ element, roleRequired }) => {
  const { isAuthenticated, role } = useUsuariosStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    role: state.role,
  }));

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (roleRequired && role !== roleRequired) {
    return <Navigate to="/" />;
  }

  return element;
};

export default ProtectedRoute;
