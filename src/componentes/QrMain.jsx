// QrMain.js
import React, { useState, useEffect } from 'react';
import {
  Button, TextField, Grid, Container, Typography, Card, CardContent,
  Paper, Box, MenuItem, Select, InputLabel, FormControl, InputAdornment
} from '@mui/material';
import { useQrStore } from '../store/UseQrStore';
import useEmpresasStore from '../store/useEmpresaStore';
import useUsuariosStore from '../store/useUsuariosStore';
import { WhatsApp } from '@mui/icons-material';
import { useTheme, ThemeProvider, CssBaseline, useMediaQuery } from '@mui/material';
import { styled } from '@mui/system';
import Swal from 'sweetalert2';

const StyledBox = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[200],
  color: theme.palette.text.primary,
  transition: 'background-color 0.3s ease, color 0.3s ease',
  height: '100vh',  // Ocupa toda la altura de la ventana del navegador
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.spacing(2),
}));

export const QrMain = () => {
  const [value, setValue] = useState('');
  const [empresaId, setEmpresaId] = useState('');
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [mail, setMail] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [date, setDate] = useState('');
  const [base64Image, setBase64Image] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [maxUsageCount, setMaxUsageCount] = useState(''); // Nuevo estado para maxUsageCount

  const createQr = useQrStore((state) => state.createQr);
  const { empresas, getAllEmpresas } = useEmpresasStore();
  const { usuarios, getUsuarios } = useUsuariosStore();

  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('md'));

  useEffect(() => {
    getAllEmpresas();
    getUsuarios();
  }, [getAllEmpresas, getUsuarios]);

  useEffect(() => {
    console.log("Usuarios:", usuarios);
  }, [usuarios]);

  const validateFields = () => {
    if (!value || !empresaId || !nombre || !telefono || !mail || !startTime || !endTime || !date || !assignedTo || !maxUsageCount) { // Validar maxUsageCount
      Swal.fire('Error', 'Por favor, complete todos los campos', 'error');
      return false;
    }
    if (nombre.length > 20) {
      Swal.fire('Error', 'El nombre no debe exceder los 20 caracteres', 'error');
      return false;
    }
    if (telefono.length < 10 || telefono.length > 15 || !/^\d+$/.test(telefono)) {
      Swal.fire('Error', 'El teléfono debe tener entre 10 y 15 caracteres y solo debe contener números', 'error');
      return false;
    }
    if (!/^\d{1,2}$/.test(value)) {
      Swal.fire('Error', 'El descuento debe ser un número entre 0 y 99', 'error');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(mail)) {
      Swal.fire('Error', 'El correo no es válido', 'error');
      return false;
    }
    if (!/^\d+$/.test(maxUsageCount) || parseInt(maxUsageCount, 10) < 1) {
      Swal.fire('Error', 'La cantidad máxima de usos debe ser un número entero mayor que 0', 'error');
      return false;
    }
    return true;
  };

  const handleGenerateClick = async () => {
    if (!validateFields()) {
      return;
    }

    const userId = localStorage.getItem('userId');
    if (!userId) {
      console.error("User ID is missing");
      return;
    }

    const empresa = empresas.find(e => e._id === empresaId);
    const qrData = {
      userId,
      assignedTo: { _id: assignedTo, nombre: usuarios.find(u => u._id === assignedTo)?.nombre },
      empresaId: { _id: empresaId, name: empresa?.name || 'N/A' },
      value,
      nombre,
      telefono,
      mail,
      startTime,
      endTime,
      date,
      maxUsageCount: parseInt(maxUsageCount, 10) // Incluir maxUsageCount en los datos del QR
    };

    console.log("Datos enviados para generar QR:", qrData);

    try {
      const newQr = await createQr(qrData); // Enviar el objeto directamente
      console.log("QR creado:", newQr);
      if (newQr && newQr.base64Image) {
        setBase64Image(newQr.base64Image);
      }
    } catch (error) {
      console.error("Error al crear QR:", error);
      Swal.fire('Error', 'Hubo un problema al crear el QR', 'error');
    }
  };

  const handleWhatsAppShare = () => {
    const message = `Hola, aquí tienes tu código QR:\n\n${window.location.origin}/qr/${base64Image}`;
    const formattedNumber = telefono.replace(/\D/g, '');
    window.open(`https://wa.me/${formattedNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <StyledBox>
        <Card elevation={3} className="p-5 w-full max-w-screen-lg">
          <CardContent>
            <Typography variant="h4" className="text-center mb-4">
              Crear QR Code
            </Typography>
            <Grid container spacing={4} mt={4}>
              <Grid item xs={12} md={6}>
                <Box className="p-4 rounded-md shadow-md">
                  <FormControl fullWidth margin="normal" variant="outlined">
                    <InputLabel>Empresa</InputLabel>
                    <Select
                      value={empresaId}
                      onChange={(e) => setEmpresaId(e.target.value)}
                      label="Empresa"
                    >
                      {empresas.map((empresa) => (
                        <MenuItem key={empresa._id} value={empresa._id}>
                          {empresa.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    label="Descuento"
                    variant="outlined"
                    placeholder="Descuento (%)"
                    value={value}
                    onChange={(e) => {
                      if (/^\d{0,2}$/.test(e.target.value)) {
                        setValue(e.target.value);
                      }
                    }}
                    fullWidth
                    margin="normal"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>
                    }}
                  />
                  <TextField
                    label="Nombre"
                    variant="outlined"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    fullWidth
                    margin="normal"
                    inputProps={{ maxLength: 20 }}
                  />
                  <TextField
                    label="Teléfono"
                    variant="outlined"
                    value={telefono}
                    onChange={(e) => {
                      if (/^\d*$/.test(e.target.value)) {
                        setTelefono(e.target.value);
                      }
                    }}
                    fullWidth
                    margin="normal"
                  />
                  <TextField
                    label="Correo"
                    variant="outlined"
                    value={mail}
                    onChange={(e) => setMail(e.target.value)}
                    fullWidth
                    margin="normal"
                  />
                  <TextField
                    label="Hora de inicio (HH:MM)"
                    variant="outlined"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    fullWidth
                    margin="normal"
                  />
                  <TextField
                    label="Hora de fin (HH:MM)"
                    variant="outlined"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    fullWidth
                    margin="normal"
                  />
                  <TextField
                    label="Fecha"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    fullWidth
                    margin="normal"
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                  <TextField
                    label="Cantidad de usos"
                    variant="outlined"
                    placeholder="Cantidad de usos"
                    value={maxUsageCount}
                    onChange={(e) => {
                      if (/^\d*$/.test(e.target.value)) {
                        setMaxUsageCount(e.target.value);
                      }
                    }}
                    fullWidth
                    margin="normal"
                  />
                  <FormControl fullWidth margin="normal" variant="outlined">
                    <InputLabel>Asignar a usuario</InputLabel>
                    <Select
                      value={assignedTo}
                      onChange={(e) => setAssignedTo(e.target.value)}
                      label="Asignar a usuario"
                    >
                      {usuarios.map((usuario) => (
                        <MenuItem key={usuario._id} value={usuario._id}>
                          {usuario.nombre}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleGenerateClick}
                    fullWidth
                    className="py-3 text-lg mt-4"
                  >
                    Generar QR
                  </Button>
                  {base64Image && (
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<WhatsApp />}
                      onClick={handleWhatsAppShare}
                      fullWidth
                      className="py-3 text-lg mt-4"
                    >
                      Compartir en WhatsApp
                    </Button>
                  )}
                </Box>
              </Grid>
              <Grid item xs={12} md={6} className="flex justify-center items-center">
                {base64Image && (
                  <Paper elevation={3} className="p-0 bg-white dark:bg-gray-800 rounded-md shadow-md flex justify-center items-center w-full h-full">
                    <img
                      src={`data:image/png;base64,${base64Image}`}
                      alt="Generated QR Code"
                      className="w-full h-full max-w-xs md:max-w-sm lg:max-w-md xl:max-w-lg"
                      style={{
                        width: '350%',
                        height: '80%',
                        maxWidth: '450px',
                      }}
                    />
                  </Paper>
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </StyledBox>
    </ThemeProvider>
  );
};
