import React, { useState, useEffect } from "react";
import { Footer } from "./Footer";
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
  useMediaQuery
} from "@mui/material";

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
      alert(
        "Por favor, introduce un nombre válido (solo se permiten letras, números y espacios)."
      );
      return;
    }
    if (formData.name.length !== maxNameLength) {
      alert(`El nombre debe tener exactamente ${maxNameLength} caracteres.`);
      return;
    }
    if (!emailRegex.test(formData.email) || !formData.email.endsWith(".com")) {
      alert('Por favor, introduce una dirección de correo válida que termine en ".com".');
      return;
    }
    try {
      await emailjs.sendForm(
        "service_bxl40rs",
        "template_goi94t2",
        e.target,
        "h3yy4ICYJmisn2ANM"
      );
      setFormData({
        name: "",
        email: "",
        inquiry: "",
        subscribe: true,
      });
      alert("¡El formulario se envió correctamente!");
    } catch (error) {
      console.error("Error al enviar el formulario:", error);
      alert("Ocurrió un error al enviar el formulario. Por favor, inténtalo de nuevo.");
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
                E-Shop
              </Typography>
              <Typography variant="body2" paragraph>
                Dirección para llegar a nuestra sede a hacer los trámites personalmente, te esperamos para brindarte la mejor información y nuestra ayuda.
              </Typography>
              <Box mt={2}>
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3560.1022202999184!2d-65.209390485688!3d-26.83670088316032!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94225d3ad7f30f1d%3A0xf8606cd659b8e3e4!2sRollingCode%20School!5e0!3m2!1ses-419!2sar!4v1616643393539!5m2!1ses-419!2sar"
                  width="100%"
                  height="290"
                  style={{ border: "0" }}
                  allowFullScreen=""
                  loading="lazy"
                ></iframe>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
      <Footer />
    </>
  );
};
