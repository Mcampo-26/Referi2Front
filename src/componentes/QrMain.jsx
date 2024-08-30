import React, { useEffect, useState } from 'react';
import {
  Button, TextField, Grid, Typography, Card, CardContent,
  Paper, Box, MenuItem, Select, InputLabel, FormControl
} from '@mui/material';
import useQrStore from '../store/useQrStore';
import useEmpresasStore from '../store/useEmpresaStore';
import useUsuariosStore from '../store/useUsuariosStore';
import { WhatsApp } from '@mui/icons-material';
import { useTheme, ThemeProvider, CssBaseline, useMediaQuery } from '@mui/material';
import { styled } from '@mui/system';
import Swal from 'sweetalert2';
import './Css/QrMain.css';

const StyledBox = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[200],
  color: theme.palette.text.primary,
  transition: 'background-color 0.3s ease, color 0.3s ease',
  height: '100vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.spacing(2),
}));

export const QrMain = () => {
  const [empresaId, setEmpresaId] = useState('');
  const [nombreEmpresa, setNombreEmpresa] = useState('');
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [mail, setMail] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [base64Image, setBase64Image] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [maxUsageCount, setMaxUsageCount] = useState('');
  const [filteredUsuarios, setFilteredUsuarios] = useState([]);

  const createQr = useQrStore((state) => state.createQr);
  const { empresas, getAllEmpresas } = useEmpresasStore();
  const { getUsuariosByEmpresa, usuarios, usuario } = useUsuariosStore((state) => ({
    getUsuariosByEmpresa: state.getUsuariosByEmpresa,
    usuarios: state.usuarios,
    usuario: state.usuario,
  }));

  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('md'));

  // ID del rol SuperAdmin
  const superAdminRoleId = "668692d09bbe1e9ff25a4826";  // Cambia esto por el ID correcto

  // Cargar todas las empresas cuando el componente se monta
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        if (empresas.length === 0) {
          await getAllEmpresas();
          console.log('Empresas cargadas:', empresas);
        }
  
        if (usuario.roleId !== superAdminRoleId && usuario.empresa) {
          const empresaSeleccionada = empresas.find(e => e._id === usuario.empresa._id);
          if (empresaSeleccionada) {
            setEmpresaId(empresaSeleccionada._id);
            setNombreEmpresa(empresaSeleccionada.name);
  
            // Verifica si ya tienes los usuarios cargados antes de hacer la llamada
            if (!usuarios.length || !usuarios.some(u => u.empresa._id === empresaSeleccionada._id)) {
              await getUsuariosByEmpresa(empresaSeleccionada._id);
            }
            setFilteredUsuarios(usuarios.filter(u => u.empresa && u.empresa._id === empresaSeleccionada._id));
          }
        }
      } catch (error) {
        console.error('Error en cargarDatos:', error);
      }
    };
  
    cargarDatos();
  }, [getAllEmpresas, empresas, usuario, getUsuariosByEmpresa, usuarios]);
  

  // Manejar el cambio de empresa solo si es SuperAdmin
  const handleEmpresaChange = async (e) => {
    if (usuario.roleId === superAdminRoleId) {
      const selectedEmpresaId = e.target.value;
      setEmpresaId(selectedEmpresaId);

      const selectedEmpresa = empresas.find(e => e._id === selectedEmpresaId);
      if (selectedEmpresa) {
        setNombreEmpresa(selectedEmpresa.name);
        try {
          await getUsuariosByEmpresa(selectedEmpresaId);
          setFilteredUsuarios(usuarios.filter(usuario => usuario.empresa && usuario.empresa._id === selectedEmpresaId));
        } catch (error) {
          console.error('Error al obtener usuarios por empresa:', error);
        }
      }
    }
  };

  // Filtrar los usuarios basados en la empresa seleccionada
  useEffect(() => {
    if (empresaId) {
      const usuariosFiltrados = usuarios.filter(usuario => usuario.empresa && usuario.empresa._id === empresaId);
      setFilteredUsuarios(usuariosFiltrados);
    }
  }, [empresaId, usuarios]);

  const validateFields = () => {
    if (!empresaId || !nombre || !telefono || !mail || !date || !startTime || !endTime || !assignedTo || !maxUsageCount) {
      Swal.fire('Error', 'Por favor, complete todos los campos', 'error');
      return false;
    }
    if (nombre.length > 20) {
      Swal.fire('Error', 'El nombre no debe exceder los 20 caracteres', 'error');
      return false;
    }
    if (telefono.length < 10 || telefono.length > 15 || !/^\d+$/.test(telefono)) {
      Swal.fire('Error', 'El teléfono debe tener entre 10 y 15 caracteres y solo debe contener números', 'error');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(mail)) {
      Swal.fire('Error', 'El correo no es válido', 'error');
      return false;
    }
    if (!/^\d+$/.test(maxUsageCount) || parseInt(maxUsageCount, 10) < 1) {
      Swal.fire('Error', 'La cantidad máxima de usos debe ser un número entero mayor que 0', 'error');
      return false;
    }
    if (new Date(`${date}T${startTime}`) >= new Date(`${date}T${endTime}`)) {
      Swal.fire('Error', 'La hora de inicio debe ser anterior a la hora de fin', 'error');
      return false;
    }
    return true;
  };

  const handleGenerateClick = async () => {
    if (!validateFields()) {
      return;
    }
  
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    
    if (!userId || !token) {
      console.error("User ID or token is missing");
      return;
    }
  
    const empresa = empresas.find(e => e._id === empresaId);
    const qrData = {
      userId,
      assignedTo: { _id: assignedTo, nombre: usuarios.find(u => u._id === assignedTo)?.nombre },
      empresaId: { _id: empresaId, name: empresa?.name || 'N/A' },
      nombre,
      telefono,
      mail,
      date,
      startTime,
      endTime,
      maxUsageCount: parseInt(maxUsageCount, 10)
    };
  
    try {
      const newQr = await createQr(qrData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
  
      if (newQr && newQr.base64Image) {
        setBase64Image(newQr.base64Image);
        Swal.fire('QR creado', 'QR creado exitosamente', 'success');
      }
    } catch (error) {
      console.error("Error al crear QR:", error);
      Swal.fire('Error', 'Hubo un problema al crear el QR', 'error');
    }
  };

  const handleWhatsAppShare = () => {
  if (!base64Image) {
    alert('No hay código QR para compartir.');
    return;
  }

  // Crear el mensaje con partes en azul
  const mensaje = [
    { text: '¡Hola! 🎉', color: '#000' }, // Color negro
    { text: 'Te invitamos a usar este ', color: '#000' },
    { text: 'QR', color: 'blue' }, // Texto en azul
    { text: ' para obtener beneficios exclusivos con ', color: '#000' },
    { text: `${nombreEmpresa}.`, color: 'blue' }, // Texto en azul
  ];

  // Crear un canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const img = new Image();
  img.src = `data:image/png;base64,${base64Image}`;

  img.onload = () => {
    const padding = 50; // Margen adicional alrededor del texto
    canvas.width = img.width + padding * 2;
    canvas.height = img.height + 200 + padding; // Espacio adicional para el texto y margen

    // Dibujar la imagen del QR en el canvas con margen superior
    ctx.drawImage(img, padding, padding);

    // Limpiar el área de texto antes de dibujar para evitar un fondo negro
    ctx.clearRect(0, img.height + padding, canvas.width, canvas.height);

    // Configurar el estilo del texto
    ctx.font = '30px Arial'; // Tamaño de fuente ajustado
    ctx.textAlign = 'center';

    // Posición de inicio para el texto
    let startY = img.height + padding + 30;

    // Dibujar cada parte del mensaje con su color correspondiente
    mensaje.forEach((part, index) => {
      ctx.fillStyle = part.color; // Cambiar el color del texto
      ctx.fillText(part.text, canvas.width / 2, startY);
      startY += 30; // Incrementar la posición Y para la siguiente línea
    });

    // Convertir el canvas a una imagen base64
    const combinedImage = canvas.toDataURL('image/png');

    // Crear un archivo Blob con la imagen combinada
    const byteCharacters = atob(combinedImage.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/png' });
    const file = new File([blob], 'qr-code-with-message.png', { type: 'image/png' });

    // Detectar si es un dispositivo móvil o de escritorio
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);

    if (isMobile) {
      // Para dispositivos móviles, compartir la imagen combinada usando la API de compartir nativa
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({
          files: [file],
          title: 'Código QR con mensaje',
          text: mensaje.map(part => part.text).join(''),
        })
        .then(() => console.log('Compartido con éxito'))
        .catch((error) => console.log('Error al compartir', error));
      } else {
        alert('Tu navegador no soporta compartir archivos o texto.');
      }
    } else {
      // Para dispositivos de escritorio, abrir la imagen combinada en una nueva pestaña
      const imageUrl = URL.createObjectURL(blob);
      window.open(imageUrl, '_blank');
    }
  };

  img.onerror = () => {
    console.error('Error al cargar la imagen del QR');
    alert('Error al cargar la imagen del QR');
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
                  <FormControl fullWidth variant="outlined" className="custom-margin">
                    <InputLabel>Empresa</InputLabel>
                    <Select
                      labelId="empresa-select-label"
                      value={empresaId || ''}
                      onChange={handleEmpresaChange}
                      label="Empresa"
                      disabled={usuario.roleId !== superAdminRoleId}
                      sx={{
                        color: theme.palette.mode === 'dark' ? '#fff' : '#111',
                        '.MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.mode === 'dark' ? '#fff' : '#444',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.primary.main,
                        },
                        '.MuiSvgIcon-root': {
                          color: theme.palette.mode === 'dark' ? '#fff' : '#000',
                        },
                      }}
                    >
                      {empresas.map((empresa) => (
                        <MenuItem key={empresa._id} value={empresa._id} sx={{ color: 'black' }}>
                          {empresa.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth variant="outlined" className="custom-margin">
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
                  <Box display="flex" alignItems="center" className="custom-margin">
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
                  >
                    Generar QR
                  </Button>
                  {base64Image && (
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
              <Grid item xs={12} md={6} className="flex justify-center items-center">
                {base64Image && (
                  <Paper elevation={3} className="p-0 bg-white dark:bg-gray-800 rounded-md shadow-md flex justify-center items-center w-full h-full">
                    <img
                      src={`data:image/png;base64,${base64Image}`}
                      alt="Generated QR Code"
                      className="w-full h-full max-w-xs md:max-w-sm lg:max-w-md xl:max-w-lg"
                      style={{
                        width: '300%',
                        height: '50%',
                        maxWidth: '450px',
                      }}
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
