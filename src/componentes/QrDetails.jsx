import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQrStore } from '../store/useQrStore';
import useServiciosStore from '../store/useServiciosStore';
import {
  Box,
  Container,
  Grid,
  Typography,
  Paper,
  CircularProgress,
  IconButton
} from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import qrMini from "../assets/qrMini.png";

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
    if (qr) {
      if (qr.isUsed) {
        setSelectedImage(qrMini); // Muestra la imagen desde assets si isUsed es true
      } else if (qr.base64Image) {
        setSelectedImage(`data:image/png;base64,${qr.base64Image}`); // Muestra la imagen base64 si no está usada
      }
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

  const handleWhatsAppClick = (phoneNumber) => {
    const formattedNumber = phoneNumber.replace(/\D/g, '');
    window.open(`https://wa.me/${formattedNumber}`, '_blank');
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
            <Paper
              elevation={3}
              sx={{
                p: 2,
                borderRadius: 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                transform: 'scale(0.9)',
                mt: 5,
              }}
            >
              <img
                src={selectedImage}
                alt="QR Code"
                style={{ width: '90%', height: 'auto', display: 'block' }}
              />
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
            <Paper elevation={3} sx={{ p: 2, borderRadius: 1, mb: 2, display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" component="div" sx={{ fontWeight: 'bold', flex: 1 }}>
                Teléfono: {qr.telefono}
              </Typography>
              <IconButton onClick={() => handleWhatsAppClick(qr.telefono)} sx={{ ml: 2 }}>
                <WhatsAppIcon color="success" />
              </IconButton>
            </Paper>
            <Paper elevation={3} sx={{ p: 2, borderRadius: 1, mb: 2 }}>
              <Typography variant="body2" component="div" sx={{ fontWeight: 'bold' }}>
                Fecha: {formatDate(qr.date)}
              </Typography>
            </Paper>
            <Paper elevation={3} sx={{ p: 2, borderRadius: 1, mb: 2 }}>
              <Typography variant="body2" component="div" sx={{ fontWeight: 'bold' }}>
                Usado: {qr.usageCount}
              </Typography>
            </Paper>
            <Paper elevation={3} sx={{ p: 2, borderRadius: 1, mb: 2 }}>
              <Typography variant="body2" component="div" sx={{ fontWeight: 'bold' }}>
                Usos restantes: {qr.maxUsageCount - qr.usageCount}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};
