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
  
  // Obtén el estado de autenticación y rol desde el store
  const { isAuthenticated, role } = useUsuariosStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    role: state.role,
  }));
  
  // Mapa de roles desde IDs a nombres
  const roleMap = {
    "668692d09bbe1e9ff25a4826": "SuperAdmin",
    "66aba1fc753d20ba639d2aaf": "Admin",
    "668697449bbe1e9ff25a4889": "Referidor",
    "6686d371d64d18acf5ba6bb5": "Vendedor",
  };

  // Convertir roleId a roleName usando el mapa
  const roleName = roleMap[role] || null;

  if (isAuthenticated) {
    if (roleName === 'Admin' || roleName === 'SuperAdmin') {
      return <ScanQr />;
    } else if (roleName === 'Referidor' || roleName === 'Vendedor') {
      return <Referidos />;
    } else if (!roleName) {
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
