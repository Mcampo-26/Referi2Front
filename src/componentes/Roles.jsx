import React, { useEffect, useState } from 'react';
import useRolesStore from '../store/useRolesStore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import withReactContent from "sweetalert2-react-content";
import {
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
  TableRow,
  Paper,
  CircularProgress,
  Typography,
  Container
} from '@mui/material';

const MySwal = withReactContent(Swal);

export const Roles = () => {
  const { roles, getAllRoles, loading, error, createRole, updateRole, deleteRole, totalPages } = useRolesStore();
  const [showModal, setShowModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    getAllRoles();
  }, [currentPage]);

  useEffect(() => {
    console.log('Roles en el estado:', roles);
  }, [roles]);

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  const handleCreate = () => {
    setNewRoleName('');
    setIsEditing(false);
    setEditingRoleId(null);
    toggleModal();
  };

  const handleEdit = (role) => {
    setNewRoleName(role.name);
    setIsEditing(true);
    setEditingRoleId(role._id);
    toggleModal();
  };

  const handleDelete = (_id) => {
    MySwal.fire({
      title: "¿Estás seguro de que deseas eliminar este rol?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteRole(_id)
          .then(() => {
            MySwal.fire({
              title: "¡Rol eliminado con éxito!",
              icon: "success",
              confirmButtonColor: "#3085d6",
              confirmButtonText: "Ok",
            });
            getAllRoles(); // Refrescar la lista de roles
          })
          .catch((error) => {
            MySwal.fire({
              icon: "error",
              title: "Error",
              text: "Hubo un error al eliminar el rol.",
            });
            console.error("Error al eliminar el rol:", error);
          });
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newRoleName.trim() !== '') {
      toggleModal(); // Cierra el modal antes de mostrar el SweetAlert

      setTimeout(async () => {
        try {
          MySwal.fire({
            title: "Guardando...",
            text: "Por favor espera mientras se guarda el rol.",
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            },
            customClass: {
              popup: 'z-50' // Clase Tailwind para ajustar el z-index
            },
            backdrop: `rgba(0,0,0,0.4)`
          });

          if (isEditing) {
            await updateRole({ roleId: editingRoleId, updatedRole: { name: newRoleName } });
          } else {
            await createRole({ name: newRoleName });
          }

          await getAllRoles();
          MySwal.close();
          MySwal.fire({
            icon: "success",
            title: "Roles actualizados",
            text: "Los roles se han actualizado correctamente.",
            customClass: {
              popup: 'z-50' // Clase Tailwind para ajustar el z-index
            },
            backdrop: `rgba(0,0,0,0.4)`
          });

        } catch (error) {
          MySwal.close();
          MySwal.fire({
            icon: "error",
            title: "Error",
            text: "Hubo un error al actualizar los roles.",
            customClass: {
              popup: 'z-50' // Clase Tailwind para ajustar el z-index
            },
            backdrop: `rgba(0,0,0,0.4)`
          });
          console.error("Error al actualizar los roles:", error);
        }
      }, 500); // Retraso de 500ms antes de mostrar el SweetAlert "Guardando..."
    } else {
      MySwal.fire({
        icon: "error",
        title: "Error",
        text: "El nombre del rol no puede estar vacío.",
        customClass: {
          popup: 'z-50' // Clase Tailwind para ajustar el z-index
        },
        backdrop: `rgba(0,0,0,0.4)`
      });
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <Container maxWidth="md">
      <div className="flex justify-between items-center mt-10 mb-6">
        <Typography variant="h4">Administración de roles</Typography>
        <Button variant="contained" color="primary" onClick={handleCreate}>
          + Agregar Rol
        </Button>
      </div>

      <Dialog open={showModal} onClose={toggleModal}>
        <DialogTitle>{isEditing ? 'Editar Rol' : 'Agregar Nuevo Rol'}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {isEditing ? 'Edita el nombre del rol.' : 'Ingresa el nombre del nuevo rol.'}
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Nombre"
            type="text"
            fullWidth
            value={newRoleName}
            onChange={(e) => setNewRoleName(e.target.value)}
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

      {loading ? (
        <div className="flex justify-center mt-4">
          <CircularProgress />
        </div>
      ) : error ? (
        <Typography color="error" align="center">
          Error al cargar datos: {error}
        </Typography>
      ) : roles && roles.length > 0 ? (
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
              {roles.map((role, index) => (
                <TableRow key={`${role._id}-${index}`}>
                  <TableCell>{role.name}</TableCell>
                  <TableCell align="right">
                    <FontAwesomeIcon
                      icon={faPenToSquare}
                      className="h-6 w-5 text-blue-400 hover:text-blue-700 cursor-pointer mr-4"
                      onClick={() => handleEdit(role)}
                    />
                    <FontAwesomeIcon
                      icon={faTrash}
                      className="h-4 w-4 text-red-600 hover:text-red-800 cursor-pointer"
                      onClick={() => handleDelete(role._id)}
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
      <div className="flex justify-between items-center mt-4">
        <Typography>
          Mostrando registros del {(currentPage - 1) * 10 + 1} al {Math.min(currentPage * 10, roles.length)} de un total de {roles.length} registros
        </Typography>
        <div>
          <Button variant="outlined" className="mr-2" onClick={handlePreviousPage} disabled={currentPage === 1}>Anterior</Button>
          <Button variant="outlined" onClick={handleNextPage} disabled={currentPage === totalPages}>Siguiente</Button>
        </div>
      </div>
    </Container>
  );
};
