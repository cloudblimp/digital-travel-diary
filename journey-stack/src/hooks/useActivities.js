import { useState, useCallback } from 'react';
import apiClient from '../services/apiClient';
import { useAuth } from '../contexts/AuthContext';

export function useActivities() {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const { currentUser } = useAuth();

  const createActivity = useCallback(async (tripId, activityData) => {
    const { title, dateTime, location, description, type } = activityData;

    if (!currentUser) throw new Error('User must be authenticated to create an activity');
    if (!title || !dateTime) throw new Error('Title and date are required');

    setLoading(true);
    setError(null);

    try {
      const { data } = await apiClient.post(`/trips/${tripId}/activities`, {
        title,
        dateTime,
        location: location || '',
        description: description || '',
        type: type || 'Activity',
      });
      return data.activity;
    } catch (err) {
      const msg = err.response?.data?.error || err.message;
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const deleteActivity = useCallback(async (activityId) => {
    try {
      await apiClient.delete(`/activities/${activityId}`);
    } catch (err) {
      const msg = err.response?.data?.error || err.message;
      setError(msg);
      throw new Error(msg);
    }
  }, [currentUser]);

  const updateActivity = useCallback(async (activityId, updates) => {
    try {
      const { data } = await apiClient.patch(`/activities/${activityId}`, updates);
      return data.activity;
    } catch (err) {
      const msg = err.response?.data?.error || err.message;
      setError(msg);
      throw new Error(msg);
    }
  }, [currentUser]);

  return { createActivity, deleteActivity, updateActivity, loading, error };
}
