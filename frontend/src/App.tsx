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
import { get, set, del } from 'idb-keyval';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 30, // 30 minutos de cache "fresco"
      gcTime: 1000 * 60 * 60 * 24 * 7, // 7 dias até o lixo ser coletado do cache (persistente)
      retry: 1, // Tenta uma vez se falhar antes de desistir
    },
  },
});

// Configuração do Persister usando IndexedDB (idb-keyval)
const persister = createAsyncStoragePersister({
  storage: {
    getItem: (key) => get(key),
    setItem: (key, value) => set(key, value),
    removeItem: (key) => del(key),
  },
});

function App() {
  const [isOnboarded, setIsOnboarded] = useState(localStorage.getItem('onboarding_complete') === 'true');

  useEffect(() => {
    const handleLoginEvent = () => {
      setIsOnboarded(localStorage.getItem('onboarding_complete') === 'true');
    };
    window.addEventListener('app:login', handleLoginEvent);
    return () => window.removeEventListener('app:login', handleLoginEvent);
  }, []);

  return (
    <PersistQueryClientProvider 
      client={queryClient} 
      persistOptions={{ persister, maxAge: 1000 * 60 * 60 * 24 * 7 }} // 7 dias de persistência
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
          {/* Public / Onboarding Routes */}
          <Route path="/welcome" element={<WelcomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {!isOnboarded ? (
            <Route path="*" element={<Navigate to="/welcome" replace />} />
          ) : (
            <>
              {/* Private App Routes */}
              <Route path="/" element={<LavourasPage />} />
              <Route path="/chat/:id" element={<ChatPage />} />
              <Route path="/atividades" element={<ActivitiesPage />} />
              <Route path="/lavoura/:id/perfil" element={<LavouraProfilePage />} />
              <Route path="/configuracoes" element={<SettingsPage />} />
              <Route path="/funcionarios" element={<FuncionariosPage />} />
              <Route path="/maquinarios" element={<MaquinariosPage />} />
              <Route path="/perfil" element={<ProfilePage />} />
              <Route path="/nova-lavoura" element={<NewLavouraPage />} />
              <Route path="/editar-lavoura/:id" element={<NewLavouraPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          )}
        </Routes>
      </BrowserRouter>
    </PersistQueryClientProvider>
  );
}

export default App;
