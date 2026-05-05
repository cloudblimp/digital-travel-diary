import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPlane, FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaMapMarkerAlt } from 'react-icons/fa';
import apiClient from '../services/apiClient';
import { getSocket } from '../services/socket';
import { useTrip } from '../contexts/TripContext';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  pending:  { label: 'Pending',  icon: FaHourglassHalf,  color: 'text-yellow-400',  bg: 'bg-yellow-500/10 border-yellow-500/20' },
  accepted: { label: 'Accepted', icon: FaCheckCircle,    color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  declined: { label: 'Declined', icon: FaTimesCircle,    color: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/20' },
};

const ROLE_BADGE = {
  editor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  admin:  'bg-blue-500/20 text-blue-300 border-blue-500/30',
};

export default function Invitations() {
  const navigate = useNavigate();
  const { fetchTrips } = useTrip();
  const [invitations, setInvitations] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [responding,  setResponding]  = useState(null); // invitationId being responded to

  useEffect(() => {
    loadInvitations();
  }, []);

  // Real-time new invite notification
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const onNewInvite = () => loadInvitations();
    socket.on('invite:new', onNewInvite);
    return () => socket.off('invite:new', onNewInvite);
  }, []);

  const loadInvitations = async () => {
    try {
      const { data } = await apiClient.get('/invitations');
      setInvitations(data.invitations);
    } catch (err) {
      console.error('Failed to load invitations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (invId, tripId) => {
    setResponding(invId);
    try {
      await apiClient.patch(`/invitations/${invId}/accept`);
      setInvitations(prev => prev.map(i => i.id === invId ? { ...i, status: 'accepted' } : i));
      await fetchTrips(); // refresh trips list so new trip appears in dashboard
      toast.success('Invitation accepted! The trip is now in your dashboard 🗺️');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to accept');
    } finally {
      setResponding(null);
    }
  };

  const handleDecline = async (invId) => {
    setResponding(invId);
    try {
      await apiClient.patch(`/invitations/${invId}/decline`);
      setInvitations(prev => prev.map(i => i.id === invId ? { ...i, status: 'declined' } : i));
      toast.success('Invitation declined');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to decline');
    } finally {
      setResponding(null);
    }
  };

  const pending  = invitations.filter(i => i.status === 'pending');
  const history  = invitations.filter(i => i.status !== 'pending');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-md border-b border-emerald-500/20 px-4 sm:px-6 py-4"
      >
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-emerald-500/20 rounded-lg transition-colors"
          >
            <FaArrowLeft className="text-emerald-400 h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Trip Invitations</h1>
            {pending.length > 0 && (
              <p className="text-sm text-emerald-400">{pending.length} pending {pending.length === 1 ? 'invite' : 'invites'}</p>
            )}
          </div>
        </div>
      </motion.div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-slate-800/50 border border-emerald-500/20 rounded-xl p-5 animate-pulse space-y-3">
                <div className="h-4 bg-slate-700 rounded w-1/2" />
                <div className="h-3 bg-slate-700 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : invitations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-4">✈️</div>
            <h2 className="text-xl font-semibold text-white mb-2">No invitations yet</h2>
            <p className="text-emerald-200/60 mb-6">
              When someone invites you to a trip, it'll show up here.
            </p>
            <Link to="/" className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors">
              Go to Dashboard
            </Link>
          </motion.div>
        ) : (
          <>
            {/* Pending Invitations */}
            {pending.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <FaHourglassHalf className="text-yellow-400 h-4 w-4" />
                  Pending
                </h2>
                <AnimatePresence>
                  <div className="space-y-4">
                    {pending.map((inv, i) => (
                      <motion.div
                        key={inv.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-slate-800/60 border border-yellow-500/20 rounded-2xl overflow-hidden hover:border-yellow-500/40 transition-colors"
                      >
                        {/* Trip cover strip */}
                        {inv.tripCover && (
                          <div className="h-24 w-full overflow-hidden">
                            <img src={inv.tripCover} alt={inv.tripTitle} className="w-full h-full object-cover opacity-60" />
                          </div>
                        )}

                        <div className="p-5">
                          {/* Trip info */}
                          <div className="flex items-start justify-between gap-3 mb-4">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <FaPlane className="text-emerald-400 h-4 w-4 rotate-45" />
                                <h3 className="text-lg font-semibold text-white">{inv.tripTitle}</h3>
                              </div>
                              {inv.tripDestination && (
                                <p className="text-sm text-emerald-200/60 flex items-center gap-1">
                                  <FaMapMarkerAlt className="h-3 w-3" />
                                  {inv.tripDestination}
                                </p>
                              )}
                            </div>
                            <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border font-medium ${ROLE_BADGE[inv.role]}`}>
                              {inv.role === 'admin' ? '🛡 Admin' : '✏️ Editor'}
                            </span>
                          </div>

                          {/* Invited by */}
                          <div className="flex items-center gap-2 mb-5 text-sm text-emerald-200/70">
                            {inv.invitedByPhoto ? (
                              <img src={inv.invitedByPhoto} alt={inv.invitedByName} className="w-6 h-6 rounded-full object-cover" />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold">
                                {inv.invitedByName?.[0]?.toUpperCase()}
                              </div>
                            )}
                            Invited by <span className="font-medium text-emerald-200">{inv.invitedByName}</span>
                            <span className="text-emerald-200/40 text-xs">{new Date(inv.createdAt).toLocaleDateString()}</span>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleAccept(inv.id, inv.tripId)}
                              disabled={responding === inv.id}
                              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-xl font-semibold transition-colors text-sm"
                            >
                              {responding === inv.id ? '...' : '✓ Accept'}
                            </button>
                            <button
                              onClick={() => handleDecline(inv.id)}
                              disabled={responding === inv.id}
                              className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-60 text-emerald-200 rounded-xl font-semibold transition-colors text-sm"
                            >
                              {responding === inv.id ? '...' : '✕ Decline'}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </AnimatePresence>
              </section>
            )}

            {/* History */}
            {history.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-white mb-4 text-emerald-200/60">History</h2>
                <div className="space-y-3">
                  {history.map(inv => {
                    const cfg = STATUS_CONFIG[inv.status];
                    const StatusIcon = cfg.icon;
                    return (
                      <div
                        key={inv.id}
                        className={`flex items-center justify-between p-4 rounded-xl border ${cfg.bg} opacity-60`}
                      >
                        <div>
                          <p className="text-sm font-medium text-white">{inv.tripTitle}</p>
                          <p className="text-xs text-emerald-200/50 mt-0.5">
                            From {inv.invitedByName} · {new Date(inv.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`flex items-center gap-1.5 text-xs font-medium ${cfg.color}`}>
                          <StatusIcon className="h-3.5 w-3.5" />
                          {cfg.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
