import React, { useState } from 'react';
import { Search, MoreVertical, ArrowLeft, Settings, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  showTabs?: boolean;
  showBackButton?: boolean;
  onSearchClick?: () => void;
  onTitleClick?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title = 'AgroCafé', 
  showTabs = false, 
  showBackButton = false,
  onSearchClick,
  onTitleClick
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);

  const isActive = (path: string) => {
    if (path === '/configuracoes') {
      return location.pathname === '/configuracoes' || 
             location.pathname === '/perfil' || 
             location.pathname === '/funcionarios' || 
             location.pathname === '/maquinarios';
    }
    return location.pathname === path;
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <header className="bg-whatsapp-teal text-white p-4 flex justify-between items-center shadow-md z-50">
        <div className="flex items-center gap-3">
          {showBackButton && (
            <ArrowLeft 
              size={24} 
              className="cursor-pointer opacity-80 hover:opacity-100 transition-all active:scale-90" 
              onClick={() => navigate(-1)}
            />
          )}
          <h1 
            onClick={onTitleClick}
            className={`text-xl font-semibold tracking-tight ${onTitleClick ? 'cursor-pointer hover:opacity-80' : ''}`}
          >
            {title}
          </h1>
        </div>
        <div className="flex gap-4 relative">
          <Search 
            size={24} 
            className="cursor-pointer opacity-80 hover:opacity-100 transition-all active:scale-90" 
            onClick={onSearchClick}
          />
          <div className="relative">
            <MoreVertical 
              size={24} 
              className="cursor-pointer opacity-80 hover:opacity-100 transition-all active:scale-90" 
              onClick={() => setShowMenu(!showMenu)}
            />
            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)}></div>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl z-20 py-2 border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
                  <button 
                    onClick={() => { navigate('/configuracoes'); setShowMenu(false); }}
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                  >
                    <Settings size={18} className="text-gray-400" /> Configurações
                  </button>
                  <button 
                    onClick={() => { navigate('/perfil'); setShowMenu(false); }}
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 border-t border-gray-50"
                  >
                    <User size={18} className="text-gray-400" /> Meu Perfil
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Tabs (Optional) */}
      {showTabs && (
        <div className="bg-whatsapp-teal text-white flex border-t border-whatsapp-green/20 shadow-sm z-40">
          <div 
            onClick={() => navigate('/')}
            className={`flex-1 text-center py-3 font-medium uppercase text-xs tracking-widest cursor-pointer transition-all ${
              isActive('/') ? 'border-b-4 border-white opacity-100' : 'opacity-60'
            }`}
          >
            Lavouras
          </div>
          <div 
            onClick={() => navigate('/atividades')}
            className={`flex-1 text-center py-3 font-medium uppercase text-xs tracking-widest cursor-pointer transition-all ${
              isActive('/atividades') ? 'border-b-4 border-white opacity-100' : 'opacity-60'
            }`}
          >
            Atividades
          </div>
          <div 
            onClick={() => navigate('/configuracoes')}
            className={`flex-1 text-center py-3 font-medium uppercase text-xs tracking-widest cursor-pointer transition-all ${
              isActive('/configuracoes') ? 'border-b-4 border-white opacity-100' : 'opacity-60'
            }`}
          >
            Configurações
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative bg-whatsapp-light">
        {children}
      </main>
    </div>
  );
};

export default Layout;
