import React from 'react';
import { Box, Typography, Container, Paper, useTheme } from '@mui/material';
import { styled } from '@mui/system';
import qrHome from '../assets/qrHome.jpg';
import { ScanQr } from '../componentes/ScanQr';

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

  return (
<ScanQr/>
  );
};

