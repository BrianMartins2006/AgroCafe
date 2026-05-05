import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit, Trash2, Truck, Settings, DollarSign, X } from 'lucide-react';
import Layout from '../components/Layout';

interface Maquinario {
  id: number;
  tipo: string;
  modelo: string;
  valor_hora: number;
  consumo_medio: number;
}

const MaquinariosPage = () => {
  const [maquinarios, setMaquinarios] = useState<Maquinario[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Maquinario | null>(null);
  const [form, setForm] = useState({
    tipo: '',
    modelo: '',
    valor_hora: 0,
    consumo_medio: 0
  });

  const loadData = () => {
    setLoading(true);
    fetch('/api/v1/maquinarios')
      .then(res => res.json())
      .then(data => {
        setMaquinarios(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editing ? 'PUT' : 'POST';
    const url = editing ? `/api/v1/maquinarios/${editing.id}` : '/api/v1/maquinarios';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setIsModalOpen(false);
        setEditing(null);
        setForm({ tipo: '', modelo: '', valor_hora: 0, consumo_medio: 0 });
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Excluir maquinário?")) return;
    await fetch(`/api/v1/maquinarios/${id}`, { method: 'DELETE' });
    loadData();
  };

  return (
    <Layout title="Maquinário" showBackButton={true}>
      <div className="bg-[#f0f2f5] min-h-full p-4 space-y-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black text-gray-900">Frota</h2>
            <p className="text-sm text-gray-400">Gerencie tratores e equipamentos.</p>
          </div>
          <button 
            onClick={() => { setEditing(null); setForm({ tipo: '', modelo: '', valor_hora: 0, consumo_medio: 0 }); setIsModalOpen(true); }}
            className="p-3 bg-whatsapp-green text-white rounded-full shadow-lg active:scale-90 transition-all"
          >
            <Plus size={24} />
          </button>
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="p-10 text-center text-gray-400 italic">Carregando...</div>
          ) : maquinarios.map(m => (
            <div key={m.id} className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center">
                  <Truck size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{m.modelo}</h3>
                  <p className="text-xs text-gray-400 font-medium">{m.tipo}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setEditing(m); setForm(m); setIsModalOpen(true); }} className="p-2 text-gray-400 hover:text-whatsapp-teal"><Edit size={18} /></button>
                <button onClick={() => handleDelete(m.id)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 size={18} /></button>
              </div>
            </div>
          ))}
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl">
              <div className="bg-whatsapp-teal p-6 text-white flex justify-between items-center">
                <h3 className="font-bold">{editing ? 'Editar' : 'Novo'} Maquinário</h3>
                <button onClick={() => setIsModalOpen(false)}><X size={24} /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <input 
                  type="text" placeholder="Tipo (ex: Trator)" required
                  value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})}
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-whatsapp-teal"
                />
                <input 
                  type="text" placeholder="Modelo" required
                  value={form.modelo} onChange={e => setForm({...form, modelo: e.target.value})}
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-whatsapp-teal"
                />
                <input 
                  type="number" placeholder="Valor/Hora" required
                  value={form.valor_hora} onChange={e => setForm({...form, valor_hora: Number(e.target.value)})}
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-whatsapp-teal"
                />
                <input 
                  type="number" placeholder="Consumo Médio (L/h)"
                  value={form.consumo_medio} onChange={e => setForm({...form, consumo_medio: Number(e.target.value)})}
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

export default MaquinariosPage;
