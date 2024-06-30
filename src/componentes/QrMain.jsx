import React, { useState } from 'react';
import { Button, TextField, Grid, Container, Typography, Card, CardContent, Paper, Box } from '@mui/material';
import { useQrStore } from '../store/UseQrStore'; // Ruta corregida
import { useUsuariosStore } from '../store/useUsuariosStore'; // Asumiendo que tienes un store para gestionar el usuario
import { WhatsApp } from '@mui/icons-material';
import axios from 'axios';
import { useTheme, ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { styled } from '@mui/system';
import { URL } from '../utilities/config';



const StyledBox = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[200],
  color: theme.palette.text.primary,
  transition: 'background-color 0.3s ease, color 0.3s ease'
}));

export const QrMain = () => {
  const [inputValue, setInputValue] = useState('');
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [mail, setMail] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [base64Image, setBase64Image] = useState('');

  const createQr = useQrStore((state) => state.createQr);
  const { userId } = useUsuariosStore(); // Obtén el userId del store del usuario
  const theme = useTheme();

  const handleGenerateClick = async () => {
    const qrData = {
      userId, // Incluye el userId del usuario actual
      value: inputValue,
      nombre,
      telefono,
      mail,
      startTime,
      endTime
    };
    const newQr = await createQr(qrData);
    if (newQr) {
      const combinedData = `
        Texto: ${inputValue}\n
        Nombre: ${nombre}\n
        Teléfono: ${telefono}\n
        Correo: ${mail}\n
        Hora de inicio: ${startTime}\n
        Hora de fin: ${endTime}
      `.trim(); // Trim to remove leading/trailing spaces/newlines
      const response = await axios.get(`${URL}/Qr/generate-qr`, { params: { text: combinedData } });
      setBase64Image(response.data.base64Image);
    }
  };

  const handleWhatsAppShare = () => {
    if (!base64Image) {
      alert('No QR code to share');
      return;
    }

    const byteCharacters = atob(base64Image);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/png' });
    const file = new File([blob], 'qr-code.png', { type: 'image/png' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({
        files: [file],
        title: 'QR Code',
        text: 'Here is the QR code',
      })
      .then(() => console.log('Successful share'))
      .catch((error) => console.log('Error sharing', error));
    } else {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'qr-code.png';
      a.click();
      URL.revokeObjectURL(url);
      alert('File downloaded. You can now share it manually.');
    }
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
                  <TextField
                    label="Empresa"
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
                  <Paper elevation={3} className="p-5 bg-white dark:bg-gray-800 rounded-md shadow-md">
                    <img src={`data:image/png;base64,${base64Image}`} alt="Generated QR Code" />
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
