import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

import Sidebar from '../../components/Sidebar';
import StatCard from '../../components/StatCard';
import ReporteModal from '../../components/ReporteModal';
import HistorySidebar from '../../components/HistorySidebar';
import EmergencyMap from '../../components/EmergencyMap';
import EmergencyController from '../../components/EmergencyController';
import EmergencyChat from '../../components/EmergencyChat';
import EntityListModal from '../../components/EntityListModal';

import { Flame, ShieldAlert, Users, TrendingUp, CheckCircle, AlertCircle, X, Shield, Clock } from 'lucide-react';

let globalAudioCtx = null;

const formatCasoId = (id) => {
  if (!id) return '';
  const strId = String(id);
  if (strId.startsWith('local-')) {
    return `CASO-${strId.slice(-4)}`;
  }
  return `CASO-${strId.padStart(3, '0')}`;
};

export default function EntidadDashboard() {
  const { user, usuarios = [] } = useAuth();

  // Estados generales
  const enviando = false;
  const [todosLosReportes, setTodosLosReportes] = useState([]);
  const [mostrarModalEntidades, setMostrarModalEntidades] = useState(false);
  const [toast, setToast] = useState({ mostrar: false, mensaje: '', tipo: 'success' });
  const [toastTimeoutId, setToastTimeoutId] = useState(null);
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

  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoLectura, setModoLectura] = useState(false);
  const [historial, setHistorial] = useState([]);
  const [archivo, setArchivo] = useState(null);
  const [selectedCoords, setSelectedCoords] = useState(null);
  const [reporteSeleccionado, setReporteSeleccionado] = useState(null);
  const [verChat, setVerChat] = useState(false);

  const [datosReporte, setDatosReporte] = useState({
    id: null, titulo: '', descripcion: '', latitud: -33.4372, longitud: -70.6506, estado: 'PENDIENTE', fecha: ''
  });

  const aplicarReportesEntidad = useCallback((reportes) => {
    setTodosLosReportes(reportes);
    const reportesActivos = reportes.filter(r => r.estado !== 'RESUELTO');
    setHistorial(reportesActivos);
    setReporteSeleccionado(prev => prev ? reportesActivos.find(r => r.id === prev.id) || null : null);
    setSelectedCoords(prev => {
      if (!prev) return prev;
      const sigueVisible = reportesActivos.some(r =>
        Number(r.latitud) === Number(prev[0]) && Number(r.longitud) === Number(prev[1])
      );
      return sigueVisible ? prev : null;
    });
  }, []);

  const cargarHistorial = useCallback(async () => {
    const DEFAULT_ALERTAS = [
      { id: 101, titulo: "Incendio Forestal Sector Alto Sol", descripcion: "Fuego descontrolado cerca de matorrales en pendiente pronunciada.", latitud: -33.4320, longitud: -70.6410, estado: 'PENDIENTE', fecha: new Date(Date.now() - 3600000).toLocaleString() },
      { id: 102, titulo: "Columna de Humo en Quebrada", descripcion: "Comunidad reporta avistamiento de humo gris denso en la quebrada principal.", latitud: -33.4490, longitud: -70.6590, estado: 'EN_PROCESO', fecha: new Date(Date.now() - 7200000).toLocaleString() },
      { id: 103, titulo: "Foco Pastizales Bajo Control", descripcion: "Foco controlado y extinguido gracias al rápido actuar de brigadistas.", latitud: -33.4210, longitud: -70.6690, estado: 'RESUELTO', fecha: new Date(Date.now() - 86400000).toLocaleString() }
    ];

    try {
      const response = await api.get('/sincronizar');
      localStorage.setItem('valle_sol_reportes', JSON.stringify(response.data));
      aplicarReportesEntidad(response.data);
    } catch {
      console.warn("Backend offline o error al sincronizar. Cargando desde LocalStorage...");
      const stored = localStorage.getItem('valle_sol_reportes');
      let reportesList = stored ? JSON.parse(stored) : null;
      if (!reportesList) {
        reportesList = DEFAULT_ALERTAS;
        localStorage.setItem('valle_sol_reportes', JSON.stringify(DEFAULT_ALERTAS));
      }
      aplicarReportesEntidad(reportesList);
    }
  }, [aplicarReportesEntidad]);

  useEffect(() => {
    let activo = true;
    const inicializarHistorial = async () => {
      if (!activo) return;
      await cargarHistorial();
    };
    inicializarHistorial();
    return () => { activo = false; };
  }, [cargarHistorial, user]);

  useEffect(() => {
    const sincronizarDesdeLocalStorage = (event) => {
      if (event.key !== 'valle_sol_reportes' || !event.newValue) return;
      aplicarReportesEntidad(JSON.parse(event.newValue));
    };
    const intervalId = setInterval(cargarHistorial, 10000);
    window.addEventListener('storage', sincronizarDesdeLocalStorage);
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('storage', sincronizarDesdeLocalStorage);
    };
  }, [aplicarReportesEntidad, cargarHistorial]);

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
    setVerChat(false);
  };

  const handleAbrirGPS = (lat, lng) => {
    const gMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${Number(lat)},${Number(lng)}&travelmode=driving`;
    window.open(gMapsUrl, '_blank');
  };

  const handleActualizarEstado = async (id, nuevoEstado) => {
    // Si la entidad se marca "EN CAMINO" a un caso, primero revertimos cualquier
    // otro caso que ya tenga "EN CAMINO" de esta misma entidad (solo 1 caso a la vez)
    if (nuevoEstado.startsWith('EN CAMINO')) {
      const casosEnCamino = historial.filter(r => r.id !== id && r.estado?.startsWith('EN CAMINO'));
      for (const caso of casosEnCamino) {
        try {
          await api.put(`/editar/${caso.id}`, { estado: 'PENDIENTE' });
        } catch {
          console.warn("API offline. Revirtiendo estado localmente...");
        }
      }
      
      // Actualizamos el caso ACTUAL a "EN CAMINO"
      try {
        await api.put(`/editar/${id}`, { estado: nuevoEstado });
      } catch {
        console.warn("API offline. Actualizando caso a en camino localmente...");
      }
      // Actualizar localStorage para los casos revertidos
      const stored = localStorage.getItem('valle_sol_reportes');
      if (stored) {
        const list = JSON.parse(stored);
        const updatedList = list.map(r => {
          if (r.id === id) return { ...r, estado: nuevoEstado };
          if (casosEnCamino.some(c => c.id === r.id)) return { ...r, estado: 'PENDIENTE' };
          return r;
        });
        localStorage.setItem('valle_sol_reportes', JSON.stringify(updatedList));
      }
      // Actualizar historial local: revertir anteriores + marcar el seleccionado
      setHistorial(prev => prev.map(r => {
        if (r.id === id) return { ...r, estado: nuevoEstado };
        if (casosEnCamino.some(c => c.id === r.id)) return { ...r, estado: 'PENDIENTE' };
        return r;
      }));
      setTodosLosReportes(prev => prev.map(r => {
        if (r.id === id) return { ...r, estado: nuevoEstado };
        if (casosEnCamino.some(c => c.id === r.id)) return { ...r, estado: 'PENDIENTE' };
        return r;
      }));
      setReporteSeleccionado(prev => prev?.id === id ? { ...prev, estado: nuevoEstado } : prev);
      mostrarToast(`Unidad despachada al caso seleccionado.`, "info");
      return;
    }

    // Para otros estados (CONTROLADO, RESUELTO), flujo normal
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

    if (nuevoEstado === 'RESUELTO') {
      setHistorial(prev => prev.filter(r => r.id !== id));
      setTodosLosReportes(prev => prev.map(r => r.id === id ? { ...r, estado: nuevoEstado } : r));
      setSelectedCoords(null);
      setReporteSeleccionado(null);
      mostrarToast("Emergencia finalizada y cerrada con éxito.", "success");
    } else {
      setHistorial(prev => prev.map(r => r.id === id ? { ...r, estado: nuevoEstado } : r));
      setTodosLosReportes(prev => prev.map(r => r.id === id ? { ...r, estado: nuevoEstado } : r));
      setReporteSeleccionado(prev => prev?.id === id ? { ...prev, estado: nuevoEstado } : prev);
      mostrarToast(`Estado de la emergencia actualizado a: ${nuevoEstado}`, "info");
    }
  };

  // Cálculos para las métricas superiores
  const resolvedAlerts = todosLosReportes.filter(r => r.estado?.startsWith('RESUELTO') || r.estado?.startsWith('CONTROLADO')).length;
  const totalAlerts = todosLosReportes.length;
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

  // Caso más antiguo sin resolver ni controlado para la tarjeta de Tardíos (solo PENDIENTE o NUEVO)
  const activeAlerts = todosLosReportes.filter(r => !r.estado?.startsWith('RESUELTO'));
  const tardiosAlerts = todosLosReportes.filter(r => r.estado === 'PENDIENTE' || r.estado === 'NUEVO');
  let oldestAlert = null;
  let tiempoTranscurrido = "";
  if (tardiosAlerts.length > 0) {
    oldestAlert = tardiosAlerts.reduce((oldest, current) => {
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

  const playAlertSound = useCallback(() => {
    try {
      if (!globalAudioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        globalAudioCtx = new AudioContext();
      }

      if (globalAudioCtx.state === 'suspended') {
        globalAudioCtx.resume();
      }
      
      const playTone = (freq, type, startTime, duration) => {
        const osc = globalAudioCtx.createOscillator();
        const gain = globalAudioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, startTime);
        
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.1, startTime + 0.05); // Volumen original suave
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        
        osc.connect(gain);
        gain.connect(globalAudioCtx.destination);
        
        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      const now = globalAudioCtx.currentTime;
      // Sonido estilo "Alerta de Despacho" (Doble tono corto, urgente pero suave)
      playTone(750, 'triangle', now, 0.4);
      playTone(750, 'triangle', now + 0.15, 0.4);
    } catch (e) {
      console.warn("Navegador bloqueó el autoplay del sonido de emergencia:", e);
    }
  }, []);

  useEffect(() => {
    let interval;
    if (oldestAlert && (oldestAlert.estado === 'PENDIENTE' || oldestAlert.estado === 'NUEVO')) {
      playAlertSound();
      interval = setInterval(playAlertSound, 4000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [oldestAlert?.id, oldestAlert?.estado, playAlertSound]);

  const handleFocusOldest = (alert) => {
    if (alert) {
      abrirDetalleReporte(alert);
      mostrarToast(`Enfocado caso más antiguo ${formatCasoId(alert.id)}`, "info");
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
      secondaryText: `${resolvedAlerts} controlados/resueltos de ${totalAlerts} totales`,
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
      value: oldestAlert ? formatCasoId(oldestAlert.id) : 'Al Día',
      icon: <Clock size={20} className={oldestAlert && (oldestAlert.estado === 'PENDIENTE' || oldestAlert.estado === 'NUEVO') ? "animate-bounce" : ""} />,
      color: oldestAlert && (oldestAlert.estado === 'PENDIENTE' || oldestAlert.estado === 'NUEVO') ? "text-red-500" : (oldestAlert ? "text-amber-500" : "text-emerald-500"),
      bg: oldestAlert && (oldestAlert.estado === 'PENDIENTE' || oldestAlert.estado === 'NUEVO') ? "bg-red-500/10" : (oldestAlert ? "bg-amber-500/10" : "bg-emerald-500/10"),
      secondaryText: oldestAlert ? `${tiempoTranscurrido} - ${oldestAlert.estado}` : 'Sin alertas pendientes',
      onClick: oldestAlert ? () => handleFocusOldest(oldestAlert) : undefined,
      pulseBorder: !!(oldestAlert && (oldestAlert.estado === 'PENDIENTE' || oldestAlert.estado === 'NUEVO'))
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
        handleChange={() => {}} handleSubmit={(e) => { e.preventDefault(); setMostrarModal(false); }}
        enviando={enviando} archivo={archivo} setArchivo={setArchivo}
        onActualizarEstado={handleActualizarEstado}
        onAbrirGPS={handleAbrirGPS}
      />

      <Sidebar onRefresh={cargarHistorial} />

      <main className="flex-1 ml-16 md:ml-64 p-4 md:p-5 overflow-y-auto transition-all duration-300">
        <header className="max-w-[1500px] mx-auto flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight italic">Mando de Despliegue</h1>
            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1 italic">Monitoreo de focos activos y rutas en terreno</p>
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

        <section className="max-w-[1500px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {statsData.map((stat, i) => (
            <StatCard key={i} {...stat} compact />
          ))}
        </section>

        <section className="max-w-[1500px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-5">
          <EmergencyMap
            user={user}
            historial={historial}
            selectedCoords={selectedCoords}
            setSelectedCoords={setSelectedCoords}
            datosReporte={datosReporte}
            setDatosReporte={setDatosReporte}
            modoLectura={modoLectura}
            abrirDetalleReporte={abrirDetalleReporte}
            compact
          />

          <div>
            <div className="bg-blue-950/20 border border-blue-500/10 px-4 py-2.5 rounded-2xl mb-3 flex items-center gap-3 text-blue-400 uppercase tracking-widest text-[9px] font-black italic">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
              Feed en Tiempo Real - Despacho Activo
            </div>
            {reporteSeleccionado ? (
              verChat ? (
                <EmergencyChat
                  reporte={reporteSeleccionado}
                  user={user}
                  onBack={() => setVerChat(false)}
                />
              ) : (
                <EmergencyController
                  reporte={reporteSeleccionado}
                  onBack={() => {
                    setReporteSeleccionado(null);
                    setSelectedCoords(null);
                    setVerChat(false);
                  }}
                  onActualizarEstado={handleActualizarEstado}
                  onAbrirGPS={handleAbrirGPS}
                  onVerChat={() => setVerChat(true)}
                  userName={user?.institucion || user?.fullName}
                />
              )
            ) : (
              <HistorySidebar historial={historial} onSelect={abrirDetalleReporte} compact />
            )}
          </div>
        </section>
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
