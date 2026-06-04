import React, { useState } from 'react';
import { Search, Filter, Calendar, MapPin, Eye, FileText, Download } from 'lucide-react';

export default function SavedReportsHistory({ reportes, onSelectReporte }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('TODOS');

  const filteredReportes = reportes.filter(rep => {
    const matchesSearch = 
      rep.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rep.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEstado = filterEstado === 'TODOS' || rep.estado === filterEstado;

    return matchesSearch && matchesEstado;
  });

  const getBadgeClass = (estado) => {
    switch (estado) {
      case 'PENDIENTE':
        return 'bg-red-500/10 border-red-500/30 text-red-400';
      case 'EN CAMINO':
      case 'EN_PROCESO':
        return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
      case 'CONTROLADO':
        return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
      case 'RESUELTO':
        return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
      default:
        return 'bg-slate-500/10 border-slate-500/30 text-slate-400';
    }
  };

  const handleExportCSV = () => {
    if (filteredReportes.length === 0) return;
    
    const headers = ['ID', 'Titulo', 'Descripcion', 'Estado', 'Latitud', 'Longitud', 'Fecha'];
    const rows = filteredReportes.map(r => [
      r.id,
      `"${r.titulo?.replace(/"/g, '""') || ''}"`,
      `"${r.descripcion?.replace(/"/g, '""') || ''}"`,
      r.estado,
      r.latitud,
      r.longitud,
      `"${r.fecha || ''}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `historial_reportes_valle_sol_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl transition-all duration-300">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-black text-white uppercase tracking-tight italic flex items-center gap-2">
            <FileText className="text-red-500 w-5 h-5 animate-pulse" /> Registro Histórico de Reportes
          </h2>
          <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1 italic">
            Historial detallado y auditoría de alertas guardadas en la plataforma
          </p>
        </div>

        {/* Botón Exportar */}
        <button
          onClick={handleExportCSV}
          className="bg-slate-950 border border-slate-800 hover:border-slate-700 text-[10px] font-black uppercase text-slate-300 hover:text-white px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 self-start md:self-auto italic tracking-wider animate-hover-pulse"
        >
          <Download size={14} className="text-emerald-500" /> Exportar CSV
        </button>
      </div>

      {/* Controles de Búsqueda y Filtro */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Buscador */}
        <div className="md:col-span-2 relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 group-focus-within:text-red-500 transition-colors">
            <Search size={16} />
          </div>
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por título o descripción..."
            className="w-full bg-slate-950/80 border border-slate-800/80 text-white text-xs pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:border-red-650 transition-all font-semibold placeholder:text-slate-700"
          />
        </div>

        {/* Filtro Estado */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 group-focus-within:text-red-500 transition-colors">
            <Filter size={16} />
          </div>
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-800/80 text-white text-xs pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:border-red-650 transition-all font-bold appearance-none cursor-pointer"
          >
            <option value="TODOS">Todos los Estados</option>
            <option value="PENDIENTE">🔴 Pendiente</option>
            <option value="EN CAMINO">🔵 En Camino</option>
            <option value="EN_PROCESO">🔵 En Proceso</option>
            <option value="CONTROLADO">🟡 Controlado</option>
            <option value="RESUELTO">🟢 Cerrado</option>
          </select>
        </div>
      </div>

      {/* Tabla / Listado */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800/50 bg-slate-950/20">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/40">
              <th className="p-4 text-[10px] font-black uppercase tracking-wider text-slate-500">ID</th>
              <th className="p-4 text-[10px] font-black uppercase tracking-wider text-slate-500">Alerta</th>
              <th className="p-4 text-[10px] font-black uppercase tracking-wider text-slate-500">Ubicación</th>
              <th className="p-4 text-[10px] font-black uppercase tracking-wider text-slate-500">Fecha Registro</th>
              <th className="p-4 text-[10px] font-black uppercase tracking-wider text-slate-500">Estado</th>
              <th className="p-4 text-[10px] font-black uppercase tracking-wider text-slate-500 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/30">
            {filteredReportes.map((rep) => (
              <tr key={rep.id} className="hover:bg-slate-900/30 transition-colors group">
                <td className="p-4 text-xs font-mono font-bold text-slate-600">#{rep.id}</td>
                <td className="p-4 max-w-xs">
                  <p className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">{rep.titulo}</p>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5">{rep.descripcion}</p>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                    <MapPin size={12} className="text-red-500" />
                    <span>{rep.latitud?.toFixed(4)}, {rep.longitud?.toFixed(4)}</span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                    <Calendar size={12} className="text-blue-400" />
                    <span>{rep.fecha || 'Sin fecha'}</span>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-[9px] font-black border uppercase tracking-wider ${getBadgeClass(rep.estado)}`}>
                    {rep.estado}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <button
                    onClick={() => onSelectReporte(rep)}
                    className="inline-flex items-center gap-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase transition-all"
                  >
                    <Eye size={12} /> Ver Alerta
                  </button>
                </td>
              </tr>
            ))}
            {filteredReportes.length === 0 && (
              <tr>
                <td colSpan="6" className="p-8 text-center text-slate-600 text-xs italic">
                  No se encontraron reportes guardados que coincidan con la búsqueda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
