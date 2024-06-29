import React, { useState } from 'react';
import useUsuariosStore from '../store/useUsuariosStore';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export const Register = () => {
  const { createUsuario } = useUsuariosStore();
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    direccion1: '',
    direccion2: '',
    telefono: '',
    role: 'usuario'
  });
  const navigate = useNavigate();

  const validateInputs = () => {
    const nameRegex = /^[a-zA-Z\s]{1,50}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{0,15}$/;

    if (!formData.nombre.trim()) return 'El nombre completo es requerido.';
    if (!nameRegex.test(formData.nombre)) return 'El nombre completo debe contener solo letras y espacios, con un máximo de 50 caracteres.';
    if (!formData.email.trim()) return 'El correo electrónico es requerido.';
    if (!emailRegex.test(formData.email)) return 'El correo electrónico no es válido.';
    if (!formData.password.trim()) return 'La contraseña es requerida.';
    if (formData.password.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
    if (!/[A-Z]/.test(formData.password)) return 'La contraseña debe contener al menos una letra mayúscula.';
    if (!/\d/.test(formData.password)) return 'La contraseña debe contener al menos un número.';
    if (!phoneRegex.test(formData.telefono)) return 'El número de teléfono debe contener solo números y un máximo de 15 caracteres.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateInputs();
    if (validationError) {
      Swal.fire({
        icon: 'error',
        title: 'Por favor complete los campos',
        text: validationError,
      });
      return;
    }

    try {
      await createUsuario(formData);
      Swal.fire({
        icon: 'success',
        title: 'Usuario creado exitosamente',
      }).then(() => {
        navigate('/');
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error al crear usuario',
        text: error.message,
      });
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 4, position: 'relative' }}>
        <IconButton
          aria-label="close"
          onClick={() => navigate('/')}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box sx={{ mb: 2 }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12 4a4 4 0 0 1 4 4a4 4 0 0 1-4 4a4 4 0 0 1-4-4a4 4 0 0 1 4-4m0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4"/>
            </svg>
          </Box>
          <Typography component="h1" variant="h5">
            Crea una nueva cuenta
          </Typography>
          <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 3 }}>
            Ingresa tus datos para registrarte.
          </Typography>
          <form onSubmit={handleSubmit} noValidate>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="nombre"
              label="Nombre completo"
              name="nombre"
              autoComplete="name"
              autoFocus
              value={formData.nombre}
              onChange={handleChange}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="email"
              label="Correo electrónico"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              label="Contraseña"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
            />
            <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 2 }}>
              Debe contener al menos 1 letra mayúscula, 1 número y mínimo 8 caracteres.
            </Typography>     
            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              id="telefono"
              label="Número de teléfono"
              name="telefono"
              autoComplete="tel"
              value={formData.telefono}
              onChange={handleChange}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 3, mb: 2 }}
            >
              Registrarse
            </Button>
          </form>
        </Box>
      </Paper>
    </Container>
  );
};


