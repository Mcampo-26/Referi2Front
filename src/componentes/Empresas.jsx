import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useEmpresasStore from '../store/useEmpresaStore';
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
  Container,
  Box
} from '@mui/material';

const MySwal = withReactContent(Swal);

export const Empresas = () => {
  const navigate = useNavigate();
  const { empresa, empresas, getAllEmpresas, getEmpresaById, loading, error, createEmpresa, updateEmpresa, deleteEmpresa } = useEmpresasStore();
  const [showModal, setShowModal] = useState(false);
  const [newEmpresaName, setNewEmpresaName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingEmpresaId, setEditingEmpresaId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const role = localStorage.getItem('role');
  const empresaId = localStorage.getItem('empresaId');

  useEffect(() => {
    if (role === 'SuperAdmin') {
      getAllEmpresas();
    } else if (role === 'Admin' && empresaId) {
      getEmpresaById(empresaId);
    }
  }, [role, empresaId, getAllEmpresas, getEmpresaById]);

  useEffect(() => {
    if (role === 'Admin' && empresa) {
      // Si es Admin, y hay una empresa cargada, la agregamos al array para que se renderice
      setFilteredEmpresas([empresa]);
    } else {
      setFilteredEmpresas(empresas);
    }
  }, [role, empresa, empresas]);

  const [filteredEmpresas, setFilteredEmpresas] = useState([]);

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  const handleCreate = () => {
    setNewEmpresaName('');
    setIsEditing(false);
    setEditingEmpresaId(null);
    toggleModal();
  };

  const handleEdit = (empresa) => {
    setNewEmpresaName(empresa.name);
    setIsEditing(true);
    setEditingEmpresaId(empresa._id);
    toggleModal();
  };

  const handleDelete = (_id) => {
    MySwal.fire({
      title: "¿Estás seguro de que deseas eliminar esta empresa?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteEmpresa(_id)
          .then(() => {
            MySwal.fire({
              title: "¡Empresa eliminada con éxito!",
              icon: "success",
              confirmButtonColor: "#3085d6",
              confirmButtonText: "Ok",
            });
            if (role === 'SuperAdmin') {
              getAllEmpresas();
            } else if (role === 'Admin' && empresaId) {
              getEmpresaById(empresaId);
            }
          })
          .catch((error) => {
            MySwal.fire({
              icon: "error",
              title: "Error",
              text: "Hubo un error al eliminar la empresa.",
            });
            console.error("Error al eliminar la empresa:", error);
          });
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newEmpresaName.trim() !== '') {
      toggleModal();

      try {
        if (isEditing) {
          await updateEmpresa({ empresaId: editingEmpresaId, updatedEmpresa: { name: newEmpresaName } });
        } else {
          await createEmpresa({ name: newEmpresaName });
        }

        if (role === 'SuperAdmin') {
          getAllEmpresas();
        } else if (role === 'Admin' && empresaId) {
          getEmpresaById(empresaId);
        }
      } catch (error) {
        MySwal.fire({
          icon: "error",
          title: "Error",
          text: "Hubo un error al actualizar la empresa.",
        });
        console.error("Error al actualizar la empresa:", error);
      }
    } else {
      MySwal.fire({
        icon: "error",
        title: "Error",
        text: "El nombre de la empresa no puede estar vacío.",
      });
    }
  };

  const handleRowClick = (id) => {
    navigate(`/EmpresaDetails/${id}`);
  };

  const filteredEmpresasToShow = searchTerm
    ? filteredEmpresas.filter((empresa) =>
        empresa.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : filteredEmpresas;

  return (
    <Container maxWidth="md">
      <Box display="flex" justifyContent="center" alignItems="center" mt={4}>
        <Typography variant="h4" mb={4}>Administración de empresas</Typography>
      </Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4} mt={2} flexWrap="wrap">
        <Box display="flex" alignItems="center" mt={{ xs: 2, sm: 0 }}>
          <TextField
            variant="outlined"
            placeholder="Buscar ..."
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
          + Agregar Empresa
        </Button>
      </Box>

      <Dialog open={showModal} onClose={toggleModal}>
        <DialogTitle>{isEditing ? 'Editar Empresa' : 'Agregar Nueva Empresa'}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {isEditing ? 'Edita el nombre de la empresa.' : 'Ingresa el nombre de la nueva empresa.'}
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Nombre"
            type="text"
            fullWidth
            value={newEmpresaName}
            onChange={(e) => setNewEmpresaName(e.target.value)}
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
      ) : filteredEmpresasToShow && filteredEmpresasToShow.length > 0 ? (
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
              {filteredEmpresasToShow.map((empresa, index) => (
                <TableRow key={`${empresa._id}-${index}`} onClick={() => handleRowClick(empresa._id)} style={{ cursor: 'pointer' }}>
                  <TableCell>{empresa.name}</TableCell>
                  <TableCell align="right">
                    <FontAwesomeIcon
                      icon={faPenToSquare}
                      className="h-6 w-5 text-blue-400 hover:text-blue-700 cursor-pointer mr-4"
                      onClick={(e) => { e.stopPropagation(); handleEdit(empresa); }}
                    />
                    <FontAwesomeIcon
                      icon={faTrash}
                      className="h-4 w-4 text-red-600 hover:text-red-800 cursor-pointer"
                      onClick={(e) => { e.stopPropagation(); handleDelete(empresa._id); }}
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
