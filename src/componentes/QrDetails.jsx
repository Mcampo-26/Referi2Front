import React, { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useQrStore } from "../store/useQrStore";
import useServiciosStore from "../store/useServiciosStore";
import ReactQRCode from "react-qr-code";
import {
  Box,
  Container,
  Grid,
  Typography,
  Paper,
  CircularProgress,
  IconButton,
} from "@mui/material";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import WarningIcon from "@mui/icons-material/Warning";
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

  const qrRef = useRef(); // Referencia al componente de QR

  useEffect(() => {
    getQrById(id);
    getAllServicios();
  }, [id, getQrById, getAllServicios]);

  const getServiceName = (serviceId) => {
    const service = servicios.find((serv) => serv._id === serviceId);
    return service ? service.name : "Servicio no encontrado";
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleWhatsAppClick = (phoneNumber) => {
    const formattedNumber = phoneNumber.replace(/\D/g, "");
    window.open(`https://wa.me/${formattedNumber}`, "_blank");
  };
  const handleWhatsAppShare = () => {
    if (!qrRef.current) {
      alert("No hay código QR para compartir.");
      return;
    }
  
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const svg = qrRef.current.querySelector("svg");
  
    if (!svg) {
      console.error("No se encontró el SVG del QR.");
      alert("Error al cargar el código QR.");
      return;
    }
  
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  
    img.onload = () => {
      const padding = 2;
      const fontSize = 12; // Tamaño de fuente ajustado para mejor legibilidad
      const lineHeight = fontSize + 6; // Ajuste del interlineado
      const maxWidth = 280; // Ancho máximo ajustado para evitar que el texto se amontone
      const textHeight = lineHeight * 3; // Ajuste exacto para acomodar tres líneas
      const marginTop = 20;
      const marginBottom = 0; // Ajuste del margen inferior
  
      canvas.width = img.width + padding * 2;
      canvas.height = img.height + textHeight + padding * 2 + marginTop; // Ajuste de altura para eliminar el espacio extra
  
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
  
      ctx.drawImage(img, padding, padding);
  
      const mensaje = `¡Hola! 🎉\nTe invitamos a usar este QR\npara obtener beneficios exclusivos con ${
        qr.empresaId?.name || "nuestra empresa"
      }.`; // Mantén el mensaje en el mismo formato
  
      ctx.font = `${fontSize}px Arial`;
      ctx.fillStyle = "#333";
      ctx.textAlign = "center";
  
      const words = mensaje.split(" ");
      const lines = [];
      let currentLine = "";
  
      // Ajuste para dividir el mensaje en líneas
      for (let i = 0; i < words.length; i++) {
        const testLine = currentLine + words[i] + " ";
        const testWidth = ctx.measureText(testLine).width;
        if (testWidth > maxWidth) {
          lines.push(currentLine);
          currentLine = words[i] + " ";
        } else {
          currentLine = testLine;
        }
      }
      lines.push(currentLine);
  
      const textYStart = img.height + padding + marginTop;
  
      // Dibujar las líneas del texto centradas
      lines.forEach((line, index) => {
        ctx.fillText(line, canvas.width / 2, textYStart + index * lineHeight);
      });
  
      const combinedImage = canvas.toDataURL("image/png");
  
      const isMobile = /Mobi|Android/i.test(navigator.userAgent);
  
      const byteCharacters = atob(combinedImage.split(",")[1]);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "image/png" });
      const file = new File([blob], "qr-code-with-message.png", {
        type: "image/png",
      });
  
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator
          .share({
            files: [file],
            title: "Código QR con mensaje",
            text: mensaje,
          })
          .then(() => console.log("Compartido con éxito"))
          .catch((error) => console.log("Error al compartir", error));
      } else if (isMobile) {
        const url = `https://wa.me/?text=${encodeURIComponent(mensaje)}`;
        window.open(url, "_blank");
      } else {
        const downloadLink = document.createElement("a");
        downloadLink.href = combinedImage;
        downloadLink.download = "qr-code.png";
        downloadLink.target = "_blank";
        downloadLink.click();
      }
    };
  
    img.onerror = () => {
      console.error("Error al cargar la imagen del QR");
      alert("Error al cargar la imagen del QR");
    };
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
          <Grid
            item
            xs={12}
            md={6}
            container
            justifyContent="center"
            alignItems="center"
            direction="column"
          >
            <Paper
              elevation={3}
              sx={{
                p: 1, // Agrega padding de 2 unidades (puedes ajustar este valor según necesites)
                borderRadius: 1,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "auto", // Ajusta automáticamente la altura
                width: "92%", // Ocupa todo el ancho disponible
                maxWidth: "100%", // Limita el ancho máximo al 100%
                marginBottom: "auto",
                overflow: "hidden", // Evita el desbordamiento
              }}
              ref={qrRef}
            >
              {!qr.isUsed ? (
                <ReactQRCode
                  value={qr.paymentLink ? qr.paymentLink : JSON.stringify(qr)}
                  size={240} // Ajusta el tamaño inicial del QR
                  style={{
                    width: "100%", // Asegura que el QR ocupe todo el ancho del contenedor
                    height: "auto", // Permite que la altura se ajuste automáticamente
                    margin: 0, // Elimina cualquier margen adicional
                    padding: 0, // Elimina cualquier relleno adicional
                    display: "block",
                  }}
                />
              ) : (
                <img
                  src={qrMini}
                  alt="QR Code"
                  style={{
                    width: "100%", // Asegura que la imagen ocupe todo el ancho disponible
                    height: "auto", // Ajusta automáticamente la altura para mantener la proporción
                    display: "block",
                    filter: "blur(5px)",
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
            style={{
              display: "flex",
              height: "100%",
              justifyContent: "center",
            }}
          >
            {qr.empresaId?.name && (
              <Grid item>
                <Paper elevation={3} sx={{ p: 2, borderRadius: 1 }}>
                  <Typography
                    variant="h6"
                    component="div"
                    sx={{ fontWeight: "bold" }}
                  >
                    Empresa: {qr.empresaId.name}
                  </Typography>
                </Paper>
              </Grid>
            )}
            {qr.nombre && (
              <Grid item>
                <Paper elevation={3} sx={{ p: 2, borderRadius: 1 }}>
                  <Typography
                    variant="subtitle1"
                    component="div"
                    sx={{ fontWeight: "bold" }}
                  >
                    Nombre: {qr.nombre}
                  </Typography>
                </Paper>
              </Grid>
            )}
            {qr.mail && (
              <Grid item>
                <Paper elevation={3} sx={{ p: 2, borderRadius: 1 }}>
                  <Typography
                    variant="body2"
                    component="div"
                    sx={{ fontWeight: "bold" }}
                  >
                    Correo: {qr.mail}
                  </Typography>
                </Paper>
              </Grid>
            )}
            {qr.telefono && (
              <Grid item>
                <Paper
                  elevation={3}
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    variant="body2"
                    component="div"
                    sx={{ fontWeight: "bold", flex: 1 }}
                  >
                    Teléfono: {qr.telefono}
                  </Typography>
                  <IconButton
                    onClick={() => handleWhatsAppClick(qr.telefono)}
                    sx={{ ml: 2 }}
                  >
                    <WhatsAppIcon color="success" />
                  </IconButton>
                </Paper>
              </Grid>
            )}
            {qr.date && (
              <Grid item>
                <Paper elevation={3} sx={{ p: 2, borderRadius: 1 }}>
                  <Typography
                    variant="body2"
                    component="div"
                    sx={{ fontWeight: "bold" }}
                  >
                    Fecha: {formatDate(qr.date)}
                  </Typography>
                </Paper>
              </Grid>
            )}
            {qr.usageCount !== undefined && qr.usageCount > 0 && (
              <Grid item>
                <Paper elevation={3} sx={{ p: 2, borderRadius: 1 }}>
                  <Typography
                    variant="body2"
                    component="div"
                    sx={{ fontWeight: "bold" }}
                  >
                    Usado: {qr.usageCount}
                  </Typography>
                </Paper>
              </Grid>
            )}

            {qr.maxUsageCount !== undefined && qr.usageCount !== undefined && (
              <Grid item>
                <Paper elevation={3} sx={{ p: 2, borderRadius: 1 }}>
                  <Typography
                    variant="body2"
                    component="div"
                    sx={{ fontWeight: "bold" }}
                  >
                    Usos restantes: {qr.maxUsageCount - qr.usageCount}
                  </Typography>
                </Paper>
              </Grid>
            )}
            <Grid item>
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  borderRadius: 1,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Typography
                  variant="body2"
                  component="div"
                  sx={{ fontWeight: "bold", flex: 1 }}
                >
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
