import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LavourasPage from './pages/LavourasPage';
import ChatPage from './pages/ChatPage';
import NewLavouraPage from './pages/NewLavouraPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LavourasPage />} />
        <Route path="/chat/:id" element={<ChatPage />} />
        <Route path="/nova-lavoura" element={<NewLavouraPage />} />
        <Route path="/editar-lavoura/:id" element={<NewLavouraPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
