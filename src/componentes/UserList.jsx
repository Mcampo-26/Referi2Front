import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import withReactContent from "sweetalert2-react-content";
import { EditUserModal } from "./EditUserModal";
import useUsuariosStore from "../store/useUsuariosStore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPenToSquare } from "@fortawesome/free-solid-svg-icons";
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
  CircularProgress,
  Box,
  useTheme,
} from "@mui/material";

const MySwal = withReactContent(Swal);

const StyledTableCell = ({
  children,
  onClick,
  orderBy,
  column,
  orderDirection,
}) => {
  return (
    <TableCell
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      <Typography variant="h6" component="div" sx={{ fontWeight: "bold" }}>
        {children}{" "}
        {orderBy === column && (orderDirection === "asc" ? "▲" : "▼")}
      </Typography>
    </TableCell>
  );
};

export const UserList = () => {
  const [orderBy, setOrderBy] = useState("nombre");
  const [orderDirection, setOrderDirection] = useState("asc");
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editedUser, setEditedUser] = useState(null);

  // Obtén role, empresaId, y empresaName directamente de localStorage
  const role = localStorage.getItem("role");
  const empresaId = localStorage.getItem("empresaId");
  const empresaName = localStorage.getItem("empresaName");

  const {
    getUsuarios,
    getUsuariosByEmpresa,
    usuarios,
    loading: loadingUsuarios,
    deleteUsuario,
    totalRecords,
    totalPages,
    currentPage,
  } = useUsuariosStore();
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    if (role === "SuperAdmin") {
      // Si es SuperAdmin, obtener todos los usuarios
      getUsuarios(currentPage);
    } else if (role === "Admin" && empresaId) {
      // Si es Admin y tiene empresa, obtener solo los usuarios de esa empresa
      getUsuariosByEmpresa(empresaId);
    }
  }, [role, empresaId, getUsuarios, getUsuariosByEmpresa, currentPage]);

  const handleSort = (column) => {
    if (column === orderBy) {
      setOrderDirection(orderDirection === "asc" ? "desc" : "asc");
    } else {
      setOrderBy(column);
      setOrderDirection("asc");
    }
  };

  const handleDelete = (_id, email) => {
    if (email === "admin@admin.com") {
      Swal.fire({
        icon: "warning",
        title: "No permitido",
        text: "No se puede eliminar al administrador.",
      });
      return;
    }

    Swal.fire({
      title: "¿Estás seguro de que deseas eliminar este usuario?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteUsuario(_id)
          .then(() => {
            Swal.fire({
              title: "¡Usuario eliminado con éxito!",
              icon: "success",
              confirmButtonColor: "#3085d6",
              confirmButtonText: "Ok",
            });
            getUsuarios(currentPage); // Refrescar la lista de usuarios
          })
          .catch((error) => {
            Swal.fire({
              icon: "error",
              title: "Error",
              text: "Hubo un error al eliminar el usuario.",
            });
            console.error("Error al eliminar el usuario:", error);
          });
      }
    });
  };

  const handleEdit = (usuario) => {
    setEditedUser(usuario); // Establece el usuario seleccionado
    setShowModal(true); // Abre el modal
  };

  const handleClear = () => {
    setSearchTerm("");
  };

  const handleCloseEditModal = () => {
    setEditedUser(null); // Limpia el estado de usuario editado
    setShowModal(false); // Cierra el modal
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      currentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      currentPage(currentPage + 1);
    }
  };

  const filteredUsers = usuarios.filter(
    (usuario) =>
      usuario &&
      usuario.nombre &&
      (usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        usuario._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        usuario.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const sortedUsers = filteredUsers.sort((a, b) => {
    const aValue = a[orderBy];
    const bValue = b[orderBy];

    if (aValue < bValue) return orderDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return orderDirection === "asc" ? 1 : -1;
    return 0;
  });

  if (loadingUsuarios) {
    return <CircularProgress />;
  }

  return (
    <Container maxWidth="md">
      <Box display="flex" justifyContent="center" alignItems="center" mt={4}>
        <Typography variant="h4" mb={4}>
          Lista de Usuarios
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
            placeholder="Buscar Usuarios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              width: { xs: "100%", sm: "300px" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "black", // Borde negro para ambos temas
                },
                "&:hover fieldset": {
                  borderColor: "black", // Borde negro al pasar el cursor
                },
                "&.Mui-focused fieldset": {
                  borderColor: "black", // Borde negro al enfocarse
                },
              },
              "& .MuiInputBase-input": {
                color: "black", // Texto negro para ambos temas
              },
              "& .MuiInputLabel-root": {
                color: "black", // Placeholder negro para ambos temas
              },
              "& .MuiInputBase-input::placeholder": {
                color: "black", // Placeholder negro para ambos temas
                opacity: 1, // Asegura que el placeholder sea visible
              },
            }}
          />
          {searchTerm && (
            <Button
              variant="contained"
              color="secondary"
              onClick={handleClear}
              sx={{ ml: 1 }}
            >
              Limpiar
            </Button>
          )}
        </Box>

        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            console.log("Empresa del usuario logueado:", empresaName); // Debería mostrar el nombre de la empresa
            navigate("/register", {
              state: { showEmpresa: true, empresaName },
            });
          }}
          sx={{ mt: { xs: 2, sm: 0 } }}
        >
          Nuevo Usuario
        </Button>
      </Box>

      {sortedUsers.length ? (
        <TableContainer component={Paper} style={{ marginTop: "2rem" }}>
          <Table>
            <TableHead>
              <TableRow>
                <StyledTableCell
                  onClick={() => handleSort("nombre")}
                  orderBy={orderBy}
                  column="nombre"
                  orderDirection={orderDirection}
                >
                  Nombre
                </StyledTableCell>
                <StyledTableCell
                  onClick={() => handleSort("email")}
                  orderBy={orderBy}
                  column="email"
                  orderDirection={orderDirection}
                >
                  Email
                </StyledTableCell>
                <StyledTableCell
                  onClick={() => handleSort("empresa")}
                  orderBy={orderBy}
                  column="empresa"
                  orderDirection={orderDirection}
                >
                  Empresa
                </StyledTableCell>
                <StyledTableCell
                  onClick={() => handleSort("role")}
                  orderBy={orderBy}
                  column="role"
                  orderDirection={orderDirection}
                >
                  Rol
                </StyledTableCell>
                <TableCell>
                  <Typography
                    variant="h6"
                    component="div"
                    sx={{ fontWeight: "bold" }}
                  >
                    Acciones
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
  {sortedUsers.map((usuario) => {
    const isAdmin = usuario.email === "admin@admin.com";
    const isSuperAdmin = usuario.role?.name === "SuperAdmin"; // Verifica si el usuario tiene rol de SuperAdmin

    return (
      <TableRow key={usuario._id}>
        <TableCell>{usuario.nombre || "Nombre no disponible"}</TableCell>
        <TableCell>{usuario.email || "Email no disponible"}</TableCell>
        <TableCell>{usuario.empresa ? usuario.empresa.name : "Empresa no disponible"}</TableCell>
        <TableCell>{usuario.role?.name || "Rol no disponible"}</TableCell>
        <TableCell>
          {/* Botón de Editar */}
          <FontAwesomeIcon
            icon={faPenToSquare}
            className={`h-6 w-5 ${
              isAdmin || (role === "Admin" && isSuperAdmin)
                ? 'text-gray-500'
                : 'text-blue-400 hover:text-blue-700 cursor-pointer'
            }`}
            onClick={() => {
              if (isAdmin || (role === "Admin" && isSuperAdmin)) {
                Swal.fire({
                  icon: 'warning',
                  title: 'No permitido',
                  text: 'No se puede editar a este usuario.',
                });
              } else {
                handleEdit(usuario);
              }
            }}
            style={{
              cursor: isAdmin || (role === "Admin" && isSuperAdmin) ? 'not-allowed' : 'pointer'
            }}
          />
          {/* Botón de Eliminar */}
          <FontAwesomeIcon
            icon={faTrash}
            className={`h-4 w-4 ${
              isAdmin || (role === "Admin" && isSuperAdmin)
                ? 'text-gray-500'
                : 'text-red-600 hover:text-red-800 cursor-pointer'
            }`}
            onClick={() => {
              if (isAdmin || (role === "Admin" && isSuperAdmin)) {
                Swal.fire({
                  icon: 'warning',
                  title: 'No permitido',
                  text: 'No se puede eliminar a este usuario.',
                });
              } else {
                handleDelete(usuario._id, usuario.email);
              }
            }}
            style={{
              marginLeft: '10px',
              cursor: isAdmin || (role === "Admin" && isSuperAdmin) ? 'not-allowed' : 'pointer'
            }}
          />
        </TableCell>
      </TableRow>
    );
  })}
</TableBody>

          </Table>
        </TableContainer>
      ) : (
        <Typography>No hay usuarios disponibles.</Typography>
      )}

      <div className="flex justify-between items-center mt-4">
        <Typography>
          Mostrando registros del {(currentPage - 1) * 10 + 1} al{" "}
          {Math.min(currentPage * 10, usuarios.length)} de un total de{" "}
          {usuarios.length} registros
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

      {showModal && (
        <EditUserModal
          isOpen={showModal}
          handleClose={handleCloseEditModal}
          editedUser={editedUser} // Pasa el usuario seleccionado al modal
        />
      )}
    </Container>
  );
};
