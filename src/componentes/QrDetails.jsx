import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQrStore } from '../store/UseQrStore';
import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  Paper,
  CircularProgress,
} from '@mui/material';

export const QrDetails = () => {
  const { id } = useParams();
  const { qr, getQrById, loading, error } = useQrStore((state) => ({
    qr: state.qr,
    getQrById: state.getQrById,
    loading: state.loading,
    error: state.error,
  }));

  const [selectedImage, setSelectedImage] = useState('');

  useEffect(() => {
    getQrById(id);
  }, [id, getQrById]);

  useEffect(() => {
    if (qr && qr.base64Image) {
      setSelectedImage(`data:image/png;base64,${qr.base64Image}`);
    }
  }, [qr]);

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography variant="h6" color="error">{error}</Typography>;
  }

  if (!qr) {
    return <Typography variant="h6">QR no encontrado</Typography>;
  }

  return (
    <Container>
      <Box display="flex" flexDirection="column" alignItems="center" mt={8}>
        <Typography variant="h3" component="h1" textAlign="center" gutterBottom>
          Detalles del Qr
        </Typography>
        <Grid container spacing={4} mt={4}>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 2, borderRadius: 1 }}>
              <img src={selectedImage} alt="QR Code" style={{ width: '100%', height: 'auto' }} />
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 2, borderRadius: 1, mb: 2 }}>
              <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                Empresa: {qr.value}
              </Typography>
            </Paper>
            <Paper elevation={3} sx={{ p: 2, borderRadius: 1, mb: 2 }}>
              <Typography variant="subtitle1" component="div" sx={{ fontWeight: 'bold' }}>
                Usuario: {qr.nombre}
              </Typography>
            </Paper>
            <Paper elevation={3} sx={{ p: 2, borderRadius: 1, mb: 2 }}>
              <Typography variant="body2" component="div" sx={{ fontWeight: 'bold' }}>
                Correo: {qr.mail}
              </Typography>
            </Paper>
            <Paper elevation={3} sx={{ p: 2, borderRadius: 1 }}>
              <Typography variant="body2" component="div" sx={{ fontWeight: 'bold' }}>
                Teléfono: {qr.telefono}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
        <Box mt={4} width="100%">
          <Typography variant="h5" gutterBottom>
            Más detalles
          </Typography>
          <Paper elevation={3} sx={{ p: 2, borderRadius: 1 }}>
            <Typography variant="body1" component="div">
              Aquí puedes agregar más detalles sobre el QR, como información adicional, instrucciones, etc.
            </Typography>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
};
