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
import {RolesDetails} from "./componentes/RolesDetails"

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
    // Listener para sincronizar el estado entre pestañas
    const syncAuthState = () => {
      const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
      const usuario = JSON.parse(localStorage.getItem('usuario'));
      
      useUsuariosStore.setState({ isAuthenticated, usuario });
    };
  
    window.addEventListener('storage', syncAuthState);
  
    // Limpieza del listener
    return () => {
      window.removeEventListener('storage', syncAuthState);
    };
  }, []);
  

  useEffect(() => {
    // Verifica si el usuario está autenticado y la ruta actual es diferente de /login o /register
    const currentPath = window.location.pathname;
    
    if (!isAuthenticated && currentPath !== '/login' && currentPath !== '/register') {
      // Redirige a la página principal si no está autenticado y no está en login o register
      navigate('/', { replace: true });
    } else if (blockBackButton && isAuthenticated) {
      // Función para empujar un nuevo estado al historial
      const pushState = () => {
        window.history.pushState(null, "", window.location.href); // Empuja el estado actual al historial
      };
  
      pushState(); // Empuja el estado inicialmente al cargar la página
  
      // Función para manejar el evento de retroceso (botón "Atrás" del navegador)
      const handlePopState = () => {
        pushState(); // Empuja nuevamente el estado al intentar retroceder
        navigate(window.location.pathname, { replace: true }); // Redirige a la página actual para evitar navegación hacia atrás
      };
  
      // Escucha el evento de retroceso en el historial del navegador
      window.addEventListener("popstate", handlePopState);
  
      // Intervalo que empuja repetidamente estados al historial para bloquear el retroceso
      const intervalId = setInterval(pushState, 100); // Cada 100 ms asegura que el historial esté actualizado
  
      // Cleanup: Elimina el event listener y el intervalo al desmontar el componente o cambiar el estado de bloqueo
      return () => {
        window.removeEventListener("popstate", handlePopState);
        clearInterval(intervalId);
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
          <Route path="/rolesDetails/:roleId" element={<RolesDetails />} />


        </Routes>
      </div>
    </ThemeProvider>
  );
}

export default App;
