import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useEmpresasStore from '../store/useEmpresaStore';
import useServiciosStore from '../store/useServiciosStore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import withReactContent from "sweetalert2-react-content";
import {
  Box,
  Container,
  Grid,
  Typography,
  Paper,
  CircularProgress,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';

const MySwal = withReactContent(Swal);

export const EmpresaDetails = () => {
  const { id } = useParams();
  const { empresa, getEmpresaById, loading, error } = useEmpresasStore((state) => ({
    empresa: state.empresa,
    getEmpresaById: state.getEmpresaById,
    loading: state.loading,
    error: state.error,
  }));

  const { servicios, getServiciosByEmpresaId, createServicio, updateServicio, deleteServicio } = useServiciosStore((state) => ({
    servicios: state.servicios,
    getServiciosByEmpresaId: state.getServiciosByEmpresaId,
    createServicio: state.createServicio,
    updateServicio: state.updateServicio,
    deleteServicio: state.deleteServicio,
  }));

  const [showModal, setShowModal] = useState(false);
  const [newServicioName, setNewServicioName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingServicioId, setEditingServicioId] = useState(null);

  useEffect(() => {
    getEmpresaById(id);
    getServiciosByEmpresaId(id);
  }, [id, getEmpresaById, getServiciosByEmpresaId]);

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  const handleCreate = () => {
    setNewServicioName('');
    setIsEditing(false);
    setEditingServicioId(null);
    toggleModal();
  };

  const handleEdit = (servicio) => {
    setNewServicioName(servicio.name);
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
            getServiciosByEmpresaId(id);
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
    if (newServicioName.trim() !== '') {
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
            await updateServicio({ servicioId: editingServicioId, updatedServicio: { name: newServicioName, empresaId: id } });
          } else {
            await createServicio({ name: newServicioName, empresaId: id });
          }

          await getServiciosByEmpresaId(id);
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
        text: "El nombre del servicio no puede estar vacío.",
        customClass: {
          popup: 'z-50'
        },
        backdrop: `rgba(0,0,0,0.4)`
      });
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography variant="h6" color="error">{error}</Typography>;
  }

  if (!empresa) {
    return <Typography variant="h6">Empresa no encontrada</Typography>;
  }

  return (
    <Container>
      <Box display="flex" flexDirection="column" alignItems="center" mt={8}>
        <Typography variant="h3" mt={4} mb={6}component="h1" textAlign="center" gutterBottom>
          Detalles de la Empresa
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 2, borderRadius: 1, mt: -2 }}>
              <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                Nombre: {empresa.name}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
        <Box mt={4} width="100%">
          <Typography variant="h5" gutterBottom>
            Servicios
          </Typography>
          <Button variant="contained" color="primary" onClick={handleCreate}>
            + Agregar Servicio
          </Button>
          <Paper elevation={3} sx={{ p: 2, borderRadius: 1, mt: 2 }}>
            {servicios && servicios.length > 0 ? (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell align="center">
                        <Typography variant="h7" component="div" sx={{ fontWeight: 'bold' }}>
                          Nombre
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
                    {servicios.map((servicio, index) => (
                      <TableRow key={`${servicio._id}-${index}`}>
                        <TableCell>{servicio.name}</TableCell>
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
          </Paper>
        </Box>
      </Box>

      <Dialog open={showModal} onClose={toggleModal}>
        <DialogTitle>{isEditing ? 'Editar Servicio' : 'Agregar Nuevo Servicio'}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {isEditing ? 'Edita el nombre del servicio.' : 'Ingresa el nombre del nuevo servicio.'}
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
    </Container>
  );
};
