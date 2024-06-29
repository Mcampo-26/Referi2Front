import React, { useState, useEffect } from "react";
import useUsuariosStore from "../store/useUsuariosStore";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  IconButton
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
  const [updatedUser, setUpdatedUser] = useState({ ...editedUser });
  const isAdminUser = editedUser.email === "admin@admin";

  useEffect(() => {
    if (editedUser) {
      setUpdatedUser({ ...editedUser });
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
    if (!updatedUser.password.trim()) return "La contraseña es requerida.";
    if (!updatedUser.role.trim()) return "El rol del usuario es requerido.";
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

        await updateUsuario(updatedUser._id, updatedUser);
        await getUsuarios();

        MySwal.close();
        MySwal.fire({
          icon: "success",
          title: "Usuario actualizado",
          text: "El usuario se ha actualizado correctamente.",
      
        });
      } catch (error) {
        MySwal.close();
        MySwal.fire({
          icon: "error",
          title: "Error",
          text: "Hubo un error al actualizar el usuario.",
       
        });
        console.error("Error al actualizar el usuario:", error);
      }
    }, 500); // Retraso de 100ms antes de mostrar el SweetAlert
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
            value={updatedUser.nombre || ""}
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Email"
            name="email"
            type="email"
            value={updatedUser.email || ""}
            onChange={handleChange}
            required
            disabled={isAdminUser}
          />
         
          <TextField
            fullWidth
            margin="normal"
            select
            label="Rol"
            name="role"
            value={updatedUser.role || ""}
            onChange={handleChange}
            required
            disabled={isAdminUser}
          >
            <MenuItem value="usuario">Usuario</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </TextField>
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
