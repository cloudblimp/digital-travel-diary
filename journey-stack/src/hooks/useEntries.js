import { useState, useCallback } from 'react';
import apiClient from '../services/apiClient';
import { useAuth } from '../contexts/AuthContext';

export function useEntries() {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const { currentUser } = useAuth();

  const createEntry = useCallback(async (tripId, entryData) => {
    const { title, dateTime, location, story, type, photoFile } = entryData;

    if (!currentUser) throw new Error('User must be authenticated to create an entry');
    if (!title || !dateTime) throw new Error('Title and date are required');

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('title',    title);
      formData.append('dateTime', dateTime);
      formData.append('location', location || '');
      formData.append('story',    story || '');
      formData.append('type',     type || 'Activity');
      if (photoFile) formData.append('photo', photoFile);

      const { data } = await apiClient.post(`/trips/${tripId}/entries`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      return data.entry;
    } catch (err) {
      const msg = err.response?.data?.error || err.message;
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  return { createEntry, loading, error };
}
