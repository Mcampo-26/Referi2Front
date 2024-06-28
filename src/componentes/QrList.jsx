import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import useQrStore from "../store/UseQrStore";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import {
  Container,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  IconButton,
  CircularProgress
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

export const QrList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { getQrs, qrs, loading, deleteQr } = useQrStore();
  const [orderBy, setOrderBy] = useState('nombre');
  const [orderDirection, setOrderDirection] = useState('asc');
  const theme = useTheme();

  useEffect(() => {
    getQrs();
  }, []);

  const handleSort = (column) => {
    if (column === orderBy) {
      setOrderDirection(orderDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setOrderBy(column);
      setOrderDirection('asc');
    }
  };

  const handleDelete = (_id) => {
    Swal.fire({
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
        Swal.fire({
          title: "Eliminando QR, aguarde por favor...",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        setTimeout(() => {
          deleteQr(_id)
            .then(() => {
              Swal.close();
              Swal.fire({
                title: "¡QR eliminado con éxito!",
                icon: "success",
                confirmButtonColor: "#3085d6",
                confirmButtonText: "Ok",
              });
            })
            .catch((error) => {
              Swal.close();
              Swal.fire({
                title: "Error",
                text: "Hubo un problema al eliminar el QR.",
                icon: "error",
                confirmButtonColor: "#d33",
                confirmButtonText: "Ok",
              });
              console.error("Error al eliminar el QR:", error);
            });
        }, 800);
      }
    });
  };

  const handleClear = () => {
    setSearchTerm('');
  };

  const filteredQrs = qrs.filter((qr) =>
    qr &&
    qr.nombre &&
    (
      qr.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      qr._id.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const sortedQrs = filteredQrs.sort((a, b) => {
    const aValue = a[orderBy];
    const bValue = b[orderBy];

    if (aValue < bValue) return orderDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return orderDirection === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <Container>
      <Box className="w-full md:w-1/3 flex items-center mx-auto mb-4">
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar QRs por nombre o ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputLabelProps={{ style: { color: theme.palette.text.primary } }}
          InputProps={{
            style: {
              color: theme.palette.text.primary,
              backgroundColor: theme.palette.background.paper,
            },
          }}
          sx={{ marginTop: '1.5rem', bgcolor: theme.palette.background.default }}
        />
        <Button
          variant="contained"
          color="secondary"
          onClick={handleClear}
          sx={{ marginLeft: '1rem', marginTop: '1.5rem' }}
        >
          Limpiar
        </Button>
      </Box>

      <Typography variant="h4" component="h1" sx={{ mt: 5, color: theme.palette.text.primary }} gutterBottom>
        Lista de QRs
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : sortedQrs.length ? (
        <TableContainer component={Paper} sx={{ marginTop: '2rem', bgcolor: theme.palette.background.default }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell onClick={() => handleSort('nombre')} sx={{ cursor: 'pointer', color: theme.palette.text.primary }}>
                  Nombre {orderBy === 'nombre' && (orderDirection === 'asc' ? '▲' : '▼')}
                </TableCell>
                <TableCell onClick={() => handleSort('telefono')} sx={{ cursor: 'pointer', color: theme.palette.text.primary }}>
                  Teléfono {orderBy === 'telefono' && (orderDirection === 'asc' ? '▲' : '▼')}
                </TableCell>
                <TableCell onClick={() => handleSort('mail')} sx={{ cursor: 'pointer', color: theme.palette.text.primary }}>
                  Correo {orderBy === 'mail' && (orderDirection === 'asc' ? '▲' : '▼')}
                </TableCell>
                <TableCell onClick={() => handleSort('startTime')} sx={{ cursor: 'pointer', color: theme.palette.text.primary }}>
                  Hora de inicio {orderBy === 'startTime' && (orderDirection === 'asc' ? '▲' : '▼')}
                </TableCell>
                <TableCell onClick={() => handleSort('endTime')} sx={{ cursor: 'pointer', color: theme.palette.text.primary }}>
                  Hora de fin {orderBy === 'endTime' && (orderDirection === 'asc' ? '▲' : '▼')}
                </TableCell>
                <TableCell sx={{ color: theme.palette.text.primary }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedQrs.map((qr, index) => (
                <TableRow key={qr._id || index}>
                  <TableCell sx={{ color: theme.palette.text.primary }}>{qr.nombre}</TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary }}>{qr.telefono}</TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary }}>{qr.mail}</TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary }}>{qr.startTime}</TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary }}>{qr.endTime}</TableCell>
                  <TableCell>
                    <IconButton
                      color="secondary"
                      onClick={() => handleDelete(qr._id)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography sx={{ color: theme.palette.text.primary }}>No hay QRs disponibles.</Typography>
      )}
    </Container>
  );
};
