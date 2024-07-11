import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useQrStore from '../store/UseQrStore';
import useUsuariosStore from '../store/useUsuariosStore';
import {
  Box, Typography, CircularProgress, IconButton, Container, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Avatar, Button
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faCheckCircle, faCircle } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const StyledTableCell = ({ children, onClick, orderBy, column, orderDirection }) => {
  return (
    <TableCell onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default', fontWeight: 'bold' }}>
      {children} {orderBy === column && (orderDirection === 'asc' ? '▲' : '▼')}
    </TableCell>
  );
};

export const QrList = () => {
  const { qrs, getQrsByAssignedUser, deleteQr, loading, error } = useQrStore();
  const { userId } = useUsuariosStore();
  const [orderBy, setOrderBy] = useState('value');
  const [orderDirection, setOrderDirection] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      console.log("Fetching QRs for user:", storedUserId);
      getQrsByAssignedUser(storedUserId);
    }
  }, [getQrsByAssignedUser]);

  const handleSort = (column) => {
    if (column === orderBy) {
      setOrderDirection(orderDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setOrderBy(column);
      setOrderDirection('asc');
    }
  };

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

  const handleQrClick = (id) => {
    navigate(`/QrDetails/${id}`);
  };

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
        <Typography variant="h4" mb={4}>Mis QR Codes</Typography>
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
                  borderColor: 'white', // Cambia el color del borde
                },
                '&:hover fieldset': {
                  borderColor: 'white', // Cambia el color del borde al pasar el mouse
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'white', // Cambia el color del borde cuando está enfocado
                },
              },
              '& .MuiInputBase-input': {
                color: 'white', // Cambia el color del texto del input
              },
              '& .MuiInputLabel-root': {
                color: 'white', // Cambia el color del placeholder
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
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <StyledTableCell onClick={() => handleSort('empresaId.name')} orderBy={orderBy} column="empresaId.name" orderDirection={orderDirection}>
                  Empresa
                </StyledTableCell>
                <StyledTableCell onClick={() => handleSort('assignedTo.nombre')} orderBy={orderBy} column="assignedTo.nombre" orderDirection={orderDirection}>
                  Usuario Asignado
                </StyledTableCell>
                <StyledTableCell onClick={() => handleSort('nombre')} orderBy={orderBy} column="nombre" orderDirection={orderDirection}>
                  Nombre
                </StyledTableCell>
                <StyledTableCell onClick={() => handleSort('telefono')} orderBy={orderBy} column="telefono" orderDirection={orderDirection}>
                  Teléfono
                </StyledTableCell>
                <StyledTableCell onClick={() => handleSort('mail')} orderBy={orderBy} column="mail" orderDirection={orderDirection}>
                  Correo
                </StyledTableCell>
                <StyledTableCell onClick={() => handleSort('startTime')} orderBy={orderBy} column="startTime" orderDirection={orderDirection}>
                  Hora de Inicio
                </StyledTableCell>
                <StyledTableCell onClick={() => handleSort('endTime')} orderBy={orderBy} column="endTime" orderDirection={orderDirection}>
                  Hora de Fin
                </StyledTableCell>
                <StyledTableCell>
                  Acciones
                </StyledTableCell>
                <StyledTableCell>
                  Estado
                </StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedQrs.map((qr) => (
                <TableRow key={qr._id}>
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
                        variant="square" // Añadido para que el Avatar se vea cuadrado
                      />
                    )}
                    <IconButton
                      color="secondary"
                      onClick={() => handleDelete(qr._id)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </IconButton>
                  </TableCell>
                  <TableCell>
                    <FontAwesomeIcon
                      icon={qr.isUsed ? faCheckCircle : faCircle}
                      color={qr.isUsed ? 'red' : 'green'}
                    />
                  </TableCell>
                </TableRow>
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
