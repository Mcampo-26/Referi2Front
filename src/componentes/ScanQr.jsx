import React, { useState, useEffect, useRef } from 'react';
import { Button, Container, Typography, Box, TextField, Grid, Paper } from '@mui/material';
import { Html5Qrcode } from 'html5-qrcode';
import { useTheme } from '@mui/material/styles';
import 'tailwindcss/tailwind.css';

export const ScanQr = () => {
  const [scannedData, setScannedData] = useState({});
  const [error, setError] = useState(null);
  const [manualInput, setManualInput] = useState('');
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 768); // Estado para detectar el tamaño de la pantalla
  const theme = useTheme();
  const scannerRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Verifica el tamaño de la pantalla al montar el componente

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

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
      
      {isSmallScreen && (<Typography variant="h4" className="text-center mb-4" >
        Escanear QR Code
      </Typography>
      )}
       {!isSmallScreen && (<Typography variant="h4" className="text-center mb-4" >
       Imagen de QR Code
      </Typography>
      )}
            <Box id="reader" width="100%" maxWidth="600px" mb={4} mt={4} className="w-full md:w-auto border border-gray-300 rounded-lg shadow-md">
        {/* Contenedor del lector QR */}
      </Box>
      {/* Mostrar el botón "Iniciar Escaneo" solo en pantallas pequeñas */}
      {isSmallScreen && (
        <Button
          variant="contained"
          color="primary"
          onClick={startScan}
          className="mb-6 "
        >
          Iniciar Escaneo
        </Button>
      )}
      {/* Mostrar el botón "Subir Archivo" solo en pantallas medianas y grandes */}
      {!isSmallScreen && (
        <Button
          variant="contained"
          color="secondary"
          onClick={() => fileInputRef.current.click()}
          className="mb-2 mt-2"
        >
          Subir Archivo
        </Button>
      )}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <Box
        width="100%"
        maxWidth="600px"
        mb={4}
        p={4}
        mt={6}
        borderRadius={2}
        boxShadow={3}
        className="bg-white dark:bg-gray-800 text-black dark:text-white transition-all duration-300"
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
              backgroundColor: theme.palette.mode === 'dark' ? '#2e2e2e' : theme.palette.background.paper, // Color de fondo específico en modo oscuro
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
          className="w-full max-w-lg mx-auto bg-white dark:bg-gray-800 text-black dark:text-white transition-all duration-300"
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
          className="w-full max-w-lg mx-auto bg-white dark:bg-gray-800 text-black dark:text-white transition-all duration-300"
        >
          <Typography variant="body1" color="error">
            Error al escanear el QR: {error.message}
          </Typography>
        </Box>
      )}
    </Container>
  );
};
