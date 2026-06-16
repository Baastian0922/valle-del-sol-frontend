import React, { useState } from 'react';
import { Search, ShieldAlert, Trash2, CheckCircle, Shield, X, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function EntityValidationPanel() {
  const {
    usuarios = [],
    cargandoUsuarios,
    eliminarUsuario,
    alternarEstadoUsuario,
    traducirErrorFirebase
  } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [cargandoAccion, setCargandoAccion] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filtrar los usuarios pendientes de validación (active === false)
  const solicitudesPendientes = usuarios.filter(u => u.active === false);

  const handleEliminar = async (u) => {
    if (!confirm(`¿Rechazar y eliminar permanentemente la solicitud de @${u.username}?`)) return;

    setCargandoAccion(true);
    setError('');
    setSuccess('');
    try {
      await eliminarUsuario(u.id);
      setSuccess(`Solicitud de @${u.username} rechazada y eliminada.`);
      setTimeout(() => setSuccess(''), 4000);
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
    setSuccess('');
    try {
      await alternarEstadoUsuario(u.id);
      setSuccess(`¡La entidad "${u.fullName || u.institucion}" ha sido aprobada y validada con éxito!`);
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
      case 'EMERGENCY_ENTITY':
        return (
          <span className="inline-flex items-center gap-1.5 text-[9px] font-black text-blue-400 border border-blue-400/20 bg-blue-400/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
            <Shield size={10} /> Emergencia
          </span>
        );
      case 'STAFF':
        return (
          <span className="inline-flex items-center gap-1.5 text-[9px] font-black text-amber-500 border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
            <Shield size={10} /> Staff
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-[9px] font-black text-emerald-400 border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
            Vecino
          </span>
        );
    }
  };

  const filteredSolicitudes = solicitudesPendientes.filter(u => {
    const term = searchTerm.toLowerCase();
    return (
      (u.fullName || u.institucion || '').toLowerCase().includes(term) ||
      (u.email || '').toLowerCase().includes(term) ||
      (u.rutCodigo || '').toLowerCase().includes(term) ||
      (u.username || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl transition-all duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-black text-white uppercase tracking-tight italic flex items-center gap-2">
            <ShieldAlert className="text-amber-500 w-5 h-5 animate-pulse" /> Validación de Entidades
          </h2>
          <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1 italic">
            Revisión, aprobación y auditoría de solicitudes de acceso institucional
          </p>
        </div>
        <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-950/40 border border-slate-850 px-4 py-2 rounded-xl">
          {solicitudesPendientes.length} Solicitud{solicitudesPendientes.length === 1 ? 'ad' : 'edes'} Pendiente{solicitudesPendientes.length === 1 ? '' : 's'}
        </div>
      </div>

      {/* Alertas */}
      {error && (
        <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl text-xs font-semibold flex items-center justify-between gap-2 animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-red-500/70 hover:text-red-500">
            <X size={16} />
          </button>
        </div>
      )}
      {success && (
        <div className="mb-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-2xl text-xs font-semibold flex items-center justify-between gap-2 animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle size={16} />
            <span>{success}</span>
          </div>
          <button onClick={() => setSuccess('')} className="text-emerald-400/70 hover:text-emerald-400">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Buscador */}
      <div className="relative group mb-6">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 group-focus-within:text-amber-500 transition-colors">
          <Search size={16} />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar solicitud por institución, RUT, correo o nombre de usuario..."
          className="w-full bg-slate-950/80 border border-slate-800/80 text-white text-xs pl-11 pr-4 py-3 h-12 rounded-xl focus:outline-none focus:border-amber-550 transition-all font-semibold placeholder:text-slate-700"
        />
      </div>

      {/* Tabla / Listado */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800/50 bg-slate-950/20">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/40">
              <th className="p-4 text-[10px] font-black uppercase tracking-wider text-slate-500">ID Usuario</th>
              <th className="p-4 text-[10px] font-black uppercase tracking-wider text-slate-500">Tipo</th>
              <th className="p-4 text-[10px] font-black uppercase tracking-wider text-slate-500">Institución / Nombre</th>
              <th className="p-4 text-[10px] font-black uppercase tracking-wider text-slate-500">RUT / Código</th>
              <th className="p-4 text-[10px] font-black uppercase tracking-wider text-slate-500">Sector / Comuna</th>
              <th className="p-4 text-[10px] font-black uppercase tracking-wider text-slate-500">Correo Electrónico</th>
              <th className="p-4 text-[10px] font-black uppercase tracking-wider text-slate-500 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/30">
            {cargandoUsuarios ? (
              <tr>
                <td colSpan="7" className="p-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">Cargando solicitudes...</span>
                  </div>
                </td>
              </tr>
            ) : filteredSolicitudes.map((u) => (
              <tr key={u.id} className="hover:bg-slate-900/30 transition-colors group">
                <td className="p-4 text-xs font-mono font-bold text-slate-600 break-all max-w-[120px]">
                  @{u.username || u.id?.substring(0, 8)}
                </td>
                <td className="p-4 whitespace-nowrap">
                  {getRoleBadge(u.role)}
                </td>
                <td className="p-4 font-bold text-slate-200 group-hover:text-white transition-colors max-w-[200px] break-words">
                  {u.fullName || u.institucion}
                </td>
                <td className="p-4 font-mono text-xs text-slate-300 whitespace-nowrap">
                  {u.rutCodigo || 'No especificado'}
                </td>
                <td className="p-4 text-xs text-slate-300 max-w-[150px] break-words">
                  {u.sectorComuna || 'No especificado'}
                </td>
                <td className="p-4 font-mono text-xs text-blue-400 break-all max-w-[180px]">
                  {u.email}
                </td>
                <td className="p-4 text-center">
                  <div className="inline-flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleEliminar(u)}
                      disabled={cargandoAccion}
                      className="bg-slate-950 border border-slate-800 hover:border-red-500/30 text-slate-400 hover:text-red-500 p-2 rounded-lg text-xs font-bold uppercase transition-all"
                      title="Rechazar Solicitud"
                    >
                      <Trash2 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleEstado(u)}
                      disabled={cargandoAccion}
                      className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white px-3.5 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5"
                    >
                      Validar y Aprobar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredSolicitudes.length === 0 && !cargandoUsuarios && (
              <tr>
                <td colSpan="7" className="p-12 text-center text-slate-500 text-xs italic">
                  No se encontraron solicitudes de validación pendientes.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
