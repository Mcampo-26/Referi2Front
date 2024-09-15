import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  Box,
  Typography,
  Container,
  TextField,
  Grid,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Fade,
} from "@mui/material";
import { useParams } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import { useTheme } from "@mui/material/styles";
import useQrStore from "../store/useQrStore";
import useServiciosStore from "../store/useServiciosStore";
import Swal from "sweetalert2";
import "tailwindcss/tailwind.css";
import "./Css/Scan.css";
import qrHome from "../assets/qrHome.jpg";
import usePaymentStore from "../store/usePaymentStore";

export const ScanQr = () => {
  const [scannedData, setScannedData] = useState(null);
  const [error, setError] = useState(null);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 768);
  const [selectedService, setSelectedService] = useState("");
  const [details, setDetails] = useState("");
  const [discount, setDiscount] = useState("");
  const [fadeOut, setFadeOut] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [enableUpdateFields, setEnableUpdateFields] = useState(false);
  const { qrId } = useParams();
  const { createPayment } = usePaymentStore();
  const [isHandlingScan, setIsHandlingScan] = useState(false);
  const {
    servicios,
    getServiciosByEmpresaId,
    loading,
    error: serviciosError,
  } = useServiciosStore((state) => ({
    servicios: state.servicios,
    getServiciosByEmpresaId: state.getServiciosByEmpresaId,
    loading: state.loading,
    error: state.error,
  }));

  const { updateQr, getQrById, getQrsByAssignedUser } = useQrStore((state) => ({
    updateQr: state.updateQr,
    getQrById: state.getQrById,
    getQrsByAssignedUser: state.getQrsByAssignedUser,
  }));

  const theme = useTheme();
  const scannerRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const html5QrCode = new Html5Qrcode("reader");
    scannerRef.current = html5QrCode;

    return () => {
      if (html5QrCode.isScanning) {
        html5QrCode
          .stop()
          .catch((err) => console.error("Failed to stop Html5Qrcode.", err));
      }
    };
  }, []);

  useEffect(() => {
    if (qrId) {
      const fetchQrData = async () => {
        const qrDetails = await getQrById(qrId);

        setEnableUpdateFields(qrDetails.enableUpdateFields);

        if (qrDetails && qrDetails.empresaId) {
          // Verifica si ya tienes servicios cargados para evitar llamadas repetidas
          if (!servicios.length) {
            await getServiciosByEmpresaId(qrDetails.empresaId._id);
          }
        }
      };

      fetchQrData();
    }
  }, [qrId, getQrById, servicios.length]); // Solo se ejecutará si cambian estas dependencias

  const parseData = (data) => {
    try {
      const parsed = JSON.parse(data);
      setEnableUpdateFields(parsed.enableUpdateFields || false);
      return {
        id: parsed._id || "N/A",
        userId: parsed.userId || "N/A",
        assignedTo: parsed.assignedTo || "N/A",
        empresaId: parsed.empresaId || { _id: "N/A", name: "N/A" },
        nombre: parsed.nombre || "N/A",
        telefono: parsed.telefono || "N/A",
        mail: parsed.mail || "N/A",
        startTime: parsed.startTime || "N/A",
        endTime: parsed.endTime || "N/A",
        usageCount: parsed.usageCount || 0,
        maxUsageCount: parsed.maxUsageCount || 0,
        isUsed: parsed.isUsed || false,
        updates: parsed.updates || [],
        date: parsed.date ? new Date(parsed.date).toISOString() : "N/A",
        isPayment: parsed.isPayment || false, // Asegúrate de incluir el campo isPayment
      };
    } catch (error) {
      return {
        id: "N/A",
        userId: "N/A",
        assignedTo: "N/A",
        empresaId: { _id: "N/A", name: "N/A" },
        nombre: "N/A",
        telefono: "N/A",
        mail: "N/A",
        startTime: "N/A",
        endTime: "N/A",
        usageCount: 0,
        maxUsageCount: 0,
        isUsed: false,
        updates: [],
        date: "N/A",
        isPayment: false, // Asegúrate de incluir también aquí el campo isPayment
      };
    }
  };

  const startScan = () => {
    if (scannerRef.current && !scannerRef.current.isScanning) {
      setError(null);
      setIsScanning(true);
      scannerRef.current
        .start(
          { facingMode: "environment" },
          { fps: 10, qrbox: 300 },
          handleScan,
          handleError
        )
        .catch((err) => {
          console.error("Failed to start scanning.", err);
          setError(err);
          setIsScanning(false);
        });
    }
  };

  // Nueva función para reiniciar el estado del componente
  const resetComponentState = () => {
    setScannedData(null);
    setEnableUpdateFields(false);
    setSelectedService("");
    setDetails("");
    setDiscount("");
    setError(null);
    setIsScanning(false);
    setIsUpdating(false);
    setFadeOut(false);
  };
  const handleScan = async (data) => {
    if (!isHandlingScan && data) {
      stopScan();
      setIsHandlingScan(true);
      setError(null);

      const parsedData = parseData(data);

      if (!parsedData.id || parsedData.id === "N/A") {
        Swal.fire({
          title: "Error",
          text: "El QR escaneado no contiene un ID válido.",
          icon: "error",
          confirmButtonText: "Aceptar",
        }).finally(() => {
          setIsHandlingScan(false);
        });
        return;
      }

      const qrFromDb = await getQrById(parsedData.id);

      if (!qrFromDb) {
        Swal.fire({
          title: "Error",
          text: "El QR no se encontró en la base de datos.",
          icon: "error",
          confirmButtonText: "Aceptar",
        }).finally(() => {
          setIsHandlingScan(false);
        });
        return;
      }

      setEnableUpdateFields(qrFromDb.enableUpdateFields);
      setScannedData({
        ...parsedData,
        id: parsedData._id || parsedData.id,
        empresaId: parsedData.empresaId,
        usageCount: qrFromDb.usageCount,
        maxUsageCount: qrFromDb.maxUsageCount,
        updates: qrFromDb.updates || [],
      });

      if (parsedData.empresaId && parsedData.empresaId._id !== "N/A") {
        await getServiciosByEmpresaId(parsedData.empresaId._id);
      }

      console.log("Verificando si el QR es de pago:", qrFromDb.isPayment);

      if (qrFromDb.isPayment) {
        console.log("QR de pago detectado, iniciando proceso de pago...");
      
        try {
          const usuarioEmail = localStorage.getItem("userEmail");
          const infoCompra = `Estás a punto de comprar: ${qrFromDb.nombre} por $${qrFromDb.precio}.`;
      
          const result = await Swal.fire({
            title: "Confirmar Compra",
            text: infoCompra,
            icon: "info",
            showCancelButton: true,
            confirmButtonText: "Aceptar",
            cancelButtonText: "Cancelar",
          });
      
          if (result.isConfirmed) {
            if (qrFromDb.precio) {
              const initPointUrl = await createPayment(
                qrFromDb.nombre,
                qrFromDb.precio,
                null,
                usuarioEmail
              );
              window.location.href = initPointUrl;
            } else {
              console.error("El precio del QR es nulo o indefinido.");
            }
          }
        } catch (error) {
          console.error("Error al crear la preferencia de pago:", error);
          Swal.fire({
            title: "Error",
            text: "Hubo un problema al crear la preferencia de pago.",
            icon: "error",
            confirmButtonText: "Aceptar",
          });
          setIsHandlingScan(false);
          return;
        }
           
      } else if (!qrFromDb.enableUpdateFields) {
        Swal.fire({
          title: "Escaneo Correcto",
          text: "El QR se escaneó correctamente.",
          icon: "success",
          position: "center",
          showConfirmButton: false,
          timer: 4000,
          timerProgressBar: true,
          background: "#333",
          color: "#fff",
          customClass: {
            popup: "colored-toast",
          },
        }).finally(() => {
          resetComponentState();
          setIsHandlingScan(false);
        });
      } else {
        setIsHandlingScan(false);
      }
    }
  };

  const handleError = (err) => {
    if (
      err.name === "NotFoundException" ||
      err.message.includes(
        "No MultiFormat Readers were able to detect the code"
      )
    ) {
      return;
    } else {
      console.error("Error durante el escaneo:", err);
      setError(err);
    }
  };

  const stopScan = () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current
        .stop()
        .catch((err) => console.error("Failed to stop Html5Qrcode.", err));
      setIsScanning(false);
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log("Archivo seleccionado:", file);
      scannerRef.current
        .scanFile(file, true)
        .then(async (decodedText) => {
          setError(null);

          const parsedData = parseData(decodedText);

          const qrFromDb = await getQrById(parsedData.id);
          if (
            qrFromDb &&
            qrFromDb.isUsed &&
            qrFromDb.usageCount >= qrFromDb.maxUsageCount
          ) {
            stopScan();
            Swal.fire({
              title: "QR no usable",
              text: "El QR ya no puede ser usado.",
              icon: "warning",
              confirmButtonText: "Aceptar",
            });
            return;
          }

          handleScan(decodedText);
        })
        .catch((err) => {
          if (err.name === "NotFoundException") {
            console.warn("QR code not found in file. Please try another file.");
          } else {
            console.error("Error scanning file:", err);
            setError(err);
          }
        });
    } else {
      console.log("No file selected");
    }
  };

  const handleUpdateQr = async () => {
    setIsUpdating(true);

    if (!scannedData.id) {
      setError(new Error("No QR code ID found."));
      console.log("No QR code ID found");

      return;
    }

    const qrData = {
      service: selectedService,
      details,
      discount,
      updatedAt: new Date().toISOString(),
    };

    try {
      const response = await updateQr(scannedData.id, qrData);

      const updatedQr = response.qr;

      if (!updatedQr) {
        throw new Error("QR data is undefined");
      }

      setFadeOut(true);
      const storedUserId = localStorage.getItem("userId");
      if (storedUserId) {
        await getQrsByAssignedUser(storedUserId);
      }

      Swal.fire({
        title: "QR actualizado",
        text: "El QR ha sido actualizado correctamente.",
        icon: "success",
        confirmButtonText: "Aceptar",
      }).then(() => {
        setIsUpdating(false);
        setIsScanning(false);
        setScannedData(null);
        setSelectedService("");
        setDetails("");
        setDiscount("");
        setFadeOut(false);
      });
    } catch (error) {
      console.error("Error al actualizar QR:", error);
      Swal.fire({
        title: "Error",
        text: "Hubo un problema al actualizar el QR",
        icon: "error",
        confirmButtonText: "Aceptar",
      }).then(() => {
        setIsUpdating(false);
      });
    }
  };

  const usosRestantes = scannedData
    ? scannedData.maxUsageCount - scannedData.usageCount
    : 0;

  return (
    <Container
      maxWidth="md"
      className="flex flex-col items-center justify-center mt-20"
      sx={{
        paddingBottom: "40px",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Ocultar imagen de escanear mientras se escanea, actualiza o hay datos escaneados */}
      {!isScanning && !isUpdating && !scannedData && (
        <Box
          component="img"
          src={qrHome}
          alt="Iniciar Escaneo"
          onClick={startScan}
          sx={{
            cursor: "pointer",
            width: 150,
            height: 150,
            mb: 2,
          }}
        />
      )}

      <Typography variant="h4" className="text-center mb-4">
        Escanear QR Code
      </Typography>
      <Box
        id="reader"
        width="100%"
        maxWidth="600px"
        mb={4}
        mt={4}
        className="w-full md:w-auto border border-gray-300 rounded-lg shadow-md"
      />

      {!isScanning && !isUpdating && !scannedData && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          mb={4}
          gap={2}
        >
          <Button
            variant="contained"
            color="secondary"
            onClick={() => fileInputRef.current.click()}
            className="mb-6"
          >
            Subir Archivo
          </Button>
        </Box>
      )}

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      {isScanning && (
        <Button
          variant="contained"
          color="secondary"
          onClick={stopScan}
          className="mb-6"
        >
          Detener Escaneo
        </Button>
      )}

      {scannedData && (
        <Fade in={!fadeOut} timeout={100}>
          <Box
            component={Paper}
            elevation={3}
            mt={4}
            mb={4}
            p={4}
            borderRadius={2}
            className={`w-full max-w-lg mx-auto bg-white dark:bg-gray-800 text-black dark:text-white transition-all duration-300 ${
              fadeOut ? "fade-out" : ""
            }`}
          >
            {scannedData.isUsed &&
            scannedData.usageCount >= scannedData.maxUsageCount ? (
              <Typography variant="body1" color="error" align="center">
                QR no usable. El QR ya no puede ser usado.
              </Typography>
            ) : (
              <>
                <Typography variant="h6" mb={5} gutterBottom>
                  Información del QR:
                </Typography>
                <Grid container spacing={2}>
                  {scannedData.nombre && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body1">
                        <strong>Nombre:</strong> {scannedData.nombre}
                      </Typography>
                    </Grid>
                  )}
                  {scannedData.telefono && scannedData.telefono !== "N/A" && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body1">
                        <strong>Teléfono:</strong> {scannedData.telefono}
                      </Typography>
                    </Grid>
                  )}
                  {scannedData.mail && scannedData.mail !== "N/A" && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body1">
                        <strong>Correo:</strong> {scannedData.mail}
                      </Typography>
                    </Grid>
                  )}
                  {scannedData.startTime && scannedData.startTime !== "N/A" && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body1">
                        <strong>Hora de inicio:</strong> {scannedData.startTime}
                      </Typography>
                    </Grid>
                  )}
                  {scannedData.endTime && scannedData.endTime !== "N/A" && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body1">
                        <strong>Hora de fin:</strong> {scannedData.endTime}
                      </Typography>
                    </Grid>
                  )}
                  {scannedData.date &&
                    scannedData.date !== "N/A" &&
                    scannedData.date !== "Invalid Date" && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body1">
                          <strong>Fecha:</strong>{" "}
                          {new Date(scannedData.date).toLocaleDateString()}
                        </Typography>
                      </Grid>
                    )}
                  {scannedData.empresaId?.name &&
                    scannedData.empresaId.name !== "N/A" && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body1">
                          <strong>Empresa:</strong> {scannedData.empresaId.name}
                        </Typography>
                      </Grid>
                    )}
                  {scannedData.usageCount !== undefined &&
                    scannedData.usageCount > 0 && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body1">
                          <strong>Usado:</strong> {scannedData.usageCount}
                        </Typography>
                      </Grid>
                    )}
                  {usosRestantes > 0 && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body1">
                        <strong>Usos restantes:</strong> {usosRestantes}
                      </Typography>
                    </Grid>
                  )}
                </Grid>

                {/* Renderizar los inputs de actualización solo si enableUpdateFields es true */}
                {enableUpdateFields && (
                  <>
                    {servicios.length > 0 && (
                      <FormControl fullWidth margin="normal" variant="outlined">
                        <InputLabel>Servicio</InputLabel>
                        <Select
                          value={selectedService}
                          onChange={(e) => setSelectedService(e.target.value)}
                          label="Servicio"
                        >
                          {servicios.map((servicio) => (
                            <MenuItem key={servicio._id} value={servicio._id}>
                              {servicio.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}

                    <TextField
                      fullWidth
                      label="Descuento"
                      variant="outlined"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      margin="normal"
                      InputProps={{
                        endAdornment: <Typography>%</Typography>,
                      }}
                    />

                    <TextField
                      fullWidth
                      label="Detalles"
                      variant="outlined"
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                      margin="normal"
                    />

                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleUpdateQr}
                      sx={{ mt: 2 }}
                    >
                      Guardar Cambios
                    </Button>
                  </>
                )}
              </>
            )}
          </Box>
        </Fade>
      )}

      {error && (
        <Box
          mt={4}
          mb={4}
          textAlign="center"
          p={4}
          borderRadius={2}
          boxShadow={3}
          className="w-full max-w-lg mx-auto bg-white dark:bg-gray-800 text-black dark:text-white transition-all duration-300"
        >
          <Typography variant="body1" color="error">
            Error al escanear el QR: {error.message}
          </Typography>
        </Box>
      )}

      {serviciosError && (
        <Box
          mt={4}
          mb={4}
          textAlign="center"
          p={4}
          borderRadius={2}
          boxShadow={3}
          className="w-full max-w-lg mx-auto bg-white dark:bg-gray-800 text-black dark:text-white transition-all duration-300"
        >
          <Typography variant="body1" color="error">
            Error al obtener servicios: {serviciosError.message}
          </Typography>
        </Box>
      )}

      {loading && (
        <Box
          mt={4}
          mb={4}
          textAlign="center"
          p={4}
          borderRadius={2}
          boxShadow={3}
          className="w-full max-w-lg mx-auto bg-white dark:bg-gray-800 text-black dark:text-white transition-all duration-300"
        >
          <Typography variant="body1">Cargando servicios...</Typography>
        </Box>
      )}
    </Container>
  );
};
