import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Map as MapIcon, RotateCcw, LogOut, Users, Shield, ShieldAlert, HeartHandshake, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { auth } from '../services/firebase-config';
import { signOut } from 'firebase/auth';

const Sidebar = ({ onRefresh, onShowUsers, onShowEntityValidation, vistaActiva = 'monitoreo', setVistaActiva }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const getRoleIcon = (role) => {
    switch (role) {
      case 'ADMIN': return <ShieldAlert className="text-red-500" size={14} />;
      case 'EMERGENCY_ENTITY': return <Shield className="text-blue-400" size={14} />;
      default: return <HeartHandshake className="text-emerald-400" size={14} />;
    }
  };

  // Funcion unificada de salida
  const handleSalir = async () => {
    try {
      if (user) {
        await signOut(auth);
      }
    } catch (error) {
      console.error("Error al cerrar sesion:", error);
    } finally {
      // Forzamos el regreso a la portada principal (LandingPage)
      navigate('/', { replace: true });
    }
  };

  return (
    <aside className="w-16 md:w-64 border-r border-slate-800 bg-slate-900/50 backdrop-blur-md flex flex-col fixed h-full z-20 transition-all duration-300">
      <div className="p-4 md:p-6 border-b border-slate-800 flex items-center gap-3 justify-center md:justify-start">
        <div className="bg-red-600 p-2 rounded-lg text-white shadow-lg shrink-0"><Flame size={20} /></div>
        <span className="hidden md:inline font-black tracking-tighter text-white uppercase text-lg italic">Valle del Sol</span>
      </div>

      {/* Información del Perfil en Sidebar */}
      <div className="p-3 md:p-4 border-b border-slate-800/60 bg-slate-950/20 flex justify-center md:justify-start">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center text-xs text-white font-black italic shrink-0">
            {user?.fullName ? user.fullName.substring(0, 2).toUpperCase() : 'US'}
          </div>
          <div className="hidden md:block overflow-hidden">
            <p className="text-xs font-black text-white uppercase italic truncate">
              {user?.fullName || 'Invitado'}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              {user ? getRoleIcon(user.role) : <HeartHandshake className="text-emerald-400" size={14} />}
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">
                {user?.role || 'ANONIMO'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-2 md:p-4 space-y-2 mt-2">
        <button
          onClick={() => setVistaActiva && setVistaActiva('monitoreo')}
          className={`w-full flex items-center justify-center md:justify-start gap-3 px-3 md:px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${vistaActiva === 'monitoreo' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
        >
          <MapIcon size={18} className="shrink-0" />
          <span className="hidden md:inline">Monitoreo</span>
        </button>

        {user?.role === 'ADMIN' && (
          <button
            onClick={() => setVistaActiva && setVistaActiva('historial')}
            className={`w-full flex items-center justify-center md:justify-start gap-3 px-3 md:px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${vistaActiva === 'historial' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            <FileText size={18} className="shrink-0" />
            <span className="hidden md:inline">Reporte Histórico</span>
          </button>
        )}

        {user?.role === 'ADMIN' && (
          <button onClick={onShowUsers} className="w-full flex items-center justify-center md:justify-start gap-3 px-3 md:px-4 py-3 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl font-bold transition-all text-xs uppercase tracking-wider">
            <Users size={18} className="shrink-0" />
            <span className="hidden md:inline">Gestión Usuarios</span>
          </button>
        )}

        {user?.role === 'ADMIN' && onShowEntityValidation && (
          <button 
            onClick={onShowEntityValidation} 
            className={`w-full flex items-center justify-center md:justify-start gap-3 px-3 md:px-4 py-3 rounded-xl font-bold transition-all text-xs uppercase tracking-wider ${vistaActiva === 'validar-entidades' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            <ShieldAlert size={18} className="shrink-0" />
            <span className="hidden md:inline">Validar Entidades</span>
          </button>
        )}

        {onRefresh && (
          <button onClick={onRefresh} className="w-full flex items-center justify-center md:justify-start gap-3 px-3 md:px-4 py-3 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl font-bold transition-all text-xs uppercase tracking-wider">
            <RotateCcw size={18} className="shrink-0" />
            <span className="hidden md:inline">Refrescar</span>
          </button>
        )}
      </nav>

      <div className="p-3 md:p-4 border-t border-slate-800 flex justify-center md:justify-start">
         <button onClick={handleSalir} className="w-full flex items-center justify-center md:justify-start gap-3 px-3 md:px-4 py-3 text-red-400 font-bold hover:bg-red-400/10 rounded-xl transition-all text-xs uppercase tracking-wider">
           <LogOut size={18} className="shrink-0" />
           <span className="hidden md:inline">Salir</span>
         </button>
      </div>
    </aside>
  );
};

export default Sidebar;