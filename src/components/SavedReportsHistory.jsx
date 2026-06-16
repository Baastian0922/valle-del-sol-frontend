import React, { useState } from 'react';
import { Search, Filter, Calendar, MapPin, Eye, FileText, Download, X, Trash2 } from 'lucide-react';

const getReportTimestamp = (fecha) => {
  if (!fecha) return null;

  const parsed = new Date(fecha);
  if (!Number.isNaN(parsed.getTime())) return parsed.getTime();

  const match = String(fecha).match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})(?:,\s*(\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
  if (!match) return null;

  const [, day, month, year, hour = '0', minute = '0', second = '0'] = match;
  const fallbackDate = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second));
  return Number.isNaN(fallbackDate.getTime()) ? null : fallbackDate.getTime();
};

export default function SavedReportsHistory({ reportes, onSelectReporte, onDeleteMultiple }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('TODOS');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  // Limpiar selección si cambia la lista filtrada
  const handleToggleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredReportes.map(r => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(x => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    if (confirm(`¿Estás seguro de eliminar los ${selectedIds.length} reportes seleccionados permanentemente?`)) {
      onDeleteMultiple(selectedIds);
      setSelectedIds([]);
    }
  };

  const rangoInvalido = Boolean(fechaDesde && fechaHasta && fechaDesde > fechaHasta);

  const filteredReportes = reportes.filter(rep => {
    const matchesSearch =
      rep.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rep.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesEstado = filterEstado === 'TODOS' || rep.estado === filterEstado;
    const timestamp = getReportTimestamp(rep.fecha || rep.fechaCreacion);
    const inicio = fechaDesde ? new Date(`${fechaDesde}T00:00:00`).getTime() : null;
    const fin = fechaHasta ? new Date(`${fechaHasta}T23:59:59.999`).getTime() : null;
    const matchesFecha =
      (!fechaDesde && !fechaHasta) ||
      (timestamp !== null && (!inicio || timestamp >= inicio) && (!fin || timestamp <= fin));

    return matchesSearch && matchesEstado && matchesFecha && !rangoInvalido;
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
    if (filteredReportes.length === 0 || rangoInvalido) return;

    const headers = ['ID', 'Titulo', 'Descripcion', 'Estado', 'Latitud', 'Longitud', 'Fecha'];
    const rows = filteredReportes.map(r => [
      r.id,
      `"${r.titulo?.replace(/"/g, '""') || ''}"`,
      `"${r.descripcion?.replace(/"/g, '""') || ''}"`,
      r.estado,
      r.latitud,
      r.longitud,
      `"${r.fecha || r.fechaCreacion || ''}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF"
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const rangoArchivo = fechaDesde || fechaHasta
      ? `${fechaDesde || 'inicio'}_a_${fechaHasta || 'hoy'}`
      : new Date().toISOString().split('T')[0];
    link.setAttribute("download", `historial_reportes_valle_sol_${rangoArchivo}.csv`);
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

        {/* Botones de Acción */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          {selectedIds.length > 0 && onDeleteMultiple && (
            <button
              onClick={handleDeleteSelected}
              className="bg-red-950/80 hover:bg-red-900 border border-red-500/35 text-[10px] font-black uppercase text-red-400 hover:text-white px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 italic tracking-wider shadow-lg shadow-red-950/20"
            >
              <Trash2 size={14} className="text-red-500" /> Eliminar Seleccionados ({selectedIds.length})
            </button>
          )}

          <button
            onClick={handleExportCSV}
            disabled={filteredReportes.length === 0 || rangoInvalido}
            className="bg-slate-950 border border-slate-800 hover:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-[10px] font-black uppercase text-slate-300 hover:text-white px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 italic tracking-wider animate-hover-pulse"
          >
            <Download size={14} className="text-emerald-500" /> Exportar CSV
          </button>
        </div>
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

      <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4 mb-6 p-5 rounded-3xl bg-slate-950/40 border border-slate-800/60 backdrop-blur-md">
        <label className="block">
          <span className="block text-[9px] text-slate-500 font-black uppercase tracking-widest mb-2">Desde</span>
          <div className="relative">
            <Calendar size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none" />
            <input
              type="date"
              value={fechaDesde}
              max={fechaHasta || undefined}
              onChange={(event) => setFechaDesde(event.target.value)}
              onClick={(e) => e.target.showPicker()}
              className="w-full inline-flex items-center bg-slate-950/80 border border-slate-800 text-white text-xs pl-11 pr-4 h-12 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 hover:border-slate-700/80 transition-all font-semibold cursor-pointer"
            />
          </div>
        </label>

        <label className="block">
          <span className="block text-[9px] text-slate-500 font-black uppercase tracking-widest mb-2">Hasta</span>
          <div className="relative">
            <Calendar size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none" />
            <input
              type="date"
              value={fechaHasta}
              min={fechaDesde || undefined}
              onChange={(event) => setFechaHasta(event.target.value)}
              onClick={(e) => e.target.showPicker()}
              className="w-full inline-flex items-center bg-slate-950/80 border border-slate-800 text-white text-xs pl-11 pr-4 h-12 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 hover:border-slate-700/80 transition-all font-semibold cursor-pointer"
            />
          </div>
        </label>

        <button
          type="button"
          onClick={() => {
            setFechaDesde('');
            setFechaHasta('');
          }}
          disabled={!fechaDesde && !fechaHasta}
          className="self-end px-5 h-12 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-900/50 hover:bg-blue-950/20 hover:text-blue-400 text-slate-400 disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:bg-slate-950 disabled:hover:border-slate-800 disabled:hover:text-slate-400 text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200 italic"
        >
          <X size={13} /> Limpiar fechas
        </button>

        <div className="md:col-span-3 flex justify-between gap-4 text-[9px] font-black uppercase tracking-wider mt-1">
          <span className={rangoInvalido ? 'text-red-400' : 'text-slate-500'}>
            {rangoInvalido ? 'La fecha desde no puede ser posterior a la fecha hasta' : 'El rango incluye ambos días completos'}
          </span>
          <span className="text-slate-400">{filteredReportes.length} reportes encontrados</span>
        </div>
      </div>

      {/* Tabla / Listado */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800/50 bg-slate-950/20">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/40">
              <th className="p-4 w-12 text-center">
                <input
                  type="checkbox"
                  checked={filteredReportes.length > 0 && selectedIds.length === filteredReportes.length}
                  ref={el => {
                    if (el) {
                      el.indeterminate = selectedIds.length > 0 && selectedIds.length < filteredReportes.length;
                    }
                  }}
                  onChange={handleToggleSelectAll}
                  className="rounded border-slate-800 text-red-500 focus:ring-red-500 bg-slate-950"
                />
              </th>
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
                <td className="p-4 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(rep.id)}
                    onChange={() => handleToggleSelectOne(rep.id)}
                    className="rounded border-slate-800 text-red-500 focus:ring-red-500 bg-slate-950"
                  />
                </td>
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
                    <span>{rep.fecha || rep.fechaCreacion ? new Date(rep.fecha || rep.fechaCreacion).toLocaleString() : 'Sin fecha'}</span>
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
                <td colSpan="7" className="p-8 text-center text-slate-600 text-xs italic">
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
