import React from 'react';
import { ArrowLeft, Flame, MapPin, Navigation, Radio, ShieldCheck, Trash2, CheckCircle2, Activity, Calendar, X } from 'lucide-react';

const estados = [
  { value: 'EN_PROCESO', label: 'En Proceso', className: 'bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-600/30' },
  { value: 'CONTROLADO', label: 'Incendio Controlado', className: 'bg-amber-600/20 hover:bg-amber-600 text-amber-400 hover:text-white border border-amber-600/30' },
  { value: 'RESUELTO', label: 'Caso Resuelto', className: 'bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-600/30' },
];

export default function AdminEmergencyController({ reporte, onBack, onActualizarEstado, onAbrirGPS, onDelete, userName, isModal = false }) {
  const scrollRef = React.useRef(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [reporte?.id]);

  const getEstadoColor = (estado) => {
    if (estado === 'RESUELTO') return 'text-emerald-400';
    if (estado === 'CONTROLADO') return 'text-amber-400';
    if (estado === 'EN_PROCESO') return 'text-blue-400';
    return 'text-red-400';
  };

  return (
    <aside className="bg-slate-900 border border-slate-800 rounded-[2.5rem] py-5 px-0 shadow-2xl flex flex-col h-full min-h-[420px] max-h-[520px] w-full max-w-md">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0 px-5">
        <div className="flex items-center gap-3">
          {!isModal && onBack && (
            <button onClick={onBack} className="p-2 rounded-xl bg-slate-950 text-slate-400 hover:text-white transition-colors" aria-label="Volver al feed">
              <ArrowLeft size={16} />
            </button>
          )}
          <div>
            <p className="text-[9px] text-red-400 font-black uppercase tracking-widest flex items-center gap-1">
              <Radio size={12} className="animate-pulse" /> Panel de Gestión — Admin
            </p>
            <h3 className="text-sm text-white font-bold mt-0.5">Administrar Emergencia</h3>
          </div>
        </div>

        {isModal && onBack && (
          <button onClick={onBack} className="p-2 rounded-xl bg-slate-950 text-slate-400 hover:text-white transition-colors" aria-label="Cerrar modal">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Detalle del reporte */}
      <div ref={scrollRef} className="px-5 py-2.5 flex-1 overflow-y-auto custom-scrollbar">
        <div className="flex items-start gap-2.5 mb-3">
          <div className="w-9 h-9 rounded-2xl bg-red-500/10 text-red-500 grid place-items-center shrink-0">
            <Flame size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm text-white font-black italic truncate">{reporte.titulo}</h4>
            <p className="text-[9px] text-slate-500 mt-0.5">ID: #{reporte.id}</p>
          </div>
        </div>
        
        <p className="text-[11px] text-slate-400 leading-relaxed mb-3">{reporte.descripcion}</p>
        
        {/* Info Cards */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-2">
            <div className="flex items-center gap-1.5 mb-1">
              <Activity size={12} className={getEstadoColor(reporte.estado)} />
              <p className="text-[7.5px] text-slate-600 font-black uppercase">Estado</p>
            </div>
            <p className={`text-[9.5px] font-black uppercase ${getEstadoColor(reporte.estado)}`}>{reporte.estado}</p>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-2">
            <div className="flex items-center gap-1.5 mb-1">
              <MapPin size={12} className="text-red-400" />
              <p className="text-[7.5px] text-slate-600 font-black uppercase">Coordenadas</p>
            </div>
            <p className="text-[9.5px] font-mono text-emerald-400">{Number(reporte.latitud).toFixed(4)}, {Number(reporte.longitud).toFixed(4)}</p>
          </div>
        </div>

        {reporte.fechaCreacion && (
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-2 mb-3 flex items-center gap-2">
            <Calendar size={12} className="text-slate-500" />
            <p className="text-[9.5px] text-slate-400">{new Date(reporte.fechaCreacion).toLocaleString()}</p>
          </div>
        )}

        {/* GPS Button */}
        <button
          onClick={() => onAbrirGPS(reporte.latitud, reporte.longitud)}
          className="w-full mb-3 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-black uppercase text-[9px] tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
        >
          <Navigation size={14} /> Abrir Ruta GPS
        </button>

        {/* Estado Actions */}
        <p className="text-[8px] text-slate-650 font-black uppercase tracking-widest mb-1.5 italic">Cambiar Estado</p>
        <div className="space-y-1.5 mb-3">
          {estados.map((estado) => (
            <button
              key={estado.value}
              onClick={() => {
                if (estado.value === 'RESUELTO') {
                  if (confirm("¿Confirmas el cierre definitivo de esta alerta de incendio?")) {
                    onActualizarEstado(reporte.id, estado.value);
                  }
                } else {
                  onActualizarEstado(reporte.id, estado.value);
                }
              }}
              disabled={reporte.estado?.startsWith(estado.value)}
              className={`w-full px-4 py-1.5 rounded-lg font-black uppercase text-[8.5px] tracking-widest transition-all disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${estado.className}`}
            >
              {estado.value === 'RESUELTO' && <CheckCircle2 size={12} />}
              {estado.value === 'CONTROLADO' && <Activity size={12} />}
              {estado.value === 'EN_PROCESO' && <Navigation size={12} className="rotate-45" />}
              {estado.label}
            </button>
          ))}

          {userName && (
            <button
              onClick={() => onActualizarEstado(reporte.id, `EN CAMINO - ENTIDAD: ${userName.toUpperCase()}`)}
              disabled={reporte.estado?.startsWith('EN CAMINO')}
              className="w-full px-4 py-1.5 rounded-lg font-black uppercase text-[8.5px] tracking-widest transition-all disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center gap-2 bg-cyan-600/20 hover:bg-cyan-600 text-cyan-400 hover:text-white border border-cyan-600/30"
            >
              <Navigation size={12} /> Despachar unidad en camino
            </button>
          )}
        </div>
      </div>

      {/* Footer: Delete */}
      <div className="pt-2 border-t border-slate-800 shrink-0 px-5">
        <button
          onClick={() => {
            if (confirm("¿Estás seguro de eliminar este reporte permanentemente?")) {
              onDelete(reporte.id);
            }
          }}
          className="w-full px-4 py-1.5 bg-red-950/50 hover:bg-red-600 border border-red-500/20 text-red-400 hover:text-white rounded-lg font-black uppercase text-[8.5px] tracking-widest transition-all flex items-center justify-center gap-2"
        >
          <Trash2 size={12} /> Eliminar Reporte
        </button>
      </div>
    </aside>
  );
}
