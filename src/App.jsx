import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
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
import { ProtectedRoute } from './componentes/ProtectedRoute';
import { Mensajes } from "./componentes/Mensajes";

// Definición de temas
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
          backgroundColor: '#f5f5f5',
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
          backgroundColor: '#303030',
          color: '#ffffff',
        },
      },
    },
  },
});

function App() {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark");
  const [blockBackButton, setBlockBackButton] = useState(true); // Estado para bloquear o desbloquear el botón "Atrás"
  const navigate = useNavigate();
  const { isAuthenticated } = useUsuariosStore((state) => ({
    isAuthenticated: state.isAuthenticated,
  }));

  useEffect(() => {
    // Limpiar el localStorage al cargar la página principal
    localStorage.clear();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    } else if (blockBackButton) {
      // Empuja un nuevo estado al historial para prevenir navegación hacia atrás
      const pushState = () => {
        window.history.pushState(null, "", window.location.href);
      };

      pushState(); // Empuja el estado inicialmente

      const handlePopState = () => {
        pushState(); // Empuja un nuevo estado cada vez que el usuario intenta retroceder
        navigate(window.location.pathname, { replace: true }); // Redirige a la página actual inmediatamente
      };

      window.addEventListener("popstate", handlePopState);

      // Este código empuja repetidamente estados al historial para bloquear completamente el botón "Atrás"
      const intervalId = setInterval(pushState, 100); // Cada 100 ms se asegura de que el historial esté actualizado

      return () => {
        window.removeEventListener("popstate", handlePopState);
        clearInterval(intervalId); // Limpia el intervalo al desmontar el componente o al cambiar el estado de bloqueo
      };
    }
  }, [isAuthenticated, blockBackButton, navigate]);

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

  const handleUserInteraction = () => {
    setBlockBackButton(false); // Desbloquea el botón "Atrás" cuando el usuario hace clic en alguna pestaña
  };

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100" onClick={handleUserInteraction}>
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
          <Route path="/mensajes" element={<Mensajes />} />
        </Routes>
      </div>
    </ThemeProvider>
  );
}

export default App;
