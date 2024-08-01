import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { Navbar } from './componentes/Navbar';
import './index.css';
import { Home } from "./pages/Home";
import { Referidos } from "./pages/Referidos";
import { QrMain } from "./componentes/QrMain";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { ScanPage } from "./pages/ScanPage";
import { Login } from "./componentes/Login";
import { Register } from "./componentes/Register";
import { QrDetails } from "./componentes/QrDetails";
import { Users } from "./pages/Users";
import { Roles } from "./componentes/Roles";
import { Empresas } from "./componentes/Empresas";
import { Servicios } from "./componentes/Servicios";
import { EmpresaDetails } from "./componentes/EmpresaDetails";
import PdfManager from "./componentes/PdfManager";
import {Error404} from './pages/Error404'
import {Contacto}from './pages/Contacto'

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#f5f5f5',
    },
    text: {
      primary: '#000000',
    },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#303030',
    },
    text: {
      primary: '#ffffff',
    },
  },
});

function App() {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark");

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <Navbar toggleDarkMode={toggleDarkMode} darkMode={darkMode} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/QrMain" element={<QrMain />} />
          <Route path="/Escanear" element={<ScanPage />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/Register" element={<Register />} />
          <Route path="/Users" element={<Users />} />
          <Route path="/Referidos" element={<Referidos />} />
          <Route path="/QrDetails/:id" element={<QrDetails />} />
          <Route path="/roles" element={<Roles />} />
          <Route path="/empresas" element={<Empresas />} />
          <Route path="/servicios" element={<Servicios />} />
          <Route path="/empresaDetails/:id" element={<EmpresaDetails />} />
          <Route path="/pdfs" element={<PdfManager />} />
          <Route path="/reportes" element={<Error404 />} />
          <Route path="/contacto" element={<Contacto />} />
        </Routes>
      </div>
    </ThemeProvider>
  );
}

export default App;