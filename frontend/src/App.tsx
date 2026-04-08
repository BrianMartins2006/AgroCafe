import { Search, MoreVertical, MessageSquarePlus, Settings, Sprout } from 'lucide-react'

interface Lavoura {
  id: number;
  nome: string;
  cultura: string;
  ultimaAtividade: string;
  data: string;
  foto: string;
}

const lavouras: Lavoura[] = [
  {
    id: 1,
    nome: "Talhão 01 - Café",
    cultura: "Café",
    ultimaAtividade: "Adubação realizada",
    data: "14:30",
    foto: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=100&q=80"
  },
  {
    id: 2,
    nome: "Área Norte - Milho",
    cultura: "Milho",
    ultimaAtividade: "Irrigação concluída",
    data: "Ontem",
    foto: "https://images.unsplash.com/photo-1551733592-220009cad634?auto=format&fit=crop&w=100&q=80"
  },
  {
    id: 3,
    nome: "Sítio Boa Vista",
    cultura: "Café",
    ultimaAtividade: "Monitoramento de pragas",
    data: "05/04/26",
    foto: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=100&q=80"
  }
];

function App() {
  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <header className="bg-whatsapp-teal text-white p-4 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-semibold">AgroCafé</h1>
        <div className="flex gap-4">
          <Search size={24} className="cursor-pointer opacity-80 hover:opacity-100" />
          <MoreVertical size={24} className="cursor-pointer opacity-80 hover:opacity-100" />
        </div>
      </header>

      {/* Tabs (Simple Version) */}
      <div className="bg-whatsapp-teal text-white flex border-t border-whatsapp-green/20">
        <div className="flex-1 text-center py-3 border-b-4 border-white font-medium uppercase text-sm">
          Lavouras
        </div>
        <div className="flex-1 text-center py-3 opacity-60 font-medium uppercase text-sm">
          Atividades
        </div>
        <div className="flex-1 text-center py-3 opacity-60 font-medium uppercase text-sm">
          Perfil
        </div>
      </div>

      {/* Chat List */}
      <main className="flex-1 overflow-y-auto">
        {lavouras.map((lavoura) => (
          <div 
            key={lavoura.id}
            className="flex items-center p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 active:bg-gray-200 transition-colors"
          >
            {/* Avatar */}
            <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 bg-gray-200">
              <img src={lavoura.foto} alt={lavoura.nome} className="w-full h-full object-cover" />
            </div>

            {/* Info */}
            <div className="ml-4 flex-1">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-gray-900">{lavoura.nome}</h3>
                <span className="text-xs text-gray-500">{lavoura.data}</span>
              </div>
              <p className="text-sm text-gray-600 truncate mt-1 flex items-center gap-1">
                <Sprout size={14} className="text-whatsapp-green" />
                {lavoura.ultimaAtividade}
              </p>
            </div>
          </div>
        ))}
      </main>

      {/* Floating Action Button */}
      <button className="fixed bottom-6 right-6 w-14 h-14 bg-whatsapp-green text-white rounded-full shadow-lg flex items-center justify-center hover:bg-whatsapp-teal transition-transform active:scale-95">
        <MessageSquarePlus size={24} />
      </button>

      {/* Settings FAB (Optional) */}
      <button className="fixed bottom-24 right-6 w-10 h-10 bg-gray-100 text-gray-600 rounded-full shadow flex items-center justify-center hover:bg-gray-200 transition-transform active:scale-95">
        <Settings size={20} />
      </button>
    </div>
  )
}

export default App
