import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import apiClient from '../services/apiClient';
import { connectSocket, disconnectSocket } from '../services/socket';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ─── Rehydrate user from stored token on mount ──────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setLoading(false);
      return;
    }

    apiClient.get('/auth/me')
      .then(({ data }) => {
        setCurrentUser(data.user);
        connectSocket();
      })
      .catch(() => {
        localStorage.removeItem('accessToken');
      })
      .finally(() => setLoading(false));
  }, []);

  // ─── Signup ──────────────────────────────────────────────────────────────
  const signup = useCallback(async (email, password, displayName) => {
    const { data } = await apiClient.post('/auth/signup', { email, password, displayName });
    localStorage.setItem('accessToken', data.token);
    setCurrentUser(data.user);
    connectSocket();
    return data.user;
  }, []);

  // ─── Login ───────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const { data } = await apiClient.post('/auth/login', { email, password });
    localStorage.setItem('accessToken', data.token);
    setCurrentUser(data.user);
    connectSocket();
    return data.user;
  }, []);

  // ─── Logout ──────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch { /* ok — clear anyway */ }
    localStorage.removeItem('accessToken');
    disconnectSocket();
    setCurrentUser(null);
  }, []);

  // ─── Google OAuth ─────────────────────────────────────────────────────────
  // Redirects browser to server; server redirects back to /auth/callback?token=…
  const signInWithGoogle = useCallback(() => {
    // In production, use relative path. In dev, use port 5001.
    const apiBase = import.meta.env.PROD 
      ? '/api' 
      : (import.meta.env.VITE_API_URL || 'http://localhost:5001/api');
    window.location.href = `${apiBase}/auth/google`;
  }, []);

  // ─── Reset password (send email) ─────────────────────────────────────────
  const resetPassword = useCallback(async (email) => {
    await apiClient.post('/auth/forgot-password', { email });
  }, []);

  // ─── Update local user state (used after profile edits) ──────────────────
  const updateCurrentUser = useCallback((updates) => {
    setCurrentUser(prev => prev ? { ...prev, ...updates } : prev);
  }, []);

  const value = {
    currentUser,
    loading,
    signup,
    login,
    logout,
    signInWithGoogle,
    resetPassword,
    updateCurrentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
