import React from 'react';
import { X, Shield, Phone, Mail, UserCheck, UserX, Star } from 'lucide-react';

export default function EntityListModal({ mostrar, setMostrar, usuarios }) {
  if (!mostrar) return null;

  // Filtrar entidades registradas (STAFF y EMERGENCY_ENTITY)
  const entidades = usuarios.filter(u => u.role === 'EMERGENCY_ENTITY' || u.role === 'STAFF');

  const staffMunicipal = entidades.filter(u => u.role === 'STAFF');
  const orgEmergencia = entidades.filter(u => u.role === 'EMERGENCY_ENTITY');

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-[2.5rem] p-8 shadow-2xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600/10 text-blue-400 p-2.5 rounded-2xl border border-blue-500/20">
              <Shield size={22} className="animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Entidades Registradas</h2>
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest italic">
                Organismos activos y personal de seguridad ciudadana en la comuna
              </p>
            </div>
          </div>
          <button
            onClick={() => setMostrar(false)}
            className="bg-slate-950 border border-slate-800 p-2.5 rounded-full text-slate-400 hover:text-white transition-all hover:scale-105 active:scale-95"
          >
            <X size={20} />
          </button>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
          {entidades.length === 0 ? (
            <div className="text-center py-12">
              <Shield size={48} className="text-slate-700 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wide">No hay entidades de emergencia registradas</p>
              <p className="text-xs text-slate-500 mt-1">Registra personal de emergencias o seguridad en el panel de usuarios.</p>
            </div>
          ) : (
            <>
              {/* Sección 1: Organismos de Emergencia */}
              {orgEmergencia.length > 0 && (
                <div>
                  <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-1.5 italic">
                    <Star size={12} className="fill-blue-400/20" /> Organismos de Emergencia (Bomberos, Carabineros, etc.)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {orgEmergencia.map(u => (
                      <EntityCard key={u.id} entity={u} />
                    ))}
                  </div>
                </div>
              )}

              {/* Sección 2: Seguridad y Staff Municipal */}
              {staffMunicipal.length > 0 && (
                <div>
                  <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-3 flex items-center gap-1.5 italic">
                    <Shield size={12} className="fill-amber-500/20" /> Seguridad Ciudadana y Staff Municipal
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {staffMunicipal.map(u => (
                      <EntityCard key={u.id} entity={u} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex justify-between items-center text-[10px] text-slate-500 uppercase font-black tracking-wider shrink-0">
          <span>Total de Entidades: {entidades.length}</span>
          <span className="text-blue-400 italic">Valle del Sol Emergencias</span>
        </div>

      </div>
    </div>
  );
}

// Sub-componente Tarjeta de Entidad
function EntityCard({ entity }) {
  return (
    <div className={`p-4 rounded-2xl border bg-slate-950/60 flex flex-col justify-between transition-all hover:border-slate-700/80 hover:bg-slate-950 ${
      entity.active ? 'border-slate-800/80' : 'border-red-900/20 bg-red-950/5 opacity-60'
    }`}>
      <div>
        <div className="flex justify-between items-start gap-2">
          <h4 className="text-xs font-black text-white uppercase italic tracking-tight">{entity.fullName}</h4>
          <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
            entity.active
              ? 'text-emerald-400 border border-emerald-500/25 bg-emerald-500/10'
              : 'text-red-400 border border-red-500/25 bg-red-500/10'
          }`}>
            {entity.active ? 'Activo' : 'Inactivo'}
          </span>
        </div>

        <p className="text-[10px] text-slate-500 font-mono mt-0.5">@{entity.username}</p>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-900/60 space-y-1.5">
        <div className="flex items-center gap-2 text-[10px] text-slate-400">
          <Mail size={12} className="text-slate-600" />
          <span className="truncate">{entity.email || 'Sin correo asociado'}</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-400">
          <Phone size={12} className="text-slate-600" />
          <span>Canal de Radio / Frecuencia VHF</span>
        </div>
      </div>
    </div>
  );
}
