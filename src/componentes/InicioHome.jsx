import React from 'react';
import { Box, Typography, Container, Paper, useTheme } from '@mui/material';
import { styled } from '@mui/system';

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

export const InicioHome = () => {
  const theme = useTheme();

  return (
    <BackgroundContainer>
      <Paper elevation={3} className="p-6 md:p-10 rounded-lg shadow-lg max-w-md">
        <Box className="text-center">
          <Typography variant="h4" component="h1" className="font-bold mb-4" sx={{ color: theme.palette.text.primary }}>
            ¡Bienvenido a Referi2!
          </Typography>
          <Typography variant="body1" className="mb-6" sx={{ color: theme.palette.text.secondary }}>
            Escanea el código QR para empezar.
          </Typography>
          <Box className="flex justify-center mb-4">
            <img src="https://cdn.eldestapeweb.com/eldestape/082023/1691074331924/codigo-qr-cuenta-dni-para-referir-png..webp?cw=1127&ch=634&extw=jpg" alt="Código QR" className="w-40 h-40 md:w-64 md:h-64 rounded-lg shadow-md" />
          </Box>
          <Typography variant="body1" className="mb-6" sx={{ color: theme.palette.text.primary }}>
            ¡Comparte este QR con tus amigos y gana recompensas exclusivas! Por cada referido que se registre usando este código, recibirás puntos que podrás canjear!!!
          </Typography>
        </Box>
      </Paper>
    </BackgroundContainer>
  );
};

export default InicioHome;
