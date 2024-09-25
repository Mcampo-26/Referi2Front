import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; 
import useRolesStore from "../store/useRolesStore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
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
  useTheme,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Typography,
  Container,
  Box,
} from "@mui/material";

const MySwal = withReactContent(Swal);

export const Roles = () => {
  const {
    roles,
    getRolesByEmpresa, 
    getRolesByUser,
    loading,
    error,
    getAllRoles,
    createRole,
    updateRole,
    deleteRole,
    totalPages,
  } = useRolesStore();

  const [showModal, setShowModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const theme = useTheme();

  // Asegúrate de obtener correctamente el rol desde el localStorage
  const userRole = localStorage.getItem("roleName"); // Aquí debería obtener el nombre del rol
  const empresaId = localStorage.getItem("empresaId");

  const navigate = useNavigate();

  useEffect(() => {
    const empresaId = localStorage.getItem('empresaId');
    if (empresaId) {
      getRolesByEmpresa(empresaId);
    } else {
      console.error("No se encontró empresaId en localStorage");
    }
  }, [getRolesByEmpresa]);
  
  useEffect(() => {
    // Llamar a getRolesByUser con el empresaId y userRole
    if (userRole) {
      getRolesByUser(empresaId, userRole);
    } else {
      console.error("userRole no está definido o no se obtuvo correctamente del localStorage.");
    }
  }, [empresaId, userRole, getRolesByUser]);

  // Observa cambios en roles y mostrarlos en la consola
  useEffect(() => {
    console.log("Roles para renderizar:", roles);
  }, [roles]);

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  const handleCreate = () => {
    setNewRoleName("");
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
            getRolesByEmpresa(localStorage.getItem("empresaId")); // Refrescar la lista de roles
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

  const handleRowClick = (roleId) => {
    // Navegar a RolesDetails pasando el ID del rol
    navigate(`/rolesDetails/${roleId}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const empresaId = localStorage.getItem('empresaId');
    const roleName = localStorage.getItem('roleName'); // Obtener el rol desde localStorage
  
    // Permitir creación sin empresaId si el rol es SuperAdmin
    if (!empresaId && roleName !== 'SuperAdmin') {
      MySwal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El ID de la empresa es requerido para crear un rol.',
      });
      return;
    }
  
    if (newRoleName.trim() !== "") {
      toggleModal();
  
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
              popup: "z-50",
            },
            backdrop: `rgba(0,0,0,0.4)`,
          });
  
          if (isEditing) {
            // Si estamos editando, solo enviamos el nombre del rol
            await updateRole({
              roleId: editingRoleId,
              updatedRole: { name: newRoleName },
            });
          } else {
            // Si estamos creando un nuevo rol
            const roleData = { name: newRoleName };
  
            // Añadir empresaId solo si el usuario no es SuperAdmin
            if (roleName !== 'SuperAdmin') {
              roleData.empresaId = empresaId;
            }
  
            await createRole(roleData);
          }
  
          // Si no es SuperAdmin, refrescar roles por empresa, de lo contrario refrescar todos los roles
          if (roleName !== 'SuperAdmin') {
            await getRolesByEmpresa(empresaId); // Refrescar roles después de la creación
          } else {
            await getAllRoles(); // SuperAdmin puede ver todos los roles, refrescar lista general
          }
  
          MySwal.close();
          MySwal.fire({
            icon: "success",
            title: "Roles actualizados",
            text: "Los roles se han actualizado correctamente.",
            customClass: {
              popup: "z-50",
            },
            backdrop: `rgba(0,0,0,0.4)`,
          });
        } catch (error) {
          MySwal.close();
          MySwal.fire({
            icon: "error",
            title: "Error",
            text: "Hubo un error al actualizar los roles.",
            customClass: {
              popup: "z-50",
            },
            backdrop: `rgba(0,0,0,0.4)`,
          });
          console.error("Error al actualizar los roles:", error);
        }
      }, 500);
    } else {
      MySwal.fire({
        icon: "error",
        title: "Error",
        text: "El nombre del rol no puede estar vacío.",
        customClass: {
          popup: "z-50",
        },
        backdrop: `rgba(0,0,0,0.4)`,
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

  const filteredRoles = Array.isArray(roles) 
    ? roles.filter((role) =>
        role?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <Container maxWidth="md">
      <Box display="flex" justifyContent="center" alignItems="center" mt={4}>
        <Typography variant="h4" mb={4}>
          Administración de roles
        </Typography>
      </Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
        mt={2}
        flexWrap="wrap"
      >
        <Box display="flex" alignItems="center" mt={{ xs: 2, sm: 0 }}>
          <TextField
            variant="outlined"
            placeholder="Buscar Roles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              width: { xs: "100%", sm: "300px" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "white",
                },
                "&:hover fieldset": {
                  borderColor: "white",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "white",
                },
              },
              "& .MuiInputBase-input": {
                color: "white",
              },
              "& .MuiInputLabel-root": {
                color: "white",
              },
            }}
          />
          {searchTerm && (
            <Button
              variant="contained"
              color="secondary"
              onClick={() => setSearchTerm("")}
              sx={{ ml: 1 }}
            >
              Limpiar
            </Button>
          )}
        </Box>
        <Button variant="contained" color="primary" onClick={handleCreate}>
          + Agregar Rol
        </Button>
      </Box>

      <Dialog open={showModal} onClose={toggleModal}>
        <DialogTitle>
          {isEditing ? "Editar Rol" : "Agregar Nuevo Rol"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {isEditing
              ? "Edita el nombre del rol."
              : "Ingresa el nombre del nuevo rol."}
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
            {isEditing ? "Guardar Cambios" : "Guardar"}
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
      ) : filteredRoles.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="center">
                  <Typography
                    variant="h7"
                    component="div"
                    sx={{ fontWeight: "bold" }}
                  >
                    Nombre
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography
                    variant="h7"
                    component="div"
                    sx={{ fontWeight: "bold" }}
                  >
                    Acciones
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRoles.map((role, index) => (
                <TableRow key={`${role._id}-${index}`} onClick={() => handleRowClick(role._id)} style={{ cursor: 'pointer' }}>
                  <TableCell>{role.name}</TableCell>
                  <TableCell align="right">
                    <FontAwesomeIcon
                      icon={faPenToSquare}
                      className="h-6 w-5 text-blue-400 hover:text-blue-700 cursor-pointer mr-4"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(role);
                      }}
                    />
                    <FontAwesomeIcon
                      icon={faTrash}
                      className="h-4 w-4 text-red-600 hover:text-red-800 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(role._id);
                      }}
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
          Mostrando registros del {(currentPage - 1) * 10 + 1} al{" "}
          {Math.min(currentPage * 10, roles.length)} de un total de{" "}
          {roles.length} registros
        </Typography>
        <div>
          <Button
            variant="contained"
            color="primary"
            className="mr-2"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            sx={{
              backgroundColor:
                currentPage === 1
                  ? theme.palette.grey[500]
                  : theme.palette.primary.main,
              color:
                currentPage === 1
                  ? theme.palette.grey[300]
                  : theme.palette.primary.contrastText,
            }}
          >
            Anterior
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </Container>
  );
};
