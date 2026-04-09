import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sprout, MessageSquarePlus, Settings } from 'lucide-react';
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

  return (
    <Layout showTabs={true}>
      <div className="bg-white min-h-full">
        {loading ? (
          <div className="flex justify-center items-center h-[60vh] text-gray-400">
            Carregando sua fazenda...
          </div>
        ) : lavouras.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-[60vh] text-gray-400 p-8 text-center">
            <Sprout size={48} className="mb-4 opacity-20" />
            <p>Nenhuma lavoura cadastrada ainda.</p>
            <p className="text-sm">Toque no botão verde para começar.</p>
          </div>
        ) : (
          lavouras.map((lavoura) => (
            <div 
              key={lavoura.id}
              onClick={() => navigate(`/chat/${lavoura.id}`)}
              className="flex items-center p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 active:bg-gray-200 transition-colors bg-white"
            >
              {/* Avatar */}
              <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 bg-gray-200">
                <img 
                  src={lavoura.foto_perfil || "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=100&q=80"} 
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
      <button className="fixed bottom-6 right-6 w-14 h-14 bg-whatsapp-green text-white rounded-full shadow-lg flex items-center justify-center hover:bg-whatsapp-teal transition-transform active:scale-95 z-50">
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
