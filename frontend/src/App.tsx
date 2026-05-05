import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

function App() {
  return (
    <BrowserRouter>
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
  );
}

export default App;
