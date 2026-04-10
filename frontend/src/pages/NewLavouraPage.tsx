import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sprout, Check } from 'lucide-react';
import Layout from '../components/Layout';

const NewLavouraPage = () => {
  const [nome, setNome] = useState('');
  const [cultura, setCultura] = useState('Café');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSave = async () => {
    if (!nome.trim() || loading) return;

    setLoading(true);
    try {
      const response = await fetch('/api/v1/lavouras', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome,
          cultura,
          foto_perfil: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=100&q=80", // Default
          id_usuario_fk: null
        }),
      });

      if (response.ok) {
        navigate('/');
      }
    } catch (err) {
      console.error("Erro ao criar lavoura:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Nova Lavoura" showBackButton={true}>
      <div className="p-6 space-y-6">
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-300">
            <Sprout size={40} />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-whatsapp-teal mb-1 uppercase tracking-wider">
              Nome do Talhão
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Talhão 05 - Encosta"
              className="w-full p-3 border-b-2 border-gray-200 focus:border-whatsapp-teal outline-none text-lg transition-colors bg-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-whatsapp-teal mb-1 uppercase tracking-wider">
              Cultura
            </label>
            <div className="flex gap-2">
              {['Café', 'Milho', 'Soja', 'Outro'].map((c) => (
                <button
                  key={c}
                  onClick={() => setCultura(c)}
                  className={`px-4 py-2 rounded-full border-2 transition-all ${
                    cultura === c 
                    ? 'border-whatsapp-teal bg-whatsapp-teal text-white' 
                    : 'border-gray-200 text-gray-500 hover:border-whatsapp-teal'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-10">
          <p className="text-gray-400 text-xs text-center px-6">
            Sua nova lavoura aparecerá na lista de conversas como um novo chat.
          </p>
        </div>
      </div>

      {/* Save Button (FAB style) */}
      <button 
        onClick={handleSave}
        disabled={!nome.trim() || loading}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all ${
          nome.trim() && !loading 
          ? 'bg-whatsapp-green text-white active:scale-95' 
          : 'bg-gray-300 text-white cursor-not-allowed'
        }`}
      >
        <Check size={28} className={loading ? 'animate-spin' : ''} />
      </button>
    </Layout>
  );
};

export default NewLavouraPage;
