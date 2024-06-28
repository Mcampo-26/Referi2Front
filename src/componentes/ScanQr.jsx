import React, { useState, useEffect } from 'react';
import { Button, Container, Typography, Box, TextField } from '@mui/material';
import { Html5QrcodeScanner } from 'html5-qrcode';

export const ScanQr = () => {
  const [scannedData, setScannedData] = useState(null);
  const [error, setError] = useState(null);
  const [manualInput, setManualInput] = useState('');

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'reader',
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );
    scanner.render(handleScan, handleError);

    return () => {
      scanner.clear().catch(error => {
        console.error('Failed to clear html5QrcodeScanner. ', error);
      });
    };
  }, []);

  const handleScan = (data) => {
    if (data) {
      setScannedData(data);
    }
  };

  const handleError = (err) => {
    console.error(err);
    setError(err);
  };

  const handleInputChange = (event) => {
    setManualInput(event.target.value);
  };

  const handleInputSubmit = () => {
    setScannedData(manualInput);
  };

  return (
    <Container maxWidth="md" className="h-screen flex flex-col items-center justify-center mt-20">
      <Typography variant="h4" className="text-center mb-4 dark:text-white">
        Escanear QR Code
      </Typography>
      <Box id="reader" width="100%" maxWidth="600px" mb={4} mt={4}></Box>
      <Box
        width="100%"
        maxWidth="600px"
        mb={4}
        className="bg-white dark:bg-gray-800 dark:text-white p-4 rounded-md shadow-md transition-all duration-300"
      >
        <TextField
  fullWidth
  label="Ingresar código QR manualmente"
  variant="outlined"
  value={manualInput}
  onChange={handleInputChange}
  className="mb-4"
  InputProps={{
    classes: {
      root: 'dark:text-white',
    },
    style: {
      color: 'white', // Asegura que el texto sea blanco en modo oscuro
    },
    inputProps: {
      className: 'dark:text-white', // Asegura que el texto del input sea blanco en modo oscuro
    },
  }}
  InputLabelProps={{
    className: 'dark:text-white', // Asegura que el label sea blanco en modo oscuro
    style: {
      color: 'white', // Asegura que el color del label sea blanco en modo oscuro
    },
  }}
  sx={{
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: 'white', // Color del borde en modo oscuro
      },
      '&:hover fieldset': {
        borderColor: 'white', // Color del borde en modo hover en modo oscuro
      },
      '&.Mui-focused fieldset': {
        borderColor: 'white', // Color del borde cuando está enfocado en modo oscuro
      },
    },
  }}
/>

        <Button variant="contained" color="primary" onClick={handleInputSubmit}>
          Mostrar Información
        </Button>
      </Box>
      {scannedData && (
        <Box
          mt={4}
          textAlign="center"
          className="bg-white dark:bg-gray-800 dark:text-white p-4 rounded-md shadow-md transition-all duration-300"
        >
          <Typography variant="h6" gutterBottom>
            Información del QR:
          </Typography>
          <Typography variant="body1" color="textSecondary" gutterBottom>
            {scannedData}
          </Typography>
        </Box>
      )}
      {error && (
        <Box
          mt={4}
          textAlign="center"
          className="bg-white dark:bg-gray-800 dark:text-white p-4 rounded-md shadow-md transition-all duration-300"
        >
          <Typography variant="body1" color="error">
            Error al escanear el QR: {error.message}
          </Typography>
        </Box>
      )}
    </Container>
  );
};
