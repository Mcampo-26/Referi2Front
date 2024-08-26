import React, { useState } from 'react';
import useUsuariosStore from '../store/useUsuariosStore';
import Swal from 'sweetalert2';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
} from '@mui/material';

export const VerifyAccount = () => {
  const [code, setCode] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const email = new URLSearchParams(location.search).get('email');
  const fromUserList = location.state?.fromUserList || false;  // Detecta si proviene de UserList
  const { verifyUsuario } = useUsuariosStore();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await verifyUsuario(email, code);
      Swal.fire({
        icon: 'success',
        title: 'Cuenta verificada',
        text: 'Tu cuenta ha sido verificada exitosamente.',
      }).then(() => {
        if (fromUserList) {
          navigate('/Users');  // Redirige a la lista de usuarios
        } else {
          navigate('/login');  // Redirige al login
        }
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error al verificar cuenta',
        text: error.message,
      });
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
            Verificar Cuenta
          </Typography>
          <form onSubmit={handleSubmit} noValidate>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="code"
              label="Código de Verificación"
              name="code"
              autoComplete="off"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 3, mb: 2 }}
            >
              Verificar
            </Button>
          </form>
        </Box>
      </Paper>
    </Container>
  );
};
