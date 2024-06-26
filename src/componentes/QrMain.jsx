import React, { useState } from 'react';
import QRCode from 'qrcode.react';
import { Button, TextField, Grid, Container, Typography, Card, CardContent, Paper, Box } from '@mui/material';
import { useQrStore } from '../store/UseQrStore'; // Ruta corregida
import { WhatsApp } from '@mui/icons-material';

export const QrMain = () => {
  const [inputValue, setInputValue] = useState('');
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [mail, setMail] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [qrValue, setQrValue] = useState('');

  const createQr = useQrStore((state) => state.createQr);

  const handleGenerateClick = async () => {
    const qrData = {
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
      `;
      setQrValue(combinedData);
    }
  };

  const handleWhatsAppShare = () => {
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(qrValue)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Container maxWidth="lg" className="h-screen flex items-center justify-center mt-20">
      <Card elevation={3} className="p-5 w-full">
        <CardContent>
          <Typography variant="h4" className="text-center mb-4">
            Crear QR Code
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Box className="p-4 bg-gray-100 rounded-md shadow-md">
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
                {qrValue && (
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
              {qrValue && (
                <Paper elevation={3} className="p-5 bg-white rounded-md shadow-md">
                  <QRCode value={qrValue} size={300} />
                </Paper>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
};

