import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useUsuariosStore from '../store/useUsuariosStore';
import Swal from 'sweetalert2';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
} from '@mui/material';

export const RestaurarPassword = () => {
  const { token } = useParams(); // Obtiene el token desde la URL
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { restaurarPassword } = useUsuariosStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Las contraseñas no coinciden',
      });
      return;
    }

    try {
      const responseMessage = await restaurarPassword(token, password);
      Swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: responseMessage,
      }).then(() => {
        navigate('/login');
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message.includes('enlace ya ha sido usado o ha expirado')
          ? 'Este enlace ya ha sido usado o ha expirado. Por favor, solicita una nueva restauración de contraseña.'
          : 'Hubo un problema al restaurar la contraseña',
      });
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
            Restaurar Contraseña
          </Typography>
          <form onSubmit={handleSubmit} noValidate>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="password"
              label="Nueva Contraseña"
              name="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="confirmPassword"
              label="Confirmar Nueva Contraseña"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 3, mb: 2 }}
            >
              Restaurar Contraseña
            </Button>
          </form>
        </Box>
      </Paper>
    </Container>
  );
};
