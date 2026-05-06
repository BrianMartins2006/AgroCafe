import { useState, useEffect } from 'react';
import { User, Mail, Lock, Camera, Check } from 'lucide-react';
import Layout from '../components/Layout';

interface UserProfile {
  id_usuario: number;
  nome: string;
  email: string;
  foto_url?: string;
}

const ProfilePage = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [form, setForm] = useState({
    nome: '',
    email: '',
    senha: ''
  });

  useEffect(() => {
    fetch((import.meta.env.VITE_API_URL || '') + '/api/v1/perfil')
      .then(res => res.json())
      .then(data => {
        setProfile(data);
        setForm({
          nome: data.nome,
          email: data.email,
          senha: ''
        });
        setLoading(false);
      })
      .catch(err => {
        console.error("Erro ao buscar perfil:", err);
        setLoading(false);
      });
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setSaving(true);
      const res = await fetch((import.meta.env.VITE_API_URL || '') + '/api/v1/upload', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        const updateRes = await fetch((import.meta.env.VITE_API_URL || '') + '/api/v1/perfil', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, foto_url: data.url })
        });

        if (updateRes.ok) {
          const updated = await updateRes.json();
          setProfile(updated);
          setSuccess(true);
          setTimeout(() => setSuccess(false), 3000);
        }
      }
    } catch (err) {
      console.error("Erro ao subir foto:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || '') + '/api/v1/perfil', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, foto_url: profile?.foto_url })
      });
      
      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Erro ao salvar perfil:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout title="Meu Perfil" showBackButton={true}>
      <div className="bg-[#f0f2f5] min-h-full">
        {/* Profile Header (WhatsApp Style) */}
        <div className="bg-white p-8 flex flex-col items-center border-b border-gray-100 shadow-sm">
          <div className="relative group">
            <div className="w-40 h-40 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border-4 border-gray-50 shadow-xl">
              {profile?.foto_url ? (
                <img src={profile.foto_url?.startsWith('http') ? profile.foto_url : (import.meta.env.VITE_API_URL || '') + profile.foto_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={80} className="text-gray-300" />
              )}
            </div>
            <label className="absolute bottom-1 right-1 w-12 h-12 bg-whatsapp-teal text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all border-4 border-white cursor-pointer">
              <Camera size={20} />
              <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
            </label>
          </div>
          <h2 className="mt-6 text-2xl font-black text-gray-900">{profile?.nome || 'Carregando...'}</h2>
          <p className="text-gray-400 font-medium">{profile?.email}</p>
        </div>

        {/* Edit Form */}
        <div className="p-6 max-w-md mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-[2rem] p-8 shadow-sm space-y-6 border border-gray-50">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-2">Nome Completo</label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    value={form.nome}
                    onChange={e => setForm({...form, nome: e.target.value})}
                    placeholder="Seu nome"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-whatsapp-teal transition-all text-gray-800 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-2">E-mail</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="email" 
                    value={form.email}
                    onChange={e => setForm({...form, email: e.target.value})}
                    placeholder="Seu e-mail"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-whatsapp-teal transition-all text-gray-800 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-2">Alterar Senha</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="password" 
                    value={form.senha}
                    onChange={e => setForm({...form, senha: e.target.value})}
                    placeholder="Deixe em branco para manter"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-whatsapp-teal transition-all text-gray-800 font-medium"
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={saving || loading}
              className={`w-full py-5 rounded-2xl font-black text-lg shadow-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 ${
                success 
                ? 'bg-whatsapp-green text-white shadow-whatsapp-green/20' 
                : 'bg-whatsapp-teal text-white shadow-whatsapp-teal/20 hover:bg-whatsapp-teal-dark'
              }`}
            >
              {saving ? (
                <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : success ? (
                <><Check size={24} /> Salvo com Sucesso!</>
              ) : (
                'Salvar Alterações'
              )}
            </button>
          </form>
          <p className="text-center text-[10px] text-gray-300 mt-8 font-black uppercase tracking-widest">AgroCafé • Segurança de Dados</p>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
