import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import useUsuariosStore from '../store/useUsuariosStore';

const MySwal = withReactContent(Swal);

export const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { createUsuario } = useUsuariosStore();

  // Extraemos la información de la ubicación para saber si venimos de UserList
  const fromUserList = location.state?.fromUserList || false;
  const showEmpresa = location.state?.showEmpresa || false;
  const preselectedEmpresa = location.state?.empresaName || '';
  const role = localStorage.getItem('role');

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
    telefono: '',
    empresa: preselectedEmpresa,
  });

  const validateInputs = () => {
    const nameRegex = /^[a-zA-ZÀ-ÿ\s]{1,50}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{0,15}$/;

    if (!formData.nombre.trim()) return 'El nombre completo es requerido.';
    if (!nameRegex.test(formData.nombre))
      return 'El nombre completo debe contener solo letras y espacios, con un máximo de 50 caracteres.';
    if (!formData.email.trim()) return 'El correo electrónico es requerido.';
    if (!emailRegex.test(formData.email))
      return 'El correo electrónico no es válido.';
    if (!formData.password.trim()) return 'La contraseña es requerida.';
    if (formData.password.length < 8)
      return 'La contraseña debe tener al menos 8 caracteres.';
    if (!/[A-Z]/.test(formData.password))
      return 'La contraseña debe contener al menos una letra mayúscula.';
    if (!/\d/.test(formData.password))
      return 'La contraseña debe contener al menos un número.';
    if (formData.password !== formData.confirmPassword)
      return 'Las contraseñas no coinciden.';
    if (formData.telefono && !phoneRegex.test(formData.telefono))
      return 'El número de teléfono debe contener solo números y un máximo de 15 caracteres.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateInputs();
    if (validationError) {
      MySwal.fire({
        icon: 'error',
        title: 'Error en el formulario',
        text: validationError,
      });
      return;
    }

    // Mostrar spinner de carga
    MySwal.fire({
      title: 'Creando usuario...',
      text: 'Por favor espera mientras procesamos tu solicitud.',
      allowOutsideClick: false,
      didOpen: () => {
        MySwal.showLoading();
      },
    });

    try {
      const userData = {
        nombre: formData.nombre,
        email: formData.email,
        password: formData.password,
        telefono: formData.telefono || undefined,
        empresa: formData.empresa || undefined,
      };

      await createUsuario(userData);

      // Cerrar spinner de carga y mostrar mensaje de éxito
      MySwal.fire({
        icon: 'success',
        title: 'Registro exitoso',
        text: 'Se ha enviado un código de verificación a tu correo electrónico.',
        confirmButtonText: 'Aceptar',
      }).then(() => {
        // Navegar a la página de verificación y pasar el estado para regresar a la lista de usuarios después
        navigate(`/verify?email=${formData.email}`, { state: { fromUserList } });
      });
    } catch (error) {
      MySwal.fire({
        icon: 'error',
        title: 'Error al registrar usuario',
        text: error.response?.data?.msg || 'Ocurrió un error inesperado.',
      });
    }
  };

  const handleChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const handleClose = () => {
    if (fromUserList) {
      navigate(-1); // Regresar a la página anterior (UserList)
    } else {
      navigate('/login'); // Navegar a la página de inicio de sesión
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 4, position: 'relative' }}>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography component="h1" variant="h5">
            Crear nueva cuenta
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
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
              autoComplete="new-password"
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
              autoComplete="new-password"
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
              sx={{ mt: 3 }}
            >
              Crear Cuenta
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};
