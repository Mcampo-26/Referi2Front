import React, { useEffect, useState } from "react";
import useUsuariosStore from "../store/useUsuariosStore";
import useRolesStore from "../store/useRolesStore";
import useEmpresasStore from "../store/useEmpresaStore";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  IconButton,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const MySwal = withReactContent(Swal);

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

export const EditUserModal = ({ isOpen, handleClose, editedUser }) => {
  const { updateUsuario, getUsuarios } = useUsuariosStore();
  const { roles, getAllRoles } = useRolesStore();
  const { empresas, getAllEmpresas } = useEmpresasStore();
  const [updatedUser, setUpdatedUser] = useState({
    _id: '',
    nombre: '',
    email: '',
    role: '',
    empresa: '',
  });

  useEffect(() => {
    if (isOpen) {
      getAllRoles();
      getAllEmpresas();
    }
  }, [isOpen, getAllRoles, getAllEmpresas]);

  useEffect(() => {
    if (editedUser) {
      setUpdatedUser({
        _id: editedUser._id,
        nombre: editedUser.nombre || '',
        email: editedUser.email || '',
        role: editedUser.role ? editedUser.role._id : '',
        empresa: editedUser.empresa ? editedUser.empresa._id : '',
      });
    }
  }, [editedUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedUser((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const validateInputs = () => {
    if (!updatedUser.nombre.trim()) return "El nombre del usuario es requerido.";
    if (!updatedUser.email.trim()) return "El correo electrónico es requerido.";
    if (!updatedUser.role) return "El rol del usuario es requerido.";
    if (!updatedUser.empresa) return "La empresa es requerida.";
    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validateInputs();
    if (validationError) {
      MySwal.fire({
        icon: "error",
        title: "Por favor complete los campos",
        text: validationError,
      });
      return;
    }

    handleClose(); // Cierra el modal antes de mostrar el SweetAlert

    setTimeout(async () => {
      try {
        MySwal.fire({
          title: "Guardando...",
          text: "Por favor espera mientras se guarda el usuario.",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        const { _id, role, empresa, nombre, email } = updatedUser;
        const updatedFields = { role, empresa, nombre, email };

        await updateUsuario(_id, updatedFields);

        MySwal.close();
        MySwal.fire({
          icon: "success",
          title: "Usuario actualizado",
          text: "El usuario se ha actualizado correctamente.",
        });
        await getUsuarios();
      } catch (error) {
        MySwal.close();
        MySwal.fire({
          icon: "error",
          title: "Error",
          text: "Hubo un error al actualizar el usuario.",
        });
        console.error("Error al actualizar el usuario:", error);
      }
    }, 500); // Retraso de 500ms antes de mostrar el SweetAlert
  };

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <Box sx={style}>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
        <Typography id="modal-title" variant="h6" component="h2" textAlign="center" gutterBottom>
          Editar Usuario
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            margin="normal"
            label="Nombre"
            name="nombre"
            value={updatedUser.nombre}
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Email"
            name="email"
            type="email"
            value={updatedUser.email}
            onChange={handleChange}
            required
            disabled={editedUser.email === "admin@admin.com"}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Rol</InputLabel>
            <Select
              name="role"
              value={updatedUser.role}
              onChange={handleChange}
              required
            >
              {roles.map((role) => (
                <MenuItem key={role._id} value={role._id}>
                  {role.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Empresa</InputLabel>
            <Select
              name="empresa"
              value={updatedUser.empresa}
              onChange={handleChange}
              required
            >
              {empresas.map((empresa) => (
                <MenuItem key={empresa._id} value={empresa._id}>
                  {empresa.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box mt={2} display="flex" justifyContent="center">
            <Button
              type="submit"
              variant="contained"
              color="primary"
            >
              Guardar
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleClose}
              sx={{ ml: 2 }}
            >
              Cerrar
            </Button>
          </Box>
        </form>
      </Box>
    </Modal>
  );
};
