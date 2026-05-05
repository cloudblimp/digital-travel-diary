import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { connectSocket } from '../services/socket';
import apiClient from '../services/apiClient';

/**
 * Receives the token from the Google OAuth redirect:
 *   /auth/callback?token=<accessToken>
 * Stores the token, fetches user info, then redirects to the dashboard.
 */
export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      navigate('/login?error=oauth_failed');
      return;
    }

    if (!token) {
      navigate('/login');
      return;
    }

    // Store token and fetch user to populate AuthContext
    localStorage.setItem('accessToken', token);

    apiClient.get('/auth/me')
      .then(({ data }) => {
        connectSocket();
        // AuthContext will re-initialize on next mount via its useEffect
        navigate('/', { replace: true });
      })
      .catch(() => {
        localStorage.removeItem('accessToken');
        navigate('/login?error=auth_failed');
      });
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin inline-block w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full mb-4" />
        <p className="text-emerald-200 text-lg">Signing you in...</p>
      </div>
    </div>
  );
}
