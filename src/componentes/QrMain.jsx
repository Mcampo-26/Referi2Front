import React, { useEffect, useState, useRef } from "react";
import {
  Button,
  TextField,
  Grid,
  Typography,
  Card,
  CardContent,
  Paper,
  Box,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import useQrStore from "../store/useQrStore";

import useEmpresasStore from "../store/useEmpresaStore";
import useUsuariosStore from "../store/useUsuariosStore";
import { WhatsApp } from "@mui/icons-material";
import ReactQRCode from "react-qr-code"; // Asegúrate de importar el componente de React QR Code

import {
  useTheme,
  ThemeProvider,
  CssBaseline,
  useMediaQuery,
} from "@mui/material";
import { styled } from "@mui/system";
import Swal from "sweetalert2";
import "./Css/QrMain.css";

const StyledBox = styled(Box)(({ theme }) => ({
  backgroundColor:
    theme.palette.mode === "dark"
      ? theme.palette.grey[800]
      : theme.palette.grey[200],
  color: theme.palette.text.primary,
  transition: "background-color 0.3s ease, color 0.3s ease",
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: theme.spacing(2),
}));

export const QrMain = () => {
  const [empresaId, setEmpresaId] = useState("");
  const [nombreEmpresa, setNombreEmpresa] = useState("");
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [mail, setMail] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [maxUsageCount, setMaxUsageCount] = useState("");
  const [filteredUsuarios, setFilteredUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [qrData, setQrData] = useState(null); // Estado para los detalles del QR
  const [qrId, setQrId] = useState("");
  const qrRef = useRef(null);

  const createQr = useQrStore((state) => state.createQr);
  const { getQrById } = useQrStore((state) => ({
    getQrById: state.getQrById,
  }));
  const { empresas, getAllEmpresas } = useEmpresasStore();
  const { getUsuariosByEmpresa, usuarios, usuario } = useUsuariosStore(
    (state) => ({
      getUsuariosByEmpresa: state.getUsuariosByEmpresa,
      usuarios: state.usuarios,
      usuario: state.usuario,
    })
  );

  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up("md"));

  const superAdminRoleId = "668692d09bbe1e9ff25a4826";

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        if (empresas.length === 0) {
          await getAllEmpresas();
        }
        if (usuario.roleId !== superAdminRoleId && usuario.empresa) {
          const empresaSeleccionada = empresas.find(
            (e) => e._id === usuario.empresa._id
          );
          if (empresaSeleccionada) {
            setEmpresaId(empresaSeleccionada._id);
            setNombreEmpresa(empresaSeleccionada.name);
            await getUsuariosByEmpresa(empresaSeleccionada._id);
            if (usuarios && usuarios.length > 0) {
              setFilteredUsuarios(
                usuarios.filter(
                  (u) => u.empresa && u.empresa._id === empresaSeleccionada._id
                )
              );
            }
          }
        }
      } catch (error) {
        console.error("Error en cargarDatos:", error);
      }
    };

    cargarDatos();
  }, [getAllEmpresas, empresas, usuario, getUsuariosByEmpresa]);

  const handleEmpresaChange = async (e) => {
    if (usuario.roleId === superAdminRoleId) {
      const selectedEmpresaId = e.target.value;
      setEmpresaId(selectedEmpresaId);

      const selectedEmpresa = empresas.find((e) => e._id === selectedEmpresaId);
      if (selectedEmpresa) {
        setNombreEmpresa(selectedEmpresa.name);
        try {
          await getUsuariosByEmpresa(selectedEmpresaId);
          setFilteredUsuarios(
            usuarios.filter(
              (usuario) =>
                usuario.empresa && usuario.empresa._id === selectedEmpresaId
            )
          );
        } catch (error) {
          console.error("Error al obtener usuarios por empresa:", error);
        }
      }
    }
  };

  useEffect(() => {
    if (empresaId) {
      const usuariosFiltrados = usuarios.filter(
        (usuario) => usuario.empresa && usuario.empresa._id === empresaId
      );
      setFilteredUsuarios(usuariosFiltrados);
    }
  }, [empresaId, usuarios]);

  const validateFields = () => {
    if (
      !empresaId ||
      !nombre ||
      !telefono ||
      !mail ||
      !date ||
      !startTime ||
      !endTime ||
      !assignedTo ||
      !maxUsageCount
    ) {
      Swal.fire("Error", "Por favor, complete todos los campos", "error");
      return false;
    }
    if (nombre.length > 20) {
      Swal.fire(
        "Error",
        "El nombre no debe exceder los 20 caracteres",
        "error"
      );
      return false;
    }
    if (
      telefono.length < 10 ||
      telefono.length > 15 ||
      !/^\d+$/.test(telefono)
    ) {
      Swal.fire(
        "Error",
        "El teléfono debe tener entre 10 y 15 caracteres y solo debe contener números",
        "error"
      );
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(mail)) {
      Swal.fire("Error", "El correo no es válido", "error");
      return false;
    }
    if (!/^\d+$/.test(maxUsageCount) || parseInt(maxUsageCount, 10) < 1) {
      Swal.fire(
        "Error",
        "La cantidad máxima de usos debe ser un número entero mayor que 0",
        "error"
      );
      return false;
    }
    if (new Date(`${date}T${startTime}`) >= new Date(`${date}T${endTime}`)) {
      Swal.fire(
        "Error",
        "La hora de inicio debe ser anterior a la hora de fin",
        "error"
      );
      return false;
    }
    return true;
  };

  const handleGenerateClick = async () => {
    if (!validateFields()) {
      return;
    }

    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    if (!userId || !token) {
      console.error("User ID or token is missing");
      return;
    }

    const empresa = empresas.find((e) => e._id === empresaId);
    const qrDataToSend = {
      userId,
      assignedTo: {
        _id: assignedTo,
        nombre: usuarios.find((u) => u._id === assignedTo)?.nombre,
      },
      empresaId: { _id: empresaId, name: empresa?.name || "N/A" },
      nombre,
      telefono,
      mail,
      date,
      startTime,
      endTime,
      maxUsageCount: parseInt(maxUsageCount, 10),
    };

    try {
      setLoading(true);
      const newQr = await createQr(qrDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (newQr && newQr._id) {
        setQrId(newQr._id); // Guarda el ID del QR recién creado
        Swal.fire("QR creado", "QR creado exitosamente", "success");
      }
    } catch (error) {
      console.error("Error al crear QR:", error);
      Swal.fire("Error", "Hubo un problema al crear el QR", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchQrData = async () => {
      if (qrId) {
        try {
          const qrDetails = await getQrById(qrId);
          setQrData(qrDetails); // Guarda los detalles del QR
        } catch (error) {
          console.error("Error al obtener los detalles del QR:", error);
        }
      }
    };

    fetchQrData();
  }, [qrId, getQrById]);

  const handleWhatsAppShare = () => {
  if (!qrRef.current) {
    alert("No hay código QR para compartir.");
    return;
  }

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const svg = qrRef.current.querySelector("svg");

  const svgData = new XMLSerializer().serializeToString(svg);
  const img = new Image();
  img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;

  img.onload = () => {
    // Ajustar el tamaño del canvas para incluir espacio para el texto
    const padding = 20; // Espacio adicional alrededor del texto
    const fontSize = 14; // Tamaño de la fuente más grande
    const lineHeight = fontSize + 6; // Altura de cada línea de texto
    const maxWidth = 300; // Ancho máximo del texto
    const textHeight = 100; // Altura estimada para el texto
    const marginTop = 30; // Margen superior entre la imagen y el texto
    const marginBottom = -50; // Espacio inferior extra

    // Aumentar resolución del canvas
    const scale = 2; // Factor de escala para mejorar la claridad

    canvas.width = (img.width + padding * 2) * scale;
    canvas.height = (img.height + textHeight + padding * 2 + marginTop + marginBottom) * scale;
    ctx.scale(scale, scale); // Escalar el contexto del canvas

    // Dibujar el fondo blanco
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width / scale, canvas.height / scale);

    // Dibujar la imagen del QR en el canvas
    ctx.drawImage(img, padding, padding);

    // Crear un mensaje personalizado
    const mensaje = `¡Hola! 🎉\nTe invitamos a usar este QR\npara obtener beneficios exclusivos con ${nombreEmpresa}.`;

    // Configurar estilo del texto
    ctx.font = `${fontSize}px Arial, sans-serif`;
    ctx.fillStyle = "#333"; // Un color más suave para el texto
    ctx.textAlign = "center";

    // Dividir el mensaje en líneas para que no se salga del cuadro
    const words = mensaje.split(" ");
    const lines = [];
    let currentLine = "";

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

    // Ajustar la posición inicial del texto
    const textYStart = img.height + padding + marginTop;

    // Dibujar cada línea del mensaje en el canvas
    lines.forEach((line, index) => {
      ctx.fillText(
        line,
        (canvas.width / scale) / 2, // Ajuste para escalar
        textYStart + index * lineHeight
      );
    });

    // Convertir el canvas a una imagen base64
    const combinedImage = canvas.toDataURL("image/png");

    // Crear un archivo Blob con la imagen combinada
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

    const isMobile = /Mobi|Android/i.test(navigator.userAgent);

    if (isMobile) {
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator
          .share({
            files: [file],
            title: "Código QR con mensaje",
            text: mensaje,
          })
          .then(() => console.log("Compartido con éxito"))
          .catch((error) => console.log("Error al compartir", error));
      } else {
        alert("Tu navegador no soporta compartir archivos o texto.");
      }
    } else {
      const imageUrl = URL.createObjectURL(blob);
      window.open(imageUrl, "_blank");
    }
  };

  img.onerror = () => {
    console.error("Error al cargar la imagen del QR");
    alert("Error al cargar la imagen del QR");
  };
};


  

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <StyledBox mt={-2}>
        <Card elevation={3} className="p-5 w-full max-w-screen-lg">
          <CardContent>
            <Typography mt={-1} variant="h4" className="text-center">
              Crear QR Code
            </Typography>
            <Grid container spacing={4} mt={4}>
              <Grid item xs={12} md={6}>
                <Box mt={-5} className="p-4 rounded-md shadow-md">
                  <FormControl
                    fullWidth
                    variant="outlined"
                    className="custom-margin"
                  >
                    <InputLabel>Empresa</InputLabel>
                    <Select
                      labelId="empresa-select-label"
                      value={empresaId || ""}
                      onChange={handleEmpresaChange}
                      label="Empresa"
                      disabled={usuario.roleId !== superAdminRoleId}
                      sx={{
                        color: theme.palette.mode === "dark" ? "#fff" : "#111",
                        ".MuiOutlinedInput-notchedOutline": {
                          borderColor:
                            theme.palette.mode === "dark" ? "#fff" : "#444",
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: theme.palette.primary.main,
                        },
                        ".MuiSvgIcon-root": {
                          color:
                            theme.palette.mode === "dark" ? "#fff" : "#000",
                        },
                      }}
                    >
                      {empresas.map((empresa) => (
                        <MenuItem
                          key={empresa._id}
                          value={empresa._id}
                          sx={{ color: "black" }}
                        >
                          {empresa.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl
                    fullWidth
                    variant="outlined"
                    className="custom-margin"
                  >
                    <InputLabel>Asignar a usuario</InputLabel>
                    <Select
                      value={assignedTo}
                      onChange={(e) => setAssignedTo(e.target.value)}
                      label="Asignar a usuario"
                      disabled={!empresaId}
                    >
                      {filteredUsuarios.map((usuario) => (
                        <MenuItem key={usuario._id} value={usuario._id}>
                          {usuario.nombre}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    label="Nombre"
                    variant="outlined"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    fullWidth
                    className="custom-margin"
                    inputProps={{ maxLength: 20 }}
                  />
                  <TextField
                    label="Teléfono"
                    variant="outlined"
                    value={telefono}
                    onChange={(e) => {
                      if (/^\d*$/.test(e.target.value)) {
                        setTelefono(e.target.value);
                      }
                    }}
                    fullWidth
                    className="custom-margin"
                  />
                  <TextField
                    label="Correo"
                    variant="outlined"
                    value={mail}
                    onChange={(e) => setMail(e.target.value)}
                    fullWidth
                    className="custom-margin"
                  />
                  <Box
                    display="flex"
                    alignItems="center"
                    className="custom-margin"
                  >
                    <TextField
                      label="Fecha"
                      type="date"
                      variant="outlined"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      fullWidth
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                    <TextField
                      label="Hora de inicio"
                      type="time"
                      variant="outlined"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      fullWidth
                      className="ml-2"
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                    <TextField
                      label="Hora de fin"
                      type="time"
                      variant="outlined"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      fullWidth
                      className="ml-2"
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Box>
                  <TextField
                    label="Cantidad de usos"
                    variant="outlined"
                    placeholder="Cantidad de usos"
                    value={maxUsageCount}
                    onChange={(e) => {
                      if (/^\d*$/.test(e.target.value)) {
                        setMaxUsageCount(e.target.value);
                      }
                    }}
                    fullWidth
                    className="custom-margin"
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleGenerateClick}
                    fullWidth
                    className="py-3 text-lg mt-4"
                    disabled={loading}
                  >
                    {loading ? "Generando..." : "Generar QR"}
                  </Button>
                  {qrData && (
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<WhatsApp />}
                      onClick={handleWhatsAppShare}
                      fullWidth
                      className="py-3 text-lg mt-4"
                    >
                      Compartir en WhatsApp
                    </Button>
                  )}
                </Box>
              </Grid>
              <Grid
                item
                xs={12}
                md={6}
                className="flex justify-center items-center"
              >
                {qrData && (
                  <Paper
                    elevation={3}
                    ref={qrRef} // Referencia al contenedor del QR
                    className="p-0 bg-white dark:bg-gray-800 rounded-md shadow-md flex justify-center items-center w-full h-full"
                  >
                    <ReactQRCode
                      value={JSON.stringify(qrData)}
                      size={256} // Ajusta el tamaño según sea necesario
                    />
                  </Paper>
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </StyledBox>
    </ThemeProvider>
  );
};
