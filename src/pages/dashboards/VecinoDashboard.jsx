import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

import Sidebar from '../../components/Sidebar';
import ReporteModal from '../../components/ReporteModal';
import HistorySidebar from '../../components/HistorySidebar';
import EmergencyMap from '../../components/EmergencyMap';

import { Heart, CheckCircle, AlertCircle, X } from 'lucide-react';


export default function VecinoDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Estados generales
  const [enviando, setEnviando] = useState(false);
  const [toast, setToast] = useState({ mostrar: false, mensaje: '', tipo: 'success' });
  const [toastTimeoutId, setToastTimeoutId] = useState(null);

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
  const [modoLectura, setModoLectura] = useState(true);
  const [historial, setHistorial] = useState([]);
  const [archivo, setArchivo] = useState(null);
  const [selectedCoords, setSelectedCoords] = useState(null);

  const [datosReporte, setDatosReporte] = useState({
    id: null, titulo: '', descripcion: '', latitud: -33.4372, longitud: -70.6506, estado: 'PENDIENTE', fecha: ''
  });

  useEffect(() => {
    cargarHistorial();
  }, [user]);

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
    } catch (err) {
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
    setMostrarModal(true);
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

  useEffect(() => {
    if (!mostrarModal) {
      setModoLectura(true);
    }
  }, [mostrarModal]);

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
    } catch (err) {
      console.warn("Backend offline. Creando reporte en sesión local...");
    }

    // Guardar en localStorage para persistencia offline
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
    setEnviando(false);
  };


  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200 font-sans">
      <ReporteModal 
        mostrar={mostrarModal} setMostrar={setMostrarModal}
        modoLectura={modoLectura} datos={datosReporte}
        handleChange={handleChange} handleSubmit={handleSubmitReporte}
        enviando={enviando} archivo={archivo} setArchivo={setArchivo}
      />

      <Sidebar onRefresh={cargarHistorial} />

      <main className="flex-1 ml-16 md:ml-64 p-4 md:p-8 overflow-y-auto transition-all duration-300">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tight italic">Portal de la Comunidad</h1>
            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1 italic">Envía alertas de focos de incendio en tu sector</p>
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

        <div className="bg-gradient-to-r from-red-950/40 to-slate-900 border border-red-500/20 p-8 rounded-[2.5rem] mb-8 shadow-xl flex items-center justify-between">
          <div className="max-w-xl">
            <h2 className="text-white font-black text-xl uppercase italic tracking-tighter flex items-center gap-2">
              <Heart size={20} className="text-red-500" /> Cuidemos Valle del Sol
            </h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed uppercase font-semibold">
              Si detectas columnas de humo, pastizales encendidos o focos de fuego forestal, repórtalo inmediatamente. Tu alerta geolocalizada llegará directo a CONAF y Bomberos en tiempo real.
            </p>
          </div>
          <button 
            onClick={() => prepararNuevoReporte()} 
            className="px-8 py-4 bg-red-600 hover:bg-red-500 text-white rounded-full font-black uppercase text-[11px] tracking-widest shadow-xl transition-all"
          >
            Reportar Ahora
          </button>
        </div>

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
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl mb-4 flex items-center gap-3 text-slate-400 uppercase tracking-widest text-[9px] font-black italic">
              Historial de Mis Alertas
            </div>
            <HistorySidebar historial={historial} onSelect={abrirDetalleReporte} />
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
