import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Truck, ChevronRight, Plus, User, 
  LayoutGrid, Trash2, Edit, X, Check,
  Sprout, Wind, Zap, Droplets, Sun, Hammer
} from 'lucide-react';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';

interface UserProfile {
  id_usuario: number;
  nome: string;
  email: string;
  foto_url?: string;
}

interface TipoAtividade {
  id: number;
  nome: string;
  icone: string;
  cor: string;
}

const COLORS = [
  { name: 'Verde', value: 'bg-whatsapp-green' },
  { name: 'Teal', value: 'bg-whatsapp-teal' },
  { name: 'Laranja', value: 'bg-orange-500' },
  { name: 'Azul', value: 'bg-blue-500' },
  { name: 'Roxo', value: 'bg-purple-500' },
  { name: 'Vermelho', value: 'bg-red-500' },
];

const ICONS_MAP: any = {
  'Sprout': Sprout,
  'Truck': Truck,
  'Wind': Wind,
  'Zap': Zap,
  'Droplets': Droplets,
  'Sun': Sun,
  'Hammer': Hammer,
  'Default': LayoutGrid
};

const SettingsPage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tipos, setTipos] = useState<TipoAtividade[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [editingTipo, setEditingTipo] = useState<TipoAtividade | null>(null);
  const [form, setForm] = useState({ nome: '', icone: 'Sprout', cor: 'bg-whatsapp-green' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [profRes, tiposRes] = await Promise.all([
        fetch((import.meta.env.VITE_API_URL || 'https://agrocafe-backend.onrender.com') + '/api/v1/perfil'),
        fetch((import.meta.env.VITE_API_URL || 'https://agrocafe-backend.onrender.com') + '/api/v1/tipos-atividade')
      ]);
      setProfile(await profRes.json());
      setTipos(await tiposRes.json());
      setLoading(false);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
      setLoading(false);
    }
  };

  const handleOpenModal = (tipo?: TipoAtividade) => {
    if (tipo) {
      setEditingTipo(tipo);
      setForm({ nome: tipo.nome, icone: tipo.icone, cor: tipo.cor });
    } else {
      setEditingTipo(null);
      setForm({ nome: '', icone: 'Sprout', cor: 'bg-whatsapp-green' });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.nome.trim()) return;
    setSaving(true);
    try {
      const url = (import.meta.env.VITE_API_URL || 'https://agrocafe-backend.onrender.com') + (editingTipo ? `/api/v1/tipos-atividade/${editingTipo.id}` : '/api/v1/tipos-atividade');
      const method = editingTipo ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (res.ok) {
        setShowModal(false);
        toast.success(editingTipo ? "Categoria atualizada!" : "Categoria salva!");
        loadData();
      } else {
        const errorData = await res.json();
        toast.error(errorData.erro || "Erro ao salvar categoria");
      }
    } catch (err) {
      console.error("Erro ao salvar:", err);
      toast.error("Erro ao comunicar com o servidor");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <span className="font-bold">Excluir esta categoria?</span>
        <div className="flex gap-2">
          <button 
            className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs"
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                const res = await fetch((import.meta.env.VITE_API_URL || 'https://agrocafe-backend.onrender.com') + `/api/v1/tipos-atividade/${id}`, { method: 'DELETE' });
                if (res.ok) {
                  loadData();
                  toast.success("Excluída com sucesso");
                } else {
                  const data = await res.json();
                  toast.error(data.erro || "Erro ao excluir categoria.");
                }
              } catch (err) {
                console.error("Erro ao deletar:", err);
                toast.error("Erro ao excluir categoria.");
              }
            }}
          >
            Sim, Excluir
          </button>
          <button 
            className="bg-gray-100 px-3 py-1.5 rounded-lg text-xs"
            onClick={() => toast.dismiss(t.id)}
          >
            Cancelar
          </button>
        </div>
      </div>
    ), { duration: 5000 });
  };

  // Função para renderizar o ícone correto
  const renderIcon = (iconName: string, size = 20) => {
    const IconComponent = ICONS_MAP[iconName] || ICONS_MAP['Default'];
    return <IconComponent size={size} />;
  };

  return (
    <Layout title="Configurações">
      <div className="p-4 space-y-6 pb-24">
        {/* Profile Card */}
        <div 
          onClick={() => navigate('/perfil')}
          className="bg-white p-6 rounded-[2rem] shadow-sm flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition-all border border-gray-50 group"
        >
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-white shadow-md">
            {profile?.foto_url ? (
              <img src={profile.foto_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User size={32} className="text-gray-300" />
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-black text-gray-900 group-hover:text-whatsapp-teal transition-colors">
              {profile?.nome || 'Carregando...'}
            </h2>
            <p className="text-xs text-gray-400 font-medium truncate max-w-[180px]">{profile?.email}</p>
          </div>
          <ChevronRight size={20} className="text-gray-300 group-hover:text-whatsapp-teal transition-colors" />
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-4">
          <div onClick={() => navigate('/funcionarios')} className="bg-white p-8 rounded-[2.5rem] shadow-sm flex flex-col items-center gap-3 border border-gray-50 active:scale-95 transition-all">
            <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center shadow-inner"><Users size={28} /></div>
            <span className="text-sm font-black text-gray-700">Equipe</span>
          </div>
          <div onClick={() => navigate('/maquinarios')} className="bg-white p-8 rounded-[2.5rem] shadow-sm flex flex-col items-center gap-3 border border-gray-50 active:scale-95 transition-all">
            <div className="w-14 h-14 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center shadow-inner"><Truck size={28} /></div>
            <span className="text-sm font-black text-gray-700">Frota</span>
          </div>
        </div>

        {/* Categories List */}
        <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-gray-50">
          <div className="flex justify-between items-center mb-6 px-2">
            <div>
              <h3 className="text-lg font-black text-gray-900">Categorias</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Configurações do Chat</p>
            </div>
            <button 
              onClick={() => handleOpenModal()}
              className="bg-whatsapp-green text-white p-3 rounded-2xl shadow-lg shadow-whatsapp-green/20 active:scale-90 transition-all"
            >
              <Plus size={24} />
            </button>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-8"><div className="w-8 h-8 border-4 border-whatsapp-teal border-t-transparent rounded-full animate-spin mx-auto"></div></div>
            ) : tipos.map(t => (
              <div key={t.id} className="flex items-center gap-4 p-4 bg-gray-50/50 rounded-3xl border border-gray-50 group hover:bg-white hover:shadow-md transition-all">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${t.cor}`}>
                  {renderIcon(t.icone)}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-black text-gray-800">{t.nome}</h4>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleOpenModal(t)} className="p-2 text-gray-300 hover:text-whatsapp-teal transition-colors"><Edit size={16} /></button>
                  <button onClick={() => handleDelete(t.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL: ADD/EDIT CATEGORY */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col">
            <div className="bg-whatsapp-teal p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black">{editingTipo ? 'Editar Categoria' : 'Nova Categoria'}</h3>
                <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest mt-1">Configuração de Registro</p>
              </div>
              <button onClick={() => setShowModal(false)} className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-all"><X size={20} /></button>
            </div>

            <div className="p-8 space-y-6">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-2">Nome da Categoria</label>
                <input 
                  type="text"
                  value={form.nome}
                  onChange={e => setForm({...form, nome: e.target.value})}
                  placeholder="Ex: Pulverização, Colheita..."
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-whatsapp-teal outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block ml-2">Cor de Destaque</label>
                <div className="grid grid-cols-6 gap-2">
                  {COLORS.map(c => (
                    <button
                      key={c.value}
                      onClick={() => setForm({...form, cor: c.value})}
                      className={`w-10 h-10 rounded-xl transition-all ${c.value} ${form.cor === c.value ? 'ring-4 ring-gray-100 scale-110' : 'opacity-60 hover:opacity-100'}`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block ml-2">Ícone Visual</label>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(ICONS_MAP).filter(k => k !== 'Default').map(i => (
                    <button
                      key={i}
                      onClick={() => setForm({...form, icone: i})}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all flex items-center gap-2 ${form.icone === i ? 'bg-whatsapp-teal text-white border-whatsapp-teal' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'}`}
                    >
                      {renderIcon(i, 14)}
                      {i}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-8 bg-gray-50/50 flex gap-4 border-t border-gray-100">
              <button onClick={() => setShowModal(false)} className="flex-1 py-4 text-xs font-black text-gray-400 hover:bg-gray-100 rounded-2xl transition-all">CANCELAR</button>
              <button 
                onClick={handleSave}
                disabled={saving || !form.nome.trim()}
                className="flex-[2] py-4 bg-whatsapp-teal text-white font-black rounded-2xl shadow-xl shadow-whatsapp-teal/20 hover:bg-whatsapp-teal-dark active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <><Check size={18} /> SALVAR</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default SettingsPage;
