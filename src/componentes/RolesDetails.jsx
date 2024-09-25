import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import usePermisosStore from "../store/usePermisosSotre";
import {
  Box,
  Container,
  Typography,
  Paper,
  CircularProgress,
  Grid,
  Checkbox,
  FormControlLabel,
  Button,
  useTheme,
} from "@mui/material";
import Swal from "sweetalert2";

export const RolesDetails = () => {
  const { getRolePermissions, updateRolePermissions, loading } =
    usePermisosStore();
  const [roleName, setRoleName] = useState("Nombre del Rol");
  const { roleId } = useParams(); // Obtén el ID del rol de la URL
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  const [permissions, setPermissions] = useState({
    viewUsers: false,
    viewEmpresas: false,
    viewRoles: false,
    viewPlanes: false,
    viewCuenta: false,
    viewEscanear: false,
    viewQr: false, // Corrige aquí a viewQr
  });

  // Cargar permisos cuando se seleccione un rol
  useEffect(() => {
    if (roleId) {
      getRolePermissions(roleId).then((rolePermissions) => {
        if (rolePermissions) {
          setPermissions(rolePermissions); // Cargar los permisos existentes
        }
      });
    }
  }, [roleId, getRolePermissions]);

  const handlePermissionChange = (event) => {
    setPermissions({
      ...permissions,
      [event.target.name]: event.target.checked,
    });
  };

  const handleSavePermissions = async () => {
    try {
      // Actualiza los permisos del rol existente
      await updateRolePermissions(roleId, permissions); // Cambia a updateRolePermissions

      Swal.fire({
        icon: "success",
        title: "Permisos actualizados",
        text: "Los permisos del rol se han actualizado con éxito",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un problema al actualizar los permisos",
      });
    }
  };

  return (
    <Container sx={{ mt: 15 }}>
      <Box textAlign="center">
        <Typography variant="h4" gutterBottom>
          Configurar Permisos
        </Typography>
      </Box>
      <Paper
        elevation={3}
        sx={{
          mt: 10,
          p: 3,
          backgroundColor: isDarkMode ? theme.palette.grey[800] : "#fff",
          color: isDarkMode
            ? theme.palette.text.primary
            : theme.palette.text.secondary,
        }}
      >
        <Box mb={2}>
          <Typography variant="h6">Rol: {roleName}</Typography>
        </Box>

        <Box mb={4}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={permissions.viewUsers}
                    onChange={handlePermissionChange}
                    name="viewUsers"
                  />
                }
                label="Ver Usuarios"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={permissions.viewEmpresas}
                    onChange={handlePermissionChange}
                    name="viewEmpresas"
                  />
                }
                label="Ver Empresas"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={permissions.viewRoles}
                    onChange={handlePermissionChange}
                    name="viewRoles"
                  />
                }
                label="Ver Roles"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={permissions.viewPlanes}
                    onChange={handlePermissionChange}
                    name="viewPlanes"
                  />
                }
                label="Ver Planes"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={permissions.viewCuenta}
                    onChange={handlePermissionChange}
                    name="viewCuenta"
                  />
                }
                label="Ver Cuenta"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={permissions.viewQr} // Usa viewQr en lugar de viewQR
                    onChange={handlePermissionChange}
                    name="viewQr" // Asegúrate de que el nombre sea viewQr
                  />
                }
                label="Ver Qrs"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={permissions.viewEscanear}
                    onChange={handlePermissionChange}
                    name="viewEscanear"
                  />
                }
                label="Ver Escanear"
              />
            </Grid>
          </Grid>
        </Box>

        {loading ? (
          <CircularProgress />
        ) : (
          <Box textAlign="center">
            <Button
              variant="contained"
              color="primary"
              onClick={handleSavePermissions}
            >
              Guardar Permisos
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};
