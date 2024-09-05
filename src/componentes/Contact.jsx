import React, { useState, useEffect } from "react";
import emailjs from 'emailjs-com';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import {
  Container,
  Grid,
  TextField,
  Button,
  Checkbox,
  Typography,
  Box,
  FormControlLabel,
  useTheme,
} from "@mui/material";

const MySwal = withReactContent(Swal);

const nameRegex = /^[A-Za-z0-9\s]+$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const Contact = () => {
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

    if (name === "name" && !nameRegex.test(newValue)) {
      return;
    }
    if (name === "name" && value.length > maxNameLength) {
      return;
    }
    if (name === "inquiry" && value.length > 100) {
      return;
    }
    if (name === "email" && !/^[\w@.]+$/.test(newValue)) {
      return;
    }
    if (name === "email" && !newValue.endsWith(".com")) {
      return;
    }
    if (name === "inquiry") {
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

    if (!nameRegex.test(formData.name)) {
      Swal.fire("Error", "Por favor, introduce un nombre válido (solo se permiten letras, números y espacios).", "error");
      return;
    }
    if (formData.name.length !== maxNameLength) {
      Swal.fire("Error", `El nombre debe tener exactamente ${maxNameLength} caracteres.`, "error");
      return;
    }
    if (!emailRegex.test(formData.email) || !formData.email.endsWith(".com")) {
      Swal.fire("Error", 'Por favor, introduce una dirección de correo válida que termine en ".com".', "error");
      return;
    }

    // Mostrar spinner de carga antes de comenzar el proceso de envío
    const loadingAlert = await MySwal.fire({
      title: 'Enviando mensaje...',
      text: 'Por favor espera mientras enviamos tu mensaje.',
      allowOutsideClick: false,
      didOpen: () => {
        MySwal.showLoading();
      },
    });

    try {
      const templateParams = {
        from_name: "REFERI2",  // Cambia el nombre del remitente a "REFERI2"
        name: formData.name,
        email: formData.email,
        inquiry: formData.inquiry,
      };

      await emailjs.send(
        "service_bleijrb",
        "template_u9eu08w",
        templateParams,
        "r9ublrR1Go282bOlc"
      );
      

      setFormData({
        name: "",
        email: "",
        inquiry: "",
        subscribe: true,
      });

      // Cerrar el spinner y mostrar mensaje de éxito
      await loadingAlert.close(); // Cerramos el loading alert
      MySwal.fire({
        icon: 'success',
        title: 'Mensaje enviado',
        text: '¡Tu mensaje ha sido enviado correctamente!',
      });
    } catch (error) {
      // Cerrar el spinner y mostrar mensaje de error
      await loadingAlert.close(); // Cerramos el loading alert
      MySwal.fire({
        icon: 'error',
        title: 'Error al enviar el mensaje',
        text: 'Ocurrió un error al enviar el formulario. Por favor, inténtalo de nuevo.',
      });
    }
  };

  useEffect(() => {
    const formElement = document.querySelector("#contact-form");
    if (formElement) {
      formElement.classList.add("scroll-to");
      const yOffset = -200;
      window.scrollTo({
        top: formElement.offsetTop + yOffset,
        behavior: "smooth",
      });
    }
  }, []);

  return (
    <>
      <Box>
        <Typography variant="h4" align="center" gutterBottom>
          Envíanos un mensaje
        </Typography>
      </Box>
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
          
        </Grid>
      </Container>

    </>
  );
};
