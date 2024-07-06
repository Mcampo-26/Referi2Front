import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useQrStore from '../store/UseQrStore';
import useUsuariosStore from '../store/useUsuariosStore';
import { Box, Typography, Paper, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Container, Button, TextField } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faCheckCircle, faCircle } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const StyledTableCell = ({ children, onClick, orderBy, column, orderDirection }) => {
  return (
    <TableCell onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
        {children} {orderBy === column && (orderDirection === 'asc' ? '▲' : '▼')}
      </Typography>
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
    const storedUserId = localStorage.getItem('userId'); // Obtén el userId del localStorage
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
      <Box className="w-full md:w-1/3 flex items-center mx-auto mb-4">
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar QRs por valor, nombre, teléfono o correo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ marginTop: '3rem' }}
        />
        {searchTerm && (
          <Button
            variant="contained"
            color="secondary"
            onClick={() => setSearchTerm('')}
            sx={{ marginLeft: '1rem', marginTop: '3rem' }}
          >
            Limpiar
          </Button>
        )}
      </Box>
      <Typography variant="h4" mb={4}>Mis QR Codes</Typography>
      {sortedQrs.length ? (
        <TableContainer component={Paper} style={{ marginTop: '2rem' }}>
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
                  <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                    Acciones
                  </Typography>
                </StyledTableCell>
                <StyledTableCell>
                  <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                    Estado
                  </Typography>
                </StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedQrs.map((qr) => {
                console.log(`QR ID: ${qr._id}, isUsed: ${qr.isUsed}`);
                return (
                  <TableRow key={qr._id}>
                    <TableCell>{qr.empresaId ? qr.empresaId.name : 'N/A'}</TableCell>
                    <TableCell>{qr.assignedTo ? qr.assignedTo.nombre : 'N/A'}</TableCell>
                    <TableCell>{qr.nombre}</TableCell>
                    <TableCell>{qr.telefono}</TableCell>
                    <TableCell>{qr.mail}</TableCell>
                    <TableCell>{qr.startTime}</TableCell>
                    <TableCell>{qr.endTime}</TableCell>
                    <TableCell>
                      {qr.base64Image && (
                        <img 
                          src={`data:image/png;base64,${qr.base64Image}`} 
                          alt="QR Code" 
                          style={{ width: 30, height: 30, marginRight: 8, cursor: 'pointer' }} 
                          onClick={() => handleQrClick(qr._id)}
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
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography>No hay QR Codes disponibles.</Typography>
      )}
    </Container>
  );
};
