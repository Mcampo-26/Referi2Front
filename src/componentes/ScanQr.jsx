import React, { useState, useEffect, useRef } from 'react';
import { Button, Container, Typography, Box, TextField, Grid, Paper } from '@mui/material';
import { Html5Qrcode, Html5QrcodeScanner } from 'html5-qrcode';
import { useTheme } from '@mui/material/styles';
import 'tailwindcss/tailwind.css';

export const ScanQr = () => {
  const [scannedData, setScannedData] = useState({});
  const [error, setError] = useState(null);
  const [manualInput, setManualInput] = useState('');
  const theme = useTheme();
  const scannerRef = useRef(null);

  useEffect(() => {
    const html5QrCode = new Html5Qrcode("reader");
    scannerRef.current = html5QrCode;

    return () => {
      if (html5QrCode.isScanning) {
        html5QrCode.stop().catch(err => console.error('Failed to stop Html5Qrcode.', err));
      }
    };
  }, []);

  const startScan = () => {
    if (scannerRef.current && !scannerRef.current.isScanning) {
      scannerRef.current.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        handleScan,
        handleError
      ).catch(err => console.error('Failed to start scanning.', err));
    }
  };

  const handleScan = (data) => {
    if (data) {
      setScannedData(parseData(data));
      stopScan();
    }
  };

  const handleError = (err) => {
    console.error(err);
    setError(err);
  };

  const stopScan = () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current.stop().catch(err => console.error('Failed to stop Html5Qrcode.', err));
    }
  };

  const handleInputChange = (event) => {
    setManualInput(event.target.value);
  };

  const handleInputSubmit = () => {
    setScannedData(parseData(manualInput));
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      scannerRef.current.scanFile(file, true)
        .then(handleScan)
        .catch(handleError);
    }
  };

  const parseData = (data) => {
    const parsedData = {};
    const dataArray = data.split(/\s+/);
    dataArray.forEach((item, index) => {
      if (item.toLowerCase() === 'texto:') {
        parsedData.text = dataArray[index + 1] || 'N/A';
      } else if (item.toLowerCase() === 'nombre:') {
        parsedData.name = dataArray[index + 1] || 'N/A';
      } else if (item.toLowerCase() === 'teléfono:') {
        parsedData.phone = dataArray[index + 1] || 'N/A';
      } else if (item.toLowerCase() === 'correo:') {
        parsedData.email = dataArray[index + 1] || 'N/A';
      } else if (item.toLowerCase() === 'hora' && dataArray[index + 1]?.toLowerCase() === 'de' && dataArray[index + 2]?.toLowerCase() === 'inicio:') {
        parsedData.startTime = dataArray[index + 3] || 'N/A';
      } else if (item.toLowerCase() === 'hora' && dataArray[index + 1]?.toLowerCase() === 'de' && dataArray[index + 2]?.toLowerCase() === 'fin:') {
        parsedData.endTime = dataArray[index + 3] || 'N/A';
      }
    });
    return parsedData;
  };

  return (
    <Container maxWidth="md" className="flex flex-col items-center justify-center mt-20" sx={{ paddingBottom: '40px', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <Typography variant="h4" className="text-center mb-4" sx={{ color: theme.palette.text.primary }}>
        Escanear QR Code
      </Typography>
      <Box id="reader" width="100%" maxWidth="600px" mb={4} mt={4} className="w-full md:w-auto">
        {/* Contenedor del lector QR */}
      </Box>
      <Button variant="contained" color="primary" onClick={startScan} sx={{ mb: 2 }}>
        Iniciar Escaneo
      </Button>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ marginBottom: '20px' }}
      />
      <Box
        width="100%"
        maxWidth="600px"
        mb={4}
        p={4}
        borderRadius={2}
        boxShadow={3}
        sx={{
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          transition: 'background-color 0.3s ease, color 0.3s ease',
        }}
      >
        <TextField
          fullWidth
          label="Ingresar código QR manualmente"
          variant="outlined"
          value={manualInput}
          onChange={handleInputChange}
          className="mb-4"
          InputProps={{
            style: {
              color: theme.palette.text.primary,
              backgroundColor: theme.palette.background.paper,
            },
          }}
          InputLabelProps={{
            style: {
              color: theme.palette.text.primary,
            },
          }}
          sx={{
            marginTop: '1.5rem',
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: theme.palette.text.primary,
              },
              '&:hover fieldset': {
                borderColor: theme.palette.text.primary,
              },
              '&.Mui-focused fieldset': {
                borderColor: theme.palette.text.primary,
              },
            },
          }}
        />

        <Button variant="contained" color="primary" onClick={handleInputSubmit} sx={{ mt: 2 }}>
          Mostrar Información
        </Button>
      </Box>
      {Object.keys(scannedData).length > 0 && (
        <Box
          component={Paper}
          elevation={3}
          mt={4}
          mb={4}
          p={4}
          borderRadius={2}
          sx={{
            textAlign: 'center',
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            transition: 'background-color 0.3s ease, color 0.3s ease',
            width: '100%', // Asegura que el ancho sea completo
            maxWidth: '600px', // Ajusta el tamaño máximo
          }}
          className="mx-auto"
        >
          <Typography variant="h6" mb={5} gutterBottom>
            Información del QR:
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1"><strong>Texto:</strong> {scannedData.text}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1"><strong>Nombre:</strong> {scannedData.name}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1"><strong>Teléfono:</strong> {scannedData.phone}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1"><strong>Correo:</strong> {scannedData.email}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1"><strong>Hora de inicio:</strong> {scannedData.startTime}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1"><strong>Hora de fin:</strong> {scannedData.endTime}</Typography>
            </Grid>
          </Grid>
        </Box>
      )}
      {error && (
        <Box
          mt={4}
          mb={4}
          textAlign="center"
          p={4}
          borderRadius={2}
          boxShadow={3}
          sx={{
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            transition: 'background-color 0.3s ease, color 0.3s ease',
            width: '100%', // Asegura que el ancho sea completo
            maxWidth: '600px', // Ajusta el tamaño máximo
          }}
          className="mx-auto"
        >
          <Typography variant="body1" color="error">
            Error al escanear el QR: {error.message}
          </Typography>
        </Box>
      )}
    </Container>
  );
};
