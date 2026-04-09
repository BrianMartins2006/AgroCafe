import React from 'react';
import { Search, MoreVertical, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  showTabs?: boolean;
  showBackButton?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, title = 'AgroCafé', showTabs = false, showBackButton = false }) => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <header className="bg-whatsapp-teal text-white p-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          {showBackButton && (
            <ArrowLeft 
              size={24} 
              className="cursor-pointer opacity-80 hover:opacity-100" 
              onClick={() => navigate(-1)}
            />
          )}
          <h1 className="text-xl font-semibold">{title}</h1>
        </div>
        <div className="flex gap-4">
          <Search size={24} className="cursor-pointer opacity-80 hover:opacity-100" />
          <MoreVertical size={24} className="cursor-pointer opacity-80 hover:opacity-100" />
        </div>
      </header>

      {/* Tabs (Optional) */}
      {showTabs && (
        <div className="bg-whatsapp-teal text-white flex border-t border-whatsapp-green/20">
          <div className="flex-1 text-center py-3 border-b-4 border-white font-medium uppercase text-sm">
            Lavouras
          </div>
          <div className="flex-1 text-center py-3 opacity-60 font-medium uppercase text-sm cursor-pointer">
            Atividades
          </div>
          <div className="flex-1 text-center py-3 opacity-60 font-medium uppercase text-sm cursor-pointer">
            Perfil
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
