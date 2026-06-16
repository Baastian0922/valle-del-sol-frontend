import React, { useState } from 'react';
import { X, Trash2, ToggleRight, Shield, ShieldAlert, AlertCircle, Loader2, CloudOff, FileText, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const EntityValidationModal = ({ mostrar, setMostrar }) => {
  const {
    usuarios, cargandoUsuarios,
    eliminarUsuario, alternarEstadoUsuario,
    traducirErrorFirebase
  } = useAuth();

  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
  const [cargandoAccion, setCargandoAccion] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!mostrar) return null;

  // Filtrar los usuarios pendientes de validación
  // Entidades inactivas (rol = EMERGENCY_ENTITY o inactivo en general)
  const solicitudesPendientes = usuarios.filter(u => u.active === false);

  const handleEliminar = async (u) => {
    if (!confirm(`¿Rechazar y eliminar permanentemente la solicitud de @${u.username}?`)) return;

    setCargandoAccion(true);
    setError('');
    try {
      await eliminarUsuario(u.id);
      setSuccess(`Solicitud de @${u.username} rechazada y eliminada.`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error("Error al eliminar solicitud:", err);
      setError(traducirErrorFirebase(err));
    } finally {
      setCargandoAccion(false);
    }
  };

  const handleToggleEstado = async (u) => {
    setCargandoAccion(true);
    setError('');
    try {
      await alternarEstadoUsuario(u.id);
      setSuccess(`¡La entidad "${u.fullName || u.institucion}" ha sido validada y aprobada con éxito!`);
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      console.error("Error al aprobar entidad:", err);
      setError(traducirErrorFirebase(err));
    } finally {
      setCargandoAccion(false);
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="flex items-center gap-1 text-[8px] font-black text-red-500 border border-red-500/20 bg-red-500/10 px-2 py-0.5 rounded uppercase tracking-widest">
            <ShieldAlert size={8} /> Admin
          </span>
        );
      case 'STAFF':
        return (
          <span className="flex items-center gap-1 text-[8px] font-black text-amber-500 border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 rounded uppercase tracking-widest">
            <Shield size={8} /> Staff
          </span>
        );
      case 'EMERGENCY_ENTITY':
        return (
          <span className="flex items-center gap-1 text-[8px] font-black text-blue-400 border border-blue-400/20 bg-blue-400/10 px-2 py-0.5 rounded uppercase tracking-widest">
            <Shield size={8} /> Emergencia
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[8px] font-black text-emerald-400 border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 rounded uppercase tracking-widest">
            Vecino
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-[2.5rem] p-8 shadow-2xl flex flex-col max-h-[90vh] relative overflow-hidden">

        {/* Encabezado */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-amber-500/10 text-amber-500 p-2.5 rounded-2xl border border-amber-500/20 animate-pulse">
              <ShieldAlert size={22} />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Validación de Entidades</h2>
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest italic flex items-center gap-1.5">
                Revisión y aprobación de solicitudes de acceso institucional
              </p>
            </div>
          </div>
          <button
            onClick={() => setMostrar(false)}
            className="bg-slate-950 border border-slate-800 p-2.5 rounded-full text-slate-400 hover:text-white transition-all"
            disabled={cargandoAccion}
          >
            <X size={20} />
          </button>
        </div>

        {/* Notificaciones */}
        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-top duration-200">
            <AlertCircle size={16} /> {error}
          </div>
        )}
        {success && (
          <div className="mb-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-top duration-200">
            <CheckCircle size={16} /> {success}
          </div>
        )}

        {/* Listado de Solicitudes */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {cargandoUsuarios ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Loader2 size={32} className="animate-spin text-amber-500 mx-auto mb-3" />
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Cargando solicitudes...</p>
              </div>
            </div>
          ) : solicitudesPendientes.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <CloudOff size={32} className="text-slate-700 mx-auto mb-3" />
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">No hay solicitudes pendientes</p>
                <p className="text-[9px] text-slate-600 mt-1">Todas las entidades registradas han sido aprobadas y validadas.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto flex-1 pr-2 custom-scrollbar pb-4">
              {solicitudesPendientes.map((u) => {
                return (
                  <div
                    key={u.id}
                    className="bg-slate-950/65 border border-amber-500/20 p-5 rounded-2.5xl flex flex-col justify-between gap-4 transition-all hover:border-amber-500/40 bg-amber-950/5 relative overflow-hidden"
                  >
                    <div className="flex justify-between items-start">
                      <div className="min-w-0 flex-1 pr-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-xs font-black text-white tracking-tight truncate">
                            {u.fullName || u.institucion}
                          </p>
                          <span className="text-[8px] font-black text-amber-500 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded uppercase tracking-widest shrink-0 animate-pulse">
                            Pendiente
                          </span>
                        </div>
                        <p className="text-[9px] text-slate-500 font-mono mt-1">@{u.username} | {u.email}</p>
                      </div>
                      <div className="shrink-0">
                        {getRoleBadge(u.role)}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-[9px] font-semibold text-slate-400">
                      <div>
                        <span className="text-[8px] font-black uppercase text-slate-600 block">RUT / Código</span>
                        <span className="text-white font-mono">{u.rutCodigo || 'No especificado'}</span>
                      </div>
                      <div>
                        <span className="text-[8px] font-black uppercase text-slate-600 block">Sector / Comuna</span>
                        <span className="text-white truncate block">{u.sectorComuna || 'No especificado'}</span>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleEliminar(u)}
                        disabled={cargandoAccion}
                        className="px-3 py-1.5 rounded-xl border border-slate-800 hover:border-red-500/30 text-slate-500 hover:text-red-500 text-[9px] font-black uppercase tracking-wider bg-slate-950 transition-all flex items-center gap-1"
                      >
                        <Trash2 size={12} /> Rechazar
                      </button>

                      <button
                        type="button"
                        onClick={() => setSolicitudSeleccionada(u)}
                        className="px-4 py-1.5 rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-slate-950 text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md"
                      >
                        <FileText size={12} /> Abrir Formulario
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Overlay Modal: Formulario de Solicitud de Registro de Entidad */}
        {solicitudSeleccionada && (
          <div className="absolute inset-0 bg-slate-900 z-50 flex flex-col p-8 animate-in fade-in duration-200">
            {/* Botón de cerrar */}
            <button
              type="button"
              onClick={() => setSolicitudSeleccionada(null)}
              className="absolute top-8 right-8 bg-slate-950 border border-slate-800 p-2.5 rounded-full text-slate-400 hover:text-white transition-all z-10 hover:scale-105"
            >
              <X size={20} />
            </button>

            {/* Encabezado */}
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800 shrink-0">
              <div className="bg-red-500/10 text-red-500 p-2.5 rounded-2xl border border-red-500/20">
                <Shield size={24} />
              </div>
              <div>
                <h4 className="text-xl font-black text-white uppercase italic tracking-tighter">Formulario de Solicitud de Registro</h4>
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-0.5">
                  Validación de Entidad de Emergencia Oficial
                </p>
              </div>
            </div>

            {/* Ficha Oficial */}
            <div className="bg-slate-950 border border-slate-850 rounded-3xl p-6 space-y-6 relative overflow-y-auto overflow-x-hidden flex-1 custom-scrollbar">
              {/* Sello de Agua / Watermark */}
              <div className="absolute -right-12 -bottom-12 text-slate-900/10 transform -rotate-12 pointer-events-none select-none">
                <Shield size={280} />
              </div>

              <div className="flex justify-between items-start border-b border-slate-900 pb-4 flex-wrap gap-4">
                <div>
                  <span className="text-[9px] font-black uppercase text-slate-500 block mb-1">Identificador Único</span>
                  <span className="text-xs font-mono font-bold text-white break-all bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-850">
                    ID: {solicitudSeleccionada.id}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-black uppercase text-slate-500 block mb-1">Fecha de Envío</span>
                  <span className="text-xs font-mono font-bold text-slate-300 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-850">
                    {solicitudSeleccionada.fechaCreacion ? new Date(solicitudSeleccionada.fechaCreacion).toLocaleString() : 'Sin fecha'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                {/* Columna Izquierda */}
                <div className="space-y-4">
                  <div>
                    <span className="text-[9px] font-black uppercase text-slate-500 block mb-1.5">Tipo de Organización</span>
                    <div className="flex items-center gap-2 bg-slate-900/60 p-3 rounded-xl border border-slate-900">
                      {getRoleBadge(solicitudSeleccionada.role)}
                      <span className="text-xs font-bold text-slate-300">
                        {solicitudSeleccionada.role === 'EMERGENCY_ENTITY' ? 'Entidad de Emergencia' : solicitudSeleccionada.role}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[9px] font-black uppercase text-slate-500 block mb-1.5">Nombre de la Institución</span>
                    <span className="text-xs font-black text-white block bg-slate-900/80 p-3 rounded-xl border border-slate-900 break-words">
                      {solicitudSeleccionada.fullName || solicitudSeleccionada.institucion}
                    </span>
                  </div>
                </div>

                {/* Columna Derecha */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[9px] font-black uppercase text-slate-500 block mb-1.5">RUT / Código Establecimiento</span>
                      <span className="text-xs font-mono font-black text-white block bg-slate-900/80 p-3 rounded-xl border border-slate-900 break-all">
                        {solicitudSeleccionada.rutCodigo || 'No especificado'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] font-black uppercase text-slate-500 block mb-1.5">Sector / Comuna</span>
                      <span className="text-xs font-black text-white block bg-slate-900/80 p-3 rounded-xl border border-slate-900 break-words">
                        {solicitudSeleccionada.sectorComuna || 'No especificado'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[9px] font-black uppercase text-slate-500 block mb-1.5">Correo Electrónico Institucional</span>
                    <span className="text-xs font-bold text-blue-400 block bg-slate-900/80 p-3 rounded-xl border border-slate-900 font-mono break-all">
                      {solicitudSeleccionada.email}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stamp */}
              <div className="border border-amber-500/20 bg-amber-500/5 text-amber-500 p-3 rounded-xl text-center text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 animate-pulse mt-4">
                <AlertCircle size={16} /> Estado: Esperando Validación Administrativa
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-6 shrink-0">
              <button
                type="button"
                onClick={() => {
                  handleEliminar(solicitudSeleccionada);
                  setSolicitudSeleccionada(null);
                }}
                disabled={cargandoAccion}
                className="px-5 py-3 rounded-xl border border-slate-800 hover:border-red-500/30 text-slate-400 hover:text-red-500 text-[10px] font-black uppercase tracking-wider bg-slate-950 transition-all flex items-center gap-1.5"
              >
                <Trash2 size={14} /> Rechazar Registro
              </button>

              <button
                type="button"
                onClick={() => {
                  handleToggleEstado(solicitudSeleccionada);
                  setSolicitudSeleccionada(null);
                }}
                disabled={cargandoAccion}
                className="px-6 py-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-950/20"
              >
                <ToggleRight size={16} /> Validar y Aprobar
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default EntityValidationModal;
