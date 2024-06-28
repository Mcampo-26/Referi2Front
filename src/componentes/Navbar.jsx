import React, { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
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
import CloseIcon from "@mui/icons-material/Close";
import MenuItem from "@mui/material/MenuItem";

const navItems = [
  { id: 1, text: "Inicio", to: "/" },
  { id: 2, text: "Escanear QR", to: "/Escanear" },
  { id: 3, text: "admin", to: "/Admin" },
  { id: 4, text: "Referidos", to: "/Products" },
  {
    id: 8,
    text: "Cerrar Sesión",
    action: () => {
      console.log("Cerrar Sesión");
    },
  },
];

export const Navbar = ({ toggleDarkMode, darkMode }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      primary: {
        main: darkMode ? "#424242" : "#90caf9", // Gris oscuro en modo oscuro y azul claro en modo claro
      },
      background: {
        default: darkMode ? "#303030" : "#ffffff",
      },
    },
  });

  const toggleDrawer = (open) => (event) => {
    if (event.type === "keydown" && (event.key === "Tab" || event.key === "Shift")) {
      return;
    }
    setDrawerOpen(open);
  };

  const closeMenu = () => {
    setDrawerOpen(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <AppBar position="sticky">
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{ color: "inherit", textDecoration: "none" }}
          >
            Referi2
          </Typography>
          <Box sx={{ display: { xs: "none", md: "flex" } }}>
            {navItems.map((item) => (
              <MenuItem
                key={item.id}
                component={RouterLink}
                to={item.to}
                onClick={item.action ? item.action : closeMenu}
                sx={{ color: "inherit" }}
              >
                {item.text}
              </MenuItem>
            ))}
          </Box>
          <Box sx={{ display: "flex", alignItems: "center" }}>
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
            {navItems.map((item) => (
              <ListItem
                button
                key={item.id}
                component={RouterLink}
                to={item.to}
                onClick={item.action ? item.action : closeMenu}
              >
                <ListItemText primary={item.text} sx={{ color: "white" }} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </ThemeProvider>
  );
};
