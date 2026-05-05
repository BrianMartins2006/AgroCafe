import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, Search, MessageCircle, Globe, 
  TrendingUp, UserCircle, MessageSquare, LayoutGrid, BarChart2
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
  onSearchClick?: () => void;
  onTitleClick?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title, 
  showBackButton = false, 
  onSearchClick,
  onTitleClick 
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isChat = location.pathname.includes('/chat/');
  
  const navItems = [
    { label: 'Conversas', icon: MessageSquare, path: '/' },
    { label: 'Atividades', icon: LayoutGrid, path: '/atividades' },
    { label: 'Custos', icon: BarChart2, path: '/dashboard' },
    { label: 'Perfil', icon: UserCircle, path: '/configuracoes' },
  ];

  return (
    <div className="flex flex-col h-screen bg-white max-w-md mx-auto relative overflow-hidden font-sans">
      {/* Top Header (WhatsApp Style - Fiel) */}
      <header className="bg-whatsapp-teal text-white px-4 py-4 shadow-md z-[70] flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBackButton && (
            <button 
              onClick={() => navigate(-1)} 
              className="p-1 -ml-1 active:bg-white/20 rounded-full transition-all"
            >
              <ArrowLeft size={24} />
            </button>
          )}
          <h1 
            onClick={onTitleClick}
            className={`text-xl font-medium tracking-tight ${onTitleClick ? 'cursor-pointer' : ''}`}
          >
            {title || 'AgroCafé'}
          </h1>
        </div>
        
        <div className="flex items-center gap-1">
          {onSearchClick && (
            <button 
              onClick={onSearchClick}
              className="p-2 active:bg-white/20 rounded-full transition-all"
            >
              <Search size={22} />
            </button>
          )}
          <button className="p-2 active:bg-white/20 rounded-full transition-all">
            <MoreVertical size={22} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-[#F0F2F5] relative pb-24 no-scrollbar">
        {children}
      </main>

      {/* Bottom Navigation Bar (WHATSAPP PREMIUM STYLE) */}
      {!isChat && (
        <nav className="bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0 max-w-md mx-auto flex justify-around items-center z-[80] py-2 shadow-[0_-2px_10px_rgba(0,0,0,0.03)]">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
                           (item.path !== '/' && location.pathname.startsWith(item.path));
            const Icon = item.icon;
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center justify-center flex-1 py-1 transition-all group"
              >
                <div className={`relative flex flex-col items-center gap-1 transition-all`}>
                  <div className={`px-5 py-1 rounded-full transition-all duration-300 ${isActive ? 'bg-whatsapp-teal/10' : 'group-active:bg-gray-100'}`}>
                    <Icon 
                      size={24} 
                      className={`transition-colors duration-300 ${isActive ? 'text-whatsapp-teal' : 'text-gray-500'}`}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                  </div>
                  <span className={`text-[11px] font-medium transition-colors duration-300 ${isActive ? 'text-whatsapp-teal font-bold' : 'text-gray-500'}`}>
                    {item.label}
                  </span>
                </div>
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
};

// Icone customizado para simular o MoreVertical do Lucide que faltou no import anterior
const MoreVertical = ({ size, className }: { size: number; className?: string }) => (
  <svg 
    width={size} height={size} viewBox="0 0 24 24" fill="none" 
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" 
    strokeLinejoin="round" className={className}
  >
    <circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" />
  </svg>
);

export default Layout;
