import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQrStore } from '../store/UseQrStore';
import useServiciosStore from '../store/useServiciosStore';
import {
  Box,
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

  const { servicios, getAllServicios } = useServiciosStore((state) => ({
    servicios: state.servicios,
    getAllServicios: state.getAllServicios,
  }));

  const [selectedImage, setSelectedImage] = useState('');

  useEffect(() => {
    getQrById(id);
    getAllServicios(); // Obtener servicios al cargar el componente
  }, [id, getQrById, getAllServicios]);

  useEffect(() => {
    if (qr && qr.base64Image) {
      setSelectedImage(`data:image/png;base64,${qr.base64Image}`);
    }
  }, [qr]);

  const getServiceName = (serviceId) => {
    const service = servicios.find((serv) => serv._id === serviceId);
    return service ? service.name : 'Servicio no encontrado';
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

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
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 2, borderRadius: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', transform: 'scale(0.9)', mt: -2 }}>
              <img src={selectedImage} alt="QR Code" style={{ width: '90%', height: 'auto', display: 'block' }} />
            </Paper>
          </Grid>
          <Grid item xs={12} md={6} mt={6}>
            <Paper elevation={3} sx={{ p: 2, borderRadius: 1, mb: 2 }}>
              <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                Empresa: {qr.empresaId.name}
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
            <Paper elevation={3} sx={{ p: 2, borderRadius: 1, mb: 2 }}>
              <Typography variant="body2" component="div" sx={{ fontWeight: 'bold' }}>
                Teléfono: {qr.telefono}
              </Typography>
            </Paper>
            <Paper elevation={3} sx={{ p: 2, borderRadius: 1, mb: 2 }}>
              <Typography variant="body2" component="div" sx={{ fontWeight: 'bold' }}>
                Fecha: {formatDate(qr.date)}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
        <Box mt={4} width="100%">
          <Typography variant="h5" gutterBottom>
          Servicios Realizados 
          </Typography>
          <Paper elevation={3} sx={{ p: 2, borderRadius: 1, mb: 4 }}>
            <Typography variant="body1" component="div">
              Servicio {getServiceName(qr.service) || "No hay detalles adicionales disponibles."}
            </Typography>
            <Typography variant="body1" component="div">
              {qr.details || "No hay detalles adicionales disponibles."}
            </Typography>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
};
