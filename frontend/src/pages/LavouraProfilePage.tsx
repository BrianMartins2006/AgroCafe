import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Calendar, MapPin, Sprout, Image as ImageIcon, ChevronRight } from 'lucide-react';
import Layout from '../components/Layout';

interface Lavoura {
  id: number;
  nome: string;
  cultura: string;
  foto_perfil: string;
}

interface MediaItem {
  id: number;
  foto_url: string;
  data: string;
  atividade_id: number;
}

const LavouraProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lavoura, setLavoura] = useState<Lavoura | null>(null);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Buscar detalhes da lavoura
    fetch(`/api/v1/lavouras/${id}`)
      .then(res => res.json())
      .then(data => setLavoura(data))
      .catch(err => console.error("Erro ao buscar lavoura:", err));

    // Buscar mídia da lavoura
    fetch(`/api/v1/lavouras/${id}/media`)
      .then(res => res.json())
      .then(data => {
        setMedia(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erro ao buscar mídia:", err);
        setLoading(false);
      });
  }, [id]);

  if (loading && !lavoura) {
    return <div className="h-screen flex items-center justify-center bg-gray-50 text-gray-400 italic">Carregando perfil...</div>;
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex flex-col">
      {/* Header / Cover */}
      <div className="relative bg-white shadow-sm">
        <div className="absolute top-4 left-4 z-10">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 bg-black/20 backdrop-blur-md text-white rounded-full hover:bg-black/40 transition-all"
          >
            <ArrowLeft size={24} />
          </button>
        </div>
        
        <div className="h-64 sm:h-80 overflow-hidden relative group">
          <img 
            src={lavoura?.foto_perfil || "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=800&q=80"} 
            alt={lavoura?.nome}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <h1 className="text-3xl font-black mb-1">{lavoura?.nome}</h1>
            <p className="flex items-center gap-2 text-white/80 font-medium">
              <Sprout size={18} /> {lavoura?.cultura}
            </p>
          </div>
          <button 
            onClick={() => navigate(`/editar-lavoura/${id}`)}
            className="absolute bottom-6 right-6 p-3 bg-whatsapp-teal text-white rounded-full shadow-lg active:scale-90 transition-all"
          >
            <Edit size={20} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 space-y-4 max-w-2xl mx-auto w-full">
        
        {/* Info Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-6">
          <h2 className="text-sm font-bold text-whatsapp-teal uppercase tracking-widest mb-4">Informações do Talhão</h2>
          
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center shrink-0">
              <MapPin size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase">Localização / Área</p>
              <p className="text-gray-800 font-medium">Área Central - 12.5 hectares</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
              <Calendar size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase">Data de Início</p>
              <p className="text-gray-800 font-medium">20 de Outubro de 2023</p>
            </div>
          </div>
        </div>

        {/* Media Gallery Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <ImageIcon size={20} className="text-gray-400" />
              <h2 className="text-sm font-bold text-whatsapp-teal uppercase tracking-widest">Arquivos e Mídia</h2>
            </div>
            <span className="text-xs font-bold text-gray-400">{media.length} itens</span>
          </div>

          {media.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed border-gray-100 rounded-xl">
              <p className="text-sm text-gray-400 italic">Nenhuma foto enviada neste chat ainda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {media.map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => window.open(item.foto_url, '_blank')}
                  className="aspect-square rounded-lg overflow-hidden border border-gray-50 cursor-pointer hover:opacity-80 transition-opacity relative group"
                >
                  <img 
                    src={item.foto_url} 
                    alt="Mídia" 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1">
                    <span className="text-[8px] text-white font-bold bg-black/40 backdrop-blur-sm rounded px-1">
                      {new Date(item.data).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activity Summary (Placeholder) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
              <ImageIcon size={20} />
            </div>
            <div>
              <p className="text-gray-800 font-bold">Relatório de Atividades</p>
              <p className="text-xs text-gray-400">Ver todas as mensagens trocadas</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-gray-300" />
        </div>

      </div>
    </div>
  );
};

export default LavouraProfilePage;
