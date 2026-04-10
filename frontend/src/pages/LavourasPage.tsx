import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sprout, MessageSquarePlus, Settings, Search, Trash, MoreVertical, Pin, PinOff } from 'lucide-react';
import Layout from '../components/Layout';

interface Lavoura {
  id: number;
  nome: string;
  cultura: string;
  ultimaAtividade?: string;
  data?: string;
  foto_perfil: string;
  is_pinned: boolean;
  ultima_atividade_date?: string | null;
}

const LavourasPage = () => {
  const [lavouras, setLavouras] = useState<Lavoura[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [selectedLavoura, setSelectedLavoura] = useState<Lavoura | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const navigate = useNavigate();

  // Hook para Long Press (Simplificado)
  const [longPressTimer, setLongPressTimer] = useState<any>(null);

  const startLongPress = (lavoura: Lavoura) => {
    const timer = setTimeout(() => {
      setSelectedLavoura(lavoura);
    }, 600);
    setLongPressTimer(timer);
  };

  const clearLongPress = () => {
    if (longPressTimer) clearTimeout(longPressTimer);
  };

  const loadLavouras = () => {
    setLoading(true);
    fetch('/api/v1/lavouras')
      .then(res => res.json())
      .then(data => {
        setLavouras(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erro ao buscar lavouras:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadLavouras();
  }, []);

  const handleDelete = async () => {
    if (!selectedLavoura) return;
    try {
      const res = await fetch(`/api/v1/lavouras/${selectedLavoura.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setShowDeleteConfirm(false);
        setSelectedLavoura(null);
        loadLavouras();
      }
    } catch (err) {
      console.error("Erro ao excluir lavoura:", err);
    }
  };

  const handleTogglePin = async (e: React.MouseEvent, lavoura: Lavoura) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/v1/lavouras/${lavoura.id}/pin`, {
        method: 'PATCH'
      });
      if (res.ok) {
        loadLavouras();
        setSelectedLavoura(null);
      }
    } catch (err) {
      console.error("Erro ao alternar fixação:", err);
    }
  };

  // Lógica de Ordenação Híbrida (Igual ao WhatsApp)
  const sortedLavouras = [...lavouras].sort((a, b) => {
    // 1. Pinned items primeiro
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;

    // 2. Depois por data da última atividade (mais recente primeiro)
    const dateA = a.ultima_atividade_date ? new Date(a.ultima_atividade_date).getTime() : 0;
    const dateB = b.ultima_atividade_date ? new Date(b.ultima_atividade_date).getTime() : 0;
    
    if (dateA !== dateB) return dateB - dateA;

    // 3. Fallback para ID (mais novos primeiro)
    return b.id - a.id;
  });

  const filteredLavouras = sortedLavouras.filter(l => 
    l.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.cultura.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout 
      showTabs={true} 
      onSearchClick={() => setShowSearch(!showSearch)}
    >
      <div className="bg-white min-h-screen pb-20">
        <div className="bg-whatsapp-teal text-white p-4 text-xs font-bold uppercase tracking-widest text-center shadow-inner">
          Meus Talhões de Café
        </div>
        
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
          <div className="p-10 text-center text-gray-500 italic font-medium">
            Carregando seus chats...
          </div>
        ) : filteredLavouras.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            <div className="mb-4 flex justify-center text-gray-300">
              <Sprout size={64} />
            </div>
            <p className="font-bold text-gray-600">
              {searchTerm ? 'Nenhuma lavoura encontrada.' : 'Sua lista está vazia.'}
            </p>
            <p className="text-sm mt-1">Clique no botão verde lateral para começar.</p>
          </div>
        ) : (
          filteredLavouras.map((lavoura) => (
            <div 
              key={lavoura.id}
              onClick={() => navigate(`/chat/${lavoura.id}`)}
              onPointerDown={() => startLongPress(lavoura)}
              onPointerUp={clearLongPress}
              onPointerLeave={clearLongPress}
              className={`group flex items-center p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 active:bg-gray-100 transition-all relative ${lavoura.is_pinned ? 'bg-gray-50/50' : 'bg-white'}`}
            >
              {/* Avatar */}
              <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 bg-gray-200 shadow-sm">
                <img 
                  src={lavoura.foto_perfil || "/images/default-lavoura.jpg"} 
                  alt={lavoura.nome} 
                  className="w-full h-full object-cover" 
                />
              </div>

              {/* Info */}
              <div className="ml-4 flex-1">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900">{lavoura.nome}</h3>
                    {lavoura.is_pinned && <Pin size={12} className="text-whatsapp-teal fill-whatsapp-teal -rotate-45" />}
                  </div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                    {lavoura.ultima_atividade_date 
                      ? new Date(lavoura.ultima_atividade_date).toLocaleDateString() 
                      : (lavoura.data || "Hoje")}
                  </span>
                </div>
                <p className="text-sm text-gray-500 truncate mt-0.5 flex items-center gap-1">
                  <Sprout size={14} className="text-whatsapp-green" />
                  {lavoura.cultura} {lavoura.ultimaAtividade ? `- ${lavoura.ultimaAtividade}` : ""}
                </p>
              </div>

              {/* Three Dots Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedLavoura(lavoura);
                }}
                className="ml-2 p-2 rounded-full text-gray-300 hover:text-whatsapp-teal hover:bg-gray-100 transition-all"
              >
                <MoreVertical size={20} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Floating Action Button */}
      <button 
        onClick={() => navigate('/nova-lavoura')}
        className="fixed bottom-8 right-8 w-16 h-16 bg-whatsapp-green text-white rounded-full shadow-2xl flex items-center justify-center transition-all active:scale-90 z-50 hover:shadow-whatsapp-green/40"
      >
        <MessageSquarePlus size={32} />
      </button>

      {/* Options Modal */}
      {selectedLavoura && !showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-[100] p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden animate-in slide-in-from-bottom-10 duration-300 shadow-2xl">
            <div className="p-8">
              <div className="flex items-center gap-5 mb-8">
                <img src={selectedLavoura.foto_perfil} alt="" className="w-20 h-20 rounded-full object-cover border-4 border-gray-50 shadow-lg" />
                <div>
                  <h3 className="font-black text-2xl text-gray-900 leading-tight">{selectedLavoura.nome}</h3>
                  <p className="text-gray-400 font-bold text-sm flex items-center gap-1 mt-1">
                    <Sprout size={14} className="text-whatsapp-green" />
                    {selectedLavoura.cultura}
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <button 
                  onClick={(e) => handleTogglePin(e, selectedLavoura)}
                  className="w-full flex items-center justify-center gap-3 bg-whatsapp-teal text-white py-4 rounded-2xl font-black shadow-xl shadow-whatsapp-teal/20 active:scale-95 transition-all text-lg"
                >
                  {selectedLavoura.is_pinned ? (
                    <><PinOff size={24} /> Desafixar Talhão</>
                  ) : (
                    <><Pin size={24} /> Fixar no Topo</>
                  )}
                </button>
                <button 
                  onClick={() => navigate(`/editar-lavoura/${selectedLavoura.id}`)}
                  className="w-full flex items-center justify-center gap-3 bg-gray-100 text-gray-700 py-4 rounded-2xl font-bold active:scale-95 transition-all"
                >
                  <Settings size={24} /> Editar Talhão
                </button>
                <button 
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full flex items-center justify-center gap-3 bg-red-50 text-red-600 py-4 rounded-2xl font-bold active:scale-95 transition-all"
                >
                  <Trash size={24} /> Excluir Registro
                </button>
                <button 
                  onClick={() => setSelectedLavoura(null)}
                  className="w-full py-4 text-gray-400 font-bold active:scale-95 transition-all uppercase text-xs tracking-widest pt-6"
                >
                  Fechar Menu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedLavoura && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[110] p-6 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-10 text-center">
              <div className="w-24 h-24 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                <Trash size={48} />
              </div>
              <h3 className="text-3xl font-black text-gray-900 mb-4">Confirmar?</h3>
              <p className="text-gray-500 mb-10 leading-relaxed font-medium">
                Esta ação apagará **definitivamente** o talhão <span className="font-black text-red-600 underline">{selectedLavoura.nome}</span> e todo o seu histórico.
              </p>
              
              <div className="flex flex-col gap-4">
                <button 
                  onClick={handleDelete}
                  className="w-full bg-red-600 text-white py-5 rounded-[1.5rem] font-black shadow-2xl shadow-red-200 active:scale-95 transition-all text-xl"
                >
                  APAGAR TUDO
                </button>
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="w-full py-5 text-gray-400 font-bold active:scale-95 transition-all"
                >
                  Cancelar, manter talhão
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default LavourasPage;
