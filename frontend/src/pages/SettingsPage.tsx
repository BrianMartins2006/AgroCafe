import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Plus, Edit, Trash2, Sprout, Truck, 
  Wind, Search, X, Check, Layout as LayoutIcon, Palette, ChevronRight, LogOut, User 
} from 'lucide-react';
import Layout from '../components/Layout';

interface TipoAtividade {
  id: number;
  nome: string;
  icone: string;
  cor: string;
}

const SettingsPage = () => {
  const navigate = useNavigate();
  const [tipos, setTipos] = useState<TipoAtividade[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTipo, setEditingTipo] = useState<TipoAtividade | null>(null);

  // Form State
  const [form, setForm] = useState({
    nome: '',
    icone: 'Sprouts',
    cor: 'bg-whatsapp-teal'
  });

  const iconsList = [
    { name: 'Sprouts', icon: Sprout },
    { name: 'Truck', icon: Truck },
    { name: 'Wind', icon: Wind },
    { name: 'Search', icon: Search },
    { name: 'Layout', icon: LayoutIcon },
  ];

  const colorsList = [
    'bg-whatsapp-teal',
    'bg-whatsapp-green',
    'bg-blue-500',
    'bg-orange-500',
    'bg-purple-500',
    'bg-red-500',
    'bg-pink-500',
    'bg-gray-800'
  ];

  const [profile, setProfile] = useState<any>(null);

  const loadTipos = () => {
    setLoading(true);
    fetch('/api/v1/tipos-atividade')
      .then(res => res.json())
      .then(data => {
        setTipos(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erro ao buscar tipos:", err);
        setLoading(false);
      });
  };

  const loadProfile = () => {
    fetch('/api/v1/perfil')
      .then(res => res.json())
      .then(data => setProfile(data))
      .catch(err => console.error("Erro ao buscar perfil:", err));
  };

  useEffect(() => {
    loadTipos();
    loadProfile();
  }, []);

  const handleLogout = () => {
    if (window.confirm("Deseja realmente sair?")) {
      // No backend legado, o logout é no /auth/logout
      window.location.href = '/auth/logout';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingTipo ? 'PUT' : 'POST';
    const url = editingTipo ? `/api/v1/tipos-atividade/${editingTipo.id}` : '/api/v1/tipos-atividade';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (res.ok) {
        setIsModalOpen(false);
        setEditingTipo(null);
        setForm({ nome: '', icone: 'Sprouts', cor: 'bg-whatsapp-teal' });
        loadTipos();
      }
    } catch (err) {
      console.error("Erro ao salvar tipo:", err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Deseja realmente excluir esta categoria?")) return;
    try {
      const res = await fetch(`/api/v1/tipos-atividade/${id}`, { method: 'DELETE' });
      if (res.ok) loadTipos();
    } catch (err) {
      console.error("Erro ao excluir tipo:", err);
    }
  };

  const openEdit = (tipo: TipoAtividade) => {
    setEditingTipo(tipo);
    setForm({ nome: tipo.nome, icone: tipo.icone, cor: tipo.cor });
    setIsModalOpen(true);
  };

  return (
    <Layout title="Configurações" showTabs={true}>
      <div className="bg-[#f0f2f5] min-h-full p-4 space-y-6 pb-24">
        
        {/* Profile Card (WhatsApp Style) */}
        <div 
          onClick={() => navigate('/perfil')}
          className="bg-white p-4 rounded-2xl shadow-sm flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition-all active:scale-[0.98] border border-gray-100"
        >
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-gray-50">
            <User size={32} className="text-gray-300" />
          </div>
          <div className="flex-1">
            <h2 className="font-black text-xl text-gray-900 leading-tight">{profile?.nome || 'Produtor'}</h2>
            <p className="text-sm text-gray-400 font-medium">{profile?.email || 'Gerencie seu perfil'}</p>
          </div>
          <ChevronRight size={20} className="text-gray-300" />
        </div>

        {/* Navigation Menu */}
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => navigate('/funcionarios')}
            className="bg-white p-6 rounded-2xl shadow-sm flex flex-col items-center gap-3 hover:shadow-md transition-all active:scale-95 border border-gray-50"
          >
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
              <User size={24} />
            </div>
            <span className="font-bold text-gray-700">Equipe</span>
          </button>
          <button 
            onClick={() => navigate('/maquinarios')}
            className="bg-white p-6 rounded-2xl shadow-sm flex flex-col items-center gap-3 hover:shadow-md transition-all active:scale-95 border border-gray-50"
          >
            <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center">
              <Truck size={24} />
            </div>
            <span className="font-bold text-gray-700">Frota</span>
          </button>
        </div>

        {/* Categories Header */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-black text-gray-900">Categorias de Atividades</h2>
            <button 
              onClick={() => {
                setEditingTipo(null);
                setForm({ nome: '', icone: 'Sprouts', cor: 'bg-whatsapp-teal' });
                setIsModalOpen(true);
              }}
              className="p-2 bg-whatsapp-green text-white rounded-full shadow-lg active:scale-90 transition-all"
            >
              <Plus size={24} />
            </button>
          </div>
          <p className="text-sm text-gray-400">Personalize os tipos de tarefas que você registra no chat.</p>
        </div>

        {/* Categories List */}
        <div className="space-y-3">
          {loading ? (
            <div className="p-10 text-center text-gray-400 italic">Carregando categorias...</div>
          ) : tipos.map(tipo => (
            <div key={tipo.id} className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${tipo.cor} text-white rounded-2xl flex items-center justify-center shadow-inner`}>
                  {(() => {
                    const IconObj = iconsList.find(i => i.name === tipo.icone);
                    const Icon = IconObj ? IconObj.icon : Search;
                    return <Icon size={24} />;
                  })()}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{tipo.nome}</h3>
                  <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">{tipo.icone}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => openEdit(tipo)}
                  className="p-2 text-gray-400 hover:text-whatsapp-teal hover:bg-gray-50 rounded-xl transition-all"
                >
                  <Edit size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(tipo.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-50 rounded-xl transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Logout Button */}
        <div className="pt-4">
          <button 
            onClick={handleLogout}
            className="w-full bg-white p-4 rounded-2xl shadow-sm flex items-center justify-center gap-3 text-red-500 font-bold hover:bg-red-50 transition-all active:scale-95 border border-red-50"
          >
            <LogOut size={20} />
            Sair da Conta
          </button>
          <p className="text-center text-[10px] text-gray-400 mt-6 font-bold uppercase tracking-widest">AgroCafé v1.0 • 2026</p>
        </div>

        {/* Modal Overlay */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="bg-whatsapp-teal p-6 text-white flex justify-between items-center">
                <h3 className="text-lg font-bold">{editingTipo ? 'Editar Categoria' : 'Nova Categoria'}</h3>
                <button onClick={() => setIsModalOpen(false)}><X size={24} /></button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Nome da Categoria</label>
                  <input 
                    type="text" 
                    required
                    value={form.nome}
                    onChange={e => setForm({...form, nome: e.target.value})}
                    placeholder="Ex: Adubação, Colheita..."
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-800 outline-none focus:ring-2 focus:ring-whatsapp-teal transition-all"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Escolha o Ícone</label>
                  <div className="flex flex-wrap gap-3">
                    {iconsList.map(item => (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => setForm({...form, icone: item.name})}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                          form.icone === item.name 
                          ? 'bg-whatsapp-teal text-white shadow-lg' 
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                      >
                        {(() => {
                          const Icon = item.icon;
                          return <Icon size={20} />;
                        })()}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Escolha a Cor</label>
                  <div className="flex flex-wrap gap-3">
                    {colorsList.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setForm({...form, cor: color})}
                        className={`w-8 h-8 rounded-full transition-all flex items-center justify-center ${color} ${
                          form.cor === color ? 'ring-4 ring-offset-2 ring-gray-200 scale-110' : ''
                        }`}
                      >
                        {form.cor === color && <Check size={14} className="text-white" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 text-gray-400 font-bold hover:bg-gray-50 rounded-2xl transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-4 bg-whatsapp-teal text-white font-bold rounded-2xl shadow-xl shadow-whatsapp-teal/20 active:scale-95 transition-all"
                  >
                    {editingTipo ? 'Salvar' : 'Criar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
};

export default SettingsPage;
