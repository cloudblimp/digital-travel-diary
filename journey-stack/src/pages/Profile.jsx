import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../services/apiClient';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FaCamera, FaSpinner, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { currentUser, updateCurrentUser } = useAuth();
  const navigate = useNavigate();
  const [displayName,          setDisplayName]          = useState('');
  const [profileImage,         setProfileImage]         = useState(null);
  const [profileImagePreview,  setProfileImagePreview]  = useState(null);
  const [loading,              setLoading]              = useState(false);
  const [saving,               setSaving]               = useState(false);
  const [stats,                setStats]                = useState({ totalTrips: 0, entriesWritten: 0, tripsShared: 0 });

  useEffect(() => {
    if (!currentUser) { navigate('/login'); return; }

    setDisplayName(currentUser.displayName || '');
    if (currentUser.photoUrl) setProfileImagePreview(currentUser.photoUrl);

    setLoading(true);
    apiClient.get('/users/me/stats')
      .then(({ data }) => setStats(data.stats))
      .catch(err => console.error('Failed to load stats:', err))
      .finally(() => setLoading(false));
  }, [currentUser, navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setProfileImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('displayName', displayName);
      if (profileImage) formData.append('photo', profileImage);

      const { data } = await apiClient.patch('/users/me', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      updateCurrentUser({ displayName: data.user.displayName, photoUrl: data.user.photoUrl });
      setProfileImage(null);
      toast.success('Profile updated! 👤');
    } catch (err) {
      toast.error(`Error: ${err.response?.data?.error || err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (!currentUser) return null;

  const userInitial = displayName?.[0]?.toUpperCase() || currentUser.email?.[0]?.toUpperCase() || '?';

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 py-12 px-4 sm:px-6 lg:px-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="max-w-2xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-emerald-400 hover:text-emerald-300 active:scale-95 mb-8 transition-all px-2 py-2 rounded hover:bg-emerald-500/10"
        >
          <FaArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>

        <div className="bg-slate-900/80 backdrop-blur-md rounded-xl shadow-2xl p-8 border border-emerald-500/30">
          <h1 className="text-3xl font-bold text-white mb-8">My Profile</h1>

          {/* Profile Picture */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-emerald-100 mb-4">Profile Picture</label>
            <div className="flex items-center space-x-8">
              <div className="relative">
                {profileImagePreview ? (
                  <img src={profileImagePreview} alt="Profile" className="h-24 w-24 rounded-full object-cover border-2 border-emerald-500" />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-emerald-600 text-white flex items-center justify-center text-3xl font-bold">
                    {userInitial}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <label className="flex items-center justify-center px-6 py-3 border-2 border-dashed border-emerald-500/40 rounded-lg cursor-pointer hover:border-emerald-500/60 hover:bg-emerald-500/5 transition-all">
                  <div className="flex items-center space-x-2 text-emerald-200">
                    <FaCamera className="h-5 w-5" />
                    <span>Upload Picture</span>
                  </div>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
                <p className="text-xs text-emerald-200/60 mt-2">JPG, PNG or GIF (max 5MB)</p>
              </div>
            </div>
          </div>

          {/* Display Name */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-emerald-100 mb-2">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="Enter your display name"
              className="w-full px-4 py-2 border border-emerald-500/30 rounded-lg bg-slate-800/50 text-white placeholder-emerald-200/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
            />
          </div>

          {/* Travel Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8 bg-slate-800/50 p-6 rounded-lg border border-emerald-500/20">
            <div>
              <p className="text-emerald-200/60 text-sm">Trips Owned</p>
              <p className="text-3xl font-bold text-emerald-400">
                {loading ? <FaSpinner className="animate-spin" /> : stats.tripsOwned ?? 0}
              </p>
            </div>
            <div>
              <p className="text-emerald-200/60 text-sm">Shared Trips</p>
              <p className="text-3xl font-bold text-purple-400">
                {loading ? <FaSpinner className="animate-spin" /> : stats.tripsShared ?? 0}
              </p>
            </div>
            <div>
              <p className="text-emerald-200/60 text-sm">Entries Written</p>
              <p className="text-3xl font-bold text-emerald-400">
                {loading ? <FaSpinner className="animate-spin" /> : stats.entriesWritten ?? 0}
              </p>
            </div>
          </div>

          {/* Email (read-only) */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-emerald-100 mb-2">Email Address</label>
            <input
              type="email"
              value={currentUser.email}
              disabled
              className="w-full px-4 py-2 border border-emerald-500/30 rounded-lg bg-slate-800/50 text-emerald-200/60"
            />
            <p className="text-xs text-emerald-200/40 mt-2">To change your email, go to Account Settings</p>
          </div>

          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="w-full bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium transition-colors"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
