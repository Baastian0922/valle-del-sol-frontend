import React from 'react';
import { ArrowLeft, Flame, MapPin, Navigation, Radio, ShieldCheck } from 'lucide-react';

const estados = [
  { value: 'EN CAMINO', label: 'Marcar en camino', className: 'bg-blue-600 hover:bg-blue-500' },
  { value: 'CONTROLADO', label: 'Marcar controlado', className: 'bg-amber-600 hover:bg-amber-500' }
];

export default function EmergencyController({ reporte, onBack, onActualizarEstado, onAbrirGPS }) {
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
        onClick={() => onAbrirGPS(reporte.latitud, reporte.longitud)}
        className="w-full mb-3 px-4 py-3 bg-slate-950 hover:bg-slate-800 border border-slate-700 text-white rounded-xl font-black uppercase text-[10px] tracking-widest transition-colors flex items-center justify-center gap-2"
      >
        <Navigation size={14} /> Abrir ruta GPS
      </button>

      <div className="space-y-2">
        {estados.map((estado) => (
          <button
            key={estado.value}
            onClick={() => onActualizarEstado(reporte.id, estado.value)}
            disabled={reporte.estado === estado.value}
            className={`w-full px-4 py-3 text-white rounded-xl font-black uppercase text-[10px] tracking-widest transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${estado.className}`}
          >
            {estado.label}
          </button>
        ))}
      </div>
    </aside>
  );
}
