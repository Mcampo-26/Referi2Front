import React from 'react';
import { Box, Typography, Container, Paper, useTheme } from '@mui/material';
import { styled } from '@mui/system';
import qrHome from '../assets/qrHome.jpg';
import { ScanQr } from '../componentes/ScanQr';
import useUsuariosStore from '../store/useUsuariosStore';
import {Login}from '../componentes/Login'
import {Referidos} from '../pages/Referidos'
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
  const { isAuthenticated, role } = useUsuariosStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    role: state.role,
  }));

  // Verifica si el usuario está autenticado y si es Admin o SuperAdmin
  if (isAuthenticated && (role === 'Admin' || role === 'SuperAdmin')) {
    return (

  
         
          <ScanQr />
        
    
    );
  } else if (isAuthenticated && role === 'Referidor') {
    return (
      <BackgroundContainer>
       <Referidos/>
      </BackgroundContainer>
    );
  } else {
    return (
   <Login/>
    );
  }
};
