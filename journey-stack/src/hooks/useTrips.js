import { useState, useCallback } from 'react';
import apiClient from '../services/apiClient';
import { useAuth } from '../contexts/AuthContext';

export function useTrips() {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const { currentUser } = useAuth();

  const createTrip = useCallback(async (tripData) => {
    const { title, destination, startDate, endDate, description, coverImageFile, locations } = tripData;

    if (!currentUser) throw new Error('User must be authenticated to create a trip');
    if (!title || !startDate || !endDate) throw new Error('Required fields are missing');

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('title',       title);
      formData.append('destination', destination || '');
      formData.append('startDate',   startDate);
      formData.append('endDate',     endDate);
      formData.append('description', description || '');
      formData.append('locations',   JSON.stringify(locations || []));
      if (coverImageFile) formData.append('coverImage', coverImageFile);

      const { data } = await apiClient.post('/trips', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      return data.trip;
    } catch (err) {
      const msg = err.response?.data?.error || err.message;
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  return { createTrip, loading, error };
}

export async function deleteTrip(tripId) {
  const { data } = await apiClient.delete(`/trips/${tripId}`);
  return data;
}

export async function archiveTrip(tripId) {
  const { data } = await apiClient.patch(`/trips/${tripId}/archive`);
  return data;
}

export async function unarchiveTrip(tripId) {
  const { data } = await apiClient.patch(`/trips/${tripId}/unarchive`);
  return data;
}