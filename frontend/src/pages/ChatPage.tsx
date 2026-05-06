import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Send, Plus, X, User, Edit, 
  Trash2, Check, ChevronDown,
  Sprout, Wind, Zap, Droplets, Sun, Hammer, LayoutGrid,
  Image as ImageIcon
} from 'lucide-react';
import Layout from '../components/Layout';
import { useDraggableScroll } from '../hooks/useDraggableScroll';

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
  const dragScroll = useDraggableScroll<HTMLDivElement>();
  const [lavoura, setLavoura] = useState<any>(null);
  const [atividades, setAtividades] = useState<any[]>([]);
  const [tipos, setTipos] = useState<any[]>([]);
  const [funcionarios, setFuncionarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0); // 0 = Geral
  
  const [showNewModal, setShowNewModal] = useState(false);
  const [editingAtv, setEditingAtv] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [newAtvForm, setNewAtvForm] = useState({
    descricao: '', id_tipo_atividade: 0, responsavel: 'Produtor',
    data: new Date().toLocaleDateString('en-CA'), fotos: [] as string[]
  });

  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Estados para os Dropdowns customizados
  const [showRespDropdown, setShowRespDropdown] = useState(false);
  const [showEditRespDropdown, setShowEditRespDropdown] = useState(false);
  const respRef = useRef<HTMLDivElement>(null);
  const editRespRef = useRef<HTMLDivElement>(null);

  useEffect(() => { 
    console.log("Loading initial data...");
    loadInitialData(); 
  }, [id]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [atividades]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (respRef.current && !respRef.current.contains(event.target as Node)) setShowRespDropdown(false);
      if (editRespRef.current && !editRespRef.current.contains(event.target as Node)) setShowEditRespDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadInitialData = async () => {
    try {
      const [lavRes, tipRes, funcRes] = await Promise.all([
        fetch((import.meta.env.VITE_API_URL || '') + `/api/v1/lavouras`), fetch((import.meta.env.VITE_API_URL || '') + '/api/v1/tipos-atividade'), fetch((import.meta.env.VITE_API_URL || '') + '/api/v1/funcionarios')
      ]);
      const allLavouras = await lavRes.json();
      setLavoura(allLavouras.find((l: any) => l.id === Number(id)));
      const tData = await tipRes.json();
      setTipos(tData);
      setNewAtvForm(p => ({ ...p, id_tipo_atividade: tData[0]?.id || 0 }));
      setFuncionarios(await funcRes.json());
      loadAtividades();
    } catch (err) { console.error(err); }
  };

  const loadAtividades = async () => {
    setLoading(true);
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || '') + `/api/v1/lavouras/${id}/atividades`);
      setAtividades(await res.json());
    } finally { setLoading(false); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    try {
      const uploadedUrls = await Promise.all(files.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch((import.meta.env.VITE_API_URL || '') + '/api/v1/upload', { method: 'POST', body: formData });
        const data = await res.json();
        return res.ok ? data.url : null;
      }));

      const validUrls = uploadedUrls.filter(url => url !== null);
      if (validUrls.length > 0) {
        if (isEdit && editingAtv) {
          const newImages = validUrls.map((url, i) => ({ id: Date.now() + i, foto_url: url }));
          setEditingAtv({...editingAtv, imagens: [...editingAtv.imagens, ...newImages]});
        } else {
          setNewAtvForm(p => ({ ...p, fotos: [...p.fotos, ...validUrls] }));
          if (!isEdit) setShowNewModal(true);
        }
      }
    } finally { 
      setUploading(false); 
      e.target.value = ''; 
    }
  };

  const handleCreate = async () => {
    if (!newAtvForm.descricao.trim() && newAtvForm.fotos.length === 0) return;
    setSending(true);
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || '') + '/api/v1/atividades', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newAtvForm, id_lavoura: Number(id) })
      });
      if (res.ok) {
        setNewAtvForm({ descricao: '', id_tipo_atividade: tipos[0]?.id || 0, responsavel: 'Produtor', data: new Date().toLocaleDateString('en-CA'), fotos: [] });
        setShowNewModal(false);
        loadAtividades();
      }
    } finally { setSending(false); }
  };

  const handleUpdate = async () => {
    if (!editingAtv) return;
    setSending(true);
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || '') + `/api/v1/atividades/${editingAtv.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          descricao: editingAtv.descricao,
          id_tipo_atividade: editingAtv.tipo.id,
          responsavel: editingAtv.responsavel,
          data: editingAtv.data,
          fotos: editingAtv.imagens.map((img: any) => img.foto_url)
        })
      });
      if (res.ok) { setEditingAtv(null); loadAtividades(); }
    } finally { setSending(false); }
  };

  const handleDelete = async (idAtv: number) => {
    const res = await fetch((import.meta.env.VITE_API_URL || '') + `/api/v1/atividades/${idAtv}`, { method: 'DELETE' });
    if (res.ok) { setDeletingId(null); loadAtividades(); }
  };

  const renderIcon = (name: string, size = 10) => {
    const Icon = ICONS_MAP[name] || ICONS_MAP['Default'];
    return <Icon size={size} />;
  };

  const filteredAtividades = atividades.filter(a => {
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
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Pesquisar no chat..." className="w-full px-4 py-2 bg-gray-100 rounded-full text-sm outline-none focus:ring-1 focus:ring-whatsapp-teal" autoFocus />
          </div>
        )}

        {/* Categorias / Abas */}
        <div 
          className={`bg-white border-b border-gray-100 overflow-x-auto no-scrollbar [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] shadow-sm z-10 ${dragScroll.className}`}
          ref={dragScroll.ref}
          onMouseDown={dragScroll.onMouseDown}
          onMouseLeave={dragScroll.onMouseLeave}
          onMouseUp={dragScroll.onMouseUp}
          onMouseMove={dragScroll.onMouseMove}
          onClickCapture={dragScroll.onClickCapture}
        >
          <div className="flex p-2 flex-nowrap gap-2 min-w-max px-4">
            <button onClick={() => setActiveTab(0)} className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase transition-all ${activeTab === 0 ? 'bg-gray-800 text-white shadow-md scale-105' : 'bg-gray-100 text-gray-500'}`}>🏠 Geral</button>
            {tipos.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase transition-all ${activeTab === t.id ? `${t.cor} text-white shadow-md scale-105` : 'bg-gray-100 text-gray-500'}`}>{renderIcon(t.icone, 12)} {t.nome}</button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 relative no-scrollbar">
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className={`flex flex-col animate-pulse ${i % 2 === 0 ? 'items-start' : 'items-end'}`}>
                <div className="bg-gray-200 rounded-xl rounded-tl-none p-3 shadow-sm w-[70%] h-24 relative border-l-4 border-l-gray-300"></div>
              </div>
            ))
          ) : filteredAtividades.map((atv) => (
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
                    {atv.imagens.map((img: any) => <img key={img.id} src={img.foto_url} className="w-full h-32 object-cover cursor-pointer active:scale-95 transition-all" onClick={() => setLightboxImage(img.foto_url)} />)}
                  </div>
                )}
                <div className="text-[9px] text-gray-400 font-bold mt-1 text-right italic">{new Date(atv.data).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="bg-white p-3 flex items-center gap-3 border-t border-gray-100 z-20 pb-safe">
          <button 
            onClick={() => fileInputRef.current?.click()} 
            className="p-3 bg-teal-50 text-whatsapp-teal rounded-full hover:bg-teal-100 active:scale-95 transition-all"
          >
            <ImageIcon size={22} />
          </button>
          <input type="file" hidden ref={fileInputRef} onChange={(e) => handleFileUpload(e)} accept="image/*" multiple />
          
          <div className="flex-1 bg-gray-50 border border-gray-100 rounded-3xl px-4 py-3 flex items-center focus-within:ring-2 focus-within:ring-whatsapp-teal/20 transition-all">
            <input 
              type="text" 
              value={newAtvForm.descricao} 
              onChange={e => setNewAtvForm({...newAtvForm, descricao: e.target.value})} 
              onKeyDown={e => e.key === 'Enter' && (newAtvForm.descricao.trim() && setShowNewModal(true))} 
              placeholder="Mensagem..." 
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
              <div className="bg-whatsapp-teal p-6 text-white flex justify-between items-center"><h3 className="text-xl font-black">Registrar Atividade</h3><button onClick={() => setShowNewModal(false)}><X size={20} /></button></div>
              <div className="p-8 pb-40 space-y-6 overflow-y-auto no-scrollbar relative">
                <div className="grid grid-cols-3 gap-2">
                  {newAtvForm.fotos.map((url, idx) => (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                      <img src={url} className="w-full h-full object-cover" />
                      <button onClick={() => setNewAtvForm({...newAtvForm, fotos: newAtvForm.fotos.filter((_, i) => i !== idx)})} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-md"><X size={10} /></button>
                    </div>
                  ))}
                  <button onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 hover:text-whatsapp-teal hover:border-whatsapp-teal transition-all"><Plus size={24} /></button>
                </div>
                <div><label className="text-[10px] font-black text-gray-400 uppercase mb-2 block ml-2">Descrição</label><textarea value={newAtvForm.descricao} onChange={e => setNewAtvForm({...newAtvForm, descricao: e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm min-h-[100px] outline-none focus:ring-1 focus:ring-whatsapp-teal" placeholder="O que aconteceu no campo?" /></div>
                <div><label className="text-[10px] font-black text-gray-400 uppercase mb-2 block ml-2">Categoria</label><div className="flex flex-wrap gap-2">{tipos.map(t => <button key={t.id} onClick={() => setNewAtvForm({...newAtvForm, id_tipo_atividade: t.id})} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-1 transition-all ${newAtvForm.id_tipo_atividade === t.id ? `${t.cor} text-white shadow-lg scale-105` : 'bg-gray-100 text-gray-500'}`}>{renderIcon(t.icone, 12)} {t.nome}</button>)}</div></div>
                <div className="relative" ref={respRef}>
                  <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block ml-2">Responsável</label>
                  <button onClick={() => setShowRespDropdown(!showRespDropdown)} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-left flex items-center justify-between hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-whatsapp-teal/10 flex items-center justify-center text-whatsapp-teal"><User size={16} /></div>{newAtvForm.responsavel}</div>
                    <ChevronDown size={16} className={`text-gray-300 transition-transform ${showRespDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  {showRespDropdown && (
                    <div className="absolute bottom-full mb-2 left-0 w-full bg-white rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-gray-100 z-[100] overflow-hidden animate-in slide-in-from-bottom-2 duration-200">
                      <div className="p-2 space-y-1 max-h-56 overflow-y-auto no-scrollbar">
                        <button onClick={() => { setNewAtvForm({...newAtvForm, responsavel: 'Produtor'}); setShowRespDropdown(false); }} className={`w-full p-3 rounded-2xl text-left text-sm font-bold flex items-center justify-between group transition-all ${newAtvForm.responsavel === 'Produtor' ? 'bg-whatsapp-teal/10 text-whatsapp-teal' : 'hover:bg-gray-50 text-gray-700'}`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${newAtvForm.responsavel === 'Produtor' ? 'bg-whatsapp-teal text-white shadow-md' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'}`}><User size={18} /></div>
                            Produtor (Eu)
                          </div>
                          {newAtvForm.responsavel === 'Produtor' && <Check size={18} />}
                        </button>
                        {funcionarios.map(f => (
                          <button key={f.id_funcionario} onClick={() => { setNewAtvForm({...newAtvForm, responsavel: f.nome}); setShowRespDropdown(false); }} className={`w-full p-3 rounded-2xl text-left text-sm font-bold flex items-center justify-between group transition-all ${newAtvForm.responsavel === f.nome ? 'bg-whatsapp-teal/10 text-whatsapp-teal' : 'hover:bg-gray-50 text-gray-700'}`}>
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${newAtvForm.responsavel === f.nome ? 'bg-whatsapp-teal text-white shadow-md' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'}`}><User size={18} /></div>
                              {f.nome}
                            </div>
                            {newAtvForm.responsavel === f.nome && <Check size={18} />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-8 bg-gray-50 flex gap-4"><button onClick={handleCreate} disabled={sending || uploading} className="w-full py-4 bg-whatsapp-teal text-white font-black rounded-2xl shadow-xl shadow-whatsapp-teal/20 hover:bg-whatsapp-teal-dark active:scale-95 transition-all">{sending ? 'ENVIANDO...' : uploading ? 'SUBINDO FOTO...' : 'REGISTRAR'}</button></div>
            </div>
          </div>
        )}

        {/* MODAL: EDITAR */}
        {editingAtv && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
              <div className="bg-whatsapp-teal p-6 text-white flex justify-between items-center"><h3 className="text-xl font-black">Editar Atividade</h3><button onClick={() => setEditingAtv(null)}><X size={20} /></button></div>
              <div className="p-8 pb-40 space-y-6 overflow-y-auto no-scrollbar relative">
                <div className="grid grid-cols-3 gap-2">
                  {editingAtv.imagens?.map((img: any, idx: number) => (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                      <img src={img.foto_url} className="w-full h-full object-cover" />
                      <button onClick={() => setEditingAtv({...editingAtv, imagens: editingAtv.imagens.filter((_: any, i: number) => i !== idx)})} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-md"><X size={10} /></button>
                    </div>
                  ))}
                  <input type="file" hidden ref={editFileInputRef} onChange={(e) => handleFileUpload(e, true)} accept="image/*" multiple />
                  <button onClick={() => editFileInputRef.current?.click()} className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 hover:text-whatsapp-teal hover:border-whatsapp-teal transition-all"><Plus size={24} /></button>
                </div>
                <div><label className="text-[10px] font-black text-gray-400 uppercase mb-2 block ml-2">Descrição</label><textarea value={editingAtv.descricao} onChange={e => setEditingAtv({...editingAtv, descricao: e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm min-h-[100px] outline-none focus:ring-1 focus:ring-whatsapp-teal" /></div>
                <div><label className="text-[10px] font-black text-gray-400 uppercase mb-2 block ml-2">Categoria</label><div className="flex flex-wrap gap-2">{tipos.map(t => <button key={t.id} onClick={() => setEditingAtv({...editingAtv, tipo: t})} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-1 transition-all ${editingAtv.tipo?.id === t.id ? `${t.cor} text-white shadow-lg scale-105` : 'bg-gray-100 text-gray-500'}`}>{renderIcon(t.icone, 12)} {t.nome}</button>)}</div></div>
                <div className="relative" ref={editRespRef}>
                  <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block ml-2">Responsável</label>
                  <button onClick={() => setShowEditRespDropdown(!showEditRespDropdown)} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-left flex items-center justify-between hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">{editingAtv.responsavel}</div>
                    <ChevronDown size={16} className={`text-gray-300 transition-transform ${showEditRespDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  {showEditRespDropdown && (
                    <div className="absolute bottom-full mb-2 left-0 w-full bg-white rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-gray-100 z-[100] overflow-hidden animate-in slide-in-from-bottom-2 duration-200">
                      <div className="p-2 space-y-1 max-h-56 overflow-y-auto no-scrollbar">
                        <button onClick={() => { setEditingAtv({...editingAtv, responsavel: 'Produtor'}); setShowEditRespDropdown(false); }} className={`w-full p-3 rounded-2xl text-left text-sm font-bold flex items-center justify-between group transition-all ${editingAtv.responsavel === 'Produtor' ? 'bg-whatsapp-teal/10 text-whatsapp-teal' : 'hover:bg-gray-50 text-gray-700'}`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${editingAtv.responsavel === 'Produtor' ? 'bg-whatsapp-teal text-white shadow-md' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'}`}><User size={18} /></div>
                            Produtor (Eu)
                          </div>
                          {editingAtv.responsavel === 'Produtor' && <Check size={18} />}
                        </button>
                        {funcionarios.map(f => (
                          <button key={f.id_funcionario} onClick={() => { setEditingAtv({...editingAtv, responsavel: f.nome}); setShowEditRespDropdown(false); }} className={`w-full p-3 rounded-2xl text-left text-sm font-bold flex items-center justify-between group transition-all ${editingAtv.responsavel === f.nome ? 'bg-whatsapp-teal/10 text-whatsapp-teal' : 'hover:bg-gray-50 text-gray-700'}`}>
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${editingAtv.responsavel === f.nome ? 'bg-whatsapp-teal text-white shadow-md' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'}`}><User size={18} /></div>
                              {f.nome}
                            </div>
                            {editingAtv.responsavel === f.nome && <Check size={18} />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-8 bg-gray-50 flex gap-4"><button onClick={handleUpdate} disabled={sending || uploading} className="w-full py-4 bg-whatsapp-teal text-white font-black rounded-2xl shadow-xl shadow-whatsapp-teal/20 hover:bg-whatsapp-teal-dark active:scale-95 transition-all">SALVAR ALTERAÇÕES</button></div>
            </div>
          </div>
        )}

        {/* MODAL: DELETE */}
        {deletingId && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
            <div className="bg-white rounded-[2.5rem] p-8 text-center max-w-xs w-full shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 size={32} /></div>
              <h3 className="text-lg font-black mb-2">Apagar registro?</h3>
              <div className="flex gap-4 mt-6"><button onClick={() => setDeletingId(null)} className="flex-1 py-3 text-xs font-black text-gray-400 bg-gray-100 rounded-xl">NÃO</button><button onClick={() => handleDelete(deletingId)} className="flex-1 py-3 text-xs font-black text-white bg-red-500 rounded-xl shadow-lg shadow-red-500/20">SIM</button></div>
            </div>
          </div>
        )}
      </div>
      {/* Lightbox Modal */}
      {lightboxImage && (
        <div className="fixed inset-0 bg-black/95 z-[200] flex items-center justify-center animate-in fade-in duration-200 p-2" onClick={() => setLightboxImage(null)}>
          <button className="absolute top-6 right-6 text-white p-2 bg-black/50 rounded-full hover:bg-white/20 transition-all z-[210]"><X size={24} /></button>
          <img src={lightboxImage} className="max-w-full max-h-full object-contain select-none shadow-2xl rounded-lg animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

    </Layout>
  );
};

export default ChatPage;