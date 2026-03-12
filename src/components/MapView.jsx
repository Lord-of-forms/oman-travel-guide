import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet Vite icon bug
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const CATEGORY_COLORS = {
  'wüste': '#FF8C42',
  'desert': '#FF8C42',
  'wasser': '#4FC3F7',
  'water': '#4FC3F7',
  'gebirge': '#90A4AE',
  'mountain': '#90A4AE',
  'kultur': '#D4AF37',
  'culture': '#D4AF37',
  'küste': '#26C6DA',
  'coast': '#26C6DA',
};

function getCategoryColor(category) {
  return CATEGORY_COLORS[category?.toLowerCase()] || '#ffffff';
}

const MapView = ({ experiences = [], destination, onDetailOpen }) => {
  const centerLat = destination?.centerLat || 22.5;
  const centerLng = destination?.centerLng || 57.5;
  const placesWithCoords = experiences.filter(e => e.lat != null && e.lng != null);

  return (
    <div className="map-container-wrapper">
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={7}
        style={{ width: '100%', height: '100%', minHeight: '500px', borderRadius: '16px' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {placesWithCoords.map(exp => {
          const color = getCategoryColor(exp.category);
          return (
            <CircleMarker
              key={exp.id}
              center={[exp.lat, exp.lng]}
              radius={10}
              pathOptions={{
                fillColor: color,
                fillOpacity: 0.9,
                color: 'rgba(0,0,0,0.4)',
                weight: 1.5,
              }}
            >
              <Popup>
                <div className="map-popup">
                  <strong>{exp.title}</strong>
                  <span className="map-popup-category" style={{ color }}>
                    {exp.category}
                  </span>
                  <button
                    className="map-popup-btn"
                    onClick={() => onDetailOpen && onDetailOpen(exp)}
                  >
                    Öffnen
                  </button>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapView;
