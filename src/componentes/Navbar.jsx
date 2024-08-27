import React, { useState, useEffect } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import Swal from 'sweetalert2';
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Drawer from "@mui/material/Drawer";
import Brightness4 from "@mui/icons-material/Brightness4";
import Brightness7 from "@mui/icons-material/Brightness7";
import CloseIcon from '@mui/icons-material/Close';
import MenuItem from "@mui/material/MenuItem";
import useUsuariosStore from "../store/useUsuariosStore";
import Brand from '../assets/Brand.jpg';

export const Navbar = ({ toggleDarkMode, darkMode }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [empresaNombre, setEmpresaNombre] = useState('');
  const { usuario, isAuthenticated, role, logoutUsuario } = useUsuariosStore((state) => ({
    usuario: state.usuario,
    isAuthenticated: state.isAuthenticated,
    role: state.role,
    logoutUsuario: state.logoutUsuario,
  }));
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      const nombre = localStorage.getItem('empresaName');
      if (nombre) {
        setEmpresaNombre(nombre);
      }
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    closeMenu();
    Swal.fire({
      title: 'Cerrando sesión...',
      timer: 2000,
      didOpen: () => Swal.showLoading(),
    }).then(() => {
      logoutUsuario();
      navigate('/');
    });
  };

  const handleEmpresasClick = () => {
    const empresaId = localStorage.getItem('empresaId');
    if (empresaId) {
      navigate(`/empresaDetails/${empresaId}`);
    }
    closeMenu();
  };

  const roleMap = {
    "668692d09bbe1e9ff25a4826": "SuperAdmin",
    "66aba1fc753d20ba639d2aaf": "Admin",
    "668697449bbe1e9ff25a4889": "Referidor",
    "6686d371d64d18acf5ba6bb5": "Vendedor",
  };

  const generateNavItems = (roleId) => {
    const role = roleMap[roleId] || ""; // Convertir el id al nombre usando el mapa
  
    const commonItems = [
      { id: 4, text: "Mis QR", to: "/Referidos" },
      { id: 12, text: "Contacto", to: "/contacto" },
      { id: 5, text: "Cerrar Sesión", action: handleLogout },
    ];
  
    switch (role) {
      case "SuperAdmin":
        return [
          { id: 1, text: "Inicio", to: "/" },
          { id: 8, text: "Crear", to: "/QrMain" },
          { id: 6, text: "Usuarios", to: "/Users" },
          { id: 10, text: "Empresas", to: "/Empresas" },
          { id: 9, text: "Roles", to: "/roles" },
          { id: 11, text: "Planes de Pago", to: "/planSelector" },
          { id: 13, text: "Cuenta", to: "/UserPlan" },
          ...commonItems,
        ];
      case "Admin":
        return [
          { id: 8, text: "Crear", to: "/QrMain" },
          { id: 2, text: "Escanear QR", to: "/Escanear" },
          { id: 6, text: "Usuarios", to: "/Users" },
          { id: 10, text: "Empresa", action: handleEmpresasClick },
          ...commonItems,
        ];
      case "Referidor":
      case "Vendedor":
        return commonItems;
      default:
        return [{ id: 5, text: "Cerrar Sesión", action: handleLogout }];
    }
  };

  const navItems = isAuthenticated && role
    ? generateNavItems(role) 
    : [
        { id: 6, text: "Iniciar Sesión", to: "/Login" },
        { id: 7, text: "Registrarse", to: "/Register" },
      ];

  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      primary: {
        main: darkMode ? "#424242" : "#90caf9",
      },
      background: {
        default: darkMode ? "#303030" : "#ffffff",
      },
    },
  });

  const toggleDrawer = (open) => (event) => {
    if (event.type === "keydown" && (event.key === "Tab" || event.key === "Shift")) return;
    setDrawerOpen(open);
  };

  const closeMenu = () => setDrawerOpen(false);

  return (
    <ThemeProvider theme={theme}>
      <AppBar position="sticky">
        <Toolbar sx={{ justifyContent: "space-between", alignItems: "center", flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: { xs: 1, md: 0 } }}>
            <RouterLink to="/" style={{ display: "flex", alignItems: "center", textDecoration: "none", color: "inherit" }}>
              <img src={Brand} alt="Referi2 Logo" style={{ height: 40, marginRight: 10 }} />
              <Typography variant="h6" sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}>
                Referi2
              </Typography>
            </RouterLink>
          </Box>

          {isAuthenticated && (
            <Typography 
              variant="body1" 
              sx={{ 
                color: 'inherit', 
                fontSize: { xs: '1rem', md: '1.25rem' }, 
                textAlign: { xs: 'center', md: 'left' },
                width: { xs: '100%', md: 'auto' },
                mb: { xs: 1, md: 0 }
              }}
            >
              {`Hola, ${usuario.nombre}${role ? `! eres ${roleMap[role]} de ${empresaNombre}` : ''}`}
            </Typography>
          )}

          <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center" }}>
            {navItems.map((item) =>
              item.to ? (
                <MenuItem
                  key={item.id}
                  component={RouterLink}
                  to={item.to}
                  onClick={closeMenu}
                  sx={{ color: "inherit" }}
                >
                  {item.text}
                </MenuItem>
              ) : (
                <MenuItem
                  key={item.id}
                  onClick={item.action}
                  sx={{ color: "inherit" }}
                >
                  {item.text}
                </MenuItem>
              )
            )}
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", ml: { xs: 0, md: 2 } }}>
            <IconButton onClick={toggleDarkMode} color="inherit">
              {darkMode ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
            <IconButton
              onClick={toggleDrawer(true)}
              color="inherit"
              sx={{ display: { md: "none" } }}
            >
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={closeMenu}
        sx={{ display: { md: "none" } }}
      >
        <Box
          sx={{
            width: 250,
            bgcolor: theme.palette.primary.main,
            height: "100%",
          }}
        >
          <IconButton onClick={closeMenu} sx={{ color: "white" }}>
            <CloseIcon />
          </IconButton>
          <List>
            {navItems.map((item) =>
              item.to ? (
                <ListItem
                  button
                  key={item.id}
                  component={RouterLink}
                  to={item.to}
                  onClick={closeMenu}
                >
                  <ListItemText primary={item.text} sx={{ color: "white" }} />
                </ListItem>
              ) : (
                <ListItem button key={item.id} onClick={item.action}>
                  <ListItemText primary={item.text} sx={{ color: "white" }} />
                </ListItem>
              )
            )}
          </List>
        </Box>
      </Drawer>
    </ThemeProvider>
  );
};
