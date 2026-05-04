import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; 
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import { Geocoder as LeafletGeocoder, geocoders } from 'leaflet-control-geocoder';
import { 
  Flame, ShieldAlert, Map as MapIcon, Users, 
  LogOut, Bell, TrendingUp, Send, X, Calendar, Activity,
  RotateCcw
} from 'lucide-react';

// --- CONFIGURACIÓN DE ICONOS ---
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function Dashboard() {
  const navigate = useNavigate();
  const [enviando, setEnviando] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoLectura, setModoLectura] = useState(false); 
  const [historial, setHistorial] = useState([]); 
  
  const [datosReporte, setDatosReporte] = useState({
    titulo: '',
    descripcion: '',
    latitud: -33.4372,
    longitud: -70.6506,
    estado: 'PENDIENTE',
    fecha: ''
  });

  const [archivo, setArchivo] = useState(null);

  useEffect(() => {
    cargarHistorial();
  }, []);

  // 1. CORRECCIÓN: Usar la ruta que definimos en Java para obtener datos
  const cargarHistorial = async () => {
    try {
      const response = await api.get('/sincronizar');
      setHistorial(response.data);
    } catch (err) {
      console.error("Error al traer historial:", err);
    }
  };

  const abrirDetalleReporte = (rep) => {
    setModoLectura(true);
    setDatosReporte({
      titulo: rep.titulo || '',
      descripcion: rep.descripcion || '',
      latitud: rep.latitud,
      longitud: rep.longitud,
      estado: rep.estado || 'PENDIENTE',
      fecha: rep.fecha ? new Date(rep.fecha).toLocaleString() : 'Sin fecha'
    });
    setMostrarModal(true);
  };

  const prepararNuevoReporte = () => {
    setModoLectura(false);
    setDatosReporte({
      titulo: '', 
      descripcion: '', 
      latitud: -33.4372, 
      longitud: -70.6506,
      estado: 'PENDIENTE', 
      fecha: new Date().toLocaleString()
    });
    setMostrarModal(true);
  };

  // Actualizador de reloj para nuevos reportes
  useEffect(() => {
    let timer;
    if (mostrarModal && !modoLectura) {
      timer = setInterval(() => {
        setDatosReporte(prev => ({ ...prev, fecha: new Date().toLocaleString() }));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [mostrarModal, modoLectura]);

  const BuscadorComunas = () => {
    const map = useMap();
    useEffect(() => {
      const geocoderInstance = geocoders.nominatim();
      const control = new LeafletGeocoder({
        geocoder: geocoderInstance,
        defaultMarkGeocode: false,
        placeholder: "Buscar sector...",
      })
      .on('markgeocode', (e) => {
        const { lat, lng } = e.geocode.center;
        if (!modoLectura) {
          setDatosReporte(prev => ({ ...prev, latitud: lat, longitud: lng }));
        }
        map.setView(e.geocode.center, 16);
      })
      .addTo(map);
      return () => map.removeControl(control);
    }, [map]);
    return null;
  };

  const ClickMapa = () => {
    useMapEvents({
      click(e) {
        if (!modoLectura) {
          setDatosReporte(prev => ({ ...prev, latitud: e.latlng.lat, longitud: e.latlng.lng }));
        }
      },
    });
    return <Marker position={[datosReporte.latitud, datosReporte.longitud]} />;
  };

  const handleLogout = () => navigate('/'); 
  const handleChange = (e) => setDatosReporte({ ...datosReporte, [e.target.name]: e.target.value });

  // 2. CORRECCIÓN: Enviar a /crear (que definimos en el Controller)
  const handleSubmitReporte = async (e) => {
    e.preventDefault();
    if (modoLectura) { setMostrarModal(false); return; }
    
    setEnviando(true);
    try {
      const payload = { 
        titulo: datosReporte.titulo,
        descripcion: datosReporte.descripcion,
        latitud: parseFloat(datosReporte.latitud),
        longitud: parseFloat(datosReporte.longitud),
        estado: "PENDIENTE",
        fecha: new Date() // Enviamos objeto Date para que Java lo entienda bien
      };
      
      // Llamada al POST que creamos en Java
      await api.post('/crear', payload);
      
      alert("Reporte Sincronizado");
      setMostrarModal(false);
      cargarHistorial(); // Recarga la lista lateral
    } catch (err) {
      alert("Fallo de conexión");
      console.error("Error al enviar reporte:", err.response?.data || err.message);
    } finally {
      setEnviando(false);
    }
  };

  const stats = [
    { label: "Alertas Activas", value: historial.length, icon: <Flame size={20}/>, color: "text-red-500", bg: "bg-red-500/10" },
    { label: "Personal en Terreno", value: "12", icon: <Users size={20}/>, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Nivel de Riesgo", value: "Crítico", icon: <ShieldAlert size={20}/>, color: "text-orange-500", bg: "bg-orange-500/10" },
    { label: "Eficiencia Op.", value: "98%", icon: <TrendingUp size={20}/>, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  ];

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200 font-sans">
      
      {mostrarModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className={`bg-slate-900 border ${modoLectura ? 'border-emerald-500/30' : 'border-slate-800'} w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">
                {modoLectura ? 'Situación del Reporte' : 'Reporte del Sistema'}
              </h2>
              <button onClick={() => setMostrarModal(false)} className="text-slate-500 hover:text-white"><X size={24} /></button>
            </div>

            <form onSubmit={handleSubmitReporte} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 ml-2 italic">Título</label>
                <input required name="titulo" value={datosReporte.titulo} readOnly={modoLectura} onChange={handleChange} className={`w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm outline-none ${modoLectura ? 'text-slate-400 cursor-default' : 'focus:border-red-600'}`} />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 ml-2 italic">Descripción</label>
                <textarea required name="descripcion" value={datosReporte.descripcion} readOnly={modoLectura} onChange={handleChange} rows="2" className={`w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm outline-none resize-none ${modoLectura ? 'text-slate-400 cursor-default' : 'focus:border-red-600'}`} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950 border border-slate-800 p-3 rounded-2xl flex items-center gap-2">
                    <Activity size={14} className={modoLectura && datosReporte.estado === 'ATENDIDO' ? 'text-emerald-500' : 'text-blue-500'} />
                    <div>
                        <label className="text-[9px] uppercase font-black text-slate-600 block italic">Estado</label>
                        <p className={`text-xs font-bold uppercase tracking-widest ${modoLectura && datosReporte.estado === 'ATENDIDO' ? 'text-emerald-400' : 'text-blue-400'}`}>
                          {datosReporte.estado}
                        </p>
                    </div>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-3 rounded-2xl flex items-center gap-2">
                    <Calendar size={14} className="text-red-500" />
                    <div>
                        <label className="text-[9px] uppercase font-black text-slate-600 block italic">Fecha</label>
                        <p className="text-[10px] font-bold text-white uppercase italic">
                          {datosReporte.fecha}
                        </p>
                    </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950/50 border border-slate-800/50 p-3 rounded-2xl italic font-mono text-emerald-500 text-xs text-center">
                    Lat: {datosReporte.latitud.toFixed(4)}
                </div>
                <div className="bg-slate-950/50 border border-slate-800/50 p-3 rounded-2xl italic font-mono text-emerald-500 text-xs text-center">
                    Lng: {datosReporte.longitud.toFixed(4)}
                </div>
              </div>

              {!modoLectura && (
                <div className="bg-slate-950 border-2 border-dashed border-slate-800 rounded-2xl p-4 text-center relative cursor-pointer">
                  <input type="file" onChange={(e) => setArchivo(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
                  <p className="text-[9px] font-black uppercase text-slate-500">{archivo ? archivo.name : "Subir Multimedia"}</p>
                </div>
              )}

              <button type="submit" disabled={enviando} className={`w-full ${modoLectura ? 'bg-slate-700' : 'bg-red-600 hover:bg-red-500'} text-white font-black py-4 rounded-2xl uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 transition-all`}>
                {modoLectura ? "Cerrar Vista" : (enviando ? "ENVIANDO..." : <><Send size={18} /> Confirmar Reporte</>)}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- SIDEBAR --- */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900/50 backdrop-blur-md flex flex-col fixed h-full z-20">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="bg-red-600 p-2 rounded-lg text-white shadow-lg"><Flame size={20} /></div>
          <span className="font-black tracking-tighter text-white uppercase text-lg italic">Valle del Sol</span>
        </div>
        <nav className="flex-1 p-4 space-y-2 mt-4">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-600/20"><MapIcon size={20} /> Monitoreo</button>
          <button onClick={cargarHistorial} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800 text-slate-400 rounded-xl font-medium transition-all hover:text-white"><RotateCcw size={20} /> Refrescar</button>
        </nav>
        <div className="p-4 border-t border-slate-800">
           <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-400 font-bold hover:bg-red-400/10 rounded-xl transition-all"><LogOut size={20} /> Salir</button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-black text-white uppercase tracking-tight italic">Panel Administrativo</h1>
          <div className="flex items-center gap-4 text-right">
            <div><p className="text-sm font-bold text-white uppercase italic">Bastián Mauricio</p><p className="text-[10px] text-emerald-500 font-black tracking-widest border border-emerald-500/20 px-2 py-0.5 rounded-md">Online</p></div>
            <div className="w-12 h-12 bg-slate-800 rounded-2xl border border-slate-700 flex items-center justify-center text-white font-black italic shadow-inner">BM</div>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] shadow-xl group">
              <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl w-fit mb-4 group-hover:scale-110 transition-transform`}>{stat.icon}</div>
              <p className="text-slate-500 font-bold text-[10px] uppercase mb-1 tracking-widest">{stat.label}</p>
              <h3 className="text-3xl font-black text-white tracking-tighter">{stat.value}</h3>
            </div>
          ))}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden min-h-[500px] flex flex-col shadow-2xl relative">
            {!mostrarModal && (
              <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 z-[1000]">
                <div>
                  <h3 className="font-bold text-white uppercase tracking-widest text-sm italic">Geolocalización</h3>
                  <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest italic tracking-tighter">Seleccione la posición oficial en el mapa</p>
                </div>
                <button onClick={prepararNuevoReporte} className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-full font-black uppercase text-[11px] border-2 border-red-500/50 shadow-xl active:scale-95 transition-all">Reportar Incendio</button>
              </div>
            )}

            <div className="flex-1 z-10 bg-slate-950">
              <MapContainer center={[-33.4372, -70.6506]} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <BuscadorComunas />
                <ClickMapa />
              </MapContainer>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 shadow-2xl flex flex-col h-[500px]">
            <h3 className="font-bold text-white uppercase tracking-widest text-sm mb-6 flex items-center gap-2 italic tracking-tighter"><Bell size={16} className="text-red-500" /> Historial de Alertas</h3>
            <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
              {historial.map((rep) => (
                <button 
                  key={rep.id} 
                  onClick={() => abrirDetalleReporte(rep)}
                  className="w-full bg-slate-950/40 border border-slate-800/50 p-4 rounded-2xl flex gap-4 items-start border-l-4 hover:bg-slate-800 transition-all text-left group"
                  style={{ borderLeftColor: rep.estado === 'ATENDIDO' ? '#10b981' : '#ef4444' }}
                >
                  <div className={`mt-1.5 w-2.5 h-2.5 rounded-full ${rep.estado === 'ATENDIDO' ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors tracking-tighter">{rep.titulo}</p>
                    <div className="flex justify-between items-center mt-1">
                        <p className="text-[9px] text-slate-500 font-black uppercase italic tracking-tighter">{rep.estado}</p>
                        <p className="text-[9px] text-emerald-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-tighter">Detalles →</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;