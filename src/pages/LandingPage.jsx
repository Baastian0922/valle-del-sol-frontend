import { Link } from 'react-router-dom';
import { Flame, ShieldCheck, ArrowRight } from 'lucide-react';

function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      {/* Navbar Simple */}
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Flame className="text-red-500" size={32} />
          <span className="text-xl font-black tracking-tighter">VALLE DEL SOL</span>
        </div>
        <Link to="/login" className="text-sm font-bold hover:text-red-500 transition">
          ACCESO PERSONAL
        </Link>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-8 text-left">
          <div className="inline-block bg-red-500/10 border border-red-500/20 px-4 py-1 rounded-full">
            <span className="text-red-500 text-xs font-bold uppercase tracking-widest">Sistema de Monitoreo 24/7</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-black leading-none">
            Protegiendo <br />
            Nuestra <span className="text-red-600">Comunidad</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-md">
            Plataforma digital para la gestión y reporte de focos de incendio en la comuna de Valle del Sol.
          </p>
          <div className="flex gap-4">
            <Link to="/login" className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-red-600/20">
              Ingresar al Panel <ArrowRight size={20} />
            </Link>
          </div>
        </div>

        {/* Decoración Visual */}
        <div className="relative">
          <div className="absolute -inset-4 bg-red-600/20 blur-3xl rounded-full"></div>
          <div className="relative bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
                <ShieldCheck size={28} />
              </div>
              <div>
                <h3 className="font-bold">Estado del Sistema</h3>
                <p className="text-xs text-green-500 font-bold tracking-widest uppercase">Operativo</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="bg-red-600 w-2/3 h-full"></div>
              </div>
              <p className="text-sm text-slate-500 italic">"La prevención es nuestra mejor herramienta contra el fuego."</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default LandingPage;