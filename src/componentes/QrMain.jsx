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
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import useQrStore from "../store/useQrStore";
import useEmpresasStore from "../store/useEmpresaStore";
import useUsuariosStore from "../store/useUsuariosStore";
import { WhatsApp } from "@mui/icons-material";
import ReactQRCode from "react-qr-code";
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
  const [qrData, setQrData] = useState(null);
  const [qrId, setQrId] = useState("");
  const [enableUpdateFields, setEnableUpdateFields] = useState(false); // Nuevo estado para el checkbox de actualización
  const qrRef = useRef(null);
  const [precio, setPrecio] = useState(""); // Estado para el precio
  const [isPayment, setIsPayment] = useState(false); // Estad
  const [enablePrecio, setEnablePrecio] = useState(false);
  // Estados para manejar los checkboxes de los campos
  const [enableNombre, setEnableNombre] = useState(false);
  const [enableTelefono, setEnableTelefono] = useState(false);
  const [enableMail, setEnableMail] = useState(false);
  const [enableDate, setEnableDate] = useState(false);
  const [enableStartTime, setEnableStartTime] = useState(false);
  const [enableEndTime, setEnableEndTime] = useState(false);
  const [enableMaxUsageCount, setEnableMaxUsageCount] = useState(false);

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
    if (!empresaId || !assignedTo) {
      Swal.fire(
        "Error",
        "Por favor, seleccione una empresa y un usuario",
        "error"
      );
      return false;
    }

    if (enableNombre && (!nombre || nombre.length > 20)) {
      Swal.fire(
        "Error",
        "El nombre no debe exceder los 20 caracteres",
        "error"
      );
      return false;
    }

    if (
      enableTelefono &&
      (telefono.length < 10 || telefono.length > 15 || !/^\d+$/.test(telefono))
    ) {
      Swal.fire(
        "Error",
        "El teléfono debe tener entre 10 y 15 caracteres y solo debe contener números",
        "error"
      );
      return false;
    }

    if (enableMail && !/\S+@\S+\.\S+/.test(mail)) {
      Swal.fire("Error", "El correo no es válido", "error");
      return false;
    }

    if (
      enableMaxUsageCount &&
      (!/^\d+$/.test(maxUsageCount) || parseInt(maxUsageCount, 10) < 1)
    ) {
      Swal.fire(
        "Error",
        "La cantidad máxima de usos debe ser un número entero mayor que 0",
        "error"
      );
      return false;
    }

    if (
      enableDate &&
      new Date(`${date}T${startTime}`) >= new Date(`${date}T${endTime}`)
    ) {
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
      ...(enableNombre && { nombre }),
      ...(enableTelefono && { telefono }),
      ...(enableMail && { mail }),
      ...(enableDate && { date }),
      ...(enableStartTime && { startTime }),
      ...(enableEndTime && { endTime }),
      ...(enableMaxUsageCount && {
        maxUsageCount: parseInt(maxUsageCount, 10),
      }),
      ...(precio && { precio: parseFloat(precio) }), // Incluye el precio
      enableUpdateFields,
      isPayment: true, // Añadir este campo si es un QR "de pago"
    };

    console.log("Datos enviados al QR:", qrDataToSend);

    try {
      setLoading(true);
      const newQr = await createQr(qrDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (newQr && newQr._id) {
        setQrId(newQr._id);
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
          setQrData(qrDetails);
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
      const padding = 10;
      const fontSize = 13;
      const lineHeight = fontSize + 4;
      const maxWidth = 300;
      const textHeight = 80;
      const marginTop = 25;
      const marginBottom = -50;

      canvas.width = img.width + padding * 2;
      canvas.height =
        img.height + textHeight + padding * 2 + marginTop + marginBottom;

      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.drawImage(img, padding, padding);

      const mensaje = `¡Hola! 🎉\nTe invitamos a usar este QR\npara obtener beneficios exclusivos con ${nombreEmpresa}.`;

      ctx.font = `${fontSize}px Arial`;
      ctx.fillStyle = "#333";
      ctx.textAlign = "center";

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

      const textYStart = img.height + padding + marginTop;

      lines.forEach((line, index) => {
        ctx.fillText(line, canvas.width / 2, textYStart + index * lineHeight);
      });

      const combinedImage = canvas.toDataURL("image/png");

      const isMobile = /Mobi|Android/i.test(navigator.userAgent);

      if (isMobile) {
        const url = `https://wa.me/?text=${encodeURIComponent(mensaje)}`;
        window.open(url, "_blank");
      } else {
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
        } else {
          alert("Tu navegador no soporta compartir archivos o texto.");
        }
      }
    };

    img.onerror = () => {
      console.error("Error al cargar la imagen del QR");
      alert("Error al cargar la imagen del QR");
    };
  };

  const handlePaymentChange = (e) => {
    setIsPayment(e.target.checked);
    if (e.target.checked) {
      setEnablePrecio(true); // Si QR de Pago está marcado, habilitar el precio
    } else {
      setEnablePrecio(false); // Si QR de Pago no está marcado, deshabilitar el precio
    }
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

                  {/* Checkbox para habilitar/deshabilitar campos de actualización */}
              

             

                  {enableNombre && (
                    <TextField
                      label="Nombre"
                      variant="outlined"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      fullWidth
                      className="custom-margin"
                      inputProps={{ maxLength: 20 }}
                    />
                  )}

                  {enableTelefono && (
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
                  )}

                  {enableMail && (
                    <TextField
                      label="Correo"
                      variant="outlined"
                      value={mail}
                      onChange={(e) => setMail(e.target.value)}
                      fullWidth
                      className="custom-margin"
                    />
                  )}

                  {(enablePrecio || isPayment) && (
                    <TextField
                      label="Precio"
                      variant="outlined"
                      placeholder="Precio"
                      value={precio}
                      onChange={(e) => {
                        if (/^\d*(\.\d{0,2})?$/.test(e.target.value)) {
                          setPrecio(e.target.value);
                        }
                      }}
                      fullWidth
                      className="custom-margin"
                    />
                  )}

                  {enableDate && (
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
                      className="custom-margin"
                    />
                  )}

                  {enableStartTime && (
                    <TextField
                      label="Hora de inicio"
                      type="time"
                      variant="outlined"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      fullWidth
                      className="custom-margin"
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  )}

                  {enableEndTime && (
                    <TextField
                      label="Hora de fin"
                      type="time"
                      variant="outlined"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      fullWidth
                      className="custom-margin"
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  )}

                  {enableMaxUsageCount && (
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
                  )}

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isPayment}
                        onChange={handlePaymentChange}
                      />
                    }
                    label="QR de Pago"
                  />

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={enablePrecio}
                        onChange={(e) => setEnablePrecio(e.target.checked)}
                        disabled={isPayment} // Deshabilitar este checkbox si el QR de Pago está seleccionado
                      />
                    }
                    label="Precio"
                  />
                  {/* Checkboxes para activar/desactivar campos */}
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={enableNombre}
                        onChange={(e) => setEnableNombre(e.target.checked)}
                      />
                    }
                    label="Nombre"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={enableTelefono}
                        onChange={(e) => setEnableTelefono(e.target.checked)}
                      />
                    }
                    label="Teléfono"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={enableMail}
                        onChange={(e) => setEnableMail(e.target.checked)}
                      />
                    }
                    label="Correo"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={enableDate}
                        onChange={(e) => setEnableDate(e.target.checked)}
                      />
                    }
                    label="Fecha"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={enableStartTime}
                        onChange={(e) => setEnableStartTime(e.target.checked)}
                      />
                    }
                    label="Hora de inicio"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={enableEndTime}
                        onChange={(e) => setEnableEndTime(e.target.checked)}
                      />
                    }
                    label="Hora de fin"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={enableMaxUsageCount}
                        onChange={(e) =>
                          setEnableMaxUsageCount(e.target.checked)
                        }
                      />
                    }
                    label="Cantidad de usos"
                  />
                      {/* Checkbox para habilitar/deshabilitar campos de actualización */}
                      <FormControlLabel
  control={
    <Checkbox
      checked={enableUpdateFields} 
      onChange={(e) => {
        setEnableUpdateFields(e.target.checked); 
        console.log("Checkbox de actualización marcado:", e.target.checked);
      }}
    />
  }
  label="Actualizar"
/>

{/* Botón condicional para "QR Actualizable" */}
{enableUpdateFields && (
  <Typography
    variant="subtitle1"
    style={{
      backgroundColor: '#388e3c', // Verde claro casi agua
      color: '#fff',
      padding: '5px 10px',
      borderRadius: '5px',
      display: 'inline-block',
      marginTop: '10px',
      fontSize: '0.875rem', // Tamaño de fuente más pequeño
    }}
  >
    QR Actualizable
  </Typography>
)}
                </Box>
                {/* Botón para generar el QR */}
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
                    ref={qrRef}
                    className="p-0 bg-white dark:bg-gray-800 rounded-md shadow-md flex justify-center items-center w-full h-full"
                  >
                    <ReactQRCode value={JSON.stringify(qrData)} size={350} />
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
