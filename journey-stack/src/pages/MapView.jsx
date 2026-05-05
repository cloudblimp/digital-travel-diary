import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTrip } from '../contexts/TripContext';
import TripLocationMap from '../components/TripLocationMap';
import { FaArrowLeft, FaSpinner } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';

export default function MapView() {
  const { currentUser } = useAuth();
  const { trips, loading } = useTrip();
  const navigate = useNavigate();

  // Get all trips with locations
  const tripsWithLocations = trips.filter(trip => trip.locations && trip.locations.length > 0);
  
  // Aggregate all locations from all trips
  const allLocations = tripsWithLocations.reduce((acc, trip) => {
    return [...acc, ...trip.locations];
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin h-12 w-12 text-emerald-400 mx-auto mb-4" />
          <p className="text-emerald-200">Loading your trips...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-emerald-200">Please log in to view your map</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Your Travel Map</h1>
            <p className="text-emerald-200/70 mt-2 text-sm sm:text-base">
              All your trip destinations visualized on one map
            </p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center px-3 sm:px-4 py-2 sm:py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 active:bg-emerald-800 active:scale-95 transition-all duration-75 font-medium text-sm sm:text-base min-h-10 sm:min-h-11"
          >
            <FaArrowLeft className="mr-2 h-4 w-4" /> Back to Trips
          </button>
        </div>

        {/* Empty State */}
        {tripsWithLocations.length === 0 && (
          <div className="bg-slate-800/50 backdrop-blur-md rounded-lg border border-emerald-500/30 p-8 sm:p-12 text-center">
            <p className="text-emerald-100 mb-4 text-sm sm:text-base">
              No trips with location stops found.
            </p>
            <p className="text-emerald-200/60 text-xs sm:text-sm">
              Create a trip and add location stops with coordinates to see them on the map.
            </p>
          </div>
        )}

        {/* Map */}
        {tripsWithLocations.length > 0 && (
          <div>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
              <div className="bg-slate-800/50 backdrop-blur-md rounded-lg border border-emerald-500/30 p-4">
                <p className="text-xs sm:text-sm text-emerald-200/70">Trips with Locations</p>
                <p className="text-xl sm:text-2xl font-bold text-emerald-100 mt-2">{tripsWithLocations.length}</p>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-md rounded-lg border border-emerald-500/30 p-4">
                <p className="text-xs sm:text-sm text-emerald-200/70">Total Location Stops</p>
                <p className="text-xl sm:text-2xl font-bold text-emerald-100 mt-2">{allLocations.length}</p>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-md rounded-lg border border-emerald-500/30 p-4">
                <p className="text-xs sm:text-sm text-emerald-200/70">All Trips</p>
                <p className="text-xl sm:text-2xl font-bold text-emerald-100 mt-2">{trips.length}</p>
              </div>
            </div>

            {/* Global Map */}
            {allLocations.length > 0 && (
              <div className="bg-slate-800/50 backdrop-blur-md rounded-lg border border-emerald-500/30 p-4 sm:p-6 mb-8">
                <h2 className="text-lg sm:text-xl font-semibold mb-4 text-white">All Your Trip Destinations</h2>
                <TripLocationMap locations={allLocations} />
              </div>
            )}

            {/* Per-trip breakdown */}
            {tripsWithLocations.length > 1 && (
              <div className="mt-8">
                <h2 className="text-xl sm:text-2xl font-semibold mb-6 text-white">Trip Breakdown</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {tripsWithLocations.map(trip => (
                    <div key={trip.id} className="bg-slate-800/50 backdrop-blur-md rounded-lg border border-emerald-500/30 p-4 sm:p-6">
                      <h3 className="text-base sm:text-lg font-semibold mb-2 text-white">{trip.title}</h3>
                      <p className="text-xs sm:text-sm text-emerald-200/70 mb-4">{trip.locations.length} location stop(s)</p>
                      {trip.locations.filter(loc => loc && loc.lat && loc.lng).length > 0 ? (
                        <TripLocationMap locations={trip.locations} />
                      ) : (
                        <div className="h-96 bg-slate-700/50 rounded-lg flex items-center justify-center border border-emerald-500/20">
                          <p className="text-emerald-200/60 text-sm">No valid location coordinates</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
