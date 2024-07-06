import React, { useState, useEffect } from 'react';
import { Button, TextField, Grid, Container, Typography, Card, CardContent, Paper, Box, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import { useQrStore } from '../store/UseQrStore';
import useEmpresasStore from '../store/useEmpresaStore';
import useUsuariosStore from '../store/useUsuariosStore';
import { WhatsApp } from '@mui/icons-material';
import { useTheme, ThemeProvider, CssBaseline, useMediaQuery } from '@mui/material';
import { styled } from '@mui/system';

const StyledBox = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[200],
  color: theme.palette.text.primary,
  transition: 'background-color 0.3s ease, color 0.3s ease'
}));

export const QrMain = () => {
  const [inputValue, setInputValue] = useState('');
  const [empresaId, setEmpresaId] = useState('');
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [mail, setMail] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [base64Image, setBase64Image] = useState('');
  const [assignedTo, setAssignedTo] = useState('');

  const createQr = useQrStore((state) => state.createQr);
  const { empresas, getAllEmpresas } = useEmpresasStore();
  const { usuarios, getUsuarios } = useUsuariosStore(); // Estado del store de usuarios

  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('md'));

  useEffect(() => {
    getAllEmpresas();
    getUsuarios(); // Obtener la lista de usuarios al montar el componente
  }, [getAllEmpresas, getUsuarios]);

  useEffect(() => {
    console.log("Usuarios:", usuarios); // Verificar si los usuarios están cargando correctamente
  }, [usuarios]);

  const handleGenerateClick = async () => {
    const userId = localStorage.getItem('userId'); // Obtén el userId del localStorage
    if (!userId) {
      console.error("User ID is missing");
      return;
    }

    const qrData = {
      userId, // Asegúrate de incluir el userId
      empresaId, // Incluye empresaId
      value: inputValue,
      nombre,
      telefono,
      mail,
      startTime,
      endTime,
      assignedTo, // Incluye el usuario asignado
    };

    console.log("Datos enviados para generar QR:", qrData);

    try {
      const newQr = await createQr(qrData);
      console.log("QR creado:", newQr);
      if (newQr && newQr.base64Image) {
        setBase64Image(newQr.base64Image);
      }
    } catch (error) {
      console.error("Error al crear QR:", error);
    }
  };

  const handleWhatsAppShare = () => {
    // Lógica para compartir en WhatsApp
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" className="h-screen flex items-center justify-center mt-20">
        <Card elevation={3} className="p-5 w-full">
          <CardContent>
            <Typography variant="h4" className="text-center mb-4">
              Crear QR Code
            </Typography>
            <Grid container spacing={4} mt={4}>
              <Grid item xs={12} md={6}>
                <StyledBox className="p-4 rounded-md shadow-md">
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
                    label="Valor del QR"
                    variant="outlined"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    fullWidth
                    margin="normal"
                  />
                  <TextField
                    label="Nombre"
                    variant="outlined"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    fullWidth
                    margin="normal"
                  />
                  <TextField
                    label="Teléfono"
                    variant="outlined"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
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
                </StyledBox>
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
    height:'80%',// Ajusta según tus necesidades
    maxWidth: '300px', // Ajusta según tus necesidades
  }}
/>

                  </Paper>
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Container>
    </ThemeProvider>
  );
};
