import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Send, Camera, Plus, X, User, Calendar, 
  MessageSquare, MoreVertical, Search, Edit, 
  Trash2, Check, ChevronDown, Briefcase,
  Sprout, Wind, Zap, Droplets, Sun, Hammer, LayoutGrid,
  Image as ImageIcon
} from 'lucide-react';
import Layout from '../components/Layout';

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
  const [lavoura, setLavoura] = useState<any>(null);
  const [atividades, setAtividades] = useState<any[]>([]);
  const [tipos, setTipos] = useState<any[]>([]);
  const [funcionarios, setFuncionarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
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

  useEffect(() => { loadInitialData(); }, [id]);
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
        fetch(`/api/v1/lavouras`), fetch('/api/v1/tipos-atividade'), fetch('/api/v1/funcionarios')
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
      const res = await fetch(`/api/v1/lavouras/${id}/atividades`);
      setAtividades(await res.json());
    } finally { setLoading(false); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    try {
      const res = await fetch('/api/v1/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok) {
        if (isEdit && editingAtv) {
          setEditingAtv({...editingAtv, imagens: [...editingAtv.imagens, { id: Date.now(), foto_url: data.url }]});
        } else {
          setNewAtvForm(p => ({ ...p, fotos: [...p.fotos, data.url] }));
          setShowNewModal(true);
        }
      }
    } finally { setUploading(false); }
  };

  const handleCreate = async () => {
    if (!newAtvForm.descricao.trim() && newAtvForm.fotos.length === 0) return;
    setSending(true);
    try {
      const res = await fetch('/api/v1/atividades', {
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
      const res = await fetch(`/api/v1/atividades/${editingAtv.id}`, {
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
    const res = await fetch(`/api/v1/atividades/${idAtv}`, { method: 'DELETE' });
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
    <Layout title={lavoura?.nome || "Chat"} showBackButton={true} onSearchClick={() => setShowSearch(!showSearch)}>
      <div className="flex flex-col h-full bg-[#efeae2] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06] bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat"></div>
        
        {/* Busca */}
        {showSearch && (
          <div className="p-2 bg-white border-b border-gray-100 animate-in slide-in-from-top-2 duration-200 z-30">
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Pesquisar no chat..." className="w-full px-4 py-2 bg-gray-100 rounded-full text-sm outline-none focus:ring-1 focus:ring-whatsapp-teal" autoFocus />
          </div>
        )}

        {/* Categorias / Abas */}
        <div className="bg-white border-b border-gray-100 overflow-x-auto no-scrollbar shadow-sm z-10">
          <div className="flex p-2 flex-nowrap gap-2 min-w-max px-4">
            <button onClick={() => setActiveTab(0)} className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase transition-all ${activeTab === 0 ? 'bg-gray-800 text-white shadow-md scale-105' : 'bg-gray-100 text-gray-500'}`}>🏠 Geral</button>
            {tipos.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase transition-all ${activeTab === t.id ? `${t.cor} text-white shadow-md scale-105` : 'bg-gray-100 text-gray-500'}`}>{renderIcon(t.icone, 12)} {t.nome}</button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 relative no-scrollbar">
          {filteredAtividades.map((atv) => (
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
                    {atv.imagens.map((img: any) => <img key={img.id} src={img.foto_url} className="w-full h-32 object-cover cursor-pointer" onClick={() => window.open(img.foto_url, '_blank')} />)}
                  </div>
                )}
                <div className="text-[9px] text-gray-400 font-bold mt-1 text-right italic">{new Date(atv.data).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="bg-[#f0f2f5] p-3 flex items-center gap-2 border-t border-gray-200 z-20">
          <button onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-500 hover:text-whatsapp-teal active:scale-90 transition-all"><ImageIcon size={24} /></button>
          <input type="file" hidden ref={fileInputRef} onChange={(e) => handleFileUpload(e)} accept="image/*" capture="environment" />
          <div className="flex-1 bg-white rounded-full px-4 py-2 flex items-center shadow-sm">
            <input type="text" value={newAtvForm.descricao} onChange={e => setNewAtvForm({...newAtvForm, descricao: e.target.value})} onKeyDown={e => e.key === 'Enter' && (newAtvForm.descricao.trim() && setShowNewModal(true))} placeholder="Mensagem..." className="w-full text-sm outline-none" />
          </div>
          <button onClick={() => setShowNewModal(true)} disabled={!newAtvForm.descricao.trim() && newAtvForm.fotos.length === 0} className={`p-2.5 rounded-full shadow-lg transition-all ${newAtvForm.descricao.trim() || newAtvForm.fotos.length > 0 ? 'bg-whatsapp-teal text-white active:scale-90' : 'bg-gray-300 text-white'}`}><Send size={20} /></button>
        </div>

        {/* MODAL: NOVO */}
        {showNewModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
              <div className="bg-whatsapp-teal p-6 text-white flex justify-between items-center"><h3 className="text-xl font-black">Registrar Atividade</h3><button onClick={() => setShowNewModal(false)}><X size={20} /></button></div>
              <div className="p-8 space-y-6 overflow-y-auto no-scrollbar">
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
                    <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                      <div className="p-2 space-y-1 max-h-48 overflow-y-auto no-scrollbar">
                        <button onClick={() => { setNewAtvForm({...newAtvForm, responsavel: 'Produtor'}); setShowRespDropdown(false); }} className="w-full p-3 rounded-xl text-left text-xs font-bold flex items-center gap-3 hover:bg-gray-50 text-gray-700">Produtor (Eu)</button>
                        {funcionarios.map(f => <button key={f.id_funcionario} onClick={() => { setNewAtvForm({...newAtvForm, responsavel: f.nome}); setShowRespDropdown(false); }} className="w-full p-3 rounded-xl text-left text-xs font-bold flex items-center gap-3 hover:bg-gray-50 text-gray-700">{f.nome}</button>)}
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
              <div className="p-8 space-y-6 overflow-y-auto no-scrollbar">
                <div className="grid grid-cols-3 gap-2">
                  {editingAtv.imagens?.map((img: any, idx: number) => (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                      <img src={img.foto_url} className="w-full h-full object-cover" />
                      <button onClick={() => setEditingAtv({...editingAtv, imagens: editingAtv.imagens.filter((_: any, i: number) => i !== idx)})} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-md"><X size={10} /></button>
                    </div>
                  ))}
                  <button onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 hover:text-whatsapp-teal hover:border-whatsapp-teal transition-all"><Plus size={24} /></button>
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
                    <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                      <div className="p-2 space-y-1 max-h-48 overflow-y-auto no-scrollbar">
                        <button onClick={() => { setEditingAtv({...editingAtv, responsavel: 'Produtor'}); setShowEditRespDropdown(false); }} className="w-full p-3 rounded-xl text-left text-xs font-bold hover:bg-gray-50 text-gray-700">Produtor (Eu)</button>
                        {funcionarios.map(f => <button key={f.id_funcionario} onClick={() => { setEditingAtv({...editingAtv, responsavel: f.nome}); setShowEditRespDropdown(false); }} className="w-full p-3 rounded-xl text-left text-xs font-bold hover:bg-gray-50 text-gray-700">{f.nome}</button>)}
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
    </Layout>
  );
};

export default ChatPage;