import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTrip } from '../contexts/TripContext';
import { deleteTrip, archiveTrip, unarchiveTrip } from '../hooks/useTrips';
import { FaTrash, FaArchive, FaArrowLeft, FaUndo } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function TripSettings() {
  const navigate = useNavigate();
  const { trips, archivedTrips, setAllTrips, allTrips } = useTrip();
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'archived'
  const [selectedTrips, setSelectedTrips] = useState(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isUnarchiving, setIsUnarchiving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [archiveConfirm, setArchiveConfirm] = useState(null);
  const [unarchiveConfirm, setUnarchiveConfirm] = useState(null);

  // Get trips for current tab
  const displayTrips = activeTab === 'active' ? trips : archivedTrips;

  // Toggle trip selection
  const toggleTripSelection = (tripId) => {
    const newSelected = new Set(selectedTrips);
    if (newSelected.has(tripId)) {
      newSelected.delete(tripId);
    } else {
      newSelected.add(tripId);
    }
    setSelectedTrips(newSelected);
  };

  // Select all trips
  const selectAllTrips = () => {
    if (selectedTrips.size === displayTrips.length) {
      setSelectedTrips(new Set());
    } else {
      setSelectedTrips(new Set(displayTrips.map(trip => trip.id)));
    }
  };

  // Handle delete trips
  const handleDeleteTrips = async () => {
    if (selectedTrips.size === 0) {
      toast.error('Please select at least one trip to delete');
      return;
    }

    setIsDeleting(true);
    try {
      for (const tripId of selectedTrips) {
        await deleteTrip(tripId);
      }
      
      // Update trips in context
      const updatedTrips = allTrips.filter(trip => !selectedTrips.has(trip.id));
      setAllTrips(updatedTrips);
      
      setSelectedTrips(new Set());
      setDeleteConfirm(null);
      toast.success(`${selectedTrips.size} trip(s) deleted successfully`);
    } catch (error) {
      console.error('Error deleting trips:', error);
      toast.error('Failed to delete trips');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle archive trips
  const handleArchiveTrips = async () => {
    if (selectedTrips.size === 0) {
      toast.error('Please select at least one trip to archive');
      return;
    }

    setIsArchiving(true);
    try {
      for (const tripId of selectedTrips) {
        await archiveTrip(tripId);
      }
      
      // Update trips in context - mark as archived
      const updatedTrips = allTrips.map(trip =>
        selectedTrips.has(trip.id) ? { ...trip, isArchived: true } : trip
      );
      setAllTrips(updatedTrips);
      
      setSelectedTrips(new Set());
      setArchiveConfirm(null);
      toast.success(`${selectedTrips.size} trip(s) archived successfully`);
    } catch (error) {
      console.error('Error archiving trips:', error);
      toast.error('Failed to archive trips');
    } finally {
      setIsArchiving(false);
    }
  };

  // Handle unarchive trips
  const handleUnarchiveTrips = async () => {
    if (selectedTrips.size === 0) {
      toast.error('Please select at least one trip to unarchive');
      return;
    }

    setIsUnarchiving(true);
    try {
      for (const tripId of selectedTrips) {
        await unarchiveTrip(tripId);
      }
      
      // Update trips in context - mark as not archived
      const updatedTrips = allTrips.map(trip =>
        selectedTrips.has(trip.id) ? { ...trip, isArchived: false } : trip
      );
      setAllTrips(updatedTrips);
      
      setSelectedTrips(new Set());
      setUnarchiveConfirm(null);
      toast.success(`${selectedTrips.size} trip(s) restored successfully`);
    } catch (error) {
      console.error('Error unarchiving trips:', error);
      toast.error('Failed to restore trips');
    } finally {
      setIsUnarchiving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-md border-b border-emerald-500/20 px-4 sm:px-6 py-4"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-emerald-500/20 rounded-lg transition-colors"
            >
              <FaArrowLeft className="text-emerald-400 h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold text-white">Trip Settings</h1>
          </div>
          <div className="text-emerald-200/60 text-sm">
            {selectedTrips.size > 0 && `${selectedTrips.size} selected`}
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="sticky top-16 z-10 bg-slate-900/80 backdrop-blur-md border-b border-emerald-500/20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex gap-4">
          <button
            onClick={() => {
              setActiveTab('active');
              setSelectedTrips(new Set());
            }}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'active'
                ? 'border-emerald-500 text-emerald-300'
                : 'border-transparent text-emerald-200/60 hover:text-emerald-200'
            }`}
          >
            Active Trips ({trips.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('archived');
              setSelectedTrips(new Set());
            }}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'archived'
                ? 'border-emerald-500 text-emerald-300'
                : 'border-transparent text-emerald-200/60 hover:text-emerald-200'
            }`}
          >
            Archived Trips ({archivedTrips.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {displayTrips.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-emerald-200/60 text-lg">
              {activeTab === 'active' ? 'No active trips' : 'No archived trips'}
            </p>
          </motion.div>
        ) : (
          <>
            {/* Select All */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <button
                onClick={selectAllTrips}
                className="px-4 py-2 bg-emerald-600/20 border border-emerald-500/40 text-emerald-100 rounded-lg hover:bg-emerald-600/30 transition-colors"
              >
                {selectedTrips.size === displayTrips.length ? 'Deselect All' : 'Select All'}
              </button>
            </motion.div>

            {/* Trips List */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.05 }}
              className="space-y-3"
            >
              {displayTrips.map((trip, index) => (
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className={`p-4 rounded-lg border transition-all cursor-pointer ${
                    selectedTrips.has(trip.id)
                      ? 'bg-emerald-500/20 border-emerald-500/50'
                      : 'bg-slate-800/50 border-emerald-500/20 hover:border-emerald-500/40'
                  }`}
                  onClick={() => toggleTripSelection(trip.id)}
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <div className="mt-1">
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                          selectedTrips.has(trip.id)
                            ? 'bg-emerald-500 border-emerald-500'
                            : 'border-emerald-500/30 hover:border-emerald-500/60'
                        }`}
                      >
                        {selectedTrips.has(trip.id) && (
                          <span className="text-white text-sm">✓</span>
                        )}
                      </div>
                    </div>

                    {/* Trip Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-white truncate">
                        {trip.title}
                      </h3>
                      <p className="text-emerald-200/60 text-sm">
                        {trip.destination}
                      </p>
                      <p className="text-emerald-200/40 text-xs mt-1">
                        {trip.startDate && trip.endDate
                          ? `${new Date(trip.startDate).toLocaleDateString()} - ${new Date(trip.endDate).toLocaleDateString()}`
                          : 'No dates set'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Action Buttons */}
            {selectedTrips.size > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 flex gap-3 sticky bottom-6 flex-wrap"
              >
                {activeTab === 'active' ? (
                  <>
                    {/* Archive Button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setArchiveConfirm(true)}
                      disabled={isArchiving}
                      className="flex-1 min-w-[150px] px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <FaArchive className="h-4 w-4" />
                      Archive ({selectedTrips.size})
                    </motion.button>

                    {/* Delete Button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setDeleteConfirm(true)}
                      disabled={isDeleting}
                      className="flex-1 min-w-[150px] px-4 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <FaTrash className="h-4 w-4" />
                      Delete ({selectedTrips.size})
                    </motion.button>
                  </>
                ) : (
                  <>
                    {/* Unarchive Button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setUnarchiveConfirm(true)}
                      disabled={isUnarchiving}
                      className="flex-1 min-w-[150px] px-4 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <FaUndo className="h-4 w-4" />
                      Restore ({selectedTrips.size})
                    </motion.button>

                    {/* Delete Button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setDeleteConfirm(true)}
                      disabled={isDeleting}
                      className="flex-1 min-w-[150px] px-4 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <FaTrash className="h-4 w-4" />
                      Delete ({selectedTrips.size})
                    </motion.button>
                  </>
                )}
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Archive Confirmation Modal */}
      {archiveConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 border border-emerald-500/30 rounded-lg max-w-sm p-6"
          >
            <h2 className="text-xl font-bold text-white mb-4">Archive Trips?</h2>
            <p className="text-emerald-200/80 mb-6">
              Are you sure you want to archive {selectedTrips.size} trip(s)? You can restore them later.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setArchiveConfirm(false)}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleArchiveTrips}
                disabled={isArchiving}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors font-medium"
              >
                {isArchiving ? 'Archiving...' : 'Archive'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 border border-red-500/30 rounded-lg max-w-sm p-6"
          >
            <h2 className="text-xl font-bold text-red-400 mb-4">Delete Trips?</h2>
            <p className="text-emerald-200/80 mb-2">
              Are you sure you want to permanently delete {selectedTrips.size} trip(s)?
            </p>
            <p className="text-red-400/60 text-sm mb-6">
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTrips}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg transition-colors font-medium"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Unarchive Confirmation Modal */}
      {unarchiveConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 border border-emerald-500/30 rounded-lg max-w-sm p-6"
          >
            <h2 className="text-xl font-bold text-white mb-4">Restore Trips?</h2>
            <p className="text-emerald-200/80 mb-6">
              Are you sure you want to restore {selectedTrips.size} trip(s)? They will appear in your active trips.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setUnarchiveConfirm(false)}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUnarchiveTrips}
                disabled={isUnarchiving}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg transition-colors font-medium"
              >
                {isUnarchiving ? 'Restoring...' : 'Restore'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
