import React, { useState, useEffect } from "react";
import { Box, Grid, Card, CardContent, Typography, Button, ToggleButton, ToggleButtonGroup, useTheme, useMediaQuery } from "@mui/material";
import usePaymentStore from '../store/usePaymentStore';
import PaymentWidget from './PaymentWidget'; // Asegúrate de importar el componente PaymentWidget

export const PlanSelector = () => {
  const [billingType, setBillingType] = useState("month");
  const [preferenceId, setPreferenceId] = useState(null);
  const { createPayment, paymentLoading, paymentError } = usePaymentStore();

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const plans = [
    { name: 'Basic', monthPrice: 102, yearPrice: 205, items: ['✔ Genera hasta 20 Qr', '✔ Escanea Qr', '✔ Genera Referidores'] },
    { name: 'Premium', monthPrice: 75000, yearPrice: 313, items: ['✔ Genera hasta 50 Qr', '✔ Escanea Qr', '✔ Genera Referidores', '✔ Crea Vendedores', '✔ Crea Reportes en Pdf'] },
    { name: 'Pro', monthPrice: 180000, yearPrice: 421, items: ['✔ Genera Qr infinitos', '✔ Escanea Qr', '✔ Genera Referidores', '✔ Crea Vendedores', '✔ Crea Reportes en Pdf'] },
  ];

  const handleBillingChange = (event, newBillingType) => {
    if (newBillingType) {
      setBillingType(newBillingType);
    }
  };

  const handleBuyClick = async (plan) => {
    const price = billingType === 'month' ? plan.monthPrice : plan.yearPrice;
    const email = "user@example.com"; // Cambia esto según el usuario autenticado

    try {
      const initPointUrl = await createPayment(plan.name, price, null, email);
      setPreferenceId(initPointUrl); // Establece el preferenceId para usar en el widget
    } catch (error) {
      console.error('Error al procesar el pago:', error);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(to right, #141E30, #243B55)'
          : 'linear-gradient(to right, #a1c4fd, #c2e9fb)',
        pb: 12,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        color: theme.palette.text.primary
      }}
    >
      <Box sx={{ width: '100%', pt: 16, pb: 8, textAlign: 'center' }}>
        <Typography variant="h4" color="inherit">Elige tu Plan</Typography>
        <Typography variant="body1" color="inherit" sx={{ mt: 2 }}>
          Tarifas diseñadas para empresas de todos los tamaños. Elige el paquete que se adapte a tus necesidades.
        </Typography>
        <ToggleButtonGroup
          value={billingType}
          exclusive
          onChange={handleBillingChange}
          sx={{ mt: 4 }}
        >
          <ToggleButton value="month" sx={{ textTransform: 'none', color: theme.palette.text.primary, backgroundColor: theme.palette.background.default, '&.Mui-selected': { backgroundColor: theme.palette.action.selected } }}>Pago Mensual</ToggleButton>
          <ToggleButton value="year" sx={{ textTransform: 'none', color: theme.palette.text.primary, backgroundColor: theme.palette.background.default, '&.Mui-selected': { backgroundColor: theme.palette.action.selected } }}>Pago Anual</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {paymentError && <Typography color="error" sx={{ mt: 2 }}>{paymentError}</Typography>}

      <Grid container spacing={4} justifyContent="center" sx={{ width: '100%', mt: 4, px: 2 }}>
        {plans.map((plan, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card sx={{
              backgroundColor: theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.15)'
                : '#FFFFFF',
              backdropFilter: theme.palette.mode === 'dark' ? 'blur(10px)' : 'none',
              borderRadius: '16px',
              boxShadow: theme.palette.mode === 'dark'
                ? '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
                : '0 4px 16px 0 rgba(0, 0, 0, 0.1)',
              transition: 'transform 0.3s, box-shadow 0.3s, border-color 0.3s',
              border: `2px solid transparent`,
              '&:hover': {
                transform: isSmallScreen ? 'translateY(-10px)' : 'scale(1.05)',
                boxShadow: theme.palette.mode === 'dark'
                  ? '0 16px 32px 0 rgba(31, 38, 135, 0.37)'
                  : '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
                borderColor: theme.palette.mode === 'dark'
                  ? '#FFD700'
                  : '#2980B9',
                '& .MuiTypography-root': {
                  transform: 'scale(1.05)',
                }
              },
              willChange: 'transform, box-shadow, border-color',
            }}>
              <CardContent sx={{ textAlign: 'center', color: theme.palette.text.primary }}>
                <Typography variant="h5" color="inherit">{plan.name}</Typography>
                <Typography variant="h4" sx={{ py: 2 }}>
                  ${billingType === 'month' ? plan.monthPrice : plan.yearPrice}
                  <Typography variant="caption" color="inherit">/ {billingType}</Typography>
                </Typography>
                <Box>
                  {plan.items.map((item, idx) => (
                    <Typography key={idx} variant="body1" sx={{ mb: 2 }}>{item}</Typography>
                  ))}
                </Box>
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ mt: 4, backgroundColor: '#2980B9', '&:hover': { backgroundColor: '#1F618D' } }}
                  onClick={() => handleBuyClick(plan)}
                  disabled={paymentLoading}
                >
                  {paymentLoading ? 'Procesando...' : 'Comprar'}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Renderizar el widget si preferenceId está disponible */}
      {preferenceId && <PaymentWidget preferenceId={preferenceId} />}
    </Box>
  );
};