import { useNavigate } from 'react-router-dom';
import { 
  Flame, 
  ShieldAlert, 
  Map as MapIcon, 
  Users, 
  Settings, 
  LogOut, 
  Bell, 
  TrendingUp 
} from 'lucide-react';

function Dashboard() {
  const navigate = useNavigate();

  // Función para cerrar sesión
  const handleLogout = () => {
    // Aquí podrías agregar lógica para borrar tokens si fuera necesario
    navigate('/'); 
  };

  // Datos de las tarjetas de estadísticas
  const stats = [
    { label: "Alertas Activas", value: "3", icon: <Flame size={20}/>, color: "text-red-500", bg: "bg-red-500/10" },
    { label: "Personal en Terreno", value: "12", icon: <Users size={20}/>, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Nivel de Riesgo", value: "Crítico", icon: <ShieldAlert size={20}/>, color: "text-orange-500", bg: "bg-orange-500/10" },
    { label: "Eficiencia Op.", value: "98%", icon: <TrendingUp size={20}/>, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  ];

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200 font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900/50 backdrop-blur-md flex flex-col fixed h-full">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="bg-red-600 p-2 rounded-lg text-white">
            <Flame size={20} />
          </div>
          <span className="font-black tracking-tighter text-white uppercase text-lg italic">Valle del Sol</span>
        </div>

        <nav className="flex-1 p-4 space-y-2 mt-4">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-red-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-red-600/20">
            <MapIcon size={20} /> Monitoreo
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl font-medium transition-all group">
            <Bell size={20} className="group-hover:animate-bounce" /> Historial
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl font-medium transition-all">
            <Users size={20} /> Brigadistas
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800 text-slate-400 rounded-xl font-medium transition-all">
            <Settings size={20} /> Configuración
          </button>
          {/* BOTÓN SALIR CONECTADO */}
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-400/10 rounded-xl font-bold transition-all group"
          >
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" /> 
            Salir del Panel
          </button>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL (Margen izquierdo para no chocar con el Sidebar fixed) */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        
        {/* Header del Dashboard */}
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight uppercase">Panel de Monitoreo</h1>
            <p className="text-slate-500 font-medium italic">Sistema de Gestión Municipal · Tiempo Real</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-bold text-white uppercase tracking-tighter">Bastián Mauricio</p>
              <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest bg-emerald-500/5 px-2 py-0.5 rounded-md border border-emerald-500/20">Admin Online</p>
            </div>
            <div className="w-12 h-12 bg-slate-800 rounded-2xl border border-slate-700 flex items-center justify-center text-white font-black shadow-inner">
              BM
            </div>
          </div>
        </header>

        {/* Grilla de Estadísticas */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] hover:border-red-600/30 transition-all group cursor-default shadow-xl">
              <div className="flex justify-between items-start mb-4">
                <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl group-hover:scale-110 transition-transform shadow-lg`}>
                  {stat.icon}
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Live</span>
                </div>
              </div>
              <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em] mb-1">{stat.label}</p>
              <h3 className="text-3xl font-black text-white tracking-tighter">{stat.value}</h3>
            </div>
          ))}
        </section>

        {/* Sección de Mapa y Alertas Recientes */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Espacio para el Mapa */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden min-h-[450px] flex flex-col shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <h3 className="font-bold text-white uppercase tracking-widest text-sm">Geolocalización de Incidentes</h3>
              <span className="bg-emerald-500/10 text-emerald-500 text-[10px] px-4 py-1.5 rounded-xl border border-emerald-500/20 font-black uppercase tracking-widest">Señal Activa</span>
            </div>
            <div className="flex-1 bg-slate-950 flex items-center justify-center relative group">
                <div className="absolute inset-0 bg-red-600/[0.02] pointer-events-none"></div>
                <div className="text-center">
                    <MapIcon size={48} className="text-slate-800 mb-4 mx-auto animate-pulse" />
                    <p className="text-slate-600 font-black uppercase tracking-[0.4em] text-xs">Esperando API de Google Maps...</p>
                </div>
            </div>
          </div>

          {/* Alertas Recientes */}
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 shadow-2xl">
            <h3 className="font-bold text-white uppercase tracking-widest text-sm mb-6 flex items-center gap-2">
                <Bell size={16} className="text-red-500" />
                Últimos Reportes
            </h3>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((_, i) => (
                <div key={i} className="bg-slate-950/40 border border-slate-800/50 p-4 rounded-2xl flex gap-4 items-start hover:bg-slate-950 transition-colors border-l-2 border-l-red-600/50">
                  <div className="mt-1.5 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                  <div>
                    <p className="text-sm font-bold text-slate-200">Foco detectado en Sector {i === 0 ? 'Norte' : 'Sur'}</p>
                    <p className="text-[10px] text-slate-500 font-black uppercase mt-1 tracking-wider italic">ID #829{i} · 09:4{i} AM</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-8 py-4 text-[10px] font-black text-slate-400 hover:text-white border border-slate-800 hover:border-slate-600 rounded-2xl transition-all uppercase tracking-[0.2em] bg-slate-950/50">
              Descargar Reporte PDF
            </button>
          </div>

        </section>
      </main>
    </div>
  );
}

export default Dashboard;