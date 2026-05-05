import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import apiClient from '../services/apiClient';
import { FaArrowLeft, FaExclamationTriangle } from 'react-icons/fa';

export default function AccountSettings() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [currentPassword,  setCurrentPassword]  = useState('');
  const [newPassword,      setNewPassword]      = useState('');
  const [confirmPassword,  setConfirmPassword]  = useState('');
  const [newEmail,         setNewEmail]         = useState(currentUser?.email || '');
  const [emailPassword,    setEmailPassword]    = useState('');
  const [deleteConfirm,    setDeleteConfirm]    = useState('');

  const [loadingPassword, setLoadingPassword] = useState(false);
  const [loadingEmail,    setLoadingEmail]    = useState(false);
  const [loadingDelete,   setLoadingDelete]   = useState(false);

  const [message,     setMessage]     = useState('');
  const [messageType, setMessageType] = useState('');

  const showMessage = (text, type = 'success') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(''), 4000);
  };

  // ─── Change Password ──────────────────────────────────────────────────────
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) return toast.error('All fields are required');
    if (newPassword !== confirmPassword) return toast.error('New passwords do not match');
    if (newPassword.length < 6) return toast.error('New password must be at least 6 characters');

    setLoadingPassword(true);
    try {
      await apiClient.patch('/auth/change-password', { currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password changed! 🔒');
    } catch (err) {
      toast.error(err.response?.data?.error || err.message);
    } finally {
      setLoadingPassword(false);
    }
  };

  // ─── Change Email ─────────────────────────────────────────────────────────
  const handleChangeEmail = async (e) => {
    e.preventDefault();

    if (!newEmail) return showMessage('Email is required', 'error');
    if (newEmail === currentUser.email) return showMessage('This is already your email', 'error');
    if (!emailPassword) return showMessage('Password is required to confirm', 'error');

    setLoadingEmail(true);
    try {
      await apiClient.patch('/auth/change-email', { newEmail, password: emailPassword });
      setEmailPassword('');
      showMessage('Email changed! ✅');
    } catch (err) {
      showMessage(err.response?.data?.error || err.message, 'error');
    } finally {
      setLoadingEmail(false);
    }
  };

  // ─── Delete Account ───────────────────────────────────────────────────────
  const handleDeleteAccount = async (e) => {
    e.preventDefault();

    if (deleteConfirm !== 'DELETE') return showMessage('Type "DELETE" to confirm', 'error');

    setLoadingDelete(true);
    try {
      await apiClient.delete('/users/me');
      await logout();
      navigate('/signup');
    } catch (err) {
      showMessage(err.response?.data?.error || err.message, 'error');
    } finally {
      setLoadingDelete(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-emerald-400 hover:text-emerald-300 active:scale-95 mb-8 transition-all px-2 py-2 rounded hover:bg-emerald-500/10"
        >
          <FaArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>

        <div className="bg-slate-900/80 backdrop-blur-md rounded-xl shadow-2xl p-8 border border-emerald-500/30">
          <h1 className="text-3xl font-bold text-white mb-8">Account Settings</h1>

          {message && (
            <div className={`mb-6 p-4 rounded-lg ${messageType === 'error' ? 'bg-red-500/20 text-red-200 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/30'}`}>
              {message}
            </div>
          )}

          {/* Change Password */}
          <div className="mb-10 pb-10 border-b border-emerald-500/20">
            <h2 className="text-xl font-semibold text-white mb-6">Change Password</h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              {[
                { label: 'Current Password',     value: currentPassword, setter: setCurrentPassword },
                { label: 'New Password',         value: newPassword,     setter: setNewPassword },
                { label: 'Confirm New Password', value: confirmPassword, setter: setConfirmPassword },
              ].map(({ label, value, setter }) => (
                <div key={label}>
                  <label className="block text-sm font-medium text-emerald-100 mb-2">{label}</label>
                  <input
                    type="password"
                    value={value}
                    onChange={e => setter(e.target.value)}
                    className="w-full px-4 py-2 border border-emerald-500/30 rounded-lg bg-slate-800/50 text-white placeholder-emerald-200/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                  />
                </div>
              ))}
              <button
                type="submit"
                disabled={loadingPassword}
                className="w-full bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium transition-colors"
              >
                {loadingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>

          {/* Change Email */}
          <div className="mb-10 pb-10 border-b border-emerald-500/20">
            <h2 className="text-xl font-semibold text-white mb-6">Change Email</h2>
            <form onSubmit={handleChangeEmail} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-emerald-100 mb-2">New Email Address</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-emerald-500/30 rounded-lg bg-slate-800/50 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-emerald-100 mb-2">Password (to confirm)</label>
                <input
                  type="password"
                  value={emailPassword}
                  onChange={e => setEmailPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-emerald-500/30 rounded-lg bg-slate-800/50 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={loadingEmail}
                className="w-full bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium transition-colors"
              >
                {loadingEmail ? 'Updating...' : 'Update Email'}
              </button>
            </form>
          </div>

          {/* Delete Account */}
          <div className="bg-red-500/15 border border-red-500/30 rounded-lg p-6">
            <div className="flex items-start space-x-4">
              <FaExclamationTriangle className="h-6 w-6 text-red-400 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-red-200 mb-6">Delete Account</h2>
                <p className="text-sm text-red-200/80 mb-4">
                  ⚠️ <strong>Warning:</strong> This action cannot be undone. All your data, trips, and entries will be permanently deleted.
                </p>
                <form onSubmit={handleDeleteAccount} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-red-200 mb-2">Type "DELETE" to confirm</label>
                    <input
                      type="text"
                      value={deleteConfirm}
                      onChange={e => setDeleteConfirm(e.target.value)}
                      className="w-full px-4 py-2 border border-red-500/30 rounded-lg bg-slate-800/50 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                      placeholder="Type DELETE"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loadingDelete || deleteConfirm !== 'DELETE'}
                    className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium transition-colors"
                  >
                    {loadingDelete ? 'Deleting...' : 'Delete My Account'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
