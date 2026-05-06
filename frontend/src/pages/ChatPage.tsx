import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Send, Plus, X, User, Edit, 
  Trash2, Check, ChevronDown,
  Sprout, Wind, Zap, Droplets, Sun, Hammer, LayoutGrid,
  Image as ImageIcon
} from 'lucide-react';
import Layout from '../components/Layout';
import { useDraggableScroll } from '../hooks/useDraggableScroll';

const API_URL = import.meta.env.VITE_API_URL || '';

const ICONS_MAP: any = {
  'Sprout': Sprout,
  'Truck': Wind,
  'Wind': Wind,
  'Zap': Zap,
  'Droplets': Droplets,
  'Sun': Sun,
  'Hammer': Hammer,
  'Default': LayoutGrid
};

const ChatPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const dragScroll = useDraggableScroll<HTMLDivElement>();
  
  // Estados UI
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0); 
  const [showNewModal, setShowNewModal] = useState(false);
  const [editingAtv, setEditingAtv] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showRespDropdown, setShowRespDropdown] = useState(false);

  // Refs
  const respRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Form Novo
  const [newAtvForm, setNewAtvForm] = useState({
    descricao: '', id_tipo_atividade: 0, responsavel: 'Produtor',
    data: new Date().toLocaleDateString('en-CA'), fotos: [] as string[]
  });

  // Queries
  const { data: lavouras = [] } = useQuery({
    queryKey: ['lavouras'],
    queryFn: () => fetch(`${API_URL}/api/v1/lavouras`).then(res => res.json())
  });
  
  const lavoura = lavouras.find((l: any) => l.id === Number(id));

  const { data: tipos = [] } = useQuery({
    queryKey: ['tipos-atividade'],
    queryFn: () => fetch(`${API_URL}/api/v1/tipos-atividade`).then(res => res.json()),
  });

  const { data: funcionarios = [] } = useQuery({
    queryKey: ['funcionarios'],
    queryFn: () => fetch(`${API_URL}/api/v1/funcionarios`).then(res => res.json())
  });

  const { data: atividades = [], isLoading: loading } = useQuery({
    queryKey: ['atividades', id],
    queryFn: () => fetch(`${API_URL}/api/v1/lavouras/${id}/atividades`).then(res => res.json()),
    enabled: !!id
  });

  // Efeito para definir a categoria padrão assim que carregar
  useEffect(() => {
    if (tipos.length > 0 && newAtvForm.id_tipo_atividade === 0) {
      setNewAtvForm(p => ({ ...p, id_tipo_atividade: tipos[0].id }));
    }
  }, [tipos, newAtvForm.id_tipo_atividade]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: (newData: any) => fetch(`${API_URL}/api/v1/atividades`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newData, id_lavoura: Number(id) })
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['atividades', id] });
      setNewAtvForm({ 
        descricao: '', 
        id_tipo_atividade: tipos[0]?.id || 0, 
        responsavel: 'Produtor', 
        data: new Date().toLocaleDateString('en-CA'), 
        fotos: [] 
      });
      setShowNewModal(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: (atv: any) => fetch(`${API_URL}/api/v1/atividades/${atv.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        descricao: atv.descricao,
        id_tipo_atividade: atv.tipo.id,
        responsavel: atv.responsavel,
        data: atv.data,
        fotos: atv.imagens.map((img: any) => img.foto_url)
      })
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['atividades', id] });
      setEditingAtv(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (atvId: number) => fetch(`${API_URL}/api/v1/atividades/${atvId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['atividades', id] });
      setDeletingId(null);
    }
  });

  const uploadMutation = useMutation({
    mutationFn: (formData: FormData) => fetch(`${API_URL}/api/v1/upload`, { method: 'POST', body: formData }).then(res => res.json()),
  });

  // Scroll Automático
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [atividades]);

  // Click Outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (respRef.current && !respRef.current.contains(event.target as Node)) setShowRespDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handlers
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      const data = await uploadMutation.mutateAsync(formData);
      
      if (data.url) {
        if (isEdit && editingAtv) {
          setEditingAtv((prev: any) => ({
            ...prev,
            imagens: [...prev.imagens, { id: Date.now(), foto_url: data.url }]
          }));
        } else {
          setNewAtvForm(p => ({ ...p, fotos: [...p.fotos, data.url] }));
          if (!isEdit) setShowNewModal(true);
        }
      }
    }
    e.target.value = '';
  };

  const handleCreate = () => {
    if (!newAtvForm.descricao.trim() && newAtvForm.fotos.length === 0) return;
    createMutation.mutate(newAtvForm);
  };

  const renderIcon = (name: string, size = 10) => {
    const Icon = ICONS_MAP[name] || ICONS_MAP['Default'];
    return <Icon size={size} />;
  };

  const filteredAtividades = atividades.filter((a: any) => {
    const matchesSearch = a.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          a.tipo.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 0 || a.tipo.id === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <Layout 
      title={lavoura?.nome || "Carregando..."} 
      subtitle={lavoura ? "Toque para ver os detalhes" : undefined}
      avatarUrl={lavoura?.foto_perfil}
      showBackButton={true} 
      onSearchClick={() => setShowSearch(!showSearch)}
      onTitleClick={() => navigate(`/lavoura/${id}/perfil`)}
    >
      <div className="flex flex-col h-full bg-[#efeae2] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06] bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat"></div>
        
        {/* Busca */}
        {showSearch && (
          <div className="p-2 bg-white border-b border-gray-100 animate-in slide-in-from-top-2 duration-200 z-30">
            <input 
              type="text" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              placeholder="Pesquisar no chat..." 
              className="w-full px-4 py-2 bg-gray-100 rounded-full text-sm outline-none focus:ring-1 focus:ring-whatsapp-teal" 
              autoFocus 
            />
          </div>
        )}

        {/* Categorias / Abas */}
        <div 
          className={`bg-white border-b border-gray-100 overflow-x-auto no-scrollbar shadow-sm z-10 ${dragScroll.className}`}
          ref={dragScroll.ref}
          onMouseDown={dragScroll.onMouseDown}
          onMouseLeave={dragScroll.onMouseLeave}
          onMouseUp={dragScroll.onMouseUp}
          onMouseMove={dragScroll.onMouseMove}
        >
          <div className="flex p-2 flex-nowrap gap-2 min-w-max px-4">
            <button 
              onClick={() => setActiveTab(0)} 
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase transition-all ${activeTab === 0 ? 'bg-gray-800 text-white shadow-md scale-105' : 'bg-gray-100 text-gray-500'}`}
            >
              🏠 Geral
            </button>
            {tipos.map((t: any) => (
              <button 
                key={t.id} 
                onClick={() => setActiveTab(t.id)} 
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase transition-all ${activeTab === t.id ? `${t.cor} text-white shadow-md scale-105` : 'bg-gray-100 text-gray-500'}`}
              >
                {renderIcon(t.icone, 12)} {t.nome}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Mensagens */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 relative no-scrollbar pb-32">
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className={`flex flex-col animate-pulse ${i % 2 === 0 ? 'items-start' : 'items-end'}`}>
                <div className="bg-gray-200 rounded-xl rounded-tl-none p-3 shadow-sm w-[70%] h-24 relative border-l-4 border-l-gray-300"></div>
              </div>
            ))
          ) : filteredAtividades.map((atv: any) => (
            <div key={atv.id} className="flex flex-col group animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-white rounded-xl rounded-tl-none p-3 shadow-sm max-w-[90%] relative self-start border-l-4 border-l-whatsapp-teal">
                <div className="flex justify-between items-center gap-4 mb-0.5">
                  <span className="text-[10px] font-black text-whatsapp-teal uppercase tracking-tight">{atv.responsavel}</span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setEditingAtv(atv)} className="p-1 text-gray-300 hover:text-whatsapp-teal"><Edit size={14} /></button>
                    <button onClick={() => setDeletingId(atv.id)} className="p-1 text-gray-300 hover:text-red-500"><Trash2 size={14} /></button>
                  </div>
                </div>
                <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md mb-2 shadow-sm ${atv.tipo.cor}`}>
                  <div className="text-white">{renderIcon(atv.tipo.icone)}</div>
                  <span className="text-[8px] font-black text-white uppercase tracking-tighter">{atv.tipo.nome}</span>
                </div>
                <p className="text-[13px] text-gray-800 leading-snug font-medium mb-1 whitespace-pre-wrap">{atv.descricao}</p>
                {atv.imagens?.length > 0 && (
                  <div className={`mt-2 grid ${atv.imagens.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} gap-1 rounded-lg overflow-hidden`}>
                    {atv.imagens.map((img: any) => (
                      <img 
                        key={img.id} 
                        src={img.foto_url ? (img.foto_url.startsWith('http') ? img.foto_url : (API_URL + img.foto_url)) : ""} 
                        className="w-full h-32 object-cover cursor-pointer active:scale-95 transition-all" 
                        onClick={() => setLightboxImage(img.foto_url.startsWith('http') ? img.foto_url : (API_URL + img.foto_url))} 
                      />
                    ))}
                  </div>
                )}
                <div className="text-[9px] text-gray-400 font-bold mt-1 text-right italic">{new Date(atv.data).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar - FIXADA NO RODAPÉ */}
        <div className="fixed bottom-0 left-0 right-0 bg-white p-3 flex items-center gap-3 border-t border-gray-100 z-50 pb-safe shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
          <button 
            onClick={() => fileInputRef.current?.click()} 
            className="p-3 bg-teal-50 text-whatsapp-teal rounded-full hover:bg-teal-100 active:scale-95 transition-all"
          >
            {uploadMutation.isPending ? <div className="w-5 h-5 border-2 border-whatsapp-teal border-t-transparent animate-spin rounded-full" /> : <ImageIcon size={22} />}
          </button>
          <input type="file" hidden ref={fileInputRef} onChange={(e) => handleFileUpload(e)} accept="image/*" capture="environment" multiple />
          
          <div className="flex-1 bg-gray-50 border border-gray-100 rounded-3xl px-4 py-3 flex items-center focus-within:ring-2 focus-within:ring-whatsapp-teal/20 transition-all">
            <input 
              type="text" 
              value={newAtvForm.descricao} 
              onChange={e => setNewAtvForm({...newAtvForm, descricao: e.target.value})} 
              onKeyDown={e => e.key === 'Enter' && (newAtvForm.descricao.trim() && setShowNewModal(true))} 
              placeholder="Registrar atividade..." 
              className="w-full text-sm outline-none bg-transparent placeholder-gray-400 text-gray-700 font-medium" 
            />
          </div>
          
          <button 
            onClick={() => setShowNewModal(true)} 
            disabled={!newAtvForm.descricao.trim() && newAtvForm.fotos.length === 0} 
            className={`p-3 rounded-full shadow-sm transition-all ${
              newAtvForm.descricao.trim() || newAtvForm.fotos.length > 0 
                ? 'bg-whatsapp-teal text-white hover:bg-teal-600 active:scale-90 shadow-whatsapp-teal/30 shadow-lg' 
                : 'bg-gray-100 text-gray-400'
            }`}
          >
            <Send size={20} className={newAtvForm.descricao.trim() || newAtvForm.fotos.length > 0 ? 'ml-0.5' : ''} />
          </button>
        </div>

        {/* MODAL: NOVO */}
        {showNewModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
              <div className="bg-whatsapp-teal p-6 text-white flex justify-between items-center">
                <h3 className="text-xl font-black">Registrar Atividade</h3>
                <button onClick={() => setShowNewModal(false)}><X size={20} /></button>
              </div>
              <div className="p-8 pb-10 space-y-6 overflow-y-auto no-scrollbar relative">
                <div className="grid grid-cols-3 gap-2">
                  {newAtvForm.fotos.map((url, idx) => (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                      <img src={url} className="w-full h-full object-cover" />
                      <button onClick={() => setNewAtvForm({...newAtvForm, fotos: newAtvForm.fotos.filter((_, i) => i !== idx)})} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-md"><X size={10} /></button>
                    </div>
                  ))}
                  <button onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 hover:text-whatsapp-teal hover:border-whatsapp-teal transition-all"><Plus size={24} /></button>
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block ml-2">Descrição</label>
                  <textarea 
                    value={newAtvForm.descricao} 
                    onChange={e => setNewAtvForm({...newAtvForm, descricao: e.target.value})} 
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm min-h-[100px] outline-none focus:ring-1 focus:ring-whatsapp-teal" 
                    placeholder="O que aconteceu no campo?" 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block ml-2">Categoria</label>
                  <div className="flex flex-wrap gap-2">
                    {tipos.map((t: any) => (
                      <button 
                        key={t.id} 
                        onClick={() => setNewAtvForm({...newAtvForm, id_tipo_atividade: t.id})} 
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-1 transition-all ${newAtvForm.id_tipo_atividade === t.id ? `${t.cor} text-white shadow-lg scale-105` : 'bg-gray-100 text-gray-500'}`}
                      >
                        {renderIcon(t.icone, 12)} {t.nome}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="relative" ref={respRef}>
                  <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block ml-2">Responsável</label>
                  <button onClick={() => setShowRespDropdown(!showRespDropdown)} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-left flex items-center justify-between hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-whatsapp-teal/10 flex items-center justify-center text-whatsapp-teal"><User size={16} /></div>
                      {newAtvForm.responsavel}
                    </div>
                    <ChevronDown size={16} className={`text-gray-300 transition-transform ${showRespDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  {showRespDropdown && (
                    <div className="absolute bottom-full mb-2 left-0 w-full bg-white rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-gray-100 z-[100] overflow-hidden">
                      <div className="p-2 space-y-1 max-h-56 overflow-y-auto no-scrollbar">
                        <button onClick={() => { setNewAtvForm({...newAtvForm, responsavel: 'Produtor'}); setShowRespDropdown(false); }} className={`w-full p-3 rounded-2xl text-left text-sm font-bold flex items-center justify-between transition-all ${newAtvForm.responsavel === 'Produtor' ? 'bg-whatsapp-teal/10 text-whatsapp-teal' : 'hover:bg-gray-50 text-gray-700'}`}>
                          Produtor (Eu)
                          {newAtvForm.responsavel === 'Produtor' && <Check size={18} />}
                        </button>
                        {funcionarios.map((f: any) => (
                          <button key={f.id_funcionario} onClick={() => { setNewAtvForm({...newAtvForm, responsavel: f.nome}); setShowRespDropdown(false); }} className={`w-full p-3 rounded-2xl text-left text-sm font-bold flex items-center justify-between transition-all ${newAtvForm.responsavel === f.nome ? 'bg-whatsapp-teal/10 text-whatsapp-teal' : 'hover:bg-gray-50 text-gray-700'}`}>
                            {f.nome}
                            {newAtvForm.responsavel === f.nome && <Check size={18} />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-8 bg-gray-50">
                <button 
                  onClick={handleCreate} 
                  disabled={createMutation.isPending || uploadMutation.isPending} 
                  className="w-full py-4 bg-whatsapp-teal text-white font-black rounded-2xl shadow-xl shadow-whatsapp-teal/20 hover:bg-whatsapp-teal-dark active:scale-95 transition-all disabled:opacity-50"
                >
                  {createMutation.isPending ? 'REGISTRANDO...' : 'CONFIRMAR REGISTRO'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: EDITAR (Simplificado para o exemplo) */}
        {editingAtv && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
             <div className="bg-white w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
               <div className="bg-whatsapp-teal p-6 text-white flex justify-between items-center">
                 <h3 className="text-xl font-black">Editar Registro</h3>
                 <button onClick={() => setEditingAtv(null)}><X size={20} /></button>
               </div>
               <div className="p-8 space-y-4 overflow-y-auto">
                  <textarea 
                    value={editingAtv.descricao} 
                    onChange={e => setEditingAtv({...editingAtv, descricao: e.target.value})} 
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm min-h-[100px] outline-none" 
                  />
                  <button 
                    onClick={() => updateMutation.mutate(editingAtv)} 
                    className="w-full py-4 bg-whatsapp-teal text-white font-black rounded-2xl"
                  >
                    {updateMutation.isPending ? 'SALVANDO...' : 'SALVAR ALTERAÇÕES'}
                  </button>
               </div>
             </div>
          </div>
        )}

        {/* MODAL: DELETE */}
        {deletingId && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
            <div className="bg-white rounded-[2.5rem] p-8 text-center max-w-xs w-full shadow-2xl">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 size={32} /></div>
              <h3 className="text-lg font-black mb-2">Apagar registro?</h3>
              <div className="flex gap-4 mt-6">
                <button onClick={() => setDeletingId(null)} className="flex-1 py-3 text-xs font-black text-gray-400 bg-gray-100 rounded-xl">NÃO</button>
                <button onClick={() => deleteMutation.mutate(deletingId)} className="flex-1 py-3 text-xs font-black text-white bg-red-500 rounded-xl">SIM</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxImage && (
        <div className="fixed inset-0 bg-black/95 z-[200] flex items-center justify-center p-2" onClick={() => setLightboxImage(null)}>
          <img src={lightboxImage} className="max-w-full max-h-full object-contain rounded-lg" />
        </div>
      )}
    </Layout>
  );
};

export default ChatPage;