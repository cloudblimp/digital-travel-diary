import React, { useState, useRef, useEffect } from 'react';
import { FaTimes, FaSpinner, FaMapPin, FaMapMarkerAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';
import apiClient from '../services/apiClient';

export default function LocationModal({ isOpen, onClose, tripId, existingLocations = [], onLocationsUpdated }) {
  const [locations, setLocations] = useState([]);
  const [locationInput, setLocationInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isGeocodingLoading, setIsGeocodingLoading] = useState(false);
  const [geocodingError, setGeocodingError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const debounceTimerRef = useRef(null);

  // Sync local state with existing locations when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocations(existingLocations.map((loc, i) => ({ ...loc, id: loc.id || Date.now() + i })));
      setLocationInput('');
      setSuggestions([]);
      setGeocodingError(null);
    }
  }, [isOpen, existingLocations]);

  // Prevent background scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  // Debounced location search
  const handleLocationInputChange = (value) => {
    setLocationInput(value);

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    if (!value.trim()) {
      setSuggestions([]);
      return;
    }

    debounceTimerRef.current = setTimeout(async () => {
      setIsLoadingSuggestions(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(value)}&format=json&limit=5`
        );
        const data = await response.json();
        setSuggestions(data || []);
      } catch (err) {
        console.error('Error fetching suggestions:', err);
        setSuggestions([]);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 800);
  };

  const handleSuggestionSelect = (suggestion) => {
    const { lat, lon, display_name } = suggestion;
    const newLocation = {
      id: Date.now(),
      name: display_name,
      lat: parseFloat(lat),
      lng: parseFloat(lon),
    };
    setLocations(prev => [...prev, newLocation]);
    setLocationInput('');
    setSuggestions([]);
    toast.success(`📍 ${display_name.split(',')[0]} added`);
  };

  const handleGetCoordinates = async () => {
    if (!locationInput.trim()) return;

    setIsGeocodingLoading(true);
    setGeocodingError(null);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationInput)}&format=json&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        handleSuggestionSelect(data[0]);
      } else {
        setGeocodingError('Location not found. Try a different search.');
        toast.error('Location not found');
      }
    } catch (err) {
      setGeocodingError('Error searching location');
      console.error(err);
    } finally {
      setIsGeocodingLoading(false);
    }
  };

  const handleRemoveLocation = (id) => {
    setLocations(prev => prev.filter(loc => loc.id !== id));
    toast.success('Location removed');
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Strip the temporary `id` field before saving (server doesn't need it)
      const cleanLocations = locations.map(({ name, lat, lng }) => ({ name, lat, lng }));
      const { data } = await apiClient.patch(`/trips/${tripId}`, { locations: cleanLocations });

      toast.success('Locations updated! 🗺️');
      onLocationsUpdated(data.trip.locations || cleanLocations);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update locations');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 sm:items-center overflow-hidden">
      <div className="w-full max-w-lg my-4 sm:my-auto max-h-[calc(100vh-2rem)] flex flex-col border shadow-2xl rounded-xl bg-slate-900/95 border-emerald-500/30 backdrop-blur-xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-emerald-500/20 flex-shrink-0">
          <div>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <FaMapMarkerAlt className="text-emerald-400" /> Manage Locations
            </h3>
            <p className="text-xs text-emerald-200/60 mt-1">Add stops that will appear on your Map View</p>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-400/60 hover:text-emerald-400 transition-colors"
            disabled={isSaving}
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Search Input */}
          <div className="relative">
            <label className="block text-sm font-medium text-emerald-100 mb-2">Search & Add Location</label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={locationInput}
                  onChange={(e) => handleLocationInputChange(e.target.value)}
                  placeholder="e.g. Ujjain, Delhi, Goa..."
                  className="w-full px-3 py-2 border border-emerald-500/30 rounded-lg bg-slate-800/50 text-white placeholder-emerald-200/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleGetCoordinates())}
                />

                {/* Suggestions Dropdown */}
                {suggestions.length > 0 && locationInput.trim() && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-emerald-500/30 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                    {suggestions.map((s, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSuggestionSelect(s)}
                        className="w-full text-left px-3 py-2 text-sm text-emerald-100 hover:bg-emerald-500/20 transition-colors border-b border-emerald-500/10 last:border-b-0 flex items-center gap-2"
                      >
                        <FaMapPin className="h-3 w-3 text-emerald-400 flex-shrink-0" />
                        <span className="truncate">{s.display_name}</span>
                      </button>
                    ))}
                  </div>
                )}

                {isLoadingSuggestions && locationInput.trim() && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-emerald-500/30 rounded-lg p-3 z-50">
                    <div className="flex items-center gap-2 text-sm text-emerald-200">
                      <FaSpinner className="animate-spin h-4 w-4" /> Searching...
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleGetCoordinates}
                disabled={isGeocodingLoading || !locationInput.trim()}
                className="px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-all flex items-center gap-2 font-medium min-h-[44px]"
              >
                {isGeocodingLoading ? <FaSpinner className="animate-spin" /> : <FaMapPin />}
              </button>
            </div>
            {geocodingError && <p className="text-sm text-red-400 mt-1">{geocodingError}</p>}
          </div>

          {/* Locations List */}
          <div>
            <label className="block text-sm font-medium text-emerald-100 mb-2">
              Trip Stops ({locations.length})
            </label>
            {locations.length === 0 ? (
              <div className="rounded-lg border border-dashed border-emerald-500/30 p-6 text-center">
                <FaMapMarkerAlt className="h-8 w-8 text-emerald-400/30 mx-auto mb-2" />
                <p className="text-sm text-emerald-200/50">No locations added yet</p>
                <p className="text-xs text-emerald-200/30 mt-1">Search above to add trip stops</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {locations.map((loc, index) => (
                  <div
                    key={loc.id}
                    className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg group hover:bg-emerald-500/15 transition-colors"
                  >
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-emerald-100 truncate font-medium">{loc.name}</p>
                      <p className="text-xs text-emerald-200/50">{loc.lat?.toFixed(4)}, {loc.lng?.toFixed(4)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveLocation(loc.id)}
                      className="text-red-400/60 hover:text-red-400 transition-colors p-1 rounded hover:bg-red-500/10"
                    >
                      <FaTimes className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-emerald-500/20 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-3 text-sm font-medium text-emerald-200 bg-slate-800/50 border border-emerald-500/30 rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-all min-h-[44px]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-3 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2 transition-all min-h-[44px]"
          >
            {isSaving ? (
              <>
                <FaSpinner className="animate-spin h-4 w-4" /> Saving...
              </>
            ) : (
              'Save Locations'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
