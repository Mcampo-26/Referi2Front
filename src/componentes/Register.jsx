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
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export const Register = () => {
  const location = useLocation();
  const showEmpresa = location.state?.showEmpresa || false;
  const preselectedEmpresa = location.state?.empresaName || '';
  const role = localStorage.getItem('role');

  const { createUsuario } = useUsuariosStore();

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
    telefono: '',
    empresa: preselectedEmpresa,
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
    if (formData.password !== formData.confirmPassword) return 'Las contraseñas no coinciden.';
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
      const userData = {
        nombre: formData.nombre,
        email: formData.email,
        password: formData.password,
        telefono: formData.telefono,
        empresa: formData.empresa,
      };
  
      await createUsuario(userData);
      Swal.fire({
        icon: 'success',
        title: 'Código de verificación enviado',
        text: 'Por favor, revisa tu correo electrónico para verificar tu cuenta.',
      }).then(() => {
        navigate(`/verify?email=${formData.email}`);
      });
    } catch (error) {
      if (error.message.includes('Ya se ha enviado un código de verificación')) {
        Swal.fire({
          icon: 'error',
          title: 'Código ya enviado',
          text: 'Ya se ha enviado un código de verificación recientemente. Por favor, espera 30 minutos antes de solicitar uno nuevo.',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error al registrar usuario',
          text: error.message,
        });
      }
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
          <Typography component="h1" variant="h5">
            Crea una nueva cuenta
          </Typography>
          <form onSubmit={handleSubmit} noValidate>
            {showEmpresa && (
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="empresa"
                label="Empresa"
                name="empresa"
                autoComplete="organization"
                value={formData.empresa}
                onChange={handleChange}
                disabled={role !== 'SuperAdmin'}
              />
            )}
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
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirmar Contraseña"
              type="password"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
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
