import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { Navbar } from './componentes/Navbar';
import './index.css';
import { Home } from "./pages/Home";
import { Referidos } from "./pages/Referidos";
import { QrMain } from "./componentes/QrMain";
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
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
import { Error404 } from './pages/Error404';
import { Contacto } from './pages/Contacto';
import useUsuariosStore from './store/useUsuariosStore';
import { PlanSelector } from './componentes/PlanSelector';
import { RestaurarPassword } from './componentes/RestaurarPassword';
import { PaymentResultPage } from './pages/PaymentResultPage';
import { UserPlanDetails } from './pages/UserPlanDetails';
import { VerifyAccount } from '../src/componentes/VerifyAccount';
import {ProtectedRoute} from './componentes/ProtectedRoute';

// Aquí defines los temas
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
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#f5f5f5', // Fondo claro para el tema claro
          color: '#000000',
        },
      },
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
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#303030', // Fondo oscuro para el tema oscuro
          color: '#ffffff',
        },
      },
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
          <Route path="/Escanear" element={<ProtectedRoute element={<ScanPage />} />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/Register" element={<Register />} />
          <Route path="/Users" element={<ProtectedRoute element={<Users />} allowedRoles={['Admin', 'SuperAdmin']} />} />
          <Route path="/Referidos" element={<ProtectedRoute element={<Referidos />} />} />
          <Route path="/QrDetails/:id" element={<ProtectedRoute element={<QrDetails />} />} />
          <Route path="/roles" element={<ProtectedRoute element={<Roles />} allowedRoles={['SuperAdmin']} />} />
          <Route path="/empresas" element={<ProtectedRoute element={<Empresas />} />} />
          <Route path="/servicios" element={<ProtectedRoute element={<Servicios />} />} />
          <Route path="/empresaDetails/:id" element={<ProtectedRoute element={<EmpresaDetails />} />} />
          <Route path="/pdfs" element={<ProtectedRoute element={<PdfManager />} />} />
          <Route path="/reportes" element={<ProtectedRoute element={<Error404 />} />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/planSelector" element={<ProtectedRoute element={<PlanSelector />} />} />
          <Route path="/restaurarPass/:token" element={<RestaurarPassword />} />
          <Route path="/payment-result/:status" element={<ProtectedRoute element={<PaymentResultPage />} />} />
          <Route path="/UserPlan" element={<ProtectedRoute element={<UserPlanDetails />} />} />
          <Route path="/verify" element={<VerifyAccount />} />
        </Routes>
      </div>
    </ThemeProvider>
  );
}

export default App;
