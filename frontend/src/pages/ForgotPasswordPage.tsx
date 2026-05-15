import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ShieldQuestion, Key, ArrowRight, Check, ChevronLeft, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '../services/api';

const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: Question, 3: Success
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [pergunta, setPergunta] = useState('');
  const [resposta, setResposta] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleCheckEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error('Digite seu e-mail');

    setLoading(true);
    try {
      const res = await api.post('/api/v1/auth/forgot-password', { email });
      const data = await res.json();

      if (res.ok) {
        setPergunta(data.pergunta_seguranca);
        setStep(2);
      } else {
        toast.error(data.erro || 'E-mail não encontrado');
      }
    } catch (err) {
      toast.error('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resposta || !novaSenha) return toast.error('Preencha todos os campos');

    setLoading(true);
    try {
      const res = await api.post('/api/v1/auth/reset-password', {
        email,
        resposta_seguranca: resposta,
        nova_senha: novaSenha
      });

      if (res.ok) {
        setStep(3);
        toast.success('Senha redefinida com sucesso!');
      } else {
        const data = await res.json();
        toast.error(data.erro || 'Resposta incorreta');
      }
    } catch (err) {
      toast.error('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-white flex flex-col items-center justify-center relative overflow-hidden font-sans">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1920&q=80" 
          className="w-full h-full object-cover shadow-inner" 
          alt="Coffee plantation" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-whatsapp-teal/60 to-whatsapp-teal/95"></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-8 text-center text-white flex flex-col h-full py-20">
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-8 shadow-2xl">
            <ShieldQuestion size={40} className="text-whatsapp-teal" />
          </div>
          
          {step === 1 && (
            <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h1 className="text-3xl font-black mb-4 tracking-tighter">Recuperar Senha</h1>
              <p className="text-white/70 mb-10 font-medium leading-relaxed">
                Digite seu e-mail para localizarmos sua pergunta de segurança rural.
              </p>

              <form onSubmit={handleCheckEmail} className="w-full space-y-6">
                <div className="relative">
                  <Mail size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Seu e-mail cadastrado"
                    className="w-full bg-white/10 border-2 border-white/20 rounded-2xl py-4 pl-14 pr-6 text-lg font-bold outline-none focus:border-white focus:bg-white/20 transition-all"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white text-whatsapp-teal py-5 rounded-[2rem] font-black text-xl shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-4 border-whatsapp-teal border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <><ArrowRight size={24} /> CONTINUAR</>
                  )}
                </button>
              </form>
            </div>
          )}

          {step === 2 && (
            <div className="w-full animate-in slide-in-from-right-10 duration-500">
              <h1 className="text-3xl font-black mb-4 tracking-tighter">Segurança Rural</h1>
              <p className="text-white/70 mb-10 font-medium leading-relaxed">
                Responda sua pergunta secreta para cadastrar uma nova senha.
              </p>

              <div className="bg-white/10 p-6 rounded-3xl mb-8 border border-white/10">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-2">Sua Pergunta:</p>
                <p className="text-xl font-bold">{pergunta}</p>
              </div>

              <form onSubmit={handleResetPassword} className="w-full space-y-5 text-left">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/60 ml-4 block">Sua Resposta</label>
                  <input 
                    type="text" 
                    value={resposta}
                    onChange={(e) => setResposta(e.target.value)}
                    placeholder="Responda aqui..."
                    className="w-full bg-white/10 border-2 border-white/20 rounded-2xl py-4 px-6 text-lg font-bold outline-none focus:border-white transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/60 ml-4 block">Nova Senha</label>
                  <div className="relative">
                    <Key size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40" />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={novaSenha}
                      onChange={(e) => setNovaSenha(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full bg-white/10 border-2 border-white/20 rounded-2xl py-4 pl-14 pr-12 text-lg font-bold outline-none focus:border-white transition-all"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-whatsapp-green text-white py-5 rounded-[2rem] font-black text-xl shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 mt-4"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <><Check size={24} /> REDEFINIR SENHA</>
                  )}
                </button>
              </form>
            </div>
          )}

          {step === 3 && (
            <div className="w-full animate-in zoom-in duration-500">
              <div className="w-24 h-24 bg-whatsapp-green rounded-full flex items-center justify-center mb-8 mx-auto shadow-2xl">
                <Check size={48} className="text-white" />
              </div>
              <h1 className="text-3xl font-black mb-4 tracking-tighter text-white">Tudo Pronto!</h1>
              <p className="text-white/70 mb-10 font-medium leading-relaxed">
                Sua senha foi alterada com sucesso. Agora você já pode entrar na sua conta.
              </p>
              <Link 
                to="/login"
                className="w-full bg-white text-whatsapp-teal py-5 rounded-[2rem] font-black text-xl shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                IR PARA O LOGIN <ArrowRight size={24} />
              </Link>
            </div>
          )}

          <Link 
            to="/login"
            className="mt-8 text-white/50 font-bold uppercase text-xs tracking-widest hover:text-white flex items-center gap-2"
          >
            <ChevronLeft size={16} /> Voltar para o Login
          </Link>
        </div>

        <div className="mt-auto pt-8">
          <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em]">
            AgroCafé • Recuperação Rural
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
