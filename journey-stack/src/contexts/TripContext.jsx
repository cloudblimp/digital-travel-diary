import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiClient from '../services/apiClient';
import { getSocket } from '../services/socket';
import { useAuth } from './AuthContext';

const TripContext = createContext();

export function TripProvider({ children }) {
  const [allTrips, setAllTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  // ─── Fetch all trips (owned + collaborated) ─────────────────────────────
  const fetchTrips = useCallback(async () => {
    if (!currentUser) return;
    try {
      const { data } = await apiClient.get('/trips');
      setAllTrips(data.trips);
    } catch (err) {
      console.error('Failed to load trips:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) {
      setAllTrips([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchTrips();
  }, [currentUser, fetchTrips]);

  // ─── Real-time socket updates ────────────────────────────────────────────
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleTripUpdated = ({ tripId }) => {
      // Re-fetch that single trip
      apiClient.get(`/trips/${tripId}`).then(({ data }) => {
        setAllTrips(prev => prev.map(t => t.id === tripId ? { ...data.trip, myRole: t.myRole } : t));
      }).catch(() => {});
    };

    const handleTripDeleted = ({ tripId }) => {
      setAllTrips(prev => prev.filter(t => t.id !== tripId));
    };

    const handleAccessRevoked = ({ tripId }) => {
      setAllTrips(prev => prev.filter(t => t.id !== tripId));
    };

    socket.on('trip:updated',        handleTripUpdated);
    socket.on('trip:deleted',        handleTripDeleted);
    socket.on('trip:access_revoked', handleAccessRevoked);

    return () => {
      socket.off('trip:updated',        handleTripUpdated);
      socket.off('trip:deleted',        handleTripDeleted);
      socket.off('trip:access_revoked', handleAccessRevoked);
    };
  });

  // Derived lists
  const trips         = allTrips.filter(t => !t.isArchived);
  const archivedTrips = allTrips.filter(t => t.isArchived);

  const addTrip = useCallback((newTrip) => {
    setAllTrips(prev => {
      const filtered = prev.filter(t => t.id !== newTrip.id);
      return [{ ...newTrip, myRole: 'owner' }, ...filtered];
    });
  }, []);

  // Helper: get my role for a specific trip
  const myRole = useCallback((tripId) => {
    const trip = allTrips.find(t => t.id === tripId);
    return trip?.myRole || null;
  }, [allTrips]);

  return (
    <TripContext.Provider value={{
      selectedTrip,
      setSelectedTrip,
      trips,
      allTrips,
      setAllTrips,
      archivedTrips,
      addTrip,
      loading,
      fetchTrips,
      myRole,
    }}>
      {children}
    </TripContext.Provider>
  );
}

export function useTrip() {
  const context = useContext(TripContext);
  if (!context) throw new Error('useTrip must be used within TripProvider');
  return context;
}