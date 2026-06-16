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

const FireIcon = L.divIcon({
  html: `<div class="emergency-fire-marker"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5"><path d="M12 22c4.4 0 8-3.1 8-7.5 0-3.1-1.7-5.8-4.7-8.5.1 2.4-1.2 3.8-2.4 4.6.2-3.5-1.7-6.7-5-8.6.3 4.3-3.9 6.5-3.9 12.5C4 18.9 7.6 22 12 22Z"/><path fill="#fde68a" stroke="none" d="M12 19c-1.8 0-3.2-1.2-3.2-3 0-1.7 1.1-2.8 2.4-4.2.1 1.5.8 2.2 1.5 2.7.6-.7 1-1.6 1-2.7 1.1 1.1 1.5 2.5 1.5 4.2 0 1.8-1.4 3-3.2 3Z"/></svg></div>`,
  className: 'custom-fire-icon',
  iconSize: [42, 42],
  iconAnchor: [21, 36],
  popupAnchor: [0, -34]
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

function BuscadorComunas({ activo, setDatosReporte }) {
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
      if (activo) setDatosReporte(prev => ({ ...prev, latitud: lat, longitud: lng }));
      map.setView(e.geocode.center, 16);
    }).addTo(map);

    return () => map.removeControl(control);
  }, [activo, map, setDatosReporte]);
  return null;
}

// 1. Modificacion central: ClickMapa ya no abre el modal, solo mueve el pin.
function ClickMapa({ activo, setDatosReporte, onLocationSelected, lat, lng }) {
  useMapEvents({
    click(e) {
      if (!activo) return;
      setDatosReporte(prev => ({ ...prev, latitud: e.latlng.lat, longitud: e.latlng.lng }));
      onLocationSelected?.(e.latlng.lat, e.latlng.lng);
    },
  });

  if (!activo) return null;
  const numLat = Number(lat);
  const numLng = Number(lng);

  if (isNaN(numLat) || isNaN(numLng)) return null;
  return <Marker position={[numLat, numLng]} />;
}

export default function EmergencyMap({
  user,
  historial,
  selectedCoords,
  datosReporte,
  setDatosReporte,
  abrirDetalleReporte,
  prepararNuevoReporte,
  canSelectLocation = false,
  locationSelectionActive = false,
  onStartLocationSelection,
  onLocationSelected,
  compact = false
}) {
  const [responderCoords] = useState([-33.4500, -70.6650]);
  const [mapType, setMapType] = useState('roadmap');

  const abrirRutaGoogleMaps = (lat, lng) => {
    const gMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${Number(lat)},${Number(lng)}&travelmode=driving`;
    window.open(gMapsUrl, '_blank');
  };

  const safeSelectedCoords = selectedCoords && !isNaN(Number(selectedCoords[0])) && !isNaN(Number(selectedCoords[1]))
    ? [Number(selectedCoords[0]), Number(selectedCoords[1])]
    : null;

  return (
    <div className={`lg:col-span-2 bg-slate-900 border border-slate-800 overflow-hidden min-h-[500px] flex flex-col shadow-2xl relative ${compact ? 'rounded-3xl' : 'rounded-[2.5rem]'}`}>
      <div className={`${compact ? 'px-5 py-3' : 'p-6'} border-b border-slate-800 flex justify-between items-center bg-slate-900/50 z-10`}>
        <div>
          <h3 className="font-bold text-white uppercase tracking-widest text-sm italic">Geolocalización</h3>
          <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest italic">
            {canSelectLocation
              ? (locationSelectionActive ? 'Haz clic en el lugar exacto de la emergencia' : 'Activa el modo de reporte para marcar una emergencia')
              : 'Monitoreo geográfico satelital de focos'}
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

          {/* 2. El boton envia las coordenadas actuales del pin */}
          {canSelectLocation && (
            <button
              onClick={() => {
                if (!locationSelectionActive) {
                  onStartLocationSelection?.();
                  return;
                }
                if (datosReporte?.latitud == null || datosReporte?.longitud == null) return;
                prepararNuevoReporte?.(datosReporte?.latitud, datosReporte?.longitud);
              }}
              disabled={locationSelectionActive && (datosReporte?.latitud == null || datosReporte?.longitud == null)}
              className="px-6 py-3 bg-red-600 hover:bg-red-500 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-crosshair text-white rounded-full font-black uppercase text-[10px] tracking-widest shadow-xl transition-all"
            >
              {!locationSelectionActive ? 'Marcar Emergencia' : datosReporte?.latitud == null ? 'Selecciona en el mapa' : 'Registrar Foco'}
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
            attribution="© Google Maps"
          />

          <BuscadorComunas
            activo={canSelectLocation && locationSelectionActive}
            setDatosReporte={setDatosReporte}
          />

          <ClickMapa
            activo={canSelectLocation && locationSelectionActive}
            setDatosReporte={setDatosReporte}
            onLocationSelected={onLocationSelected}
            lat={datosReporte?.latitud}
            lng={datosReporte?.longitud}
          />

          {safeSelectedCoords && <MapController targetCoords={safeSelectedCoords} />}

          {historial.filter(rep => rep.estado !== 'RESUELTO').map((rep) => {
            const lat = Number(rep.latitud);
            const lng = Number(rep.longitud);
            if (isNaN(lat) || isNaN(lng)) return null;
            return (
              <Marker
                key={rep.id}
                position={[lat, lng]}
                icon={FireIcon}
                eventHandlers={{
                  click: () => abrirDetalleReporte(rep)
                }}
              >
                <Popup className="custom-popup">
                  <div className="p-1 font-sans text-slate-800">
                    <p className="font-black text-sm uppercase">{rep.titulo}</p>
                    <p className="text-xs text-red-650 font-black uppercase mt-1 tracking-wider">{rep.estado}</p>
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
