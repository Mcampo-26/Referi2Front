import React, { useState } from "react";
import emailjs from 'emailjs-com';
import Swal from 'sweetalert2';
import {
  Container,
  Grid,
  TextField,
  Button,
  Checkbox,
  Typography,
  Box,
  FormControlLabel,
  useTheme
} from "@mui/material";

const nameRegex = /^[A-Za-z0-9\s]+$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const Contacto = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    inquiry: "",
    subscribe: true,
  });

  const [remainingChars, setRemainingChars] = useState(100);
  const maxNameLength = 15;
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    if (name === "name" && (!nameRegex.test(newValue) || value.length > maxNameLength)) {
      return;
    }

    if (name === "email") {
      setFormData({
        ...formData,
        email: newValue
      });
      return;
    }

    if (name === "inquiry") {
      if (value.length > 100) return;
      const remaining = 100 - value.length;
      setRemainingChars(remaining);
    }

    setFormData({
      ...formData,
      [name]: newValue,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nameRegex.test(formData.name) || formData.name.length > maxNameLength) {
      Swal.fire({
        icon: 'error',
        title: 'Nombre inválido',
        text: `Por favor, introduce un nombre válido que tenga hasta ${maxNameLength} caracteres.`,
        confirmButtonText: 'Cerrar'
      });
      return;
    }
    if (!emailRegex.test(formData.email)) {
      Swal.fire({
        icon: 'error',
        title: 'Correo inválido',
        text: 'Por favor, introduce una dirección de correo válida.',
        confirmButtonText: 'Cerrar'
      });
      return;
    }

    try {
      await emailjs.sendForm(
        "service_bxl40rs", // ID del servicio
        "template_goi94t2", // ID de la plantilla
        e.target, // Formulario
        "h3yy4ICYJmisn2ANM" // ID del usuario
      );
      setFormData({
        name: "",
        email: "",
        inquiry: "",
        subscribe: true,
      });
      Swal.fire({
        icon: 'success',
        title: 'Enviado!',
        text: 'El mensaje se envió correctamente.',
        confirmButtonText: 'Cerrar'
      });
    } catch (error) {
      console.error("Error al enviar el formulario:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error al enviar el formulario. Por favor, inténtalo de nuevo.',
        confirmButtonText: 'Cerrar'
      });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 5, mt: 10 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Box
            bgcolor={isDarkMode ? "grey.900" : "grey.100"}
            color={isDarkMode ? "white" : "black"}
            p={3}
            borderRadius={2}
            sx={{ fontSize: { xs: "1rem", md: "1.2rem" } }}
          >
            <Typography variant="h4" align="center" gutterBottom>
              Envíanos un mensaje
            </Typography>
            <form id="contact-form" onSubmit={handleSubmit}>
              <Box mb={2}>
                <TextField
                  fullWidth
                  label="Nombre y apellido"
                  name="name"
                  variant="outlined"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  inputProps={{ maxLength: maxNameLength }}
                  InputLabelProps={{ style: { color: isDarkMode ? "white" : "black" } }}
                  InputProps={{
                    style: {
                      color: isDarkMode ? "white" : "black",
                      backgroundColor: isDarkMode ? "#424242" : "white",
                    },
                  }}
                />
                <Typography variant="body2" color="textSecondary" align="right">
                  Caracteres restantes: {maxNameLength - formData.name.length}
                </Typography>
              </Box>
              <Box mb={2}>
                <TextField
                  fullWidth
                  label="Correo electrónico"
                  type="email"
                  name="email"
                  variant="outlined"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  InputLabelProps={{ style: { color: isDarkMode ? "white" : "black" } }}
                  InputProps={{
                    style: {
                      color: isDarkMode ? "white" : "black",
                      backgroundColor: isDarkMode ? "#424242" : "white",
                    },
                  }}
                />
              </Box>
              <Box mb={2}>
                <TextField
                  fullWidth
                  label="Consulta"
                  name="inquiry"
                  multiline
                  rows={4}
                  variant="outlined"
                  required
                  value={formData.inquiry}
                  onChange={handleChange}
                  inputProps={{ maxLength: 100 }}
                  InputLabelProps={{ style: { color: isDarkMode ? "white" : "black" } }}
                  InputProps={{
                    style: {
                      color: isDarkMode ? "white" : "black",
                      backgroundColor: isDarkMode ? "#424242" : "white",
                    },
                  }}
                />
                <Typography variant="body2" color="textSecondary" align="right">
                  Caracteres restantes: {remainingChars}
                </Typography>
              </Box>
              <Box mb={2}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.subscribe}
                      onChange={handleChange}
                      name="subscribe"
                      color="primary"
                    />
                  }
                  label="Suscríbete a nuestras novedades - Newsletters"
                  sx={{ color: isDarkMode ? "white" : "black" }}
                />
              </Box>
              <Button type="submit" variant="contained" color="primary" fullWidth>
                Enviar
              </Button>
            </form>
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box
            bgcolor={isDarkMode ? "grey.900" : "grey.100"}
            color={isDarkMode ? "white" : "black"}
            p={3}
            borderRadius={2}
            sx={{ fontSize: { xs: "1rem", md: "1.2rem" } }}
          >
            <Typography variant="h4" align="center" gutterBottom>
        Referi2
            </Typography>
            <Typography variant="body2" paragraph>
              Dirección para llegar a nuestra sede a hacer los trámites personalmente, te esperamos para brindarte la mejor información y nuestra ayuda.
            </Typography>
            <Box mt={2}>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d56956.87802569709!2d-65.29199830880904!3d-26.846157777328003!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94225df5fcca2727%3A0x331b810e527e57fd!2sFast%20-%20Servicio%20T%C3%A9cnico%20Inmediato!5e0!3m2!1ses-419!2sar!4v1722471943110!5m2!1ses-419!2sar"
                width="100%"
                height="364"
                style={{ border: "0" }}
                allowFullScreen=""
                loading="lazy"
              ></iframe>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};
