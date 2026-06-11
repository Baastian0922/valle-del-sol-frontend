import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

import Sidebar from '../../components/Sidebar';
import ReporteModal from '../../components/ReporteModal';
import HistorySidebar from '../../components/HistorySidebar';
import EmergencyMap from '../../components/EmergencyMap';
import EmergencyChat from '../../components/EmergencyChat';

import { Heart, CheckCircle, AlertCircle, X } from 'lucide-react';

export default function VecinoDashboard() {
  const { user } = useAuth();

  // Estados generales
  const [enviando, setEnviando] = useState(false);
  const [toast, setToast] = useState({ mostrar: false, mensaje: '', tipo: 'success' });
  const [toastTimeoutId, setToastTimeoutId] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoLectura, setModoLectura] = useState(true);
  const [historial, setHistorial] = useState([]);
  const [archivo, setArchivo] = useState(null);
  const [selectedCoords, setSelectedCoords] = useState(null);
  const [seleccionUbicacionActiva, setSeleccionUbicacionActiva] = useState(false);
  const [reporteChat, setReporteChat] = useState(null);

  const [datosReporte, setDatosReporte] = useState({
    id: null, titulo: '', descripcion: '', latitud: null, longitud: null, estado: 'PENDIENTE', fecha: ''
  });

  const reportesVisiblesMapa = historial.filter(
    reporte => reporte.estado !== 'CONTROLADO' && reporte.estado !== 'RESUELTO'
  );

  // 1. Declaracion de funciones principales
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

  const cargarHistorial = async () => {
    const DEFAULT_ALERTAS = [
      { id: 101, titulo: "Incendio Forestal Sector Alto Sol", descripcion: "Fuego descontrolado cerca de matorrales en pendiente pronunciada.", latitud: -33.4320, longitud: -70.6410, estado: 'PENDIENTE', fecha: new Date(Date.now() - 3600000).toLocaleString() },
      { id: 102, titulo: "Columna de Humo en Quebrada", descripcion: "Comunidad reporta avistamiento de humo gris denso en la quebrada principal.", latitud: -33.4490, longitud: -70.6590, estado: 'EN_PROCESO', fecha: new Date(Date.now() - 7200000).toLocaleString() },
      { id: 103, titulo: "Foco Pastizales Bajo Control", descripcion: "Foco controlado y extinguido gracias al rápido actuar de brigadistas.", latitud: -33.4210, longitud: -70.6690, estado: 'RESUELTO', fecha: new Date(Date.now() - 86400000).toLocaleString() }
    ];

    try {
      const response = await api.get('/sincronizar');
      localStorage.setItem('valle_sol_reportes', JSON.stringify(response.data));
      setHistorial(response.data.filter(r => r.titulo.toLowerCase().includes('comunidad') || r.estado === 'PENDIENTE'));
    } catch {
      console.warn("Backend offline o error al sincronizar. Cargando desde LocalStorage...");
      const stored = localStorage.getItem('valle_sol_reportes');
      let reportesList = stored ? JSON.parse(stored) : null;
      if (!reportesList) {
        reportesList = DEFAULT_ALERTAS;
        localStorage.setItem('valle_sol_reportes', JSON.stringify(DEFAULT_ALERTAS));
      }
      setHistorial(reportesList.filter(r => r.titulo.toLowerCase().includes('comunidad') || r.estado === 'PENDIENTE'));
    }
  };

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
    if (user?.role === 'USER') {
      setReporteChat(rep);
      return;
    }
    setMostrarModal(true);
  };

  const prepararNuevoReporte = (lat, lng) => {
    const finalLat = Number(lat);
    const finalLng = Number(lng);
    if (!Number.isFinite(finalLat) || !Number.isFinite(finalLng)) {
      setSeleccionUbicacionActiva(true);
      setSelectedCoords(null);
      setDatosReporte(prev => ({ ...prev, latitud: null, longitud: null }));
      return;
    }
    setModoLectura(false);
    setDatosReporte({
      id: null, titulo: '', descripcion: '', latitud: finalLat, longitud: finalLng,
      estado: 'PENDIENTE', fecha: new Date().toLocaleString()
    });
    setSeleccionUbicacionActiva(false);
    setMostrarModal(true);
  };

  // Funcion para controlar el cierre del modal de forma limpia sin usar useEffect
  const handleToggleModal = (estado) => {
    setMostrarModal(estado);
    if (!estado) {
      setModoLectura(true);
    }
  };

  // 2. Ciclos de vida y efectos secundarios
  useEffect(() => {
    let activo = true;

    const inicializarHistorial = async () => {
      if (!activo) return;
      await cargarHistorial();
    };

    inicializarHistorial();

    return () => {
      activo = false;
    };
  }, [user]);

  useEffect(() => {
    let timer;
    if (mostrarModal && !modoLectura) {
      timer = setInterval(() => {
        setDatosReporte(prev => ({ ...prev, fecha: new Date().toLocaleString() }));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [mostrarModal, modoLectura]);

  useEffect(() => {
    const sincronizarDesdeLocalStorage = (event) => {
      if (event.key !== 'valle_sol_reportes' || !event.newValue) return;
      const reportes = JSON.parse(event.newValue);
      setHistorial(reportes.filter(r => r.titulo.toLowerCase().includes('comunidad') || r.estado === 'PENDIENTE'));
    };

    const intervalId = setInterval(cargarHistorial, 10000);
    window.addEventListener('storage', sincronizarDesdeLocalStorage);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('storage', sincronizarDesdeLocalStorage);
    };
  }, []);

  const handleChange = (e) => setDatosReporte({ ...datosReporte, [e.target.name]: e.target.value });

  const handleSubmitReporte = async (e) => {
    e.preventDefault();
    setEnviando(true);

    const nuevoId = Math.floor(Math.random() * 1000) + 10;
    const payload = {
      ...datosReporte,
      id: nuevoId,
      latitud: parseFloat(datosReporte.latitud),
      longitud: parseFloat(datosReporte.longitud),
      fecha: new Date().toLocaleString()
    };

    let syncExitoso = false;
    try {
      await api.post('/crear', payload);
      syncExitoso = true;
    } catch {
      console.warn("Backend offline. Creando reporte en sesion local...");
    }

    const DEFAULT_ALERTAS = [
      { id: 101, titulo: "Incendio Forestal Sector Alto Sol", descripcion: "Fuego descontrolado cerca de matorrales en pendiente pronunciada.", latitud: -33.4320, longitud: -70.6410, estado: 'PENDIENTE', fecha: new Date(Date.now() - 3600000).toLocaleString() },
      { id: 102, titulo: "Columna de Humo en Quebrada", descripcion: "Comunidad reporta avistamiento de humo gris denso en la quebrada principal.", latitud: -33.4490, longitud: -70.6590, estado: 'EN_PROCESO', fecha: new Date(Date.now() - 7200000).toLocaleString() },
      { id: 103, titulo: "Foco Pastizales Bajo Control", descripcion: "Foco controlado y extinguido gracias al rápido actuar de brigadistas.", latitud: -33.4210, longitud: -70.6690, estado: 'RESUELTO', fecha: new Date(Date.now() - 86400000).toLocaleString() }
    ];

    const stored = localStorage.getItem('valle_sol_reportes');
    let reportesList = stored ? JSON.parse(stored) : DEFAULT_ALERTAS;
    reportesList = [payload, ...reportesList];
    localStorage.setItem('valle_sol_reportes', JSON.stringify(reportesList));

    setHistorial(prev => [payload, ...prev]);

    if (syncExitoso) {
      mostrarToast("Reporte de incendio registrado y procesado con éxito.", "success");
    } else {
      mostrarToast("Reporte registrado localmente (Offline).", "warning");
    }

    setMostrarModal(false);
    setModoLectura(true);
    setSeleccionUbicacionActiva(false);
    setEnviando(false);
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200 font-sans">
      <ReporteModal 
        mostrar={mostrarModal} setMostrar={handleToggleModal}
        modoLectura={modoLectura} datos={datosReporte}
        handleChange={handleChange} handleSubmit={handleSubmitReporte}
        enviando={enviando} archivo={archivo} setArchivo={setArchivo}
      />

      <Sidebar onRefresh={cargarHistorial} />

      <main className="flex-1 ml-16 md:ml-64 p-4 md:p-5 overflow-y-auto transition-all duration-300">
        <header className="max-w-[1500px] mx-auto flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight italic">Portal de la Comunidad</h1>
            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1 italic">Envía alertas de focos de incendio en tu sector</p>
          </div>

          <div className="flex items-center gap-4 text-right">
            <div>
              <p className="text-sm font-bold text-white uppercase italic">
                {user?.fullName || 'Vecino Invitado'}
              </p>
              <div className="flex items-center gap-1.5 justify-end mt-1">
                {user ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <p className="text-[8px] text-emerald-500 font-black tracking-widest uppercase">Online</p>
                  </>
                ) : (
                  <Link
                    to="/register"
                    className="text-[9px] bg-red-600/10 hover:bg-red-600 border border-red-500/20 hover:border-red-500 text-red-400 hover:text-white px-2 py-1 rounded-md font-black tracking-widest uppercase transition-all shadow-md"
                  >
                    Registrarse como usuario
                  </Link>
                )}
              </div>
            </div>
            <div className="w-12 h-12 bg-slate-800 rounded-2xl border border-slate-700 flex items-center justify-center text-white font-black italic shadow-xl">
              {user?.fullName ? user.fullName.substring(0, 2).toUpperCase() : 'US'}
            </div>
          </div>
        </header>

        <div className="max-w-[1500px] mx-auto bg-gradient-to-r from-red-950/40 to-slate-900 border border-red-500/20 px-6 py-4 rounded-3xl mb-4 shadow-xl flex items-center justify-between">
          <div className="max-w-xl">
            <h2 className="text-white font-black text-base uppercase italic tracking-tighter flex items-center gap-2">
              <Heart size={20} className="text-red-500" /> Cuidemos Valle del Sol
            </h2>
            <p className="text-[10px] text-slate-400 mt-1 leading-relaxed uppercase font-semibold">
              Si detectas columnas de humo, pastizales encendidos o focos de fuego forestal, repórtalo inmediatamente. Tu alerta geolocalizada llegará directo a CONAF y Bomberos en tiempo real.
            </p>
          </div>
          <button 
            onClick={() => prepararNuevoReporte()} 
            className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-full font-black uppercase text-[10px] tracking-widest shadow-xl transition-all"
          >
            Reportar Ahora
          </button>
        </div>

        <section className="max-w-[1500px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-5">
          <EmergencyMap 
            user={user}
            historial={reportesVisiblesMapa}
            selectedCoords={selectedCoords}
            setSelectedCoords={setSelectedCoords}
            datosReporte={datosReporte}
            setDatosReporte={setDatosReporte}
            modoLectura={modoLectura}
            abrirDetalleReporte={abrirDetalleReporte}
            prepararNuevoReporte={prepararNuevoReporte}
            canSelectLocation
            locationSelectionActive={seleccionUbicacionActiva}
            onStartLocationSelection={() => prepararNuevoReporte()}
            onLocationSelected={(lat, lng) => setSelectedCoords([lat, lng])}
            compact
          />

          <div>
            <div className="bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-2xl mb-3 flex items-center gap-3 text-slate-400 uppercase tracking-widest text-[9px] font-black italic">
              Historial de Mis Alertas
            </div>
            {reporteChat && user?.role === 'USER' ? (
              <EmergencyChat key={reporteChat.id} reporte={reporteChat} user={user} onBack={() => setReporteChat(null)} />
            ) : (
            <HistorySidebar historial={historial} onSelect={abrirDetalleReporte} compact />
            )}
          </div>
        </section>
      </main>

      {toast.mostrar && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-3 bg-slate-900/95 backdrop-blur-md border border-slate-700/50 text-slate-100 px-6 py-4 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] max-w-md transition-all duration-300 animate-slide-up">
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
