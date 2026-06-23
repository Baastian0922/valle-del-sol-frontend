import React from 'react';
import { ArrowLeft, Flame, MapPin, Navigation, Radio, ShieldCheck, MessageCircle } from 'lucide-react';

export default function EmergencyController({ reporte, onBack, onActualizarEstado, onAbrirGPS, onVerChat, userName }) {
  return (
    <aside className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 shadow-2xl min-h-[500px]">
      <div className="flex items-center gap-3 pb-5 border-b border-slate-800">
        <button onClick={onBack} className="p-2 rounded-xl bg-slate-950 text-slate-400 hover:text-white transition-colors" aria-label="Volver al feed">
          <ArrowLeft size={16} />
        </button>
        <div>
          <p className="text-[9px] text-blue-400 font-black uppercase tracking-widest flex items-center gap-1">
            <Radio size={12} className="animate-pulse" /> Controlador operativo
          </p>
          <h3 className="text-sm text-white font-bold mt-1">Emergencia seleccionada</h3>
        </div>
      </div>

      <div className="py-6">
        <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 grid place-items-center mb-4">
          <Flame size={24} />
        </div>
        <h4 className="text-lg text-white font-black italic">{reporte.titulo}</h4>
        <p className="text-xs text-slate-400 leading-relaxed mt-2">{reporte.descripcion}</p>
        <div className="mt-5 p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-3">
          <p className="text-[10px] text-slate-300 flex items-center gap-2"><ShieldCheck size={14} className="text-blue-400" /> Estado: <strong>{reporte.estado}</strong></p>
          <p className="text-[10px] text-slate-300 flex items-center gap-2"><MapPin size={14} className="text-red-400" /> {Number(reporte.latitud).toFixed(5)}, {Number(reporte.longitud).toFixed(5)}</p>
        </div>
      </div>

      <button
        onClick={() => onActualizarEstado(reporte.id, userName ? `EN CAMINO - ENTIDAD: ${userName.toUpperCase()}` : 'EN CAMINO')}
        disabled={reporte.estado?.startsWith('EN CAMINO')}
        className="w-full mb-3 px-4 py-3 text-white rounded-xl font-black uppercase text-[10px] tracking-widest transition-colors disabled:opacity-30 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-500"
      >
        Marcar en camino
      </button>

      <button
        onClick={() => onActualizarEstado(reporte.id, 'PENDIENTE')}
        disabled={reporte.estado === 'PENDIENTE'}
        className="w-full mb-3 px-4 py-3 text-red-400 bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 rounded-xl font-black uppercase text-[10px] tracking-widest transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        Descartar ruta y dejar Pendiente
      </button>

      <button
        onClick={() => onAbrirGPS(reporte.latitud, reporte.longitud)}
        className="w-full mb-3 px-4 py-3 bg-slate-950 hover:bg-slate-800 border border-slate-700 text-white rounded-xl font-black uppercase text-[10px] tracking-widest transition-colors flex items-center justify-center gap-2"
      >
        <Navigation size={14} /> Abrir ruta GPS
      </button>

      <button
        onClick={onVerChat}
        className="w-full mb-3 px-4 py-3 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-2"
      >
        <MessageCircle size={14} /> Ver Chat Comunitario
      </button>

      <button
        onClick={() => onActualizarEstado(reporte.id, userName ? `CONTROLADO - POR: ${userName.toUpperCase()}` : 'CONTROLADO')}
        disabled={reporte.estado?.startsWith('CONTROLADO')}
        className="w-full px-4 py-3 text-white rounded-xl font-black uppercase text-[10px] tracking-widest transition-colors disabled:opacity-30 disabled:cursor-not-allowed bg-amber-600 hover:bg-amber-500"
      >
        Marcar controlado
      </button>
    </aside>
  );
}
