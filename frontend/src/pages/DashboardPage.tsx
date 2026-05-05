import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, Users, Truck, MessageSquare, 
  ArrowUpRight, ArrowDownRight, Calendar, Filter 
} from 'lucide-react';
import Layout from '../components/Layout';

const COLORS = ['#008069', '#25D366', '#34B7F1', '#ECE5DD', '#FFBC2C'];

const DashboardPage = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulando busca de dados agregados
    // Em uma app real, faríamos um fetch para /api/v1/stats
    Promise.all([
      fetch('/api/v1/lavouras').then(res => res.json()),
      fetch('/api/v1/feed').then(res => res.json()),
      fetch('/api/v1/funcionarios').then(res => res.json()),
      fetch('/api/v1/maquinarios').then(res => res.json())
    ]).then(([lavouras, atividades, funcionarios, maquinarios]) => {
      
      // Processando dados para os gráficos
      const atividadesPorTipo = atividades.reduce((acc: any, atv: any) => {
        const tipo = atv.tipo?.nome || 'Outros';
        acc[tipo] = (acc[tipo] || 0) + 1;
        return acc;
      }, {});

      const pieData = Object.keys(atividadesPorTipo).map(name => ({
        name, value: atividadesPorTipo[name]
      }));

      // Atividades por dia (últimos 7 dias)
      const last7Days = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
      }).reverse();

      const lineData = last7Days.map(date => ({
        date: new Date(date).toLocaleDateString('pt-BR', { weekday: 'short' }),
        count: atividades.filter((a: any) => a.data.startsWith(date)).length
      }));

      setStats({
        totalLavouras: lavouras.length,
        totalAtividades: atividades.length,
        totalFuncionarios: funcionarios.length,
        totalMaquinarios: maquinarios.length,
        pieData,
        lineData,
        atividadesRecentes: atividades.slice(0, 5)
      });
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <Layout title="Dashboard">
        <div className="flex flex-col items-center justify-center h-full p-8 space-y-4">
          <div className="w-12 h-12 border-4 border-whatsapp-teal border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Calculando safras...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard">
      <div className="p-4 space-y-6 pb-24">
        {/* Resumo em Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-50">
            <div className="flex justify-between items-start mb-2">
              <div className="p-2 bg-whatsapp-teal/10 text-whatsapp-teal rounded-xl">
                <MessageSquare size={20} />
              </div>
              <span className="text-[10px] font-black text-green-500 bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                <ArrowUpRight size={10} /> +12%
              </span>
            </div>
            <h3 className="text-2xl font-black text-gray-900">{stats.totalAtividades}</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Atividades</p>
          </div>

          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-50">
            <div className="flex justify-between items-start mb-2">
              <div className="p-2 bg-orange-50 text-orange-500 rounded-xl">
                <TrendingUp size={20} />
              </div>
              <span className="text-[10px] font-black text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">Meta OK</span>
            </div>
            <h3 className="text-2xl font-black text-gray-900">{stats.totalLavouras}</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Talhões</p>
          </div>
        </div>

        {/* Gráfico de Linha: Histórico */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-50">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-black text-gray-900">Ritmo de Trabalho</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Atividades nos últimos 7 dias</p>
            </div>
            <Calendar className="text-gray-300" size={20} />
          </div>
          
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.lineData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#008069" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#008069" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#999'}} />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.05)', fontSize: '12px'}}
                  cursor={{stroke: '#008069', strokeWidth: 2}}
                />
                <Area type="monotone" dataKey="count" stroke="#008069" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Pizza: Distribuição */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-50">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-black text-gray-900">Tipo de Operação</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Distribuição por categoria</p>
            </div>
            <Filter className="text-gray-300" size={20} />
          </div>

          <div className="flex items-center">
            <div className="h-48 w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.pieData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="w-1/2 space-y-2">
              {stats.pieData.map((item: any, index: number) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[index % COLORS.length]}}></div>
                  <span className="text-[10px] font-black text-gray-600 uppercase truncate">{item.name}</span>
                  <span className="text-[10px] font-bold text-gray-400 ml-auto">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recursos Humanos e Frota */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-50 flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-500 rounded-2xl">
              <Users size={24} />
            </div>
            <div>
              <h4 className="text-xl font-black text-gray-900">{stats.totalFuncionarios}</h4>
              <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Equipe</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-50 flex items-center gap-4">
            <div className="p-3 bg-orange-50 text-orange-500 rounded-2xl">
              <Truck size={24} />
            </div>
            <div>
              <h4 className="text-xl font-black text-gray-900">{stats.totalMaquinarios}</h4>
              <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Frota</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
