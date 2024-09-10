import React, { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useQrStore } from '../store/useQrStore';
import useServiciosStore from '../store/useServiciosStore';
import ReactQRCode from 'react-qr-code';
import {
  Box,
  Container,
  Grid,
  Typography,
  Paper,
  CircularProgress,
  IconButton,
} from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import WarningIcon from '@mui/icons-material/Warning';
import qrMini from '../assets/qrMini.png';

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

  const qrRef = useRef(); // Referencia al componente de QR

  useEffect(() => {
    getQrById(id);
    getAllServicios();
  }, [id, getQrById, getAllServicios]);

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

  const handleWhatsAppShare = () => {
    // Lógica de compartir QR por WhatsApp
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return (
      <Typography variant="h6" color="error">
        {error}
      </Typography>
    );
  }

  if (!qr) {
    return <Typography variant="h6">QR no encontrado</Typography>;
  }

  return (
    <Container>
      <Box display="flex" flexDirection="column" alignItems="center" mt={8}>
        <Typography
          variant="h3"
          component="h1"
          textAlign="center"
          gutterBottom
          sx={{ mt: 4 }}
        >
          Detalles del QR
        </Typography>

        {qr.isUsed && (
          <Box display="flex" alignItems="center" color="warning.main" mb={2}>
            <WarningIcon sx={{ fontSize: 40, marginRight: 1 }} />
            <Typography variant="h5" color="warning.main">
              QR Vencido
            </Typography>
          </Box>
        )}

        <Grid container spacing={4} justifyContent="center" alignItems="center">
          <Grid item xs={12} md={6} container justifyContent="center" alignItems="center" direction="column">
            <Paper
              elevation={3}
              sx={{
                p: 2,
                borderRadius: 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                marginBottom: 'auto',
              }}
              ref={qrRef}
            >
              {!qr.isUsed ? (
                <ReactQRCode value={JSON.stringify(qr)} size={440} />
              ) : (
                <img
                  src={qrMini}
                  alt="QR Code"
                  style={{
                    width: '90%',
                    height: 'auto',
                    display: 'block',
                    filter: 'blur(5px)',
                    opacity: 0.5,
                  }}
                />
              )}
            </Paper>
          </Grid>

          <Grid
            item
            xs={12}
            md={6}
            container
            direction="column"
            spacing={2}
            alignItems="flex-start"
            justifyContent="center"
            style={{ display: 'flex', height: '100%', justifyContent: 'center' }}
          >
            {qr.empresaId?.name && (
              <Grid item>
                <Paper elevation={3} sx={{ p: 2, borderRadius: 1 }}>
                  <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                    Empresa: {qr.empresaId.name}
                  </Typography>
                </Paper>
              </Grid>
            )}
            {qr.nombre && (
              <Grid item>
                <Paper elevation={3} sx={{ p: 2, borderRadius: 1 }}>
                  <Typography variant="subtitle1" component="div" sx={{ fontWeight: 'bold' }}>
                    Usuario: {qr.nombre}
                  </Typography>
                </Paper>
              </Grid>
            )}
            {qr.mail && (
              <Grid item>
                <Paper elevation={3} sx={{ p: 2, borderRadius: 1 }}>
                  <Typography variant="body2" component="div" sx={{ fontWeight: 'bold' }}>
                    Correo: {qr.mail}
                  </Typography>
                </Paper>
              </Grid>
            )}
            {qr.telefono && (
              <Grid item>
                <Paper elevation={3} sx={{ p: 2, borderRadius: 1, display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" component="div" sx={{ fontWeight: 'bold', flex: 1 }}>
                    Teléfono: {qr.telefono}
                  </Typography>
                  <IconButton onClick={() => handleWhatsAppClick(qr.telefono)} sx={{ ml: 2 }}>
                    <WhatsAppIcon color="success" />
                  </IconButton>
                </Paper>
              </Grid>
            )}
            {qr.date && (
              <Grid item>
                <Paper elevation={3} sx={{ p: 2, borderRadius: 1 }}>
                  <Typography variant="body2" component="div" sx={{ fontWeight: 'bold' }}>
                    Fecha: {formatDate(qr.date)}
                  </Typography>
                </Paper>
              </Grid>
            )}
            {qr.usageCount !== undefined && (
              <Grid item>
                <Paper elevation={3} sx={{ p: 2, borderRadius: 1 }}>
                  <Typography variant="body2" component="div" sx={{ fontWeight: 'bold' }}>
                    Usado: {qr.usageCount}
                  </Typography>
                </Paper>
              </Grid>
            )}
            {qr.maxUsageCount !== undefined && qr.usageCount !== undefined && (
              <Grid item>
                <Paper elevation={3} sx={{ p: 2, borderRadius: 1 }}>
                  <Typography variant="body2" component="div" sx={{ fontWeight: 'bold' }}>
                    Usos restantes: {qr.maxUsageCount - qr.usageCount}
                  </Typography>
                </Paper>
              </Grid>
            )}
            <Grid item>
              <Paper elevation={3} sx={{ p: 2, borderRadius: 1, display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" component="div" sx={{ fontWeight: 'bold', flex: 1 }}>
                  Compartir QR
                </Typography>
                <IconButton onClick={handleWhatsAppShare} sx={{ ml: 2 }}>
                  <WhatsAppIcon color="success" />
                </IconButton>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};
