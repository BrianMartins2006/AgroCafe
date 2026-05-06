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

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos de cache "fresco"
      gcTime: 1000 * 60 * 30,    // 30 minutos até o lixo ser coletado
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
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
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);
}

export default App;
