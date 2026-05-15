import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LavourasPage from './pages/LavourasPage';
import ChatPage from './pages/ChatPage';
import NewLavouraPage from './pages/NewLavouraPage';
import LavouraProfilePage from './pages/LavouraProfilePage';
import SettingsPage from './pages/SettingsPage';
import ActivitiesPage from './pages/ActivitiesPage';
import FuncionariosPage from './pages/FuncionariosPage';
import MaquinariosPage from './pages/MaquinariosPage';
import ProfilePage from './pages/ProfilePage';
import DashboardPage from './pages/DashboardPage';
import WelcomePage from './pages/WelcomePage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';

import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 30, // 30 minutos de cache "fresco"
      gcTime: 1000 * 60 * 60 * 24 * 7, // 7 dias de persistência
      retry: 1,
    },
  },
});

// Usando localStorage para máxima compatibilidade
const persister = createAsyncStoragePersister({
  storage: window.localStorage,
});

function App() {
  const [isOnboarded, setIsOnboarded] = useState(() => {
    try {
      return localStorage.getItem('onboarding_complete') === 'true';
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    const handleLoginEvent = () => {
      try {
        setIsOnboarded(localStorage.getItem('onboarding_complete') === 'true');
      } catch (e) {
        console.error('Erro ao acessar localStorage:', e);
      }
    };
    window.addEventListener('app:login', handleLoginEvent);
    return () => window.removeEventListener('app:login', handleLoginEvent);
  }, []);

  return (
    <PersistQueryClientProvider 
      client={queryClient} 
      persistOptions={{ persister, maxAge: 1000 * 60 * 60 * 24 * 7 }}
    >
      <BrowserRouter>
        <Toaster 
          position="top-center" 
          toastOptions={{ 
            className: 'text-sm font-bold',
            duration: 2000,
            style: { borderRadius: '20px', padding: '16px', zIndex: 9999 }
          }} 
        />
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/welcome" element={<WelcomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Rotas Privadas Controladas */}
          <Route path="/" element={isOnboarded ? <LavourasPage /> : <Navigate to="/welcome" replace />} />
          <Route path="/chat/:id" element={isOnboarded ? <ChatPage /> : <Navigate to="/welcome" replace />} />
          <Route path="/atividades" element={isOnboarded ? <ActivitiesPage /> : <Navigate to="/welcome" replace />} />
          <Route path="/lavoura/:id/perfil" element={isOnboarded ? <LavouraProfilePage /> : <Navigate to="/welcome" replace />} />
          <Route path="/configuracoes" element={isOnboarded ? <SettingsPage /> : <Navigate to="/welcome" replace />} />
          <Route path="/funcionarios" element={isOnboarded ? <FuncionariosPage /> : <Navigate to="/welcome" replace />} />
          <Route path="/maquinarios" element={isOnboarded ? <MaquinariosPage /> : <Navigate to="/welcome" replace />} />
          <Route path="/perfil" element={isOnboarded ? <ProfilePage /> : <Navigate to="/welcome" replace />} />
          <Route path="/nova-lavoura" element={isOnboarded ? <NewLavouraPage /> : <Navigate to="/welcome" replace />} />
          <Route path="/editar-lavoura/:id" element={isOnboarded ? <NewLavouraPage /> : <Navigate to="/welcome" replace />} />
          <Route path="/dashboard" element={isOnboarded ? <DashboardPage /> : <Navigate to="/welcome" replace />} />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to={isOnboarded ? "/" : "/welcome"} replace />} />
        </Routes>
      </BrowserRouter>
    </PersistQueryClientProvider>
  );
}

export default App;
