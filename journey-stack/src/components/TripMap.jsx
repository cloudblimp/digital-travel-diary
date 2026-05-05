import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icon in react-leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const defaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to handle map bounds auto-zoom
function MapBounds({ entries }) {
  const map = useMap();

  useMemo(() => {
    if (entries && entries.length > 0) {
      const bounds = L.latLngBounds(
        entries.map(entry => [entry.coordinates.lat, entry.coordinates.lng])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [entries, map]);

  return null;
}

export default function TripMap({ entries = [] }) {
  // Filter entries with valid coordinates and sort by date
  const validEntries = useMemo(() => {
    return entries
      .filter(entry => entry.coordinates && entry.coordinates.lat && entry.coordinates.lng)
      .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
  }, [entries]);

  // Don't render if no valid entries
  if (validEntries.length === 0) {
    return null;
  }

  // Create polyline path from entries in chronological order
  const polylinePath = validEntries.map(entry => [
    entry.coordinates.lat,
    entry.coordinates.lng
  ]);

  // Calculate initial center (first entry's coordinates)
  const center = [validEntries[0].coordinates.lat, validEntries[0].coordinates.lng];

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden shadow-lg mb-8 border border-gray-200 relative z-0">
      <MapContainer
        center={center}
        zoom={13}
        className="w-full h-full"
        style={{ zIndex: 1 }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Auto-zoom to fit all markers */}
        <MapBounds entries={validEntries} />

        {/* Draw polyline connecting all markers in order */}
        {polylinePath.length > 1 && (
          <Polyline
            positions={polylinePath}
            color="#1f2937"
            weight={3}
            opacity={0.8}
            dashArray="5, 5"
          />
        )}

        {/* Render markers for each entry */}
        {validEntries.map((entry, index) => (
          <Marker
            key={entry.id}
            position={[entry.coordinates.lat, entry.coordinates.lng]}
            icon={defaultIcon}
          >
            <Popup>
              <div className="min-w-[200px]">
                <h3 className="font-bold text-sm mb-1">{entry.title}</h3>
                <p className="text-xs text-gray-600 mb-1">
                  {entry.location && `📍 ${entry.location}`}
                </p>
                <p className="text-xs text-gray-600 mb-2">
                  {new Date(entry.dateTime).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
                {entry.story && (
                  <p className="text-xs text-gray-700 line-clamp-3">{entry.story}</p>
                )}
                <p className="text-xs text-blue-600 mt-1">Stop {index + 1}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
