import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Trip, Participant } from '../types';
import './MapPage.css';

// Fix leaflet default marker icons
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface Props {
  trips: Trip[];
  participants: Participant[];
}

export default function MapPage({ trips, participants }: Props) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const tripsWithCoords = trips.filter(
    t => t.summitLat !== undefined && t.summitLng !== undefined
  );

  useEffect(() => {
    if (!containerRef.current) return;
    if (mapRef.current) return; // already initialised

    // Centre on Norway
    const map = L.map(containerRef.current, {
      center: [62.0, 10.5],
      zoom: 6,
      zoomControl: true,
    });

    mapRef.current = map;

    // Kartverket topografisk WMS
    L.tileLayer.wms('https://wms.geonorge.no/skwms1/wms.topo4?', {
      layers: 'topo4_WMS',
      format: 'image/png',
      transparent: false,
      attribution: '© Kartverket',
      maxZoom: 18,
    }).addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Re-render markers when trips change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear existing markers/layers except tile layers
    map.eachLayer(layer => {
      if (!(layer instanceof L.TileLayer)) map.removeLayer(layer);
    });

    tripsWithCoords.forEach(trip => {
      const color = trip.participants.length > 0
        ? (participants.find(p => p.id === trip.participants[0])?.color ?? '#4a9eff')
        : '#4a9eff';

      const icon = L.divIcon({
        className: '',
        html: `<div class="map-marker" style="background:${color};border-color:${color}">
                 <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5">
                   <path d="M3 17L8.5 6L14 13L17.5 9L21 17H3Z"/>
                 </svg>
               </div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const participantNames = trip.participants
        .map(id => participants.find(p => p.id === id)?.name ?? id)
        .join(', ');

      const popup = `
        <div class="map-popup">
          <div class="map-popup-title">${trip.summit}</div>
          <div class="map-popup-sub">${trip.name}</div>
          <div class="map-popup-meta">
            📅 ${trip.date}
            ${trip.altitude ? `· ⛰ ${trip.altitude} moh` : ''}
            ${trip.distanceKm ? `· 📏 ${trip.distanceKm} km` : ''}
            ${trip.elevationGainM ? `· ↑ ${trip.elevationGainM} m` : ''}
          </div>
          ${participantNames ? `<div class="map-popup-participants">👥 ${participantNames}</div>` : ''}
          <div class="map-popup-status map-popup-status--${trip.status}">
            ${trip.status === 'completed' ? 'Fullfort' : 'Planlagt'}
          </div>
        </div>`;

      L.marker([trip.summitLat!, trip.summitLng!], { icon })
        .addTo(map)
        .bindPopup(popup, { className: 'custom-popup' });

      // Also mark start if different
      if (
        trip.startLat !== undefined && trip.startLng !== undefined &&
        (trip.startLat !== trip.summitLat || trip.startLng !== trip.summitLng)
      ) {
        const startIcon = L.divIcon({
          className: '',
          html: `<div class="map-marker map-marker--start" style="border-color:${color}">S</div>`,
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });
        L.marker([trip.startLat, trip.startLng], { icon: startIcon }).addTo(map);
        L.polyline([[trip.startLat, trip.startLng], [trip.summitLat!, trip.summitLng!]], {
          color,
          weight: 2,
          opacity: 0.7,
          dashArray: '5,5',
        }).addTo(map);
      }
    });

    // Fit bounds if markers exist
    if (tripsWithCoords.length > 0) {
      const bounds = L.latLngBounds(
        tripsWithCoords.map(t => [t.summitLat!, t.summitLng!] as L.LatLngTuple)
      );
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }
  }, [trips, participants]);

  return (
    <div className="map-page">
      <div className="page-header">
        <h1>Kart</h1>
        <p className="text-secondary">
          {tripsWithCoords.length > 0
            ? `Viser ${tripsWithCoords.length} tur${tripsWithCoords.length !== 1 ? 'er' : ''} med koordinater`
            : 'Legg til koordinater på turene for å se dem på kartet'}
        </p>
      </div>

      <div className="map-wrapper card" ref={containerRef} style={{ height: '520px', padding: 0 }} />

      {tripsWithCoords.length === 0 && (
        <div className="card map-hint">
          <p className="text-secondary">
            Ingen turer har koordinater ennå. Rediger en tur og fyll inn bredde- og lengdegrad for topp for å se den her.
          </p>
        </div>
      )}

      {tripsWithCoords.length > 0 && (
        <div className="map-legend card">
          <h3>Forklaring</h3>
          <div className="legend-items">
            {participants.map(p => {
              const count = tripsWithCoords.filter(t => t.participants.includes(p.id)).length;
              if (count === 0) return null;
              return (
                <div key={p.id} className="legend-item">
                  <div className="legend-dot" style={{ background: p.color }} />
                  <span>{p.name}</span>
                  <span className="text-muted">({count} tur{count !== 1 ? 'er' : ''})</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
