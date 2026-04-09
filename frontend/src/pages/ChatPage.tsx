import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Send, Image as ImageIcon, User, Calendar } from 'lucide-react';
import Layout from '../components/Layout';

interface Atividade {
  id: number;
  tipo: {
    nome: string;
    icone: string;
    cor: string;
  };
  data: string;
  descricao: string;
  responsavel: string;
  imagens: { id: number; foto_url: string }[];
}

interface Lavoura {
  id: number;
  nome: string;
  cultura: string;
}

const ChatPage = () => {
  const { id } = useParams<{ id: string }>();
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [lavoura, setLavoura] = useState<Lavoura | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Buscar detalhes da lavoura (poderia ser otimizado buscando da lista global se houvesse context)
    fetch(`/api/v1/lavouras`)
      .then(res => res.json())
      .then((data: Lavoura[]) => {
        const current = data.find(l => l.id === Number(id));
        if (current) setLavoura(current);
      });

    // Buscar atividades
    fetch(`/api/v1/lavouras/${id}/atividades`)
      .then(res => res.json())
      .then(data => {
        setAtividades(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erro ao buscar atividades:", err);
        setLoading(false);
      });
  }, [id]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Layout title={lavoura?.nome || 'Chat'} showBackButton={true}>
      <div className="flex flex-col h-full bg-whatsapp-chat-bg">
        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="text-center text-gray-500 py-10 italic">Carregando histórico...</div>
          ) : atividades.length === 0 ? (
            <div className="text-center text-gray-500 py-10 italic">Nenhuma atividade registrada ainda.</div>
          ) : (
            atividades.map((atv) => (
              <div key={atv.id} className="flex flex-col items-start max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300">
                {/* Bubble */}
                <div className="bg-white p-3 rounded-lg rounded-tl-none shadow-sm border border-gray-100 relative group">
                  {/* Category Tag */}
                  <div className={`text-xs font-bold uppercase mb-1 px-2 py-0.5 rounded-full inline-block text-white ${atv.tipo.cor}`}>
                    {atv.tipo.nome}
                  </div>
                  
                  {/* Responsible & Date */}
                  <div className="flex items-center gap-2 text-[10px] text-gray-400 mb-1">
                    <User size={10} /> {atv.responsavel}
                    <span className="mx-1">•</span>
                    <Calendar size={10} /> {formatDate(atv.data)}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {atv.descricao}
                  </p>

                  {/* Images */}
                  {atv.imagens && atv.imagens.length > 0 && (
                    <div className="grid grid-cols-2 gap-1 mt-2 rounded overflow-hidden">
                      {atv.imagens.map((img) => (
                        <img 
                          key={img.id} 
                          src={img.foto_url} 
                          alt="Atividade" 
                          className="w-full h-24 object-cover cursor-pointer hover:opacity-90 transition-opacity shadow-sm border border-gray-50" 
                        />
                      ))}
                    </div>
                  )}

                  {/* Tail (WhatsApp style) */}
                  <div className="absolute top-0 -left-2 w-0 h-0 border-t-[10px] border-t-white border-l-[10px] border-l-transparent"></div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input Area */}
        <div className="bg-[#f0f2f5] p-3 flex items-center gap-2 border-t border-gray-200">
          <button className="text-gray-500 p-2 hover:bg-gray-200 rounded-full transition-colors">
            <ImageIcon size={24} />
          </button>
          <div className="flex-1 px-4 py-2 bg-white rounded-full text-sm text-gray-400 border border-gray-200">
            Registrar nova atividade...
          </div>
          <button className="w-10 h-10 bg-whatsapp-teal text-white rounded-full flex items-center justify-center hover:bg-opacity-90 transition-transform active:scale-90">
            <Send size={20} />
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default ChatPage;
