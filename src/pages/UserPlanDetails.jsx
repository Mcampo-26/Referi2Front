import React, { useEffect } from 'react';
import { Card, CardContent, Typography, Button, Grid, Box, useTheme } from '@mui/material';
import useUsuariosStore from '../store/useUsuariosStore';
import { format, isAfter, isValid } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { AccountCircle, Email, Phone, Business, AssignmentInd, Payment } from '@mui/icons-material';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export const UserPlanDetails = () => {
  const { usuario, planDetails, fetchPlanDetails, isAuthenticated } = useUsuariosStore((state) => ({
    usuario: state.usuario,
    planDetails: state.planDetails,
    fetchPlanDetails: state.fetchPlanDetails,
    isAuthenticated: state.isAuthenticated,
  }));

  const theme = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && usuario) {
      fetchPlanDetails();
    }
  }, [fetchPlanDetails, isAuthenticated, usuario]);

  if (!usuario) {
    return <Typography variant="h6">No se ha encontrado información del usuario.</Typography>;
  }

  const { nombre, email, telefono, empresa, role } = usuario;
  const expiryDate = planDetails ? new Date(planDetails.expiryDate) : null;
  const isPlanExpired = expiryDate && isAfter(new Date(), expiryDate);

  const handleRenewClick = () => {
    if (isPlanExpired) {
      navigate('/planSelector');
    } else {
      MySwal.fire({
        title: 'No puedes renovar tu plan',
        text: 'Solo puedes renovar tu plan cuando haya expirado.',
        icon: 'info',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        customClass: {
          popup: 'animate__animated animate__fadeInDown',
          backdrop: 'swal2-backdrop-show',
        },
      });
    }
  };

  return (
    <Box sx={{ padding: 3, backgroundColor: theme.palette.background.default, minHeight: '100vh' }}>
      <Grid container spacing={4} justifyContent="center">
        <Grid item xs={12} sm={6} md={4}>
          <Card className="shadow-lg rounded-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300" sx={{ backgroundColor: theme.palette.mode === 'dark' ? '#2b2b2b' : '#fff' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <AccountCircle color="primary" sx={{ fontSize: 40, marginRight: 2 }} />
                <Typography variant="h5" color="primary">
                  {nombre}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" mb={1}>
                <Email color="secondary" sx={{ marginRight: 1 }} />
                <Typography variant="body1">{email}</Typography>
              </Box>
              <Box display="flex" alignItems="center" mb={1}>
                <Phone color="secondary" sx={{ marginRight: 1 }} />
                <Typography variant="body1">{telefono || 'No disponible'}</Typography>
              </Box>
              <Box display="flex" alignItems="center" mb={1}>
                <Business color="secondary" sx={{ marginRight: 1 }} />
                <Typography variant="body1">{empresa ? empresa.name : 'No disponible'}</Typography>
              </Box>
              <Box display="flex" alignItems="center" mb={1}>
                <AssignmentInd color="secondary" sx={{ marginRight: 1 }} />
                <Typography variant="body1">{role ? role.name : 'No disponible'}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {planDetails && (
          <Grid item xs={12} sm={6} md={4}>
            <Card className="shadow-lg rounded-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300" sx={{ backgroundColor: theme.palette.mode === 'dark' ? '#2b2b2b' : '#fff' }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Payment color="primary" sx={{ fontSize: 40, marginRight: 2 }} />
                  <Typography variant="h5" color="primary">
                    Detalles del Plan
                  </Typography>
                </Box>
                <Typography variant="body1"><strong>Plan:</strong> {planDetails.planName}</Typography>
                <Typography variant="body1"><strong>Monto:</strong> ${planDetails.amount}</Typography>
                <Typography variant="body1">
                  <strong>Fecha de Expiración:</strong> 
                  {isValid(expiryDate) ? format(expiryDate, 'dd/MM/yyyy') : 'Fecha no válida'}
                </Typography>
                <Typography variant="body1" sx={{ mt: 2 }}><strong>Incluye:</strong></Typography>
                <Box sx={{ mt: 1 }}>
                  {planDetails.items && planDetails.items.map((item, index) => (
                    <Typography key={index} variant="body2" sx={{ mb: 1 }}>✔ {item}</Typography>
                  ))}
                </Box>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={handleRenewClick}
                  sx={{ marginTop: 2 }}
                >
                  Renovar Plan
                </Button>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};
