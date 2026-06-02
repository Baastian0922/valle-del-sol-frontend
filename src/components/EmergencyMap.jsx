import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import { Geocoder as LeafletGeocoder, geocoders } from 'leaflet-control-geocoder';
import { Compass, Navigation } from 'lucide-react';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const ResponderIcon = L.divIcon({
  html: `<div class="bg-blue-600 p-2 rounded-full border border-white text-white shadow-xl animate-bounce"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>`,
  className: 'custom-responder-icon',
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

function MapController({ targetCoords }) {
  const map = useMap();
  useEffect(() => {
    if (targetCoords && targetCoords[0] !== undefined && targetCoords[1] !== undefined) {
      const lat = Number(targetCoords[0]);
      const lng = Number(targetCoords[1]);
      if (!isNaN(lat) && !isNaN(lng)) {
        map.flyTo([lat, lng], 15, { animate: true, duration: 1.5 });
      }
    }
  }, [targetCoords, map]);
  return null;
}

export default function EmergencyMap({
  user,
  historial,
  selectedCoords,
  datosReporte,
  setDatosReporte,
  modoLectura,
  abrirDetalleReporte,
  prepararNuevoReporte
}) {
  const [responderCoords] = useState([-33.4500, -70.6650]);
  const [mapType, setMapType] = useState('roadmap'); // 'roadmap' o 'satellite'

  const abrirRutaGoogleMaps = (lat, lng) => {
    const gMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${Number(lat)},${Number(lng)}&travelmode=driving`;
    window.open(gMapsUrl, '_blank');
  };

  const BuscadorComunas = () => {
    const map = useMap();
    useEffect(() => {
      const control = new LeafletGeocoder({
        geocoder: geocoders.nominatim({
          geocodingQueryParams: {
            countrycodes: 'cl'
          }
        }),
        defaultMarkGeocode: false,
        placeholder: "Buscar sector...",
      }).on('markgeocode', (e) => {
        const { lat, lng } = e.geocode.center;
        if (!modoLectura) setDatosReporte(prev => ({ ...prev, latitud: lat, longitud: lng }));
        map.setView(e.geocode.center, 16);
      }).addTo(map);
      return () => map.removeControl(control);
    }, [map]);
    return null;
  };

  const ClickMapa = () => {
    useMapEvents({
      click(e) {
        if (!modoLectura) {
          setDatosReporte(prev => ({ ...prev, latitud: e.latlng.lat, longitud: e.latlng.lng }));
        } else if (prepararNuevoReporte && (user?.role === 'USER' || user?.role === 'ADMIN' || user?.role === 'STAFF')) {
          prepararNuevoReporte(e.latlng.lat, e.latlng.lng);
        }
      },
    });
    const lat = Number(datosReporte.latitud);
    const lng = Number(datosReporte.longitud);
    if (isNaN(lat) || isNaN(lng)) return null;
    return <Marker position={[lat, lng]} />;
  };

  const safeSelectedCoords = selectedCoords && !isNaN(Number(selectedCoords[0])) && !isNaN(Number(selectedCoords[1])) 
    ? [Number(selectedCoords[0]), Number(selectedCoords[1])] 
    : null;

  return (
    <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden min-h-[500px] flex flex-col shadow-2xl relative">
      <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 z-10">
        <div>
          <h3 className="font-bold text-white uppercase tracking-widest text-sm italic">Geolocalización</h3>
          <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest italic">
            {user?.role === 'USER' ? 'Haz clic en el mapa para marcar el foco del incendio' : 'Monitoreo geográfico satelital de focos'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => setMapType(mapType === 'roadmap' ? 'satellite' : 'roadmap')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-white border border-slate-700 rounded-2xl font-black uppercase text-[9px] tracking-wider transition-all"
          >
            {mapType === 'roadmap' ? 'Ver Satélite' : 'Ver Mapa'}
          </button>

          {user?.role !== 'USER' ? (
            safeSelectedCoords && (user?.role === 'EMERGENCY_ENTITY' || user?.role === 'ADMIN') && (
              <button 
                onClick={() => abrirRutaGoogleMaps(safeSelectedCoords[0], safeSelectedCoords[1])}
                className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-black uppercase text-[10px] tracking-widest shadow-xl transition-all flex items-center gap-2 animate-pulse"
              >
                <Navigation size={13} /> GPS Turn-by-Turn
              </button>
            )
          ) : null}

          {(user?.role === 'ADMIN' || user?.role === 'STAFF') && (
            <button 
              onClick={() => prepararNuevoReporte()} 
              className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-full font-black uppercase text-[10px] tracking-widest shadow-xl transition-all"
            >
              Registrar Foco
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 z-10 bg-slate-950">
        <MapContainer center={[-33.4372, -70.6506]} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer 
            url={mapType === 'roadmap' 
              ? "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}" 
              : "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
            } 
            attribution="&copy; Google Maps"
          />
          <BuscadorComunas />
          <ClickMapa />
          
          {safeSelectedCoords && <MapController targetCoords={safeSelectedCoords} />}

          {historial.map((rep) => {
            const lat = Number(rep.latitud);
            const lng = Number(rep.longitud);
            if (isNaN(lat) || isNaN(lng)) return null;
            return (
              <Marker 
                key={rep.id} 
                position={[lat, lng]}
                eventHandlers={{
                  click: () => abrirDetalleReporte(rep)
                }}
              >
                <Popup className="custom-popup">
                  <div className="p-1 font-sans text-slate-800">
                    <p className="font-black text-sm uppercase">{rep.titulo}</p>
                    <p className="text-xs text-red-600 font-bold uppercase mt-1">{rep.estado}</p>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {user?.role === 'EMERGENCY_ENTITY' && safeSelectedCoords && (
            <>
              <Marker position={responderCoords} icon={ResponderIcon}>
                <Popup>Tu ubicación simulada en terreno</Popup>
              </Marker>
              <Polyline 
                positions={[responderCoords, safeSelectedCoords]} 
                color="#3b82f6" 
                dashArray="8, 12" 
                weight={4}
              />
            </>
          )}
        </MapContainer>
      </div>

      {user?.role === 'EMERGENCY_ENTITY' && selectedCoords && (
        <div className="absolute bottom-4 left-4 right-4 z-[20] bg-blue-950/90 border border-blue-500/20 p-4 rounded-2xl flex items-center justify-between backdrop-blur-md shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 p-2 rounded-xl text-white">
              <Compass size={18} className="animate-spin" />
            </div>
            <div>
              <h4 className="text-white font-bold text-xs uppercase tracking-wider">Ruta en Curso Calculada</h4>
              <p className="text-[10px] text-slate-400 uppercase font-semibold mt-0.5">Diferencia de posición en mapa activo</p>
            </div>
          </div>
          <button 
            onClick={() => abrirRutaGoogleMaps(selectedCoords[0], selectedCoords[1])}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase text-[9px] tracking-widest rounded-lg transition-all"
          >
            Abrir GPS
          </button>
        </div>
      )}
    </div>
  );
}
