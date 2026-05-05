import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Truck, Settings as SettingsIcon, 
  ChevronRight, Plus, User, Camera, 
  LayoutGrid, Trash2, Edit 
} from 'lucide-react';
import Layout from '../components/Layout';

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

const SettingsPage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tipos, setTipos] = useState<TipoAtividade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Carregar Perfil do Usuário
    fetch('/api/v1/perfil')
      .then(res => res.json())
      .then(data => setProfile(data))
      .catch(err => console.error("Erro ao carregar perfil:", err));

    // Carregar Categorias de Atividades
    fetch('/api/v1/tipos-atividade')
      .then(res => res.json())
      .then(data => {
        setTipos(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erro ao carregar tipos:", err);
        setLoading(false);
      });
  }, []);

  const handleDeleteTipo = async (id: number) => {
    if (!confirm("Deseja realmente excluir esta categoria?")) return;
    try {
      const res = await fetch(`/api/v1/tipos-atividade/${id}`, { method: 'DELETE' });
      if (res.ok) setTipos(tipos.filter(t => t.id !== id));
    } catch (err) {
      console.error("Erro ao deletar:", err);
    }
  };

  return (
    <Layout title="Configurações">
      <div className="p-4 space-y-6 pb-24">
        {/* Profile Section (REFACTORED WITH PHOTO) */}
        <div 
          onClick={() => navigate('/perfil')}
          className="bg-white p-6 rounded-[2rem] shadow-sm flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition-all border border-gray-50 group"
        >
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-white shadow-md ring-2 ring-gray-50">
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
            <p className="text-xs text-gray-400 font-medium truncate max-w-[200px]">
              {profile?.email}
            </p>
          </div>
          <ChevronRight size={20} className="text-gray-300 group-hover:text-whatsapp-teal transition-colors" />
        </div>

        {/* Quick Management Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div 
            onClick={() => navigate('/equipe')}
            className="bg-white p-8 rounded-[2.5rem] shadow-sm flex flex-col items-center gap-3 cursor-pointer hover:shadow-md transition-all border border-gray-50 active:scale-95"
          >
            <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center shadow-inner">
              <User size={28} />
            </div>
            <span className="text-sm font-black text-gray-700">Equipe</span>
          </div>

          <div 
            onClick={() => navigate('/frota')}
            className="bg-white p-8 rounded-[2.5rem] shadow-sm flex flex-col items-center gap-3 cursor-pointer hover:shadow-md transition-all border border-gray-50 active:scale-95"
          >
            <div className="w-14 h-14 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center shadow-inner">
              <Truck size={28} />
            </div>
            <span className="text-sm font-black text-gray-700">Frota</span>
          </div>
        </div>

        {/* Categories Section */}
        <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-gray-50">
          <div className="flex justify-between items-center mb-6 px-2">
            <div>
              <h3 className="text-lg font-black text-gray-900">Categorias de Atividades</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Personalize seu registro</p>
            </div>
            <button className="bg-whatsapp-green text-white p-3 rounded-2xl shadow-lg shadow-whatsapp-green/20 active:scale-90 transition-all">
              <Plus size={24} />
            </button>
          </div>

          <div className="space-y-3">
            {loading ? (
              <p className="text-center text-xs text-gray-400 py-4">Carregando categorias...</p>
            ) : tipos.map(t => (
              <div 
                key={t.id} 
                className="flex items-center gap-4 p-4 bg-gray-50/50 rounded-3xl border border-gray-50 group hover:bg-white hover:shadow-md transition-all"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${t.cor}`}>
                  <LayoutGrid size={20} />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-black text-gray-800">{t.nome}</h4>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">{t.icone}</p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 text-gray-400 hover:text-whatsapp-teal transition-colors"><Edit size={16} /></button>
                  <button onClick={() => handleDeleteTipo(t.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SettingsPage;
