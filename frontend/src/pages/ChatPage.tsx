import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Send, Image as ImageIcon, Plus, MoreVertical, Search, 
  ArrowLeft, X, Calendar, User, MessageSquare, Trash2, 
  Edit, Check, Camera, Filter, ChevronRight, Briefcase, ChevronDown
} from 'lucide-react';
import Layout from '../components/Layout';

// Tipagem para as atividades
interface TipoAtividade {
  id: number;
  nome: string;
  icone: string;
  cor: string;
}

interface Atividade {
  id: number;
  id_lavoura: number;
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
  foto_perfil?: string;
}

const ChatPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [tipos, setTipos] = useState<TipoAtividade[]>([]);
  const [funcionarios, setFuncionarios] = useState<any[]>([]);
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
  const [showResponsavelDropdown, setShowResponsavelDropdown] = useState(false);
  const [showEditResponsavelDropdown, setShowEditResponsavelDropdown] = useState(false);
  
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
  const dropdownRef = useRef<HTMLDivElement>(null);
  const editDropdownRef = useRef<HTMLDivElement>(null);

  // Fecha dropdowns ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowResponsavelDropdown(false);
      }
      if (editDropdownRef.current && !editDropdownRef.current.contains(event.target as Node)) {
        setShowEditResponsavelDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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

    // Buscar funcionários
    fetch('/api/v1/funcionarios')
      .then(res => res.json())
      .then(data => setFuncionarios(data))
      .catch(err => console.error("Erro ao buscar funcionários:", err));

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
    if (!newAtvForm.descricao.trim()) return;
    
    setSending(true);
    try {
      const response = await fetch('/api/v1/atividades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newAtvForm,
          id_lavoura: Number(id)
        })
      });

      if (response.ok) {
        setNewAtvForm({
          descricao: '',
          id_tipo_atividade: tipos[0]?.id || 0,
          responsavel: 'Produtor',
          data: new Date().toLocaleDateString('en-CA'),
          fotos: []
        });
        setShowNewModal(false);
        loadAtividades();
      }
    } catch (err) {
      console.error("Erro ao criar atividade:", err);
    } finally {
      setSending(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingAtv) return;
    try {
      const response = await fetch(`/api/v1/atividades/${editingAtv.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          descricao: editingAtv.descricao,
          id_tipo_atividade: editingAtv.tipo.id,
          responsavel: editingAtv.responsavel,
          data: editingAtv.data,
          fotos: editingAtv.imagens.map((img: any) => img.foto_url)
        })
      });

      if (response.ok) {
        setEditingAtv(null);
        loadAtividades();
      }
    } catch (err) {
      console.error("Erro ao atualizar atividade:", err);
    }
  };

  const handleDelete = async (idAtv: number) => {
    try {
      const response = await fetch(`/api/v1/atividades/${idAtv}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setDeletingId(null);
        loadAtividades();
      }
    } catch (err) {
      console.error("Erro ao deletar atividade:", err);
    }
  };

  const Sprout = ({ size }: { size: number }) => <Check size={size} />;
  const Truck = ({ size }: { size: number }) => <Check size={size} />;
  const Wind = ({ size }: { size: number }) => <Check size={size} />;

  // Filtragem de atividades
  const filteredAtividades = atividades.filter(atv => {
    const matchesSearch = atv.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         atv.responsavel.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <Layout 
      title={lavoura?.nome || "Carregando..."} 
      showBackButton={true}
      onTitleClick={() => navigate(`/lavoura/${id}`)}
      onSearchClick={() => setShowSearch(!showSearch)}
    >
      <div className="flex flex-col h-full bg-[#efeae2] relative overflow-hidden">
        {/* Background Overlay (WhatsApp Pattern) */}
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat"></div>

        {/* Search Bar Overlay */}
        {showSearch && (
          <div className="bg-white p-2 border-b border-gray-200 z-10 animate-in slide-in-from-top duration-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text"
                autoFocus
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Pesquisar mensagens..."
                className="w-full bg-gray-100 rounded-lg py-2 pl-10 pr-10 outline-none text-sm"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <X size={18} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Chat Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 relative no-scrollbar">
          {loading ? (
            <div className="flex justify-center items-center h-20 text-gray-500 italic text-sm">Sincronizando atividades...</div>
          ) : filteredAtividades.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full opacity-40">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                <MessageSquare size={32} />
              </div>
              <p className="text-sm font-medium">Nenhum registro encontrado</p>
            </div>
          ) : (
            filteredAtividades.map((atv) => (
              <div key={atv.id} className="flex flex-col group animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="bg-white rounded-xl rounded-tl-none p-3 shadow-sm max-w-[85%] relative self-start border-l-4 border-l-whatsapp-teal">
                  <div className="flex justify-between items-start gap-4 mb-1">
                    <span className="text-[10px] font-black text-whatsapp-teal uppercase tracking-widest">{atv.responsavel}</span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setEditingAtv(atv)} className="p-1 text-gray-400 hover:text-whatsapp-teal"><Edit size={14} /></button>
                      <button onClick={() => setDeletingId(atv.id)} className="p-1 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 mb-2">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-black text-white uppercase tracking-tighter ${atv.tipo.cor}`}>
                      {atv.tipo.nome}
                    </span>
                  </div>

                  <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{atv.descricao}</p>

                  {atv.imagens && atv.imagens.length > 0 && (
                    <div className={`mt-2 grid ${atv.imagens.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} gap-1 rounded-lg overflow-hidden`}>
                      {atv.imagens.map((img) => (
                        <img key={img.id} src={img.foto_url} className="w-full h-40 object-cover hover:opacity-90 cursor-pointer transition-all" />
                      ))}
                    </div>
                  )}

                  <div className="text-[9px] text-gray-400 font-bold mt-1 text-right">
                    {new Date(atv.data).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area (Bottom) */}
        <div className="bg-[#f0f2f5] p-3 flex items-center gap-2 border-t border-gray-200 z-20">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-500 hover:text-whatsapp-teal active:scale-90 transition-all"
          >
            <Plus size={24} />
          </button>
          <input type="file" hidden ref={fileInputRef} onChange={handleFileUpload} accept="image/*" capture="environment" />
          
          <div className="flex-1 bg-white rounded-full px-4 py-2.5 flex items-center shadow-sm">
            <input 
              type="text" 
              value={newAtvForm.descricao}
              onChange={(e) => setNewAtvForm({...newAtvForm, descricao: e.target.value})}
              onKeyDown={(e) => e.key === 'Enter' && setShowNewModal(true)}
              placeholder="Registrar nova atividade..."
              className="w-full bg-transparent outline-none text-sm"
            />
          </div>

          <button 
            onClick={() => setShowNewModal(true)}
            className="w-11 h-11 bg-whatsapp-teal text-white rounded-full flex items-center justify-center shadow-md active:scale-90 transition-all"
          >
            <Send size={20} />
          </button>
        </div>

        {/* Modal: Confirm Registration (REFACTORED PREMIUM) */}
        {showNewModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
              {/* Modal Header */}
              <div className="bg-whatsapp-teal p-6 text-white flex justify-between items-center relative overflow-hidden">
                <div className="absolute top-0 right-0 opacity-10 rotate-12 -mr-4 -mt-4 pointer-events-none">
                  <Briefcase size={100} />
                </div>
                <div className="relative z-10">
                  <h3 className="text-xl font-black">Confirmar Registro</h3>
                  <p className="text-xs text-white/70 font-bold uppercase tracking-widest mt-1 text-left">Sincronizando com a lavoura</p>
                </div>
                <button onClick={() => setShowNewModal(false)} className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-all active:scale-90 relative z-20">
                  <X size={20} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-8 space-y-6 overflow-y-auto no-scrollbar">
                {/* Images Preview Section */}
                {newAtvForm.fotos.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 pb-2">
                    {newAtvForm.fotos.map((url, idx) => (
                      <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-gray-50 shadow-sm group">
                        <img src={url} className="w-full h-full object-cover" />
                        <button 
                          onClick={() => setNewAtvForm({...newAtvForm, fotos: newAtvForm.fotos.filter((_, i) => i !== idx)})}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 hover:border-whatsapp-teal hover:text-whatsapp-teal transition-all bg-gray-50/50"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                )}

                {/* Form Fields */}
                <div className="space-y-5">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 block ml-2 text-left">O que foi feito?</label>
                    <div className="relative">
                      <MessageSquare size={18} className="absolute left-4 top-4 text-gray-300" />
                      <textarea
                        value={newAtvForm.descricao}
                        onChange={(e) => setNewAtvForm({...newAtvForm, descricao: e.target.value})}
                        placeholder="Descreva a atividade..."
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-whatsapp-teal outline-none transition-all resize-none min-h-[100px]"
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 block ml-2 text-left">Data</label>
                      <div className="relative">
                        <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                        <input
                          type="date"
                          value={newAtvForm.data}
                          onChange={(e) => setNewAtvForm({...newAtvForm, data: e.target.value})}
                          className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-whatsapp-teal"
                        />
                      </div>
                    </div>

                    {/* CUSTOM PREMIUM SELECT (COMBOBOX) */}
                    <div className="relative" ref={dropdownRef}>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 block ml-2 text-left">Responsável</label>
                      <button 
                        type="button"
                        onClick={() => setShowResponsavelDropdown(!showResponsavelDropdown)}
                        className="w-full pl-12 pr-8 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold text-left focus:ring-2 focus:ring-whatsapp-teal transition-all flex items-center justify-between"
                      >
                        <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                        <span className="truncate">{newAtvForm.responsavel}</span>
                        <ChevronDown size={14} className={`text-gray-300 transition-transform ${showResponsavelDropdown ? 'rotate-180' : ''}`} />
                      </button>

                      {showResponsavelDropdown && (
                        <div className="absolute bottom-full left-0 w-full mb-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[110] animate-in slide-in-from-bottom-2 duration-200">
                          <div className="p-2 space-y-1 max-h-48 overflow-y-auto no-scrollbar">
                            <button 
                              type="button"
                              onClick={() => {
                                setNewAtvForm({...newAtvForm, responsavel: 'Produtor'});
                                setShowResponsavelDropdown(false);
                              }}
                              className={`w-full p-3 rounded-xl text-left text-xs font-bold flex items-center gap-3 transition-colors ${newAtvForm.responsavel === 'Produtor' ? 'bg-whatsapp-teal/10 text-whatsapp-teal' : 'hover:bg-gray-50 text-gray-600'}`}
                            >
                              <div className="w-8 h-8 rounded-full bg-whatsapp-teal/5 flex items-center justify-center">
                                <User size={16} />
                              </div>
                              Produtor (Eu)
                            </button>
                            {funcionarios.map(f => (
                              <button 
                                key={f.id_funcionario}
                                type="button"
                                onClick={() => {
                                  setNewAtvForm({...newAtvForm, responsavel: f.nome});
                                  setShowResponsavelDropdown(false);
                                }}
                                className={`w-full p-3 rounded-xl text-left text-xs font-bold flex items-center gap-3 transition-colors ${newAtvForm.responsavel === f.nome ? 'bg-whatsapp-teal/10 text-whatsapp-teal' : 'hover:bg-gray-50 text-gray-600'}`}
                              >
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                  <Briefcase size={16} />
                                </div>
                                {f.nome}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 block ml-2 text-center">Tipo de Atividade</label>
                    <div className="flex flex-wrap justify-center gap-2">
                      {tipos.map(t => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setNewAtvForm({...newAtvForm, id_tipo_atividade: t.id})}
                          className={`text-[10px] px-4 py-2 rounded-xl font-black uppercase tracking-wider border-2 transition-all active:scale-95 ${
                            newAtvForm.id_tipo_atividade === t.id 
                            ? `${t.cor} text-white border-transparent shadow-lg scale-105` 
                            : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {t.nome}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="p-8 bg-gray-50/50 border-t border-gray-100 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setShowNewModal(false)} 
                  className="flex-1 py-4 text-sm font-black text-gray-400 hover:bg-gray-100 rounded-2xl transition-all"
                >
                  CANCELAR
                </button>
                <button 
                  onClick={handleCreateActivity} 
                  disabled={sending || !newAtvForm.descricao.trim()}
                  className="flex-[2] py-4 bg-whatsapp-teal text-white font-black rounded-2xl shadow-xl shadow-whatsapp-teal/20 hover:bg-whatsapp-teal-dark active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {sending ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <><Check size={20} /> REGISTRAR AGORA</>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Edit Activity (REFACTORED PREMIUM) */}
        {editingAtv && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
              {/* Modal Header */}
              <div className="bg-whatsapp-teal p-6 text-white flex justify-between items-center relative overflow-hidden">
                <div className="absolute top-0 right-0 opacity-10 rotate-12 -mr-4 -mt-4 pointer-events-none">
                  <Edit size={100} />
                </div>
                <div className="relative z-10">
                  <h3 className="text-xl font-black">Editar Atividade</h3>
                  <p className="text-xs text-white/70 font-bold uppercase tracking-widest mt-1 text-left">Atualizando registro existente</p>
                </div>
                <button onClick={() => setEditingAtv(null)} className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-all active:scale-90 relative z-20">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-8 space-y-6 overflow-y-auto no-scrollbar">
                {/* Images Preview & Management */}
                <div className="grid grid-cols-3 gap-2">
                  {editingAtv.imagens.map((img: any, idx: number) => (
                    <div key={img.id || idx} className="relative aspect-square rounded-2xl overflow-hidden border border-gray-100 shadow-sm group">
                      <img src={img.foto_url} className="w-full h-full object-cover" />
                      <button 
                        onClick={() => setEditingAtv({
                          ...editingAtv,
                          imagens: editingAtv.imagens.filter((_: any, i: number) => i !== idx)
                        })}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={() => editFileInputRef.current?.click()}
                    className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 hover:border-whatsapp-teal hover:text-whatsapp-teal transition-all bg-gray-50/50"
                  >
                    <Plus size={20} />
                  </button>
                  <input type="file" hidden ref={editFileInputRef} onChange={(e) => handleFileUpload(e, true)} accept="image/*" />
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-2 text-left">O que foi feito?</label>
                    <div className="relative">
                      <MessageSquare size={18} className="absolute left-4 top-4 text-gray-300" />
                      <textarea
                        value={editingAtv.descricao}
                        onChange={(e) => setEditingAtv({...editingAtv, descricao: e.target.value})}
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-whatsapp-teal outline-none transition-all resize-none"
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-2 text-left">Data</label>
                      <div className="relative">
                        <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                        <input
                          type="date"
                          value={editingAtv.data.split('T')[0]}
                          onChange={(e) => setEditingAtv({...editingAtv, data: e.target.value})}
                          className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold outline-none"
                        />
                      </div>
                    </div>

                    {/* CUSTOM EDIT DROPDOWN */}
                    <div className="relative" ref={editDropdownRef}>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-2 text-left">Responsável</label>
                      <button 
                        type="button"
                        onClick={() => setShowEditResponsavelDropdown(!showEditResponsavelDropdown)}
                        className="w-full pl-12 pr-8 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold text-left flex items-center justify-between"
                      >
                        <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                        <span className="truncate">{editingAtv.responsavel}</span>
                        <ChevronDown size={14} className={`text-gray-300 transition-transform ${showEditResponsavelDropdown ? 'rotate-180' : ''}`} />
                      </button>

                      {showEditResponsavelDropdown && (
                        <div className="absolute bottom-full left-0 w-full mb-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[110] animate-in slide-in-from-bottom-2 duration-200">
                          <div className="p-2 space-y-1 max-h-48 overflow-y-auto no-scrollbar">
                            <button 
                              type="button"
                              onClick={() => {
                                setEditingAtv({...editingAtv, responsavel: 'Produtor'});
                                setShowEditResponsavelDropdown(false);
                              }}
                              className={`w-full p-3 rounded-xl text-left text-xs font-bold flex items-center gap-3 transition-colors ${editingAtv.responsavel === 'Produtor' ? 'bg-whatsapp-teal/10 text-whatsapp-teal' : 'hover:bg-gray-50 text-gray-600'}`}
                            >
                              <div className="w-8 h-8 rounded-full bg-whatsapp-teal/5 flex items-center justify-center">
                                <User size={16} />
                              </div>
                              Produtor (Eu)
                            </button>
                            {funcionarios.map(f => (
                              <button 
                                key={f.id_funcionario}
                                type="button"
                                onClick={() => {
                                  setEditingAtv({...editingAtv, responsavel: f.nome});
                                  setShowEditResponsavelDropdown(false);
                                }}
                                className={`w-full p-3 rounded-xl text-left text-xs font-bold flex items-center gap-3 transition-colors ${editingAtv.responsavel === f.nome ? 'bg-whatsapp-teal/10 text-whatsapp-teal' : 'hover:bg-gray-50 text-gray-600'}`}
                              >
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                  <Briefcase size={16} />
                                </div>
                                {f.nome}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block ml-2 text-center">Tipo de Atividade</label>
                    <div className="flex flex-wrap justify-center gap-2">
                      {tipos.map(t => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setEditingAtv({...editingAtv, tipo: t})}
                          className={`text-[10px] px-4 py-2 rounded-xl font-black uppercase tracking-wider border-2 transition-all active:scale-95 ${
                            editingAtv.tipo.id === t.id 
                            ? `${t.cor} text-white border-transparent shadow-lg scale-105` 
                            : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {t.nome}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-gray-50/50 border-t border-gray-100 flex gap-4">
                <button type="button" onClick={() => setEditingAtv(null)} className="flex-1 py-4 text-sm font-black text-gray-400 hover:bg-gray-100 rounded-2xl transition-all">CANCELAR</button>
                <button type="button" onClick={handleUpdate} className="flex-[2] py-4 bg-whatsapp-teal text-white font-black rounded-2xl shadow-xl shadow-whatsapp-teal/20 active:scale-95 transition-all">SALVAR ALTERAÇÕES</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Confirm Delete */}
        {deletingId && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2.5rem] w-full max-w-xs overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="p-8 text-center">
                <div className="w-20 h-20 bg-red-50 mx-auto rounded-full flex items-center justify-center mb-6 text-red-500">
                  <Trash2 size={40} />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-2">Apagar Registro?</h3>
                <p className="text-sm text-gray-400 font-medium leading-relaxed">
                  Esta ação não pode ser desfeita. O registro será removido permanentemente.
                </p>
              </div>
              <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3">
                <button 
                  onClick={() => setDeletingId(null)} 
                  className="flex-1 py-4 text-sm font-black text-gray-400 hover:bg-gray-100 rounded-2xl"
                >
                  NÃO
                </button>
                <button 
                  onClick={() => handleDelete(deletingId)} 
                  className="flex-1 py-4 bg-red-500 text-white font-black rounded-2xl shadow-lg shadow-red-500/20"
                >
                  SIM, APAGAR
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
