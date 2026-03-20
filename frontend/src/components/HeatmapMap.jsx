import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useMemo } from 'react';

// Kerala center coordinates
const KERALA_CENTER = [10.8505, 76.2711];

export default function HeatmapMap({ heatmapData, loading }) {
  if (loading) {
    return (
      <div className="glass-card h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-400">Loading map...</p>
        </div>
      </div>
    );
  }

  // Calculate dynamic radii based on severity weight
  const getRadius = (weight) => Math.min(15 + weight * 5, 45);

  const getColor = (weight) => {
    if (weight >= 4.5) return '#ef4444'; // Red
    if (weight >= 3.5) return '#f97316'; // Orange
    if (weight >= 2.5) return '#eab308'; // Yellow
    if (weight >= 1.5) return '#3b82f6'; // Blue
    return '#22c55e'; // Green
  };

  return (
    <div className="glass-card overflow-hidden h-full relative isolate z-0">
      <MapContainer
        center={KERALA_CENTER}
        zoom={7}
        style={{ height: '100%', width: '100%', borderRadius: '0.75rem', zIndex: 0 }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />
        {heatmapData?.map((point, i) => (
          <CircleMarker
            key={i}
            center={[point.lat, point.lng]}
            radius={getRadius(point.weight)}
            pathOptions={{
              color: getColor(point.weight),
              fillColor: getColor(point.weight),
              fillOpacity: 0.6,
              weight: 0,
            }}
          />
        ))}
      </MapContainer>
    </div>
  );
}
