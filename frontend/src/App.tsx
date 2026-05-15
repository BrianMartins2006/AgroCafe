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

import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { get, set, del } from 'idb-keyval';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos de cache "fresco"
      gcTime: 1000 * 60 * 60 * 24, // 24 horas até o lixo ser coletado do cache (persistente)
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
  const isOnboarded = localStorage.getItem('onboarding_complete') === 'true';

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
            duration: 3000,
            style: { borderRadius: '20px', padding: '16px' }
          }} 
        />
        <Routes>
          {/* Onboarding Flow */}
          {!isOnboarded && (
            <>
              <Route path="/welcome" element={<WelcomePage />} />
              <Route path="*" element={<Navigate to="/welcome" replace />} />
            </>
          )}

          {/* Main App Routes */}
          <Route path="/" element={<LavourasPage />} />
          <Route path="/welcome" element={<WelcomePage />} />
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
      </Routes>
    </BrowserRouter>
    </PersistQueryClientProvider>
);
}

export default App;
