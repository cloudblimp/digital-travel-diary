import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUserPlus, FaSignOutAlt, FaTimes, FaCrown, FaShieldAlt, FaUserEdit } from 'react-icons/fa';
import apiClient from '../services/apiClient';
import { getSocket } from '../services/socket';
import { useAuth } from '../contexts/AuthContext';
import InviteModal from './InviteModal';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const ROLE_CONFIG = {
  owner:  { label: 'Owner',  icon: FaCrown,     color: 'text-yellow-400', bg: 'bg-yellow-500/20 border-yellow-500/30' },
  admin:  { label: 'Admin',  icon: FaShieldAlt, color: 'text-blue-400',   bg: 'bg-blue-500/20 border-blue-500/30' },
  editor: { label: 'Editor', icon: FaUserEdit,  color: 'text-emerald-400', bg: 'bg-emerald-500/20 border-emerald-500/30' },
};

export default function CollaboratorsPanel({ tripId, tripRole }) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [collaborators, setCollaborators] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [showInvite,    setShowInvite]    = useState(false);
  const [removingId,    setRemovingId]    = useState(null);
  const [isLeaving,     setIsLeaving]     = useState(false);

  const fetchCollaborators = useCallback(async () => {
    try {
      const { data } = await apiClient.get(`/trips/${tripId}/collaborators`);
      setCollaborators(data.collaborators);
    } catch (err) {
      console.error('Failed to load collaborators:', err);
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    if (!tripId) return;
    fetchCollaborators();
  }, [tripId, fetchCollaborators]);

  // Real-time socket updates
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const onAdded   = () => fetchCollaborators();
    const onRemoved = () => fetchCollaborators();

    socket.on('trip:collaborator_added',   onAdded);
    socket.on('trip:collaborator_removed', onRemoved);

    return () => {
      socket.off('trip:collaborator_added',   onAdded);
      socket.off('trip:collaborator_removed', onRemoved);
    };
  }, [fetchCollaborators]);

  const handleRemove = async (userId) => {
    setRemovingId(userId);
    try {
      await apiClient.delete(`/trips/${tripId}/collaborators/${userId}`);
      setCollaborators(prev => prev.filter(c => c.id !== userId));
      toast.success('Collaborator removed');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to remove collaborator');
    } finally {
      setRemovingId(null);
    }
  };

  const handleLeave = async () => {
    if (!window.confirm('Are you sure you want to leave this trip?')) return;
    setIsLeaving(true);
    try {
      await apiClient.delete(`/trips/${tripId}/leave`);
      toast.success('You left the trip');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to leave trip');
      setIsLeaving(false);
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      await apiClient.patch(`/trips/${tripId}/collaborators/${userId}/role`, { role: newRole });
      setCollaborators(prev => prev.map(c => c.id === userId ? { ...c, role: newRole } : c));
      toast.success('Role updated');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update role');
    }
  };

  const canManage = tripRole === 'owner' || tripRole === 'admin';
  const isOwner   = tripRole === 'owner';

  return (
    <>
      <div className="bg-slate-800/50 rounded-lg border border-emerald-500/30 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-white">
            Travelers
            <span className="ml-2 text-emerald-400/70 text-sm font-normal">({collaborators.length})</span>
          </h3>
          <div className="flex gap-2">
            {canManage && (
              <button
                onClick={() => setShowInvite(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-lg transition-colors font-medium"
              >
                <FaUserPlus className="h-3.5 w-3.5" />
                Invite
              </button>
            )}
            {!isOwner && tripRole && (
              <button
                onClick={handleLeave}
                disabled={isLeaving}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-red-500/20 border border-slate-600 hover:border-red-500/30 text-emerald-200 hover:text-red-400 text-sm rounded-lg transition-all font-medium disabled:opacity-50"
              >
                <FaSignOutAlt className="h-3.5 w-3.5" />
                {isLeaving ? 'Leaving...' : 'Leave'}
              </button>
            )}
          </div>
        </div>

        {/* Collaborator List */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-9 h-9 rounded-full bg-slate-700" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-slate-700 rounded w-1/2" />
                  <div className="h-2 bg-slate-700 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <AnimatePresence>
            <div className="space-y-3">
              {collaborators.map((collaborator) => {
                const roleConfig = ROLE_CONFIG[collaborator.role] || ROLE_CONFIG.editor;
                const RoleIcon   = roleConfig.icon;
                const isSelf     = collaborator.id === currentUser?.id;
                const isCollabOwner = collaborator.role === 'owner';
                const canRemoveThis = canManage && !isSelf && !isCollabOwner && (isOwner || collaborator.role !== 'admin');
                const canChangeRole = isOwner && !isSelf && !isCollabOwner;

                return (
                  <motion.div
                    key={collaborator.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-700/30 transition-colors group"
                  >
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      {collaborator.photoUrl ? (
                        <img
                          src={collaborator.photoUrl}
                          alt={collaborator.displayName}
                          className="w-9 h-9 rounded-full object-cover border-2 border-slate-600"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-bold border-2 border-slate-600">
                          {collaborator.displayName?.[0]?.toUpperCase() || '?'}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {collaborator.displayName || collaborator.email}
                        {isSelf && <span className="ml-1 text-emerald-400/60 text-xs">(you)</span>}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {canChangeRole ? (
                          <select
                            value={collaborator.role}
                            onChange={e => handleChangeRole(collaborator.id, e.target.value)}
                            className={`text-xs px-1.5 py-0.5 rounded border ${roleConfig.bg} ${roleConfig.color} bg-transparent cursor-pointer focus:outline-none`}
                          >
                            <option value="editor">Editor</option>
                            <option value="admin">Admin</option>
                          </select>
                        ) : (
                          <span className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded border ${roleConfig.bg} ${roleConfig.color}`}>
                            <RoleIcon className="h-2.5 w-2.5" />
                            {roleConfig.label}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Remove button */}
                    {canRemoveThis && (
                      <button
                        onClick={() => handleRemove(collaborator.id)}
                        disabled={removingId === collaborator.id}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50"
                        title="Remove from trip"
                      >
                        {removingId === collaborator.id ? (
                          <div className="h-3 w-3 border border-red-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <FaTimes className="h-3 w-3" />
                        )}
                      </button>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        )}
      </div>

      {/* Invite Modal */}
      <InviteModal
        isOpen={showInvite}
        onClose={() => setShowInvite(false)}
        tripId={tripId}
        onInviteSent={fetchCollaborators}
      />
    </>
  );
}
