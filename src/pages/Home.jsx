import React, { useEffect, useState } from 'react';
import { Box, Typography, Container, Paper, useTheme, Button, Alert } from '@mui/material';
import { styled } from '@mui/system';
import { ScanQr } from '../componentes/ScanQr';
import { Referidos } from '../pages/Referidos';
import { Login } from '../componentes/Login';
import { useNavigate } from 'react-router-dom';
import useUsuariosStore from '../store/useUsuariosStore';

const BackgroundContainer = styled(Container)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(135deg, #1e3a8a, #2563eb)'
    : 'linear-gradient(135deg, #93c5fd, #3b82f6)',
  padding: theme.spacing(4),
}));

export const Home = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // Obtener el estado de autenticación y el rol desde el localStorage
  const { isAuthenticated } = useUsuariosStore((state) => ({
    isAuthenticated: state.isAuthenticated,
  }));
  
  // Obtener los permisos y roleName del localStorage
  const storedPermissions = JSON.parse(localStorage.getItem('permisos')) || {};
  const roleName = localStorage.getItem('roleName') || null;

  useEffect(() => {
    if (isAuthenticated) {
      // Reemplazar el estado actual en el historial para deshabilitar el botón "Atrás"
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [isAuthenticated]);

  if (isAuthenticated) {
    // Caso especial para SuperAdmin o Admin
    if (roleName === 'Admin' || roleName === 'SuperAdmin') {
      return <ScanQr />;
    } 
    // Otros roles: Referidor o Vendedor
    else if (roleName === 'Referidor' || roleName === 'Vendedor') {
      return <Referidos />;
    } 
    // Si no tiene permisos asignados pero tiene rol (evitar mostrar el cartel para roles válidos)
    else if (!roleName || Object.keys(storedPermissions).length === 0) {
      return (
        <BackgroundContainer>
          <Paper elevation={3} sx={{ padding: theme.spacing(4), textAlign: 'center' }}>
            <Alert severity="warning" sx={{ marginBottom: theme.spacing(2) }}>
              No tienes los permisos necesarios para acceder a esta página.
            </Alert>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => navigate('/contacto')}
            >
              Ir a Contacto
            </Button>
          </Paper>
        </BackgroundContainer>
      );
    } else {
      // Si el rol no coincide con ninguno
      return (
        <BackgroundContainer>
          <Paper elevation={3} sx={{ padding: theme.spacing(4), textAlign: 'center' }}>
            <Alert severity="warning" sx={{ marginBottom: theme.spacing(2) }}>
              No tienes un rol asignado. Contacta con el administrador.
            </Alert>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => navigate('/contacto')}
            >
              Ir a Contacto
            </Button>
          </Paper>
        </BackgroundContainer>
      );
    }
  } else {
    return <Login />;
  }
};
