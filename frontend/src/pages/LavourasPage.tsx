import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sprout, MessageSquarePlus, Settings, Search } from 'lucide-react';
import Layout from '../components/Layout';

interface Lavoura {
  id: number;
  nome: string;
  cultura: string;
  ultimaAtividade?: string;
  data?: string;
  foto_perfil: string;
}

const LavourasPage = () => {
  const [lavouras, setLavouras] = useState<Lavoura[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/v1/lavouras')
      .then(res => res.json())
      .then(data => {
        setLavouras(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erro ao buscar lavouras:", err);
        setLoading(false);
      });
  }, []);

  const filteredLavouras = lavouras.filter(l => 
    l.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.cultura.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout 
      showTabs={true} 
      onSearchClick={() => setShowSearch(!showSearch)}
    >
      <div className="bg-white min-h-full">
        {/* Search Bar */}
        {showSearch && (
          <div className="p-3 bg-gray-50 border-b border-gray-100 animate-in slide-in-from-top-2 duration-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Pesquisar lavoura ou cultura..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-whatsapp-teal transition-all"
              />
            </div>
          </div>
        )}

        {loading ? (
          <div className="p-10 text-center text-gray-500 italic">
            Carregando seus chats...
          </div>
        ) : filteredLavouras.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            <div className="mb-4 flex justify-center text-gray-300">
              <Sprout size={64} />
            </div>
            <p className="font-medium text-gray-600">
              {searchTerm ? 'Nenhuma lavoura encontrada para sua busca.' : 'Nenhuma lavoura cadastrada ainda.'}
            </p>
            <p className="text-sm mt-1">Toque no botão verde para começar.</p>
          </div>
        ) : (
          filteredLavouras.map((lavoura) => (
            <div 
              key={lavoura.id}
              onClick={() => navigate(`/chat/${lavoura.id}`)}
              className="flex items-center p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 active:bg-gray-200 transition-colors bg-white"
            >
              {/* Avatar */}
              <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 bg-gray-200">
                <img 
                  src={lavoura.foto_perfil || "/images/default-lavoura.jpg"} 
                  alt={lavoura.nome} 
                  className="w-full h-full object-cover" 
                />
              </div>

              {/* Info */}
              <div className="ml-4 flex-1">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-gray-900">{lavoura.nome}</h3>
                  <span className="text-xs text-gray-500">{lavoura.data || "Hoje"}</span>
                </div>
                <p className="text-sm text-gray-600 truncate mt-1 flex items-center gap-1">
                  <Sprout size={14} className="text-whatsapp-green" />
                  {lavoura.cultura} {lavoura.ultimaAtividade ? `- ${lavoura.ultimaAtividade}` : ""}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Floating Action Button */}
      <button 
        onClick={() => navigate('/nova-lavoura')}
        className="fixed bottom-6 right-6 w-14 h-14 bg-whatsapp-green text-white rounded-full shadow-lg flex items-center justify-center hover:bg-whatsapp-teal transition-transform active:scale-95 z-50"
      >
        <MessageSquarePlus size={24} />
      </button>

      {/* Settings FAB */}
      <button className="fixed bottom-24 right-6 w-10 h-10 bg-white text-gray-600 rounded-full shadow flex items-center justify-center hover:bg-gray-100 transition-transform active:scale-95 z-50">
        <Settings size={20} />
      </button>
    </Layout>
  );
};

export default LavourasPage;
