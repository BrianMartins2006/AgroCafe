import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Camera, Check, ArrowRight, User, Coffee } from 'lucide-react';
import { toast } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'https://agrocafe-backend.onrender.com';

const WelcomePage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useMutation({
    mutationFn: (formData: FormData) => fetch(`${API_URL}/api/v1/upload`, { method: 'POST', body: formData }).then(res => res.json()),
    onSuccess: (data) => {
      setPhotoUrl(data.url);
      toast.success('Foto carregada!');
    },
    onError: () => toast.error('Erro ao subir foto'),
  });

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    await uploadMutation.mutateAsync(formData);
    setUploading(false);
  };

  const handleFinish = async () => {
    if (!name.trim()) return toast.error('Por favor, digite seu nome');
    
    try {
      // Cria o usuário no backend
      const res = await fetch(`${API_URL}/api/v1/usuarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: name,
          email: `${name.toLowerCase().replace(/\s/g, '')}@agrocafe.com`, // Email temporário
          foto_url: photoUrl
        })
      });

      if (res.ok) {
        localStorage.setItem('onboarding_complete', 'true');
        localStorage.setItem('user_name', name);
        localStorage.setItem('user_photo', photoUrl);
        toast.success(`Bem-vindo, ${name}!`);
        navigate('/');
      } else {
        toast.error('Erro ao salvar perfil');
      }
    } catch (err) {
      toast.error('Erro de conexão');
    }
  };

  return (
    <div className="h-screen w-full bg-white flex flex-col items-center justify-center relative overflow-hidden font-sans">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/images/welcome-bg.png" 
          className="w-full h-full object-cover" 
          alt="Coffee plantation" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-whatsapp-teal/60 to-whatsapp-teal/95"></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-8 text-center text-white flex flex-col h-full py-20">
        
        {step === 1 ? (
          <div className="flex-1 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-700">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-8 shadow-2xl">
              <Coffee size={48} className="text-whatsapp-teal" />
            </div>
            <h1 className="text-5xl font-black mb-4 tracking-tighter">AgroCafé</h1>
            <p className="text-xl font-medium text-white/80 leading-relaxed mb-12">
              Gestão inteligente para sua lavoura de café, direto no seu bolso.
            </p>
            <button 
              onClick={() => setStep(2)}
              className="w-full bg-white text-whatsapp-teal py-5 rounded-[2rem] font-black text-xl shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              COMEÇAR AGORA <ArrowRight size={24} />
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center animate-in slide-in-from-right-10 duration-500">
            <h2 className="text-3xl font-black mb-10">Configurar seu Perfil</h2>
            
            {/* Profile Picture Upload */}
            <div className="relative mb-12 group">
              <div className="w-32 h-32 rounded-full border-4 border-white/30 overflow-hidden bg-white/10 flex items-center justify-center shadow-2xl relative">
                {photoUrl ? (
                  <img src={photoUrl} className="w-full h-full object-cover" alt="Profile" />
                ) : (
                  <User size={64} className="text-white/40" />
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-white text-whatsapp-teal p-3 rounded-full shadow-xl active:scale-90 transition-all"
              >
                <Camera size={20} />
              </button>
              <input 
                type="file" 
                hidden 
                ref={fileInputRef} 
                onChange={handlePhotoUpload} 
                accept="image/*"
                capture="user"
              />
            </div>

            {/* Name Input */}
            <div className="w-full space-y-2 mb-12">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/60 text-left block ml-4">Qual seu nome?</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Sr. José"
                className="w-full bg-white/10 border-2 border-white/20 rounded-2xl py-4 px-6 text-xl font-bold outline-none focus:border-white focus:bg-white/20 transition-all placeholder:text-white/30"
              />
            </div>

            <button 
              onClick={handleFinish}
              className="w-full bg-whatsapp-green text-white py-5 rounded-[2rem] font-black text-xl shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              FINALIZAR <Check size={24} />
            </button>
            
            <button 
              onClick={() => setStep(1)}
              className="mt-6 text-white/50 font-bold uppercase text-xs tracking-widest"
            >
              Voltar
            </button>
          </div>
        )}

        <div className="mt-auto">
          <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em]">
            AgroCafé v2.0 • Premium Edition
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
