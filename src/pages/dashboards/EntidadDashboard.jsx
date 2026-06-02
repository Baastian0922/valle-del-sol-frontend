import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

import Sidebar from '../../components/Sidebar';
import StatCard from '../../components/StatCard';
import ReporteModal from '../../components/ReporteModal';
import HistorySidebar from '../../components/HistorySidebar';
import EmergencyMap from '../../components/EmergencyMap';

import { Flame, ShieldAlert, Users, TrendingUp } from 'lucide-react';

export default function EntidadDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Estados generales
  const [enviando, setEnviando] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoLectura, setModoLectura] = useState(false);
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
      // Las entidades de emergencia solo ven reportes que no estén resueltos
      setHistorial(response.data.filter(r => r.estado !== 'RESUELTO'));
    } catch (err) {
      console.warn("Backend offline o error al sincronizar. Cargando desde LocalStorage...");
      const stored = localStorage.getItem('valle_sol_reportes');
      let reportesList = stored ? JSON.parse(stored) : null;
      if (!reportesList) {
        reportesList = DEFAULT_ALERTAS;
        localStorage.setItem('valle_sol_reportes', JSON.stringify(DEFAULT_ALERTAS));
      }
      setHistorial(reportesList.filter(r => r.estado !== 'RESUELTO'));
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

  const handleAbrirGPS = (lat, lng) => {
    const gMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${Number(lat)},${Number(lng)}&travelmode=driving`;
    window.open(gMapsUrl, '_blank');
  };

  const handleActualizarEstado = async (id, nuevoEstado) => {
    try {
      await api.put(`/editar/${id}`, { estado: nuevoEstado });
    } catch (err) {
      console.warn("API offline. Actualizando estado localmente...");
    }

    // Actualizar en localStorage
    const stored = localStorage.getItem('valle_sol_reportes');
    if (stored) {
      const list = JSON.parse(stored);
      const updatedList = list.map(r => r.id === id ? { ...r, estado: nuevoEstado } : r);
      localStorage.setItem('valle_sol_reportes', JSON.stringify(updatedList));
    }

    if (nuevoEstado === 'RESUELTO') {
      setHistorial(prev => prev.filter(r => r.id !== id));
      setSelectedCoords(null);
      alert("Emergencia finalizada y cerrada con éxito.");
    } else {
      setHistorial(prev => prev.map(r => r.id === id ? { ...r, estado: nuevoEstado } : r));
      alert(`Estado de la emergencia actualizado a: ${nuevoEstado}`);
    }
  };

  const statsData = [
    { label: "Alertas Activas", value: historial.length, icon: <Flame size={20}/>, color: "text-red-500", bg: "bg-red-500/10" },
    { label: "Personal en Terreno", value: "18", icon: <Users size={20}/>, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Nivel de Riesgo", value: "Crítico", icon: <ShieldAlert size={20}/>, color: "text-orange-500", bg: "bg-orange-500/10" },
    { label: "Eficiencia Op.", value: "98%", icon: <TrendingUp size={20}/>, color: "text-emerald-500", bg: "bg-emerald-500/10" },
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

      <main className="flex-1 ml-16 md:ml-64 p-4 md:p-8 overflow-y-auto transition-all duration-300">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tight italic">Mando de Despliegue</h1>
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
          />

          <div>
            <div className="bg-blue-950/20 border border-blue-500/10 p-4 rounded-3xl mb-4 flex items-center gap-3 text-blue-400 uppercase tracking-widest text-[9px] font-black italic">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
              Feed en Tiempo Real - Despacho Activo
            </div>
            <HistorySidebar historial={historial} onSelect={abrirDetalleReporte} />
          </div>
        </section>
      </main>
    </div>
  );
}
