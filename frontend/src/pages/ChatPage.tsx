import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Send, Image as ImageIcon, User, Calendar, Edit, Trash, Sprout, Truck, Wind, Search, X } from 'lucide-react';

const CategoryIcon = ({ name, size = 14 }: { name: string; size?: number }) => {
  const icons: Record<string, any> = {
    Sprouts: Sprout,
    Truck: Truck,
    Wind: Wind,
    Search: Search
  };
  const IconComponent = icons[name] || Search;
  return <IconComponent size={size} />;
};
import Layout from '../components/Layout';

interface TipoAtividade {
  id: number;
  nome: string;
  icone: string;
  cor: string;
}

interface Atividade {
  id: number;
  tipo: TipoAtividade;
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
  const [tipos, setTipos] = useState<TipoAtividade[]>([]);
  const [lavoura, setLavoura] = useState<Lavoura | null>(null);
  const [loading, setLoading] = useState(true);
  
  // States for search and UI modes
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  
  // Modals / Flow States
  const [editingAtv, setEditingAtv] = useState<any | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0); // 0 = Geral
  
  // New Activity Form State
  const [newAtvForm, setNewAtvForm] = useState({
    descricao: '',
    id_tipo_atividade: 0,
    responsavel: 'Produtor',
    data: new Date().toLocaleDateString('en-CA'), // YYYY-MM-DD local
    fotos: [] as string[]
  });
  
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  useEffect(() => {
    if (atividades.length > 0) {
      scrollToBottom();
    }
  }, [atividades]);

  useEffect(() => {
    // Buscar detalhes da lavoura
    fetch(`/api/v1/lavouras`)
      .then(res => res.json())
      .then((data: Lavoura[]) => {
        const current = data.find(l => l.id === Number(id));
        if (current) setLavoura(current);
      });

    // Buscar tipos de atividade
    fetch('/api/v1/tipos-atividade')
      .then(res => res.json())
      .then(data => {
        setTipos(data);
        if (data.length > 0) {
          setNewAtvForm(prev => ({ ...prev, id_tipo_atividade: data[0].id }));
        }
      });

    loadAtividades();
  }, [id]);

  const loadAtividades = () => {
    setLoading(true);
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
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/v1/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        if (isEdit && editingAtv) {
          setEditingAtv({
            ...editingAtv,
            imagens: [...editingAtv.imagens, { id: Date.now(), foto_url: data.url }]
          });
        } else {
          setNewAtvForm(prev => ({ ...prev, fotos: [...prev.fotos, data.url] }));
          setShowNewModal(true);
        }
      }
    } catch (err) {
      console.error("Erro no upload:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleCreateActivity = async () => {
    if (!newAtvForm.descricao.trim() && newAtvForm.fotos.length === 0) return;
    if (!newAtvForm.id_tipo_atividade || sending) return;

    console.log("Criando atividade com form:", newAtvForm);
    setSending(true);
    try {
      const response = await fetch('/api/v1/atividades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_lavoura: Number(id),
          id_tipo_atividade: newAtvForm.id_tipo_atividade,
          descricao: newAtvForm.descricao,
          responsavel: newAtvForm.responsavel,
          data: newAtvForm.data,
          fotos: newAtvForm.fotos
        }),
      });

      if (response.ok) {
        setNewAtvForm({
          descricao: '',
          id_tipo_atividade: tipos[0]?.id || 0,
          responsavel: 'Produtor',
          data: new Date().toLocaleDateString('en-CA'),
          fotos: []
        });
        setActiveTab(newAtvForm.id_tipo_atividade); // Trocar para a aba da nova atividade
        setShowNewModal(false);
        loadAtividades();
      }
    } catch (err) {
      console.error("Erro ao enviar:", err);
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (atvId: number) => {
    setDeletingId(null);
    try {
      const res = await fetch(`/api/v1/atividades/${atvId}`, { method: 'DELETE' });
      if (res.ok) loadAtividades();
    } catch (err) {
      console.error("Erro ao deletar:", err);
    }
  };

  const handleUpdate = async () => {
    if (!editingAtv) return;
    console.log("Atualizando atividade:", editingAtv);
    try {
      const res = await fetch(`/api/v1/atividades/${editingAtv.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          descricao: editingAtv.descricao,
          id_tipo_atividade: editingAtv.tipo.id,
          responsavel: editingAtv.responsavel,
          data: editingAtv.data,
          fotos: editingAtv.imagens.map((img: any) => img.foto_url)
        }),
      });
      if (res.ok) {
        setEditingAtv(null);
        loadAtividades();
      }
    } catch (err) {
      console.error("Erro ao atualizar:", err);
    }
  };

  const filteredAtividades = atividades.filter(a => {
    const matchesSearch = a.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          a.tipo.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 0 || a.tipo.id === activeTab;
    return matchesSearch && matchesTab;
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Layout 
      title={lavoura?.nome || 'Chat'} 
      showBackButton={true}
      onSearchClick={() => setShowSearch(!showSearch)}
      onTitleClick={() => navigate(`/lavoura/${id}/perfil`)}
    >
      <div className="flex flex-col h-full bg-whatsapp-chat-bg relative">
        {/* Search Area */}
        {showSearch && (
          <div className="p-2 bg-white border-b border-gray-100 animate-in slide-in-from-top-2 duration-200">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar no histórico..."
              className="w-full px-4 py-1.5 bg-gray-100 rounded-full text-sm outline-none focus:ring-1 focus:ring-whatsapp-teal"
              autoFocus
            />
          </div>
        )}

        {/* Tabs / Categories */}
        <div className="bg-white border-b border-gray-100 overflow-x-auto no-scrollbar shadow-sm z-10">
          <div className="flex p-2 flex-nowrap gap-2 min-w-max px-4">
            <button
              onClick={() => setActiveTab(0)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeTab === 0 
                ? 'bg-gray-800 text-white shadow-md scale-105' 
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              🏠 Geral
            </button>
            {tipos.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  activeTab === t.id 
                  ? `${t.cor} text-white shadow-md scale-105` 
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                <CategoryIcon name={t.icone} />
                {t.nome}
              </button>
            ))}
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading && atividades.length === 0 ? (
            <div className="text-center text-gray-500 py-10 italic">Carregando histórico...</div>
          ) : filteredAtividades.length === 0 ? (
            <div className="text-center text-gray-500 py-10 italic">
              {searchTerm ? 'Nenhum resultado encontrado.' : 'Nenhuma atividade registrada ainda.'}
            </div>
          ) : (
            filteredAtividades.map((atv) => (
              <div key={atv.id} className="flex flex-col items-start max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="bg-white p-3 rounded-lg rounded-tl-none shadow-sm border border-gray-100 relative group">
                  {/* Actions (Hover) */}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setEditingAtv(atv)} className="p-1 text-gray-400 hover:text-blue-500 rounded bg-white/80 shadow-sm">
                      <Edit size={14} />
                    </button>
                    <button onClick={() => setDeletingId(atv.id)} className="p-1 text-gray-400 hover:text-red-500 rounded bg-white/80 shadow-sm">
                      <Trash size={14} />
                    </button>
                  </div>

                  <div className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase mb-1 px-2 py-0.5 rounded-full text-white ${atv.tipo.cor}`}>
                    <CategoryIcon name={atv.tipo.icone} size={10} />
                    {atv.tipo.nome}
                  </div>
                  
                  <div className="flex items-center gap-2 text-[10px] text-gray-400 mb-1">
                    <User size={10} /> {atv.responsavel}
                    <span className="mx-1">•</span>
                    <Calendar size={10} /> {formatDate(atv.data)}
                  </div>

                  <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {atv.descricao}
                  </p>

                  {atv.imagens && atv.imagens.length > 0 && (
                    <div className="grid grid-cols-2 gap-1 mt-2 rounded overflow-hidden">
                      {atv.imagens.map((img) => (
                        <img 
                          key={img.id} 
                          src={img.foto_url} 
                          alt="Atividade" 
                          className="w-full h-24 object-cover cursor-pointer hover:opacity-90 transition-opacity shadow-sm border border-gray-50" 
                          onClick={() => window.open(img.foto_url, '_blank')}
                        />
                      ))}
                    </div>
                  )}
                  <div className="absolute top-0 -left-2 w-0 h-0 border-t-[10px] border-t-white border-l-[10px] border-l-transparent"></div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-[#f0f2f5] p-3 flex items-center gap-2 border-t border-gray-200">
          <input type="file" hidden ref={fileInputRef} onChange={(e) => handleFileUpload(e)} accept="image/*" />
          <button 
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="text-gray-500 p-2 hover:bg-gray-200 rounded-full transition-colors relative"
          >
            <ImageIcon size={24} className={uploading ? 'animate-pulse opacity-50' : ''} />
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-whatsapp-teal border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </button>
          <input
            type="text"
            value={newAtvForm.descricao}
            onChange={(e) => setNewAtvForm({...newAtvForm, descricao: e.target.value})}
            onKeyDown={(e) => e.key === 'Enter' && setShowNewModal(true)}
            placeholder="Registrar nova atividade..."
            className="flex-1 px-4 py-2 bg-white rounded-full text-sm text-gray-800 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-whatsapp-teal"
          />
          <button 
            onClick={() => setShowNewModal(true)}
            disabled={!newAtvForm.descricao.trim()}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              newAtvForm.descricao.trim() ? 'bg-whatsapp-teal text-white shadow-md active:scale-90' : 'bg-gray-300 text-white'
            }`}
          >
            <Send size={20} />
          </button>
        </div>

        {/* Modal: New Activity */}
        {showNewModal && (
          <div className="absolute inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
              <div className="bg-whatsapp-teal p-4 text-white flex justify-between items-center">
                <h3 className="font-semibold">Confirmar Registro</h3>
                <button onClick={() => setShowNewModal(false)} className="opacity-70 hover:opacity-100">×</button>
              </div>
              
              <div className="p-4 space-y-4 overflow-y-auto">
                {/* Images Preview */}
                {newAtvForm.fotos.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {newAtvForm.fotos.map((url, idx) => (
                      <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-100 shadow-sm">
                        <img src={url} className="w-full h-full object-cover" />
                        <button 
                          onClick={() => setNewAtvForm({ ...newAtvForm, fotos: newAtvForm.fotos.filter((_, i) => i !== idx) })}
                          className="absolute top-1 right-1 bg-black/30 hover:bg-red-500/80 backdrop-blur-sm text-white rounded-full w-6 h-6 flex items-center justify-center transition-all duration-200 shadow-sm"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 hover:border-whatsapp-teal hover:text-whatsapp-teal transition-colors"
                    >
                      <ImageIcon size={20} />
                    </button>
                  </div>
                )}

                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Descrição</label>
                  <textarea
                    value={newAtvForm.descricao}
                    onChange={(e) => setNewAtvForm({...newAtvForm, descricao: e.target.value})}
                    placeholder="O que foi feito?"
                    className="w-full mt-1 p-3 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:ring-1 focus:ring-whatsapp-teal outline-none"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Data</label>
                    <input
                      type="date"
                      value={newAtvForm.data}
                      onChange={(e) => setNewAtvForm({...newAtvForm, data: e.target.value})}
                      className="w-full mt-1 p-2 bg-gray-50 border border-gray-100 rounded-lg text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Responsável</label>
                    <input
                      type="text"
                      value={newAtvForm.responsavel}
                      onChange={(e) => setNewAtvForm({...newAtvForm, responsavel: e.target.value})}
                      className="w-full mt-1 p-2 bg-gray-50 border border-gray-100 rounded-lg text-sm outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Categoria</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tipos.map(t => (
                      <button
                        key={t.id}
                        onClick={() => setNewAtvForm({...newAtvForm, id_tipo_atividade: t.id})}
                        className={`text-[10px] px-3 py-1 rounded-full border transition-all ${
                          newAtvForm.id_tipo_atividade === t.id 
                          ? `${t.cor} text-white border-transparent shadow-sm` 
                          : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {t.nome}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-2">
                <button onClick={() => setShowNewModal(false)} className="flex-1 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">Cancelar</button>
                <button 
                  onClick={handleCreateActivity} 
                  disabled={sending}
                  className="flex-1 py-2.5 text-sm font-medium bg-whatsapp-teal text-white rounded-xl shadow-lg shadow-whatsapp-teal/20 hover:bg-whatsapp-teal-dark transition-colors disabled:opacity-50"
                >
                  {sending ? 'Salvando...' : 'Registrar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Edit Activity */}
        {editingAtv && (
          <div className="absolute inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
              <div className="bg-whatsapp-teal p-4 text-white flex justify-between items-center">
                <h3 className="font-semibold">Editar Atividade</h3>
                <button onClick={() => setEditingAtv(null)} className="opacity-70 hover:opacity-100">×</button>
              </div>
              
              <div className="p-4 space-y-4 overflow-y-auto">
                {/* Images Preview & Management */}
                <div className="grid grid-cols-3 gap-2">
                  {editingAtv.imagens.map((img: any, idx: number) => (
                    <div key={img.id || idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-100 shadow-sm">
                      <img src={img.foto_url} className="w-full h-full object-cover" />
                      <button 
                        onClick={() => setEditingAtv({
                          ...editingAtv,
                          imagens: editingAtv.imagens.filter((_: any, i: number) => i !== idx)
                        })}
                        className="absolute top-1 right-1 bg-black/30 hover:bg-red-500/80 backdrop-blur-sm text-white rounded-full w-6 h-6 flex items-center justify-center transition-all duration-200 shadow-sm"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  <input type="file" hidden ref={editFileInputRef} onChange={(e) => handleFileUpload(e, true)} accept="image/*" />
                  <button 
                    onClick={() => editFileInputRef.current?.click()}
                    className="aspect-square rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 hover:border-whatsapp-teal hover:text-whatsapp-teal transition-colors"
                  >
                    <ImageIcon size={20} />
                  </button>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Descrição</label>
                  <textarea
                    value={editingAtv.descricao}
                    onChange={(e) => setEditingAtv({...editingAtv, descricao: e.target.value})}
                    className="w-full mt-1 p-3 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:ring-1 focus:ring-whatsapp-teal outline-none"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Data</label>
                    <input
                      type="date"
                      value={editingAtv.data.split('T')[0]}
                      onChange={(e) => setEditingAtv({...editingAtv, data: e.target.value})}
                      className="w-full mt-1 p-2 bg-gray-50 border border-gray-100 rounded-lg text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Responsável</label>
                    <input
                      type="text"
                      value={editingAtv.responsavel}
                      onChange={(e) => setEditingAtv({...editingAtv, responsavel: e.target.value})}
                      className="w-full mt-1 p-2 bg-gray-50 border border-gray-100 rounded-lg text-sm outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Categoria</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tipos.map(t => (
                      <button
                        key={t.id}
                        onClick={() => setEditingAtv({...editingAtv, tipo: t})}
                        className={`text-[10px] px-3 py-1 rounded-full border transition-all ${
                          editingAtv.tipo.id === t.id 
                          ? `${t.cor} text-white border-transparent` 
                          : 'bg-white text-gray-500 border-gray-200'
                        }`}
                      >
                        {t.nome}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-2">
                <button onClick={() => setEditingAtv(null)} className="flex-1 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">Cancelar</button>
                <button onClick={handleUpdate} className="flex-1 py-2.5 text-sm font-medium bg-whatsapp-teal text-white rounded-xl shadow-lg shadow-whatsapp-teal/20 hover:bg-whatsapp-teal-dark transition-colors">Salvar Alterações</button>
              </div>
            </div>
          </div>
        )}
        {/* Modal: Confirm Delete */}
        {deletingId && (
          <div className="absolute inset-0 bg-black/60 z-[70] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-xs overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-red-50 mx-auto rounded-full flex items-center justify-center mb-4 text-red-500">
                  <Trash size={32} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Apagar Registro?</h3>
                <p className="text-sm text-gray-500">
                  Esta ação não pode ser desfeita. O registro de atividade será removido permanentemente.
                </p>
              </div>
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-2">
                <button 
                  onClick={() => setDeletingId(null)} 
                  className="flex-1 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => handleDelete(deletingId)} 
                  className="flex-1 py-2.5 text-sm font-medium bg-red-500 text-white rounded-xl shadow-lg shadow-red-500/20 hover:bg-red-600 transition-colors"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ChatPage;
