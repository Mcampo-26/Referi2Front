import React, { useState, useEffect } from 'react';
import { Button, TextField, Container, Typography, Paper, Box, MenuItem, Select, InputLabel, FormControl, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import useServiciosStore from '../store/useServiciosStore';
import useEmpresasStore from '../store/useEmpresaStore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import withReactContent from "sweetalert2-react-content";
import { styled } from '@mui/system';

const MySwal = withReactContent(Swal);

const StyledBox = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[200],
  color: theme.palette.text.primary,
  transition: 'background-color 0.3s ease, color 0.3s ease'
}));

export const Servicios = () => {
  const [showModal, setShowModal] = useState(false);
  const [newServicioName, setNewServicioName] = useState('');
  const [empresaId, setEmpresaId] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingServicioId, setEditingServicioId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { servicios, getAllServicios, loading, error, createServicio, updateServicio, deleteServicio } = useServiciosStore();
  const { empresas, getAllEmpresas } = useEmpresasStore();

  useEffect(() => {
    getAllServicios();
    getAllEmpresas();
  }, []);

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  const handleCreate = () => {
    setNewServicioName('');
    setEmpresaId('');
    setIsEditing(false);
    setEditingServicioId(null);
    toggleModal();
  };

  const handleEdit = (servicio) => {
    setNewServicioName(servicio.name);
    setEmpresaId(servicio.empresaId);
    setIsEditing(true);
    setEditingServicioId(servicio._id);
    toggleModal();
  };

  const handleDelete = (_id) => {
    MySwal.fire({
      title: "¿Estás seguro de que deseas eliminar este servicio?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteServicio(_id)
          .then(() => {
            MySwal.fire({
              title: "¡Servicio eliminado con éxito!",
              icon: "success",
              confirmButtonColor: "#3085d6",
              confirmButtonText: "Ok",
            });
            getAllServicios();
          })
          .catch((error) => {
            MySwal.fire({
              icon: "error",
              title: "Error",
              text: "Hubo un error al eliminar el servicio.",
            });
            console.error("Error al eliminar el servicio:", error);
          });
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newServicioName.trim() !== '' && empresaId.trim() !== '') {
      toggleModal();
      setTimeout(async () => {
        try {
          MySwal.fire({
            title: "Guardando...",
            text: "Por favor espera mientras se guarda el servicio.",
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            },
            customClass: {
              popup: 'z-50'
            },
            backdrop: `rgba(0,0,0,0.4)`
          });

          if (isEditing) {
            await updateServicio({ servicioId: editingServicioId, updatedServicio: { name: newServicioName, empresaId } });
          } else {
            await createServicio({ name: newServicioName, empresaId });
          }

          await getAllServicios();
          MySwal.close();
          MySwal.fire({
            icon: "success",
            title: "Servicios actualizados",
            text: "Los servicios se han actualizado correctamente.",
            customClass: {
              popup: 'z-50'
            },
            backdrop: `rgba(0,0,0,0.4)`
          });

        } catch (error) {
          MySwal.close();
          MySwal.fire({
            icon: "error",
            title: "Error",
            text: "Hubo un error al actualizar los servicios.",
            customClass: {
              popup: 'z-50'
            },
            backdrop: `rgba(0,0,0,0.4)`
          });
          console.error("Error al actualizar los servicios:", error);
        }
      }, 500);
    } else {
      MySwal.fire({
        icon: "error",
        title: "Error",
        text: "El nombre del servicio y la empresa no pueden estar vacíos.",
        customClass: {
          popup: 'z-50'
        },
        backdrop: `rgba(0,0,0,0.4)`
      });
    }
  };

  const filteredServicios = servicios.filter(servicio =>
    servicio.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container maxWidth="md">
      <Box display="flex" justifyContent="center" alignItems="center" mt={4}>
        <Typography variant="h4" mb={4}>Administración de ervicios</Typography>
      </Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4} mt={2} flexWrap="wrap">
        <Box display="flex" alignItems="center" mt={{ xs: 2, sm: 0 }}>
          <TextField
            variant="outlined"
            placeholder="Buscar Servicios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              width: { xs: '100%', sm: '300px' },
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'white',
                },
                '&:hover fieldset': {
                  borderColor: 'white',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'white',
                },
              },
              '& .MuiInputBase-input': {
                color: 'white',
              },
              '& .MuiInputLabel-root': {
                color: 'white',
              },
            }}
          />
          {searchTerm && (
            <Button variant="contained" color="secondary" onClick={() => setSearchTerm('')} sx={{ ml: 1 }}>
              Limpiar
            </Button>
          )}
        </Box>
        <Button variant="contained" color="primary" onClick={handleCreate}>
          + Agregar Producto y/o Servicios
          
        </Button>
      </Box>

      <Dialog open={showModal} onClose={toggleModal}>
      <DialogTitle>{isEditing ? 'Editar Producto y/o Servicio' : 'Agregar Nuevo Producto y/o Servicio'}</DialogTitle>

        <DialogContent>
        <DialogContentText>
  {isEditing ? 'Edita el nombre del producto y/o servicio y selecciona la empresa.' : 'Ingresa el nombre del nuevo producto y/o servicio y selecciona la empresa.'}
</DialogContentText>

          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Nombre"
            type="text"
            fullWidth
            value={newServicioName}
            onChange={(e) => setNewServicioName(e.target.value)}
          />
          <FormControl fullWidth margin="normal" variant="outlined">
            <InputLabel>Empresa</InputLabel>
            <Select
              value={empresaId}
              onChange={(e) => setEmpresaId(e.target.value)}
              label="Empresa"
            >
              {empresas.map((empresa) => (
                <MenuItem key={empresa._id} value={empresa._id}>
                  {empresa.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={toggleModal} color="secondary">
            Cerrar
          </Button>
          <Button onClick={handleSubmit} color="primary">
            {isEditing ? 'Guardar Cambios' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>

      {loading ? (
        <div className="flex justify-center mt-4">
          <CircularProgress />
        </div>
      ) : error ? (
        <Typography color="error" align="center">
          Error al cargar datos: {error}
        </Typography>
      ) : filteredServicios && filteredServicios.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="center">
                  <Typography variant="h7" component="div" sx={{ fontWeight: 'bold' }}>
                    Nombre
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="h7" component="div" sx={{ fontWeight: 'bold' }}>
                    Empresa
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="h7" component="div" sx={{ fontWeight: 'bold' }}>
                    Acciones
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredServicios.map((servicio, index) => (
                <TableRow key={`${servicio._id}-${index}`}>
                  <TableCell>{servicio.name}</TableCell>
                  <TableCell>{empresas.find(e => e._id === servicio.empresaId)?.name}</TableCell>
                  <TableCell align="right">
                    <FontAwesomeIcon
                      icon={faPenToSquare}
                      className="h-6 w-5 text-blue-400 hover:text-blue-700 cursor-pointer mr-4"
                      onClick={() => handleEdit(servicio)}
                    />
                    <FontAwesomeIcon
                      icon={faTrash}
                      className="h-4 w-4 text-red-600 hover:text-red-800 cursor-pointer"
                      onClick={() => handleDelete(servicio._id)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography align="center">
          Ningún dato disponible en esta tabla
        </Typography>
      )}
    </Container>
  );
};
