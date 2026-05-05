import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { motion } from 'framer-motion';
import { FaTimes, FaSearch, FaSpinner, FaUserCheck, FaEnvelope } from 'react-icons/fa';
import apiClient from '../services/apiClient';
import toast from 'react-hot-toast';

export default function InviteModal({ isOpen, onClose, tripId, onInviteSent }) {
  const [email,      setEmail]      = useState('');
  const [role,       setRole]       = useState('editor');
  const [foundUser,  setFoundUser]  = useState(null);
  const [searching,  setSearching]  = useState(false);
  const [sending,    setSending]    = useState(false);
  const [searchErr,  setSearchErr]  = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSearching(true);
    setFoundUser(null);
    setSearchErr('');

    try {
      const { data } = await apiClient.get(`/users/search?email=${encodeURIComponent(email.trim())}`);
      setFoundUser(data.user);
    } catch (err) {
      setSearchErr(err.response?.data?.error || 'User not found');
    } finally {
      setSearching(false);
    }
  };

  const handleSendInvite = async () => {
    if (!foundUser) return;
    setSending(true);
    try {
      await apiClient.post(`/trips/${tripId}/invite`, { email: foundUser.email, role });
      toast.success(`Invite sent to ${foundUser.displayName || foundUser.email}! 🎉`);
      if (onInviteSent) onInviteSent();
      handleClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send invite');
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setRole('editor');
    setFoundUser(null);
    setSearchErr('');
    onClose();
  };

  return (
    <Transition show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
          leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
            leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-md bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-emerald-500/20">
                <div>
                  <Dialog.Title className="text-lg font-semibold text-white">Invite Traveler</Dialog.Title>
                  <p className="text-sm text-emerald-200/60 mt-0.5">They must already have an account</p>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 text-emerald-400/60 hover:text-emerald-300 hover:bg-slate-800/50 rounded-lg transition-colors"
                >
                  <FaTimes className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Email search */}
                <form onSubmit={handleSearch} className="space-y-3">
                  <label className="block text-sm font-medium text-emerald-100">Email Address</label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setFoundUser(null); setSearchErr(''); }}
                      placeholder="friend@example.com"
                      className="flex-1 px-3 py-2.5 border border-emerald-500/30 rounded-lg bg-slate-800/50 text-white placeholder-emerald-200/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors text-sm"
                    />
                    <button
                      type="submit"
                      disabled={searching || !email.trim()}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors flex items-center gap-2 text-sm"
                    >
                      {searching ? <FaSpinner className="animate-spin h-4 w-4" /> : <FaSearch className="h-4 w-4" />}
                      Find
                    </button>
                  </div>
                </form>

                {/* Search error */}
                {searchErr && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-500/15 border border-red-500/30 rounded-lg"
                  >
                    <p className="text-sm text-red-300">{searchErr}</p>
                  </motion.div>
                )}

                {/* Found user */}
                {foundUser && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-3"
                  >
                    {foundUser.photoUrl ? (
                      <img src={foundUser.photoUrl} alt={foundUser.displayName} className="w-10 h-10 rounded-full object-cover border border-emerald-500/30" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                        {foundUser.displayName?.[0]?.toUpperCase() || '?'}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">{foundUser.displayName}</p>
                      <p className="text-xs text-emerald-200/60 flex items-center gap-1">
                        <FaEnvelope className="h-3 w-3" />{foundUser.email}
                      </p>
                    </div>
                    <FaUserCheck className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                  </motion.div>
                )}

                {/* Role selector */}
                {foundUser && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                    <label className="block text-sm font-medium text-emerald-100">Role</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: 'editor', label: 'Editor', desc: 'Can add & edit their own content' },
                        { value: 'admin',  label: 'Admin',  desc: 'Can also invite & remove others' },
                      ].map(({ value, label, desc }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setRole(value)}
                          className={`p-3 rounded-lg border-2 text-left transition-all ${
                            role === value
                              ? 'border-emerald-500 bg-emerald-500/20'
                              : 'border-slate-600/50 hover:border-emerald-500/50'
                          }`}
                        >
                          <p className="text-sm font-semibold text-white">{label}</p>
                          <p className="text-xs text-emerald-200/60 mt-0.5">{desc}</p>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Send button */}
                {foundUser && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={handleSendInvite}
                    disabled={sending}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    {sending ? (
                      <><FaSpinner className="animate-spin h-4 w-4" /> Sending...</>
                    ) : (
                      <>Send Invite ✈️</>
                    )}
                  </motion.button>
                )}
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
