import React from 'react';
import { X, Activity, Calendar, Send, Trash2, Save, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ReporteModal = ({ 
  mostrar, setMostrar, modoLectura, datos, handleChange, handleSubmit, enviando, archivo, setArchivo, onDelete, onFinalizeEmergency
}) => {
  const { user } = useAuth();
  
  if (!mostrar) return null;

  // El Admin puede editar incluso en modo lectura para actualizar reportes
  const esAdmin = user?.role === 'ADMIN';
  const editable = !modoLectura || esAdmin;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
      <div className={`bg-slate-900 border ${modoLectura && !esAdmin ? 'border-emerald-500/30' : esAdmin ? 'border-red-500/30' : 'border-slate-800'} w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">
            {esAdmin && modoLectura ? 'Administrar Reporte' : (modoLectura ? 'Situación del Reporte' : 'Nuevo Reporte')}
          </h2>
          <button onClick={() => setMostrar(false)} className="text-slate-500 hover:text-white"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-black uppercase text-slate-500 ml-2 italic">Título</label>
            <input 
              required 
              name="titulo" 
              value={datos.titulo} 
              readOnly={!editable} 
              onChange={handleChange} 
              className={`w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm outline-none ${!editable ? 'text-slate-400 cursor-default' : 'focus:border-red-600'}`} 
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-slate-500 ml-2 italic">Descripción</label>
            <textarea 
              required 
              name="descripcion" 
              value={datos.descripcion} 
              readOnly={!editable} 
              onChange={handleChange} 
              rows="2" 
              className={`w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm outline-none resize-none ${!editable ? 'text-slate-400 cursor-default' : 'focus:border-red-600'}`} 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-950 border border-slate-800 p-3 rounded-2xl flex items-center gap-2">
              <Activity size={14} className={datos.estado === 'RESUELTO' || datos.estado === 'ATENDIDO' ? 'text-emerald-500' : 'text-blue-500'} />
              <div className="flex-1">
                <label className="text-[9px] uppercase font-black text-slate-600 block italic">Estado</label>
                {esAdmin ? (
                  <select 
                    name="estado" 
                    value={datos.estado} 
                    onChange={handleChange} 
                    className="bg-transparent text-xs font-bold text-white uppercase outline-none w-full border-none p-0 cursor-pointer font-black"
                  >
                    <option value="PENDIENTE" className="bg-slate-900 text-red-500 font-bold">PENDIENTE</option>
                    <option value="EN_PROCESO" className="bg-slate-900 text-blue-500 font-bold">EN PROCESO</option>
                    <option value="RESUELTO" className="bg-slate-900 text-emerald-500 font-bold">RESUELTO</option>
                  </select>
                ) : (
                  <p className={`text-xs font-bold uppercase tracking-widest ${datos.estado === 'RESUELTO' || datos.estado === 'ATENDIDO' ? 'text-emerald-400' : 'text-blue-400'}`}>{datos.estado}</p>
                )}
              </div>
            </div>
            <div className="bg-slate-950 border border-slate-800 p-3 rounded-2xl flex items-center gap-2">
              <Calendar size={14} className="text-red-500" />
              <div>
                <label className="text-[9px] uppercase font-black text-slate-600 block italic">Fecha</label>
                <p className="text-[10px] font-bold text-white uppercase italic">{datos.fecha}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-950/50 border border-slate-800/50 p-3 rounded-2xl italic font-mono text-emerald-500 text-xs text-center font-bold">Lat: {datos.latitud?.toFixed(4)}</div>
            <div className="bg-slate-950/50 border border-slate-800/50 p-3 rounded-2xl italic font-mono text-emerald-500 text-xs text-center font-bold">Lng: {datos.longitud?.toFixed(4)}</div>
          </div>

          {!modoLectura && (
            <div className="bg-slate-950 border-2 border-dashed border-slate-800 rounded-2xl p-4 text-center relative cursor-pointer animate-pulse">
              <input type="file" onChange={(e) => setArchivo(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
              <p className="text-[9px] font-black uppercase text-slate-500">{archivo ? archivo.name : "Subir Multimedia"}</p>
            </div>
          )}

          <div className="flex gap-3">
            {esAdmin && modoLectura && (
              <button 
                type="button" 
                onClick={() => {
                  if (confirm("¿Estás seguro de eliminar este reporte permanentemente?")) {
                    onDelete(datos.id);
                    setMostrar(false);
                  }
                }}
                className="bg-red-600/10 hover:bg-red-600 border border-red-600/30 text-red-500 hover:text-white p-4 rounded-2xl transition-all"
                title="Eliminar Reporte"
              >
                <Trash2 size={18} />
              </button>
            )}

            {user?.role === 'EMERGENCY_ENTITY' && modoLectura && datos.estado !== 'RESUELTO' && (
              <button 
                type="button" 
                onClick={() => {
                  if (confirm("¿Confirmas la finalización y cierre de esta emergencia forestal?")) {
                    onFinalizeEmergency(datos.id);
                    setMostrar(false);
                  }
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-6 py-4 rounded-2xl uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20"
                title="Finalizar Emergencia"
              >
                <CheckCircle2 size={16} /> Finalizar Emergencia
              </button>
            )}

            <button 
              type="submit" 
              disabled={enviando} 
              className={`flex-1 ${modoLectura && !esAdmin ? 'bg-slate-700 hover:bg-slate-600' : 'bg-red-600 hover:bg-red-500'} text-white font-black py-4 rounded-2xl uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 transition-all`}
            >
              {modoLectura && !esAdmin ? "Cerrar Vista" : (
                enviando ? "ENVIANDO..." : (
                  esAdmin && modoLectura ? <><Save size={18} /> Guardar Cambios</> : <><Send size={18} /> Confirmar Reporte</>
                )
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReporteModal;