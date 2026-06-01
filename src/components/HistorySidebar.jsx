import React from 'react';
import { Bell } from 'lucide-react';

const HistorySidebar = ({ historial, onSelect }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 shadow-2xl flex flex-col h-[500px]">
      <h3 className="font-bold text-white uppercase tracking-widest text-sm mb-6 flex items-center gap-2 italic tracking-tighter">
        <Bell size={16} className="text-red-500" /> Historial de Alertas
      </h3>
      
      <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
        {historial && historial.map((rep, index) => (
          <button 
            key={rep.id || index} 
            onClick={() => onSelect(rep)}
            className="w-full bg-slate-950/40 border border-slate-800/50 p-4 rounded-2xl flex gap-4 items-start border-l-4 hover:bg-slate-800 transition-all text-left group"
            style={{ borderLeftColor: rep.estado === 'ATENDIDO' ? '#10b981' : '#ef4444' }}
          >
            <div className={`mt-1.5 w-2.5 h-2.5 rounded-full ${rep.estado === 'ATENDIDO' ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`}></div>
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors tracking-tighter">
                {rep.titulo}
              </p>
              <div className="flex justify-between items-center mt-1">
                <p className="text-[9px] text-slate-500 font-black uppercase italic tracking-tighter">
                  {rep.estado}
                </p>
                <p className="text-[9px] text-emerald-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-tighter">
                  Detalles →
                </p>
              </div>
            </div>
          </button>
        ))}
        {(!historial || historial.length === 0) && (
          <p className="text-center text-slate-600 text-xs mt-10 italic">No hay reportes activos</p>
        )}
      </div>
    </div>
  );
};

export default HistorySidebar;