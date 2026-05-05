import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit, Trash2, User, Phone, Briefcase, DollarSign, X } from 'lucide-react';
import Layout from '../components/Layout';

interface Funcionario {
  id: number;
  nome: string;
  cargo: string;
  salario_hora: number;
  contato: string;
}

const FuncionariosPage = () => {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Funcionario | null>(null);
  const [form, setForm] = useState({
    nome: '',
    cargo: '',
    salario_hora: 0,
    contato: ''
  });

  const loadData = () => {
    setLoading(true);
    fetch('/api/v1/funcionarios')
      .then(res => res.json())
      .then(data => {
        setFuncionarios(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editing ? 'PUT' : 'POST';
    const url = editing ? `/api/v1/funcionarios/${editing.id}` : '/api/v1/funcionarios';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setIsModalOpen(false);
        setEditing(null);
        setForm({ nome: '', cargo: '', salario_hora: 0, contato: '' });
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Excluir funcionário?")) return;
    await fetch(`/api/v1/funcionarios/${id}`, { method: 'DELETE' });
    loadData();
  };

  return (
    <Layout title="Funcionários" showBackButton={true}>
      <div className="bg-[#f0f2f5] min-h-full p-4 space-y-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black text-gray-900">Equipe</h2>
            <p className="text-sm text-gray-400">Gerencie quem trabalha nas lavouras.</p>
          </div>
          <button 
            onClick={() => { setEditing(null); setForm({ nome: '', cargo: '', salario_hora: 0, contato: '' }); setIsModalOpen(true); }}
            className="p-3 bg-whatsapp-green text-white rounded-full shadow-lg active:scale-90 transition-all"
          >
            <Plus size={24} />
          </button>
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="p-10 text-center text-gray-400 italic">Carregando...</div>
          ) : funcionarios.map(f => (
            <div key={f.id} className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                  <User size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{f.nome}</h3>
                  <p className="text-xs text-gray-400 font-medium">{f.cargo}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setEditing(f); setForm(f); setIsModalOpen(true); }} className="p-2 text-gray-400 hover:text-whatsapp-teal"><Edit size={18} /></button>
                <button onClick={() => handleDelete(f.id)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 size={18} /></button>
              </div>
            </div>
          ))}
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl">
              <div className="bg-whatsapp-teal p-6 text-white flex justify-between items-center">
                <h3 className="font-bold">{editing ? 'Editar' : 'Novo'} Funcionário</h3>
                <button onClick={() => setIsModalOpen(false)}><X size={24} /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <input 
                  type="text" placeholder="Nome" required
                  value={form.nome} onChange={e => setForm({...form, nome: e.target.value})}
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-whatsapp-teal"
                />
                <input 
                  type="text" placeholder="Cargo" required
                  value={form.cargo} onChange={e => setForm({...form, cargo: e.target.value})}
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-whatsapp-teal"
                />
                <input 
                  type="number" placeholder="Salário/Hora" required
                  value={form.salario_hora} onChange={e => setForm({...form, salario_hora: Number(e.target.value)})}
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-whatsapp-teal"
                />
                <input 
                  type="text" placeholder="Contato"
                  value={form.contato} onChange={e => setForm({...form, contato: e.target.value})}
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-whatsapp-teal"
                />
                <button type="submit" className="w-full py-4 bg-whatsapp-teal text-white font-bold rounded-2xl shadow-xl">Salvar</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default FuncionariosPage;
