import React, { useState, useEffect, useRef } from 'react';
import { Button, Box, Typography, Container, TextField, Grid, Paper, FormControl, InputLabel, Select, MenuItem, Fade } from '@mui/material';
import { Html5Qrcode } from 'html5-qrcode';
import { useTheme } from '@mui/material/styles';
import useQrStore from '../store/UseQrStore';
import useServiciosStore from '../store/useServiciosStore';
import Swal from 'sweetalert2';
import qrHome from '../assets/qrHome.jpg';
import './Css/Scan.css'; // Asegúrate de que el archivo CSS principal esté importado

export const ScanQr = () => {
  const [scannedData, setScannedData] = useState(null);
  const [error, setError] = useState(null);
  const [manualInput, setManualInput] = useState('');
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 768);
  const [selectedService, setSelectedService] = useState('');
  const [details, setDetails] = useState('');
  const [fadeOut, setFadeOut] = useState(false); // Estado para la transición
  const [isScanning, setIsScanning] = useState(false); // Estado para saber si está escaneando
  const { servicios, getServiciosByEmpresaId, loading, error: serviciosError } = useServiciosStore((state) => ({
    servicios: state.servicios,
    getServiciosByEmpresaId: state.getServiciosByEmpresaId,
    loading: state.loading,
    error: state.error,
  }));
  const { updateQr, getQrById, useQr } = useQrStore((state) => ({
    updateQr: state.updateQr,
    getQrById: state.getQrById,
    useQr: state.useQr
  }));
  const theme = useTheme();
  const scannerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Manejo de redimensionamiento de pantalla para actualizar el estado
  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Inicialización del escáner de QR y limpieza al desmontar el componente
  useEffect(() => {
    const html5QrCode = new Html5Qrcode("reader");
    scannerRef.current = html5QrCode;

    return () => {
      if (html5QrCode.isScanning) {
        html5QrCode.stop().catch(err => console.error('Failed to stop Html5Qrcode.', err));
      }
    };
  }, []);

  // Función para parsear los datos escaneados
  const parseData = (data) => {
    const parsedData = JSON.parse(data);
    console.log('Datos recibidos para parsear:', parsedData);

    const fullData = {
      id: parsedData.id || 'N/A',
      userId: parsedData.uId || 'N/A',
      assignedTo: { _id: parsedData.aId || 'N/A' },
      empresaId: {
        _id: parsedData.eId || 'N/A',
        name: parsedData.eName || 'N/A'
      },
      value: parsedData.v || 'N/A',
      nombre: parsedData.n || 'N/A',
      telefono: parsedData.t || 'N/A',
      mail: parsedData.m || 'N/A',
      startTime: parsedData.sT || 'N/A',
      endTime: parsedData.eT || 'N/A',
      date: parsedData.d || 'N/A',
      maxUsageCount: parsedData.mUC || 0,
      usageCount: parsedData.uC || 0,
      isUsed: parsedData.isUsed || false,
      updates: parsedData.updates || [], // Asegúrate de que se incluyan las actualizaciones
    };

    console.log('Datos parseados:', fullData);
    return fullData;
  };

 const startScan = () => {
  if (scannerRef.current && !scannerRef.current.isScanning) {
    setError(null); // Limpiar el error al iniciar un nuevo escaneo
    setIsScanning(true); // Indicar que se está escaneando
    scannerRef.current.start(
      { facingMode: "environment" },
      {
        fps: 80, // Aumenta FPS para mejorar la calidad del escaneo
        qrbox: { width: 280, height: 280 }, // Aumenta el tamaño del área de escaneo
        disableFlip: true // Desactiva el parpadeo al girar la cámara
      },
      handleScan,
      handleError
    ).catch(err => {
      console.error('Failed to start scanning.', err);
      setError(err);
      setIsScanning(false); // Indicar que el escaneo ha fallado
    });
  }
};

// Manejo de errores en el escaneo
const handleError = (err) => {
  if (err.name === 'NotFoundException') {
    console.warn('QR code not found. Retrying...');
    // Continúa escaneando en lugar de detenerse, sin mostrar error
  } else {
    console.error('Error during scan:', err);
    setError(err);
  }
};


  // Función para manejar el resultado del escaneo
  const handleScan = async (data) => {
    if (data) {
      setError(null); // Limpiar cualquier error previo
      console.log('Datos escaneados crudos:', data);
      const parsedData = parseData(data);
      console.log('Datos escaneados:', parsedData);

      // Obtén los datos del QR desde el backend
      const qrFromDb = await getQrById(parsedData.id);
      if (qrFromDb && qrFromDb.isUsed && qrFromDb.usageCount >= qrFromDb.maxUsageCount) {
        stopScan(); // Detener el escaneo inmediatamente si el QR ya está usado
        Swal.fire({
          title: 'QR no usable',
          text: 'El QR ya no puede ser usado.',
          icon: 'warning',
          confirmButtonText: 'Aceptar'
        });
        return;
      }

      // Actualiza los datos escaneados con información del backend
      setScannedData({
        ...parsedData,
        id: parsedData._id || parsedData.id,
        empresaId: parsedData.empresaId,
        usageCount: qrFromDb.usageCount, // Actualizar con los datos del backend
        maxUsageCount: qrFromDb.maxUsageCount, // Actualizar con los datos del backend
        updates: qrFromDb.updates || [], // Asegurarse de que se incluyan las actualizaciones
      });

      // Obtén los servicios por empresa
      if (parsedData.empresaId && parsedData.empresaId._id !== 'N/A') {
        console.log('Obteniendo servicios para empresaId:', parsedData.empresaId._id);
        await getServiciosByEmpresaId(parsedData.empresaId._id);
      } else {
        console.error('Empresa ID no válido:', parsedData.empresaId._id);
      }

      stopScan();
    }
  };

  // Manejo de errores en el escaneo
 

  // Función para detener el escaneo
  const stopScan = () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current.stop().catch(err => console.error('Failed to stop Html5Qrcode.', err));
      setIsScanning(false); // Indicar que el escaneo ha sido detenido
    }
  };

  // Manejo de selección de archivo para escanear QR desde una imagen
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log('Archivo seleccionado:', file);

      scannerRef.current.scanFile(file, true)
        .then(async (decodedText) => {
          setError(null); // Limpiar cualquier error previo
          console.log('Texto decodificado del QR:', decodedText);
          const parsedData = parseData(decodedText);

          const qrFromDb = await getQrById(parsedData.id);
          if (qrFromDb && qrFromDb.isUsed && qrFromDb.usageCount >= qrFromDb.maxUsageCount) {
            stopScan(); // Detener el escaneo inmediatamente si el QR ya está usado
            Swal.fire({
              title: 'QR no usable',
              text: 'El QR ya no puede ser usado.',
              icon: 'warning',
              confirmButtonText: 'Aceptar'
            });
            return;
          }

          handleScan(decodedText); // Llama a handleScan con los datos decodificados
        })
        .catch(err => {
          if (err.name === 'NotFoundException') {
            console.warn('QR code not found in file. Please try another file.');
          } else {
            console.error('Error scanning file:', err);
            setError(err);
          }
        });
    } else {
      console.log('No file selected');
    }
  };

  // Función para actualizar el QR en el backend
  const handleUpdateQr = async () => {
    console.log('handleUpdateQr called');
    console.log('scannedData:', scannedData);
    if (!scannedData.id) {
      setError(new Error("No QR code ID found."));
      console.log("No QR code ID found");
      return;
    }

    const qrData = {
      service: selectedService,
      details,
      updatedAt: new Date().toISOString(), // Añadir la fecha de actualización
    };

    console.log('Datos a enviar:', qrData);
    console.log('QR ID:', scannedData.id);

    try {
      const response = await updateQr(scannedData.id, qrData);
      console.log("Response from backend:", response);
      const updatedQr = response.qr;
      console.log("QR actualizado con éxito:", updatedQr);

      if (!updatedQr) {
        throw new Error("QR data is undefined");
      }

      setFadeOut(true); // Aplica la clase fade-out

      Swal.fire({
        title: 'QR actualizado',
        text: 'El QR ha sido actualizado correctamente.',
        icon: 'success',
        confirmButtonText: 'Aceptar'
      }).then(() => {
        setScannedData(null); // Resetea el estado de scannedData
        setSelectedService('');
        setDetails('');
        setFadeOut(false); // Elimina la clase fade-out después de ocultar los datos
      });
    } catch (error) {
      console.error("Error al actualizar QR:", error);
      Swal.fire({
        title: 'Error',
        text: 'Hubo un problema al actualizar el QR',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
    }
  };

  const usosRestantes = scannedData ? scannedData.maxUsageCount - scannedData.usageCount : 0;

  return (
    <Container maxWidth="md" className="flex flex-col items-center justify-center mt-20" sx={{ paddingBottom: '40px', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      {isSmallScreen && (
        <Container>
          <Box className="flex justify-center mb-4" onClick={startScan}>
            {!isScanning && (
              <img src={qrHome} alt="Código QR" className="w-60 h-60 md:w-64 md:h-64 rounded-lg shadow-md" style={{ cursor: 'pointer' }} />
            )}
          </Box>
          <Box display="flex" justifyContent="center" alignItems="center">
            <Typography variant="h5" className="mb-6" sx={{ color: theme.palette.text.secondary }}>
              Escanear
            </Typography>
          </Box>
        </Container>
      )}
      {!isSmallScreen && (
        <Container>
          <Box id="reader" width="100%" maxWidth="600px" mb={4} mt={4} />
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </Container>
      )}
      <Box id="reader" width="100%" maxWidth="600px" mb={4} mt={4} className="w-full md:w-auto border border-gray-300 rounded-lg shadow-md">
      </Box>
      {isSmallScreen && (
        <Box display="flex" justifyContent="center" alignItems="center" mb={4} gap={2}>
          {isScanning && (
            <Button
              variant="contained"
              color="secondary"
              onClick={stopScan}
              className="mb-6"
            >
              Detener Escaneo
            </Button>
          )}
        </Box>
      )}
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

      {scannedData && (
        <Fade in={!fadeOut} timeout={100}>
          <Box
            component={Paper}
            elevation={3}
            mt={4}
            mb={4}
            p={4}
            borderRadius={2}
            className={`w-full max-w-lg mx-auto bg-white dark:bg-gray-800 text-black dark:text-white transition-all duration-300 ${fadeOut ? 'fade-out' : ''}`}
          >
            {scannedData.isUsed && scannedData.usageCount >= scannedData.maxUsageCount ? (
              <Typography variant="body1" color="error" align="center">
                QR no usable. El QR ya no puede ser usado.
              </Typography>
            ) : (
              <>
                <Typography variant="h6" mb={5} gutterBottom>
                  Información del QR:
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body1"><strong>Descuento :</strong> {scannedData.value} %</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body1"><strong>Nombre:</strong> {scannedData.nombre}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body1"><strong>Teléfono:</strong> {scannedData.telefono}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body1"><strong>Correo:</strong> {scannedData.mail}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body1"><strong>Hora de inicio:</strong> {scannedData.startTime}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body1"><strong>Hora de fin:</strong> {scannedData.endTime}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body1"><strong>Fecha:</strong> {new Date(scannedData.date).toLocaleDateString()}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body1"><strong>Empresa:</strong> {scannedData.empresaId?.name || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body1"><strong>Usado:</strong> {scannedData.usageCount}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body1"><strong>Usos restantes:</strong> {usosRestantes >= 0 ? usosRestantes : 'N/A'}</Typography>
                  </Grid>
                </Grid>
                <FormControl fullWidth margin="normal" variant="outlined">
                  <InputLabel>Servicio</InputLabel>
                  <Select
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    label="Servicio"
                  >
                    {servicios.map((servicio) => (
                      <MenuItem key={servicio._id} value={servicio._id}>
                        {servicio.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  label="Detalles"
                  variant="outlined"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  margin="normal"
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleUpdateQr}
                  sx={{ mt: 2 }}
                >
                  Guardar Cambios
                </Button>
              </>
            )}
          </Box>
        </Fade>
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
      {serviciosError && (
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
            Error al obtener servicios: {serviciosError.message}
          </Typography>
        </Box>
      )}
      {loading && (
        <Box
          mt={4}
          mb={4}
          textAlign="center"
          p={4}
          borderRadius={2}
          boxShadow={3}
          className="w-full max-w-lg mx-auto bg-white dark:bg-gray-800 text-black dark:text-white transition-all duration-300"
        >
          <Typography variant="body1">
            Cargando servicios...
          </Typography>
        </Box>
      )}
    </Container>
  );
};
