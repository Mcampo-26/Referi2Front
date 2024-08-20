import React, { useState, useEffect } from 'react';
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
  console.log("Renderizando componente RestaurarPassword...");

  const { token } = useParams(); // Obtiene el token desde la URL
  console.log("Token desde useParams:", token);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { restaurarPassword } = useUsuariosStore();
  const navigate = useNavigate();

  // useEffect para verificar el token
  useEffect(() => {
    console.log("Token recibido en useEffect:", token);
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Formulario enviado con las siguientes contraseñas:", { password, confirmPassword });

    if (password !== confirmPassword) {
      console.log("Error: Las contraseñas no coinciden");
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Las contraseñas no coinciden',
      });
      return;
    }

    try {
      console.log("Llamando a la función restaurarPassword con el token:", token);
      const responseMessage = await restaurarPassword(token, password);
      console.log("Respuesta de restaurarPassword:", responseMessage);

      Swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: responseMessage,
      }).then(() => {
        console.log("Redirigiendo a la página de login");
        navigate('/login');
      });
    } catch (error) {
      console.error("Error durante la restauración de contraseña:", error);

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message.includes('enlace ya ha sido usado o ha expirado')
          ? 'Este enlace ya ha sido usado o ha expirado. Por favor, solicita una nueva restauración de contraseña.'
          : 'Hubo un problema al restaurar la contraseña',
      });
    }
  };

  console.log("Preparando el formulario de restauración de contraseña...");

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
              onChange={(e) => {
                console.log("Actualizando password:", e.target.value);
                setPassword(e.target.value);
              }}
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
              onChange={(e) => {
                console.log("Actualizando confirmPassword:", e.target.value);
                setConfirmPassword(e.target.value);
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 3, mb: 2 }}
              onClick={() => console.log("Botón de restaurar contraseña clicado")}
            >
              Restaurar Contraseña
            </Button>
          </form>
        </Box>
      </Paper>
    </Container>
  );
};
