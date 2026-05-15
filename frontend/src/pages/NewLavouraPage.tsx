import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Sprout, Check, Camera } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../components/Layout';
import MediaPicker from '../components/MediaPicker';

const NewLavouraPage = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const [nome, setNome] = useState('');
  const [cultura, setCultura] = useState('Café');
  const [area, setArea] = useState('');
  const [localizacao, setLocalizacao] = useState('');
  const [dataInicio, setDataInicio] = useState(new Date().toLocaleDateString('en-CA'));
  const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);
  const [imgFile, setImgFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const API_URL = import.meta.env.VITE_API_URL || '';

  const mutation = useMutation({
    mutationFn: async (payload: any) => {
      const response = await fetch(API_URL + (isEdit ? `/api/v1/lavouras/${id}` : '/api/v1/lavouras'), {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Falha ao salvar');
      return response.json();
    },
    onMutate: async (newLavoura) => {
      await queryClient.cancelQueries({ queryKey: ['lavouras'] });
      const previousLavouras = queryClient.getQueryData(['lavouras']);
      
      if (!isEdit) {
        queryClient.setQueryData(['lavouras'], (old: any) => [
          ...(old || []), 
          { 
            ...newLavoura, 
            id: Date.now(), 
            is_pinned: false,
            ultima_atividade_date: new Date().toISOString()
          }
        ]);
      }
      
      return { previousLavouras };
    },
    onError: (_err, _newLavoura, context: any) => {
      queryClient.setQueryData(['lavouras'], context.previousLavouras);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['lavouras'] });
    }
  });

  useEffect(() => {
    if (isEdit) {
      fetch(API_URL + `/api/v1/lavouras`)
        .then(res => res.json())
        .then(data => {
          const lavoura = data.find((l: any) => l.id === parseInt(id));
          if (lavoura) {
            setNome(lavoura.nome);
            setCultura(lavoura.cultura);
            setFotoPerfil(lavoura.foto_perfil);
            if (lavoura.area_hectares) setArea(lavoura.area_hectares.toString());
            if (lavoura.localizacao) setLocalizacao(lavoura.localizacao);
            if (lavoura.data_inicio) setDataInicio(lavoura.data_inicio);
          }
        });
    }
  }, [id, isEdit, API_URL]);

  const handleImageSelected = (files: File[]) => {
    const file = files[0];
    if (file) {
      setImgFile(file);
      setFotoPerfil(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!nome.trim() || loading) return;

    setLoading(true);
    try {
      let finalFotoPerfil = fotoPerfil;

      if (imgFile) {
        const formData = new FormData();
        formData.append('file', imgFile);
        const uploadRes = await fetch(API_URL + '/api/v1/upload', {
          method: 'POST',
          body: formData
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          finalFotoPerfil = uploadData.url;
        }
      }

      await mutation.mutateAsync({
        nome,
        cultura,
        foto_perfil: finalFotoPerfil || "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=100&q=80",
        area_hectares: area ? parseFloat(area) : null,
        localizacao,
        data_inicio: dataInicio,
        id_usuario_fk: null
      });

      navigate('/');
    } catch (err) {
      console.error("Erro ao salvar lavoura:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title={isEdit ? "Editar Lavoura" : "Nova Lavoura"} showBackButton={true}>
      <div className="p-6 space-y-8 max-w-lg mx-auto">
        {/* Foto de Perfil Upload */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-xl">
              {fotoPerfil ? (
                <img 
                  src={fotoPerfil.startsWith('blob:') || fotoPerfil.startsWith('http') ? fotoPerfil : (API_URL + fotoPerfil)} 
                  alt="Perfil" 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <Sprout size={48} />
                </div>
              )}
            </div>
            <button 
              onClick={() => setShowMediaPicker(true)}
              className="absolute bottom-1 right-1 bg-whatsapp-teal text-white p-3 rounded-full shadow-lg cursor-pointer hover:scale-110 active:scale-95 transition-all border-4 border-white"
            >
              <Camera size={20} />
            </button>
          </div>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Foto do Talhão</span>
        </div>

        <div className="space-y-6">
          <div className="relative">
            <label className="block text-xs font-bold text-whatsapp-teal mb-2 uppercase tracking-widest">
              Nome do Talhão
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Talhão Prime - Lote A"
              className="w-full p-0 py-2 border-b-2 border-gray-100 focus:border-whatsapp-teal outline-none text-xl font-medium transition-all bg-transparent placeholder:text-gray-300"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-whatsapp-teal mb-3 uppercase tracking-widest">
              Cultura Principal
            </label>
            <div className="flex flex-wrap gap-2">
              {['Café', 'Milho', 'Soja', 'Trigo', 'Outro'].map((c) => (
                <button
                  key={c}
                  onClick={() => setCultura(c)}
                  className={`px-5 py-2 rounded-full text-sm font-bold border-2 transition-all ${
                    cultura === c 
                    ? 'border-whatsapp-teal bg-whatsapp-teal text-white shadow-md scale-105' 
                    : 'border-gray-100 text-gray-400 hover:border-gray-200'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          
          <div className="relative">
            <label className="block text-xs font-bold text-whatsapp-teal mb-2 uppercase tracking-widest">
              Localização
            </label>
            <input
              type="text"
              value={localizacao}
              onChange={(e) => setLocalizacao(e.target.value)}
              placeholder="Ex: Fazenda Bela Vista - Área Sul"
              className="w-full p-0 py-2 border-b-2 border-gray-100 focus:border-whatsapp-teal outline-none text-md font-medium transition-all bg-transparent placeholder:text-gray-300"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <label className="block text-xs font-bold text-whatsapp-teal mb-2 uppercase tracking-widest">
                Área (Hectares)
              </label>
              <input
                type="number"
                step="0.1"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="Ex: 12.5"
                className="w-full p-0 py-2 border-b-2 border-gray-100 focus:border-whatsapp-teal outline-none text-md font-medium transition-all bg-transparent placeholder:text-gray-300"
              />
            </div>
            
            <div className="relative">
              <label className="block text-xs font-bold text-whatsapp-teal mb-2 uppercase tracking-widest">
                Data de Início
              </label>
              <input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="w-full p-0 py-2 border-b-2 border-gray-100 focus:border-whatsapp-teal outline-none text-md font-medium transition-all bg-transparent text-gray-700"
              />
            </div>
          </div>
        </div>

        <div className="pt-8 text-center">
          <p className="text-gray-400 text-[10px] leading-relaxed max-w-[200px] mx-auto italic">
            {isEdit 
              ? "As alterações serão refletidas em todos os registros deste talhão." 
              : "Este talhão será criado como um novo chat na sua tela principal."}
          </p>
        </div>
      </div>

      {/* Floating Action Button - Ajustado para ficar acima da barra de navegação */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-md flex justify-end px-6 z-[90] pointer-events-none">
        <button 
          onClick={handleSave}
          disabled={!nome.trim() || loading}
          className={`w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all pointer-events-auto hover:-translate-y-1 ${
            nome.trim() && !loading 
            ? 'bg-whatsapp-green text-white active:scale-90 hover:shadow-whatsapp-green/40 hover:shadow-2xl' 
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Check size={32} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>
      {/* Seletor de Mídia */}
      <MediaPicker 
        isOpen={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onSelect={handleImageSelected}
        multiple={false}
      />
    </Layout>
  );
};

export default NewLavouraPage;
