import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { EditUserModal } from "./EditUserModal";
import useUsuariosStore from "../store/useUsuariosStore";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
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
  IconButton,
  CircularProgress,
  Box,
  useTheme
} from '@mui/material';

const StyledTableCell = ({ children, onClick, orderBy, column, orderDirection }) => {
  return (
    <TableCell onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
        {children} {orderBy === column && (orderDirection === 'asc' ? '▲' : '▼')}
      </Typography>
    </TableCell>
  );
};

const MySwal = withReactContent(Swal);

export const UserList = () => {
  const theme = useTheme(); // Usa el hook useTheme para acceder al tema
  const [orderBy, setOrderBy] = useState('nombre');
  const [orderDirection, setOrderDirection] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editedUser, setEditedUser] = useState(null);
  const { getUsuarios, usuarios, loading, deleteUsuario, totalRecords, totalPages, currentPage } = useUsuariosStore();
  const navigate = useNavigate();
  const recordsPerPage = 10;

  useEffect(() => {
    getUsuarios(currentPage, recordsPerPage);
  }, [currentPage, recordsPerPage, getUsuarios]);

  const handleSort = (column) => {
    if (column === orderBy) {
      setOrderDirection(orderDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setOrderBy(column);
      setOrderDirection('asc');
    }
  };

  const handleDelete = (_id) => {
    if (_id === "admin@admin") {
      MySwal.fire({
        icon: 'warning',
        title: 'No permitido',
        text: 'No se puede eliminar al administrador.',
      });
      return;
    }

    MySwal.fire({
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
            MySwal.fire({
              title: "¡Usuario eliminado con éxito!",
              icon: "success",
              confirmButtonColor: "#3085d6",
              confirmButtonText: "Ok",
            });
            getUsuarios(currentPage, recordsPerPage); // Refrescar la lista de usuarios
          })
          .catch((error) => {
            MySwal.fire({
              icon: "error",
              title: "Error",
              text: "Hubo un error al eliminar el usuario.",
            });
            console.error("Error al eliminar el usuario:", error);
          });
      }
    });
  };

  const handleEdit = (user) => {
    if (user.email === "admin@admin") {
      MySwal.fire({
        icon: 'warning',
        title: 'No permitido',
        text: 'No se puede editar al administrador.',
      });
      return;
    }

    setEditedUser(user);
    setShowModal(true);
  };

  const handleClear = () => {
    setSearchTerm('');
  };

  const handleCloseEditModal = () => {
    setEditedUser(null);
    setShowModal(false);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      getUsuarios(currentPage - 1, recordsPerPage);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      getUsuarios(currentPage + 1, recordsPerPage);
    }
  };

  const filteredUsers = usuarios.filter((usuario) =>
    usuario &&
    usuario.nombre &&
    (
      usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const sortedUsers = filteredUsers.sort((a, b) => {
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
          sx={{ marginTop: '3rem', bgcolor: theme.palette.background.default }}
        />
        {searchTerm && (
          <Button
            variant="contained"
            color="secondary"
            onClick={handleClear}
            sx={{ marginLeft: '1rem', marginTop: '3rem' }}
          >
            Limpiar
          </Button>
        )}
      </Box>
      <div className="flex justify-between items-center mb-4 ">
        <Typography variant="h4" component="h1" mt={4}gutterBottom>
          Lista de Usuarios
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/register')}
          style={{ marginTop: '1rem' }}
        >
          Nuevo Usuario
        </Button>
      </div>

      <div className="w-full md:w-1/3 flex items-center mx-auto mb-4">
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar usuarios por nombre, ID o correo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ marginTop: '1.5rem' }}
        />
      </div>

      {loading ? (
        <CircularProgress />
      ) : sortedUsers.length ? (
        <TableContainer component={Paper} style={{ marginTop: '2rem' }}>
          <Table>
            <TableHead>
              <TableRow>
                <StyledTableCell onClick={() => handleSort('nombre')} orderBy={orderBy} column="nombre" orderDirection={orderDirection}>
                  Nombre
                </StyledTableCell>
                <StyledTableCell onClick={() => handleSort('email')} orderBy={orderBy} column="email" orderDirection={orderDirection}>
                  Email
                </StyledTableCell>
                <StyledTableCell onClick={() => handleSort('role')} orderBy={orderBy} column="role" orderDirection={orderDirection}>
                  Rol
                </StyledTableCell>
                <TableCell>
                  <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                    Acciones
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedUsers.map((usuario, index) => (
                <TableRow key={usuario._id || index}>
                  <TableCell>{usuario.nombre || "Nombre no disponible"}</TableCell>
                  <TableCell>{usuario.email || "Email no disponible"}</TableCell>
                  <TableCell>{usuario.role || "Rol no disponible"}</TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={usuario.email !== "admin@admin" ? () => handleEdit(usuario) : () => MySwal.fire({icon: 'warning', title: 'No permitido', text: 'No se puede editar al administrador.'})}
                      style={usuario.email === "admin@admin" ? { color: 'gray' } : {}}
                    >
                      <FontAwesomeIcon icon={faPenToSquare} />
                    </IconButton>
                    <IconButton
                      color="secondary"
                      onClick={usuario.email !== "admin@admin" ? () => handleDelete(usuario._id) : () => MySwal.fire({icon: 'warning', title: 'No permitido', text: 'No se puede eliminar al administrador.'})}
                      style={usuario.email === "admin@admin" ? { color: 'gray' } : {}}
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
        <Typography>No hay usuarios disponibles.</Typography>
      )}

      <div className="flex justify-between items-center mt-4">
        <Typography>
          Mostrando registros del {(currentPage - 1) * recordsPerPage + 1} al {Math.min(currentPage * recordsPerPage, totalRecords)} de un total de {totalRecords} registros
        </Typography>
        <div>
          <Button variant="outlined" className="mr-2" onClick={handlePreviousPage} disabled={currentPage === 1}>Anterior</Button>
          <Button variant="outlined" onClick={handleNextPage} disabled={currentPage === totalPages}>Siguiente</Button>
        </div>
      </div>

      {showModal && (
        <EditUserModal
          isOpen={showModal}
          handleClose={handleCloseEditModal}
          editedUser={editedUser}
        />
      )}
    </Container>
  );
};
