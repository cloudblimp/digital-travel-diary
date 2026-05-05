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
function MapBounds({ locations }) {
  const map = useMap();

  useMemo(() => {
    if (locations && locations.length > 0) {
      const bounds = L.latLngBounds(
        locations.map(location => [location.lat, location.lng])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [locations, map]);

  return null;
}

export default function TripLocationMap({ locations = [] }) {
  // Filter locations with valid coordinates
  const validLocations = useMemo(() => {
    return locations.filter(loc => loc && loc.lat && loc.lng);
  }, [locations]);

  // Don't render if no valid locations
  if (validLocations.length === 0) {
    return null;
  }

  // Create polyline path from locations in order
  const polylinePath = validLocations.map(location => [
    location.lat,
    location.lng
  ]);

  // Calculate initial center (first location)
  const center = [validLocations[0].lat, validLocations[0].lng];

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden shadow-2xl mb-8 border border-emerald-500/30 relative z-0">
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
        <MapBounds locations={validLocations} />

        {/* Draw polyline connecting all stops in order */}
        {polylinePath.length > 1 && (
          <Polyline
            positions={polylinePath}
            color="#10b981"
            weight={3}
            opacity={0.8}
            dashArray="5, 5"
          />
        )}

        {/* Render markers for each location stop */}
        {validLocations.map((location, index) => (
          <Marker
            key={index}
            position={[location.lat, location.lng]}
            icon={defaultIcon}
          >
            <Popup>
              <div className="min-w-[200px]">
                <h3 className="font-bold text-sm mb-1 text-slate-900">{location.name}</h3>
                <p className="text-xs text-emerald-700 mb-2">
                  {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                </p>
                <p className="text-xs text-emerald-600">Stop {index + 1} of {validLocations.length}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
