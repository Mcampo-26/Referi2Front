import React from 'react';
import { Box, Typography, Container, Paper, useTheme, Button, Alert } from '@mui/material';
import { styled } from '@mui/system';
import { ScanQr } from '../componentes/ScanQr';
import useUsuariosStore from '../store/useUsuariosStore';
import { Login } from '../componentes/Login';
import { Referidos } from '../pages/Referidos';
import { useNavigate } from 'react-router-dom';

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
  const { isAuthenticated, role } = useUsuariosStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    role: state.role,
  }));

  // Verifica si el usuario está autenticado y si es Admin o SuperAdmin
  if (isAuthenticated && (role === 'Admin' || role === 'SuperAdmin')) {
    return <ScanQr />;
  } else if (isAuthenticated && (role === 'Referidor' || role === 'Vendedor')) {
    return <Referidos />;
  } else if (isAuthenticated && !role) {
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
  } else {
    return <Login />;
  }
};
