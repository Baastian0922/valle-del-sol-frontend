import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

import Sidebar from '../../components/Sidebar';
import StatCard from '../../components/StatCard';
import ReporteModal from '../../components/ReporteModal';
import HistorySidebar from '../../components/HistorySidebar';
import UserManagementModal from '../../components/UserManagementModal';
import EntityValidationModal from '../../components/EntityValidationModal';
import EntityListModal from '../../components/EntityListModal';
import EmergencyMap from '../../components/EmergencyMap';
import SavedReportsHistory from '../../components/SavedReportsHistory';
import AdminEmergencyController from '../../components/AdminEmergencyController';


import { Flame, ShieldAlert, Users, TrendingUp, CheckCircle, AlertCircle, X, Shield, Clock } from 'lucide-react';


export default function AdminDashboard() {
  const { user, usuarios = [] } = useAuth();

  // Estados generales
  const [enviando, setEnviando] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarUserMgmt, setMostrarUserMgmt] = useState(false);
  const [mostrarModalEntidades, setMostrarModalEntidades] = useState(false);
  const [mostrarValidarEntidades, setMostrarValidarEntidades] = useState(false);
  const [modoLectura, setModoLectura] = useState(true);
  const [historial, setHistorial] = useState([]);
  const [archivo, setArchivo] = useState(null);
  const [selectedCoords, setSelectedCoords] = useState(null);
  const [tabHistorial, setTabHistorial] = useState('activas'); // 'activas' | 'controlados'
  const [toast, setToast] = useState({ mostrar: false, mensaje: '', tipo: 'success' });
  const [toastTimeoutId, setToastTimeoutId] = useState(null);
  const [vistaActiva, setVistaActiva] = useState('monitoreo'); // 'monitoreo' | 'historial'
  const [reporteSeleccionado, setReporteSeleccionado] = useState(null);
  const [metricNow] = useState(() => Date.now());


  const mostrarToast = (mensaje, tipo = 'success') => {
    if (toastTimeoutId) {
      clearTimeout(toastTimeoutId);
    }
    setToast({ mostrar: true, mensaje, tipo });
    const id = setTimeout(() => {
      setToast(prev => ({ ...prev, mostrar: false }));
    }, 4000);
    setToastTimeoutId(id);
  };


  const [datosReporte, setDatosReporte] = useState({
    id: null, titulo: '', descripcion: '', latitud: -33.4372, longitud: -70.6506, estado: 'PENDIENTE', fecha: ''
  });

  const cargarHistorial = useCallback(async () => {
    const DEFAULT_ALERTAS = [
      { id: 101, titulo: "Incendio Forestal Sector Alto Sol", descripcion: "Fuego descontrolado cerca de matorrales en pendiente pronunciada.", latitud: -33.4320, longitud: -70.6410, estado: 'PENDIENTE', fecha: new Date(Date.now() - 3600000).toLocaleString() },
      { id: 102, titulo: "Columna de Humo en Quebrada", descripcion: "Comunidad reporta avistamiento de humo gris denso en la quebrada principal.", latitud: -33.4490, longitud: -70.6590, estado: 'EN_PROCESO', fecha: new Date(Date.now() - 7200000).toLocaleString() },
      { id: 103, titulo: "Foco Pastizales Bajo Control", descripcion: "Foco controlado y extinguido gracias al rápido actuar de brigadistas.", latitud: -33.4210, longitud: -70.6690, estado: 'RESUELTO', fecha: new Date(Date.now() - 86400000).toLocaleString() }
    ];

    try {
      const response = await api.get('/sincronizar');
      localStorage.setItem('valle_sol_reportes', JSON.stringify(response.data));
      setHistorial(response.data);
    } catch {
      console.warn("Backend offline o error al sincronizar. Cargando desde LocalStorage...");
      const stored = localStorage.getItem('valle_sol_reportes');
      let reportesList = stored ? JSON.parse(stored) : null;
      if (!reportesList) {
        reportesList = DEFAULT_ALERTAS;
        localStorage.setItem('valle_sol_reportes', JSON.stringify(DEFAULT_ALERTAS));
      }
      setHistorial(reportesList);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      cargarHistorial();
    }, 0);
    return () => clearTimeout(timer);
  }, [cargarHistorial, user]);

  const abrirDetalleReporte = (rep) => {
    setModoLectura(true);
    setDatosReporte({
      id: rep.id,
      titulo: rep.titulo || '',
      descripcion: rep.descripcion || '',
      latitud: rep.latitud,
      longitud: rep.longitud,
      estado: rep.estado || 'PENDIENTE',
      fecha: rep.fecha ? new Date(rep.fecha).toLocaleString() : 'Sin fecha'
    });
    setSelectedCoords([rep.latitud, rep.longitud]);
    setReporteSeleccionado(rep);
  };

  const prepararNuevoReporte = (lat = -33.4372, lng = -70.6506) => {
    const finalLat = typeof lat === 'number' && !isNaN(lat) ? lat : -33.4372;
    const finalLng = typeof lng === 'number' && !isNaN(lng) ? lng : -70.6506;
    setModoLectura(false);
    setDatosReporte({
      id: null, titulo: '', descripcion: '', latitud: finalLat, longitud: finalLng,
      estado: 'PENDIENTE', fecha: new Date().toLocaleString()
    });
    setMostrarModal(true);
  };

  useEffect(() => {
    let timer;
    if (mostrarModal && !modoLectura) {
      timer = setInterval(() => {
        setDatosReporte(prev => ({ ...prev, fecha: new Date().toLocaleString() }));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [mostrarModal, modoLectura]);

  const handleChange = (e) => setDatosReporte({ ...datosReporte, [e.target.name]: e.target.value });

  const handleSubmitReporte = async (e) => {
    e.preventDefault();
    setEnviando(true);

    const DEFAULT_ALERTAS = [
      { id: 101, titulo: "Incendio Forestal Sector Alto Sol", descripcion: "Fuego descontrolado cerca de matorrales en pendiente pronunciada.", latitud: -33.4320, longitud: -70.6410, estado: 'PENDIENTE', fecha: new Date(Date.now() - 3600000).toLocaleString() },
      { id: 102, titulo: "Columna de Humo en Quebrada", descripcion: "Comunidad reporta avistamiento de humo gris denso en la quebrada principal.", latitud: -33.4490, longitud: -70.6590, estado: 'EN_PROCESO', fecha: new Date(Date.now() - 7200000).toLocaleString() },
      { id: 103, titulo: "Foco Pastizales Bajo Control", descripcion: "Foco controlado y extinguido gracias al rápido actuar de brigadistas.", latitud: -33.4210, longitud: -70.6690, estado: 'RESUELTO', fecha: new Date(Date.now() - 86400000).toLocaleString() }
    ];

    if (modoLectura && user?.role === 'ADMIN') {
      try {
        await api.put(`/editar/${datosReporte.id}`, datosReporte);
      } catch {
        console.warn("API offline. Actualizando localmente...");
      }

      // Actualizar localStorage
      const stored = localStorage.getItem('valle_sol_reportes');
      let list = stored ? JSON.parse(stored) : DEFAULT_ALERTAS;
      list = list.map(r => r.id === datosReporte.id ? { ...datosReporte } : r);
      localStorage.setItem('valle_sol_reportes', JSON.stringify(list));

      setHistorial(prev => prev.map(r => r.id === datosReporte.id ? { ...datosReporte } : r));
      mostrarToast("Reporte actualizado correctamente", "success");
      setMostrarModal(false);
      setEnviando(false);
      return;
    }

    if (modoLectura) {
      setMostrarModal(false);
      setEnviando(false);
      return;
    }

    const payload = { ...datosReporte, latitud: parseFloat(datosReporte.latitud), longitud: parseFloat(datosReporte.longitud) };
    delete payload.id;

    let syncExitoso = false;
    let reporteCreado = null;
    try {
      const response = await api.post('/crear', payload);
      syncExitoso = true;
      reporteCreado = response.data;
    } catch (error) {
      if (error.response && error.response.status === 429) {
        mostrarToast("Límite diario alcanzado: Máximo 3 reportes por IP.", "warning");
        setEnviando(false);
        return;
      }
      console.warn("Backend offline. Creando reporte en sesión local...");
    }

    const reporteFinal = syncExitoso ? reporteCreado : { ...payload, id: `local-${Date.now()}` };

    // Guardar en localStorage para persistencia offline
    const stored = localStorage.getItem('valle_sol_reportes');
    let reportesList = stored ? JSON.parse(stored) : DEFAULT_ALERTAS;
    reportesList = [reporteFinal, ...reportesList];
    localStorage.setItem('valle_sol_reportes', JSON.stringify(reportesList));

    setHistorial(prev => [reporteFinal, ...prev]);
    if (syncExitoso) {
      mostrarToast("Incendio reportado y sincronizado con éxito.", "success");
    } else {
      mostrarToast("Reporte guardado localmente (Offline).", "warning");
    }
    setMostrarModal(false);
    setEnviando(false);
  };

  const handleDeleteReporte = async (id) => {
    try {
      await api.delete(`/eliminar/${id}`);
    } catch {
      console.warn("API offline. Eliminando localmente...");
    }

    // Actualizar en localStorage
    const stored = localStorage.getItem('valle_sol_reportes');
    if (stored) {
      const list = JSON.parse(stored);
      const updatedList = list.filter(r => r.id !== id);
      localStorage.setItem('valle_sol_reportes', JSON.stringify(updatedList));
    }

    setHistorial(prev => prev.filter(r => r.id !== id));
    setSelectedCoords(null);
    setReporteSeleccionado(null);
    mostrarToast("Reporte eliminado con éxito.", "success");
  };

  const handleDeleteMultiple = async (ids) => {
    if (!ids || ids.length === 0) return;

    for (const id of ids) {
      try {
        await api.delete(`/eliminar/${id}`);
      } catch {
        console.warn(`API offline. Eliminando localmente reporte ${id}...`);
      }
    }

    // Actualizar en localStorage
    const stored = localStorage.getItem('valle_sol_reportes');
    if (stored) {
      const list = JSON.parse(stored);
      const updatedList = list.filter(r => !ids.includes(r.id));
      localStorage.setItem('valle_sol_reportes', JSON.stringify(updatedList));
    }

    setHistorial(prev => prev.filter(r => !ids.includes(r.id)));
    setSelectedCoords(null);
    setReporteSeleccionado(null);
    mostrarToast(`${ids.length} reportes eliminados con éxito.`, "success");
  };

  const handleFinalizarEmergencia = async (id) => {
    try {
      await api.put(`/editar/${id}`, { estado: 'RESUELTO' });
    } catch {
      console.warn("API offline. Finalizando emergencia localmente...");
    }

    const stored = localStorage.getItem('valle_sol_reportes');
    if (stored) {
      const list = JSON.parse(stored);
      const updatedList = list.map(r => r.id === id ? { ...r, estado: 'RESUELTO' } : r);
      localStorage.setItem('valle_sol_reportes', JSON.stringify(updatedList));
    }

    setHistorial(prev => prev.map(r => r.id === id ? { ...r, estado: 'RESUELTO' } : r));
    setSelectedCoords(null);
    setReporteSeleccionado(null);
    setTabHistorial('controlados');
    mostrarToast("Emergencia cerrada y trasladada al historial de controlados.", "success");
  };

  const handleAbrirGPS = (lat, lng) => {
    const gMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${Number(lat)},${Number(lng)}&travelmode=driving`;
    window.open(gMapsUrl, '_blank');
  };

  const handleActualizarEstado = async (id, nuevoEstado) => {
    try {
      await api.put(`/editar/${id}`, { estado: nuevoEstado });
    } catch {
      console.warn("API offline. Actualizando estado localmente...");
    }

    const stored = localStorage.getItem('valle_sol_reportes');
    if (stored) {
      const list = JSON.parse(stored);
      const updatedList = list.map(r => r.id === id ? { ...r, estado: nuevoEstado } : r);
      localStorage.setItem('valle_sol_reportes', JSON.stringify(updatedList));
    }

    setHistorial(prev => prev.map(r => r.id === id ? { ...r, estado: nuevoEstado } : r));
    setReporteSeleccionado(prev => prev?.id === id ? { ...prev, estado: nuevoEstado } : prev);

    if (nuevoEstado === 'RESUELTO') {
      setSelectedCoords(null);
      setReporteSeleccionado(null);
      setTabHistorial('controlados');
      mostrarToast("Incendio resuelto. Alerta trasladada al historial de controlados.", "success");
    } else if (nuevoEstado === 'CONTROLADO') {
      mostrarToast(`Incendio marcado como controlado.`, "info");
    } else {
      mostrarToast(`Estado actualizado a: ${nuevoEstado}`, "info");
    }
  };


  // Cálculos para las métricas superiores
  const resolvedAlerts = historial.filter(r => r.estado === 'RESUELTO').length;
  const totalAlerts = historial.length;
  const serviceLevel = totalAlerts > 0 ? Math.round((resolvedAlerts / totalAlerts) * 100) : 100;

  // Escala de colores para nivel de servicio
  let serviceLevelColor = "text-emerald-500";
  let serviceLevelBg = "bg-emerald-500/10";
  if (serviceLevel <= 20) {
    serviceLevelColor = "text-red-500";
    serviceLevelBg = "bg-red-500/10";
  } else if (serviceLevel <= 40) {
    serviceLevelColor = "text-orange-500";
    serviceLevelBg = "bg-orange-500/10";
  } else if (serviceLevel <= 60) {
    serviceLevelColor = "text-yellow-500";
    serviceLevelBg = "bg-yellow-500/10";
  } else if (serviceLevel <= 80) {
    serviceLevelColor = "text-lime-400";
    serviceLevelBg = "bg-lime-400/10";
  }

  // Caso más antiguo sin resolver
  const activeAlerts = historial.filter(r => r.estado !== 'RESUELTO');
  let oldestAlert = null;
  let tiempoTranscurrido = "";
  if (activeAlerts.length > 0) {
    oldestAlert = activeAlerts.reduce((oldest, current) => {
      const tOldest = new Date(oldest.fechaCreacion || oldest.fecha || 0).getTime();
      const tCurrent = new Date(current.fechaCreacion || current.fecha || 0).getTime();
      if (isNaN(tOldest)) return current;
      if (isNaN(tCurrent)) return oldest;
      return tCurrent < tOldest ? current : oldest;
    });

    if (oldestAlert) {
      const diffMs = metricNow - new Date(oldestAlert.fechaCreacion || oldestAlert.fecha).getTime();
      if (!isNaN(diffMs)) {
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 60) {
          tiempoTranscurrido = `Hace ${diffMins} min`;
        } else if (diffMins < 1440) {
          tiempoTranscurrido = `Hace ${Math.floor(diffMins / 60)}h`;
        } else {
          tiempoTranscurrido = `Hace ${Math.floor(diffMins / 1440)}d`;
        }
      }
    }
  }

  const handleFocusOldest = (alert) => {
    if (alert) {
      abrirDetalleReporte(alert);
      mostrarToast(`Enfocado caso más antiguo #${alert.id}`, "info");
    }
  };

  const entidadesCount = usuarios.filter(u => u.role === 'EMERGENCY_ENTITY' || u.role === 'STAFF').length;

  const statsData = [
    {
      label: "Alertas Activas",
      value: activeAlerts.length,
      icon: <Flame size={20} className="animate-pulse" />,
      color: "text-red-500",
      bg: "bg-red-500/10",
      secondaryText: "Focos de incendio activos"
    },
    {
      label: "Nivel de Servicio",
      value: `${serviceLevel}%`,
      icon: <TrendingUp size={20} />,
      color: serviceLevelColor,
      bg: serviceLevelBg,
      secondaryText: `${resolvedAlerts} cerrados de ${totalAlerts} totales`,
      renderFooter: () => (
        <div className="mt-3 space-y-1">
          <div className="h-2 w-full bg-slate-950 rounded-full border border-slate-800/80 overflow-hidden relative">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${serviceLevel === 0 ? 5 : serviceLevel}%`,
                background: serviceLevel === 0 ? '#ef4444' : 'linear-gradient(to right, #ef4444, #f97316, #eab308, #84cc16, #22c55e)'
              }}
            ></div>
          </div>
          <div className="flex justify-between text-[8px] font-black text-slate-500 uppercase tracking-widest pt-0.5">
            <span className="text-red-500/80">Crítico</span>
            <span className="text-yellow-500/80">Medio</span>
            <span className="text-emerald-500/80">Excelente</span>
          </div>
        </div>
      )
    },
    {
      label: "Casos Más Tardíos",
      value: oldestAlert ? `Caso #${oldestAlert.id}` : 'Al Día',
      icon: <Clock size={20} className={oldestAlert ? "animate-bounce" : ""} />,
      color: oldestAlert ? "text-amber-500" : "text-emerald-500",
      bg: oldestAlert ? "bg-amber-500/10" : "bg-emerald-500/10",
      secondaryText: oldestAlert ? `${tiempoTranscurrido} - Sin atender` : 'Sin alertas pendientes',
      onClick: oldestAlert ? () => handleFocusOldest(oldestAlert) : undefined
    },
    {
      label: "Entidades Registradas",
      value: `${entidadesCount} Entidad${entidadesCount === 1 ? '' : 'es'}`,
      icon: <Shield size={20} />,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
      secondaryText: "Ver bomberos, carabineros, etc.",
      onClick: () => setMostrarModalEntidades(true)
    },
  ];

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200 font-sans">
      <ReporteModal
        mostrar={mostrarModal} setMostrar={setMostrarModal}
        modoLectura={modoLectura} datos={datosReporte}
        handleChange={handleChange} handleSubmit={handleSubmitReporte}
        enviando={enviando} archivo={archivo} setArchivo={setArchivo}
        onDelete={handleDeleteReporte}
        onFinalizeEmergency={handleFinalizarEmergencia}
        onActualizarEstado={handleActualizarEstado}
        onAbrirGPS={handleAbrirGPS}
      />

      <UserManagementModal
        mostrar={mostrarUserMgmt}
        setMostrar={setMostrarUserMgmt}
      />

      <EntityValidationModal
        mostrar={mostrarValidarEntidades}
        setMostrar={setMostrarValidarEntidades}
      />

      <Sidebar
        onRefresh={cargarHistorial}
        onShowUsers={() => setMostrarUserMgmt(true)}
        onShowEntityValidation={() => setMostrarValidarEntidades(true)}
        vistaActiva={vistaActiva}
        setVistaActiva={setVistaActiva}
      />


      <main className="flex-1 ml-16 md:ml-64 p-4 md:p-8 overflow-y-auto transition-all duration-300">
        <header className="flex justify-between items-center mb-8">

          <div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tight italic">
              {vistaActiva === 'monitoreo' ? 'Consola de Administración' : 'Reporte Histórico'}
            </h1>
            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1 italic">
              {vistaActiva === 'monitoreo' ? 'Acceso y control total de emergencias forestales' : 'Auditoría y registro completo de alertas en la comuna'}
            </p>
          </div>

          <div className="flex items-center gap-4 text-right">
            <div>
              <p className="text-sm font-bold text-white uppercase italic">{user?.fullName}</p>
              <div className="flex items-center gap-1.5 justify-end">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <p className="text-[8px] text-emerald-500 font-black tracking-widest uppercase">Online</p>
              </div>
            </div>
            <div className="w-12 h-12 bg-slate-800 rounded-2xl border border-slate-700 flex items-center justify-center text-white font-black italic shadow-xl">
              {user?.fullName?.substring(0, 2).toUpperCase() || 'US'}
            </div>
          </div>
        </header>

        {vistaActiva === 'monitoreo' ? (
          <>
            {/* Banner de Solicitudes de Validación Pendientes */}
            {usuarios.filter(u => u.active === false).length > 0 && (
              <div className="bg-amber-600/10 border border-amber-500/20 p-4 rounded-3xl mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="bg-amber-500/10 text-amber-500 p-2.5 rounded-2xl border border-amber-500/20 shrink-0">
                    <ShieldAlert size={22} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-tight">Solicitudes de Validación Pendientes</h4>
                    <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest mt-0.5">
                      Hay {usuarios.filter(u => u.active === false).length} {usuarios.filter(u => u.active === false).length === 1 ? 'entidad de emergencia esperando' : 'entidades de emergencia esperando'} aprobación
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMostrarValidarEntidades(true)}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[9px] uppercase tracking-widest px-4 py-2 rounded-xl transition-all self-start sm:self-center shadow-lg shadow-amber-950/20"
                >
                  Revisar y Validar
                </button>
              </div>
            )}

            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statsData.map((stat, i) => (
                <StatCard key={i} {...stat} />
              ))}
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <EmergencyMap
                user={user}
                historial={historial}
                selectedCoords={selectedCoords}
                setSelectedCoords={setSelectedCoords}
                datosReporte={datosReporte}
                setDatosReporte={setDatosReporte}
                modoLectura={modoLectura}
                abrirDetalleReporte={abrirDetalleReporte}
                prepararNuevoReporte={prepararNuevoReporte}
              />

              <div>
                {reporteSeleccionado ? (
                  <AdminEmergencyController
                    reporte={reporteSeleccionado}
                    onBack={() => {
                      setReporteSeleccionado(null);
                      setSelectedCoords(null);
                    }}
                    onActualizarEstado={handleActualizarEstado}
                    onAbrirGPS={handleAbrirGPS}
                    onDelete={handleDeleteReporte}
                    userName={user?.fullName}
                  />
                ) : (
                  <>
                    <div className="flex gap-2 mb-4 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
                      <button
                        onClick={() => setTabHistorial('activas')}
                        className={`flex-grow py-2 rounded-xl text-[10px] font-black uppercase tracking-wider italic transition-all ${tabHistorial === 'activas' ? 'bg-red-600 text-white shadow-lg shadow-red-600/10' : 'text-slate-400 hover:text-white bg-slate-950/40'}`}
                      >
                        Alertas Activas ({historial.filter(r => r.estado !== 'CONTROLADO' && r.estado !== 'RESUELTO').length})
                      </button>
                      <button
                        onClick={() => setTabHistorial('controlados')}
                        className={`flex-grow py-2 rounded-xl text-[10px] font-black uppercase tracking-wider italic transition-all ${tabHistorial === 'controlados' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/10' : 'text-slate-400 hover:text-white bg-slate-950/40'}`}
                      >
                        Controlados / Cerrados ({historial.filter(r => r.estado === 'CONTROLADO' || r.estado === 'RESUELTO').length})
                      </button>
                    </div>

                    <HistorySidebar
                      historial={
                        tabHistorial === 'activas'
                          ? historial.filter(r => r.estado !== 'CONTROLADO' && r.estado !== 'RESUELTO')
                          : historial.filter(r => r.estado === 'CONTROLADO' || r.estado === 'RESUELTO')
                      }
                      onSelect={abrirDetalleReporte}
                    />
                  </>
                )}
              </div>
            </section>
          </>
        ) : (
          <SavedReportsHistory
            reportes={historial}
            onSelectReporte={abrirDetalleReporte}
            onDeleteMultiple={handleDeleteMultiple}
          />
        )}
      </main>




      <EntityListModal
        mostrar={mostrarModalEntidades}
        setMostrar={setMostrarModalEntidades}
        usuarios={usuarios}
      />

      {toast.mostrar && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[200] flex items-center gap-3 bg-slate-900/95 backdrop-blur-md border border-slate-700/50 text-slate-100 px-6 py-4 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] max-w-md transition-all duration-300 animate-slide-up">
          {toast.tipo === 'success' && <CheckCircle className="text-emerald-400 w-5 h-5 flex-shrink-0 animate-pulse" />}
          {toast.tipo === 'warning' && <AlertCircle className="text-amber-400 w-5 h-5 flex-shrink-0" />}
          {toast.tipo === 'info' && <AlertCircle className="text-blue-400 w-5 h-5 flex-shrink-0" />}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Notificación</p>
            <p className="text-xs font-bold text-white mt-0.5">{toast.mensaje}</p>
          </div>
          <button
            onClick={() => setToast(prev => ({ ...prev, mostrar: false }))}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
