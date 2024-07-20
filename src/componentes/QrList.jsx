import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useQrStore from '../store/UseQrStore';
import useUsuariosStore from '../store/useUsuariosStore';
import {
  Box, Typography, CircularProgress, IconButton, Container, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Avatar, Button, Collapse, useTheme
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faCheckCircle, faCircle, faChevronDown, faChevronUp, faFilePdf } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import 'tailwindcss/tailwind.css'; // Asegúrate de tener Tailwind CSS configurado correctamente

const MySwal = withReactContent(Swal);

const StyledTableCell = ({ children, onClick, orderBy, column, orderDirection, className }) => {
  return (
    <TableCell
      onClick={onClick}
      className={`${className} cursor-pointer font-bold`}
      style={{ cursor: onClick ? 'pointer' : 'default', fontSize: '1rem' }}
    >
      <Typography variant="subtitle1" component="div" sx={{ fontWeight: 'bold' }}>
        {children} {orderBy === column && (orderDirection === 'asc' ? '▲' : '▼')}
      </Typography>
    </TableCell>
  );
};

const UpdateRow = ({ update, index, theme }) => {
  return (
    <TableRow>
      <TableCell>{index + 1}</TableCell>
      <TableCell>{new Date(update.updatedAt).toLocaleString()}</TableCell>
      <TableCell>{update.service?.name || 'N/A'}</TableCell>
      <TableCell>{update.details}</TableCell>
    </TableRow>
  );
};

export const QrList = () => {
  const theme = useTheme();
  const { qrs, getQrsByAssignedUser, deleteQr, loading, error } = useQrStore();
  const { userId } = useUsuariosStore();
  const [orderBy, setOrderBy] = useState('value');
  const [orderDirection, setOrderDirection] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [openRow, setOpenRow] = useState(null);
  const navigate = useNavigate();

  // Obtén los QR asignados al usuario al montar el componente
  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      console.log("Fetching QRs for user:", storedUserId);
      getQrsByAssignedUser(storedUserId);
    }
  }, [getQrsByAssignedUser]);

  // Función para manejar la ordenación de las columnas
  const handleSort = (column) => {
    if (column === orderBy) {
      setOrderDirection(orderDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setOrderBy(column);
      setOrderDirection('asc');
    }
  };

  // Función para manejar la eliminación de un QR
  const handleDelete = (id) => {
    MySwal.fire({
      title: "¿Estás seguro de que deseas eliminar este QR?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteQr(id)
          .then(() => {
            MySwal.fire({
              title: "¡QR eliminado con éxito!",
              icon: "success",
              confirmButtonColor: "#3085d6",
              confirmButtonText: "Ok",
            });
          })
          .catch((error) => {
            MySwal.fire({
              icon: "error",
              title: "Error",
              text: "Hubo un error al eliminar el QR.",
            });
            console.error("Error al eliminar el QR:", error);
          });
      }
    });
  };

  // Función para manejar el click en un QR
  const handleQrClick = (id) => {
    navigate(`/QrDetails/${id}`);
  };

  // Función para manejar la expansión de las filas de actualizaciones
  const handleRowClick = (id) => {
    setOpenRow(openRow === id ? null : id);
  };

  // Función para generar un PDF del QR
  const handleGeneratePdf = (qr) => {
    navigate('/pdfs', { state: { qr } });
  };

  // Filtrar y ordenar los QR según los términos de búsqueda y la ordenación
  const filteredQrs = qrs.filter((qr) =>
    qr &&
    (
      qr.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
      qr.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      qr.telefono.toLowerCase().includes(searchTerm.toLowerCase()) ||
      qr.mail.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const sortedQrs = filteredQrs.sort((a, b) => {
    const aValue = a[orderBy];
    const bValue = b[orderBy];

    if (aValue < bValue) return orderDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return orderDirection === 'asc' ? 1 : -1;
    return 0;
  });

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography variant="h6" color="error">{error}</Typography>;
  }

  return (
    <Container>
      <Box display="flex" justifyContent="center" alignItems="center" mt={4}>
        <Typography variant="h4" mb={4} className="text-center">Mis QR Codes</Typography>
      </Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4} mt={2} flexWrap="wrap">
        <Box display="flex" alignItems="center" mt={{ xs: 2, sm: 0 }}>
          <TextField
            variant="outlined"
            placeholder="Buscar QRs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              width: { xs: '100%', sm: '300px' },
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: theme.palette.mode === 'dark' ? 'white' : 'black',
                },
                '&:hover fieldset': {
                  borderColor: theme.palette.mode === 'dark' ? 'white' : 'black',
                },
                '&.Mui-focused fieldset': {
                  borderColor: theme.palette.mode === 'dark' ? 'white' : 'black',
                },
              },
              '& .MuiInputBase-input': {
                color: theme.palette.mode === 'dark' ? 'white' : 'black',
              },
              '& .MuiInputLabel-root': {
                color: theme.palette.mode === 'dark' ? 'white' : 'black',
              },
            }}
          />
          {searchTerm && (
            <Button variant="contained" color="secondary" onClick={() => setSearchTerm('')} sx={{ ml: 1 }}>
              Limpiar
            </Button>
          )}
        </Box>
      </Box>
      {sortedQrs.length ? (
        <TableContainer component={Paper} className={`shadow-lg rounded-lg overflow-hidden border ${theme.palette.mode === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
          <Table>
            <TableHead className={`${theme.palette.mode === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-200'}`}>
              <TableRow>
                <TableCell className={`${theme.palette.mode === 'dark' ? 'text-white' : 'text-black'}`}>
                  <Typography variant="subtitle1" component="div" sx={{ fontWeight: 'bold' }}>
                    N°
                  </Typography>
                </TableCell>
                <StyledTableCell onClick={() => handleSort('empresaId.name')} orderBy={orderBy} column="empresaId.name" orderDirection={orderDirection} className={`${theme.palette.mode === 'dark' ? 'text-white' : 'text-black'}`}>
                  Empresa
                </StyledTableCell>
                <StyledTableCell onClick={() => handleSort('assignedTo.nombre')} orderBy={orderBy} column="assignedTo.nombre" orderDirection={orderDirection} className={`${theme.palette.mode === 'dark' ? 'text-white' : 'text-black'}`}>
                  Usuario Asignado
                </StyledTableCell>
                <StyledTableCell onClick={() => handleSort('nombre')} orderBy={orderBy} column="nombre" orderDirection={orderDirection} className={`${theme.palette.mode === 'dark' ? 'text-white' : 'text-black'}`}>
                  Nombre
                </StyledTableCell>
                <StyledTableCell onClick={() => handleSort('telefono')} orderBy={orderBy} column="telefono" orderDirection={orderDirection} className={`${theme.palette.mode === 'dark' ? 'text-white' : 'text-black'}`}>
                  Teléfono
                </StyledTableCell>
                <StyledTableCell onClick={() => handleSort('mail')} orderBy={orderBy} column="mail" orderDirection={orderDirection} className={`${theme.palette.mode === 'dark' ? 'text-white' : 'text-black'}`}>
                  Correo
                </StyledTableCell>
                <StyledTableCell onClick={() => handleSort('startTime')} orderBy={orderBy} column="startTime" orderDirection={orderDirection} className={`${theme.palette.mode === 'dark' ? 'text-white' : 'text-black'}`}>
                  Hora de Inicio
                </StyledTableCell>
                <StyledTableCell onClick={() => handleSort('endTime')} orderBy={orderBy} column="endTime" orderDirection={orderDirection} className={`${theme.palette.mode === 'dark' ? 'text-white' : 'text-black'}`}>
                  Hora de Fin
                </StyledTableCell>
                <TableCell className={`${theme.palette.mode === 'dark' ? 'text-white' : 'text-black'}`}>
                  <Typography variant="subtitle1" component="div" sx={{ fontWeight: 'bold' }}>
                    Acciones
                  </Typography>
                </TableCell>
                <TableCell className={`${theme.palette.mode === 'dark' ? 'text-white' : 'text-black'}`}>
                  <Typography variant="subtitle1" component="div" sx={{ fontWeight: 'bold' }}>
                    Estado
                  </Typography>
                </TableCell>
                <TableCell className={`${theme.palette.mode === 'dark' ? 'text-white' : 'text-black'}`}>
                  <Typography variant="subtitle1" component="div" sx={{ fontWeight: 'bold' }}>
                    Actualizaciones
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedQrs.map((qr, index) => (
                <React.Fragment key={qr._id}>
                  <TableRow className={`${theme.palette.mode === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{qr.empresaId ? qr.empresaId.name : 'N/A'}</TableCell>
                    <TableCell>{qr.assignedTo ? qr.assignedTo.nombre : 'N/A'}</TableCell>
                    <TableCell>{qr.nombre}</TableCell>
                    <TableCell>{qr.telefono}</TableCell>
                    <TableCell>{qr.mail}</TableCell>
                    <TableCell>{qr.startTime}</TableCell>
                    <TableCell>{qr.endTime}</TableCell>
                    <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
                      {qr.base64Image && (
                        <Avatar 
                          src={`data:image/png;base64,${qr.base64Image}`} 
                          alt="QR Code" 
                          sx={{ width: 30, height: 30, marginRight: 2, cursor: 'pointer' }} 
                          onClick={() => handleQrClick(qr._id)}
                          variant="square"
                        />
                      )}
                      <IconButton
                        color="secondary"
                        onClick={() => handleDelete(qr._id)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </IconButton>
                      {qr.isUsed && (
                        <IconButton
                          color="primary"
                          onClick={() => handleGeneratePdf(qr)}
                        >
                          <FontAwesomeIcon icon={faFilePdf} />
                        </IconButton>
                      )}
                    </TableCell>
                    <TableCell>
                      <FontAwesomeIcon
                        icon={qr.isUsed ? faCheckCircle : faCircle}
                        color={qr.isUsed ? 'red' : 'green'}
                      />
                    </TableCell>
                    <TableCell>
                      {(qr.isUsed || (qr.updates && qr.updates.length > 0)) && (
                        <IconButton
                          color="secondary"
                          onClick={() => handleRowClick(qr._id)}
                        >
                          <FontAwesomeIcon icon={openRow === qr._id ? faChevronUp : faChevronDown} />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                  {(qr.isUsed || (qr.updates && qr.updates.length > 0)) && (
                    <TableRow>
                      <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={11}>
                        <Collapse in={openRow === qr._id} timeout="auto" unmountOnExit>
                          <Box margin={1} className={`p-4 border ${theme.palette.mode === 'dark' ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'} rounded-lg shadow-inner`}>
                            <Typography variant="h6" gutterBottom component="div">
                              Actualizaciones
                            </Typography>
                            <Table size="small" aria-label="updates">
                              <TableHead>
                                <TableRow>
                                  <TableCell>N°</TableCell>
                                  <TableCell>Fecha</TableCell>
                                  <TableCell>Servicio</TableCell>
                                  <TableCell>Detalles</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {qr.updates.map((update, idx) => (
                                  <UpdateRow key={update._id} update={update} index={idx} theme={theme} />
                                ))}
                              </TableBody>
                            </Table>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography>No hay QR Codes disponibles.</Typography>
      )}
    </Container>
  );
};
