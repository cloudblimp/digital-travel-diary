import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useTrip } from '../contexts/TripContext.jsx';
import { useEntries } from '../hooks/useEntries.js';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../services/apiClient';
import { getSocket, joinTripRoom, leaveTripRoom } from '../services/socket';
import NewEntryModal from '../components/NewEntryModal.jsx';
import EntryDetailModal from '../components/EntryDetailModal.jsx';
import EditEntryModal from '../components/EditEntryModal.jsx';
import ItineraryModal from '../components/ItineraryModal.jsx';
import TripPhotos from '../components/TripPhotos.jsx';
import TripLocationMap from '../components/TripLocationMap.jsx';
import TripDetailHeroPlaceholder from '../components/TripDetailHeroPlaceholder.jsx';
import CollaboratorsPanel from '../components/CollaboratorsPanel.jsx';
import { FaCalendarAlt, FaArrowLeft, FaPlus } from 'react-icons/fa';
import { parseLocalDate } from '../utils/dateUtils';

const containerVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};
const itemVariants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function TripDetail() {
  const { tripId } = useParams();
  const { selectedTrip, myRole } = useTrip();
  const { currentUser } = useAuth();
  const { createEntry, loading, error } = useEntries();

  const [trip,               setTrip]               = useState(null);
  const [entries,            setEntries]            = useState([]);
  const [activities,         setActivities]         = useState([]);
  const [tripPhotos,         setTripPhotos]         = useState([]);
  const [selectedEntry,      setSelectedEntry]      = useState(null);
  const [isModalOpen,        setIsModalOpen]        = useState(false);
  const [isDetailModalOpen,  setIsDetailModalOpen]  = useState(false);
  const [isEditModalOpen,    setIsEditModalOpen]    = useState(false);
  const [isItineraryModalOpen, setIsItineraryModalOpen] = useState(false);
  const [isDeleting,         setIsDeleting]         = useState(false);
  const [isUpdating,         setIsUpdating]         = useState(false);
  const [tripLoading,        setTripLoading]        = useState(true);
  const [entriesLoading,     setEntriesLoading]     = useState(true);

  const role = myRole(tripId);

  // ─── Initial data load ────────────────────────────────────────────────────
  useEffect(() => {
    if (!tripId || !currentUser) return;

    const loadAll = async () => {
      try {
        // Use selectedTrip from context, or fetch directly
        if (selectedTrip?.id === tripId) {
          setTrip(selectedTrip);
          setTripLoading(false);
        } else {
          const { data } = await apiClient.get(`/trips/${tripId}`);
          setTrip(data.trip);
          setTripLoading(false);
        }

        const [entriesRes, activitiesRes, photosRes] = await Promise.all([
          apiClient.get(`/trips/${tripId}/entries`),
          apiClient.get(`/trips/${tripId}/activities`),
          apiClient.get(`/trips/${tripId}/photos`),
        ]);

        setEntries(entriesRes.data.entries || []);
        setActivities(activitiesRes.data.activities || []);
        setTripPhotos(photosRes.data.photos || []);
      } catch (err) {
        console.error('Error loading trip data:', err);
        setTrip(null);
        setTripLoading(false);
      } finally {
        setEntriesLoading(false);
      }
    };

    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId, currentUser?.id]);

  // ─── Socket.io real-time updates ─────────────────────────────────────────
  useEffect(() => {
    if (!tripId) return;
    joinTripRoom(tripId);

    const socket = getSocket();
    if (!socket) return;

    const onEntryAdded   = ({ entry }) => setEntries(prev => [entry, ...prev].sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime)));
    const onEntryUpdated = ({ entry }) => setEntries(prev => prev.map(e => e.id === entry.id ? entry : e));
    const onEntryDeleted = ({ entryId }) => setEntries(prev => prev.filter(e => e.id !== entryId));

    const onActivityAdded   = ({ activity }) => setActivities(prev => [...prev, activity].sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime)));
    const onActivityUpdated = ({ activity }) => setActivities(prev => prev.map(a => a.id === activity.id ? activity : a));
    const onActivityDeleted = ({ activityId }) => setActivities(prev => prev.filter(a => a.id !== activityId));

    const onPhotosAdded   = ({ photos }) => setTripPhotos(prev => [...photos, ...prev]);
    const onPhotoDeleted  = ({ photoId }) => setTripPhotos(prev => prev.filter(p => p.id !== photoId));

    socket.on('trip:entry_added',      onEntryAdded);
    socket.on('trip:entry_updated',    onEntryUpdated);
    socket.on('trip:entry_deleted',    onEntryDeleted);
    socket.on('trip:activity_added',   onActivityAdded);
    socket.on('trip:activity_updated', onActivityUpdated);
    socket.on('trip:activity_deleted', onActivityDeleted);
    socket.on('trip:photos_added',     onPhotosAdded);
    socket.on('trip:photo_deleted',    onPhotoDeleted);

    return () => {
      leaveTripRoom(tripId);
      socket.off('trip:entry_added',      onEntryAdded);
      socket.off('trip:entry_updated',    onEntryUpdated);
      socket.off('trip:entry_deleted',    onEntryDeleted);
      socket.off('trip:activity_added',   onActivityAdded);
      socket.off('trip:activity_updated', onActivityUpdated);
      socket.off('trip:activity_deleted', onActivityDeleted);
      socket.off('trip:photos_added',     onPhotosAdded);
      socket.off('trip:photo_deleted',    onPhotoDeleted);
    };
  }, [tripId]);

  const formattedTrip = trip ? {
    ...trip,
    startDate: parseLocalDate(trip.startDate),
    endDate:   parseLocalDate(trip.endDate),
  } : null;

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const handleEntryCreation = async (entryData) => {
    try {
      await createEntry(tripId, entryData);
      setIsModalOpen(false);
      toast.success('Entry created! 📝');
    } catch (err) {
      toast.error(`Failed to create entry: ${err.message}`);
    }
  };

  const handleDeleteEntry = async (entryId) => {
    setIsDeleting(true);
    try {
      await apiClient.delete(`/entries/${entryId}`);
      setEntries(prev => prev.filter(e => e.id !== entryId));
      setIsDetailModalOpen(false);
      toast.success('Entry deleted! 🗑️');
    } catch (err) {
      toast.error(`Failed to delete: ${err.response?.data?.error || err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveEntry = (updatedEntry) => {
    // EditEntryModal already called PATCH /api/entries/:id and returns the updated entry
    setEntries(prev => prev.map(e => e.id === updatedEntry.id ? updatedEntry : e));
    setIsEditModalOpen(false);
    toast.success('Entry updated! ✏️');
  };

  const handleEditEntry = (entry) => {
    setSelectedEntry(entry);
    setIsDetailModalOpen(false);
    setIsEditModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-900">
      {tripLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin inline-block">
              <svg className="w-12 h-12 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p className="mt-4 text-emerald-200 text-lg">Loading trip details...</p>
          </div>
        </div>
      ) : !formattedTrip ? (
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-red-400 text-lg">Trip not found or access denied</p>
        </div>
      ) : (
        <>
          {/* Hero */}
          <div className="relative h-72 w-full overflow-hidden">
            {formattedTrip.coverImage ? (
              <img src={formattedTrip.coverImage} alt={formattedTrip.title} className="w-full h-full object-cover" />
            ) : (
              <TripDetailHeroPlaceholder />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/70 to-slate-900/40" />

            <div className="absolute top-4 left-4 z-20">
              <Link to="/" className="inline-flex items-center px-4 py-2 bg-emerald-600/90 hover:bg-emerald-700 rounded-lg text-sm font-medium text-white transition-colors shadow-lg">
                <FaArrowLeft className="mr-2" /> Back to Trips
              </Link>
            </div>

            <div className="absolute top-4 right-4 z-20">
              <button
                onClick={() => setIsItineraryModalOpen(true)}
                className="inline-flex items-center px-4 py-2 bg-emerald-600/90 hover:bg-emerald-700 rounded-lg text-sm font-medium text-white transition-colors shadow-lg"
              >
                <FaCalendarAlt className="mr-2" /> View Itinerary
              </button>
            </div>

            <div className="absolute inset-x-0 bottom-0 p-6 text-white">
              <h1 className="text-3xl font-bold text-white">{formattedTrip.title}</h1>
              <p className="mt-1 text-emerald-100/90 max-w-3xl">{formattedTrip.description}</p>
              <div className="mt-2 flex items-center text-emerald-100/90">
                <FaCalendarAlt className="mr-2" />
                {formattedTrip.startDate && formatDate(formattedTrip.startDate)}
                {formattedTrip.endDate && ` - ${formatDate(formattedTrip.endDate)}`}
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-0">
            {formattedTrip.locations?.length > 0 && (
              <div className="mb-12 relative z-0">
                <h2 className="text-xl font-semibold text-white mb-4">Trip Stops</h2>
                <TripLocationMap locations={formattedTrip.locations} />
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-0">
              {/* Journal Entries */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white">Journal Entries ({entries.length})</h2>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    <FaPlus className="mr-2 h-4 w-4" /> New Entry
                  </button>
                </div>

                {entriesLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="rounded-lg border border-emerald-500/30 bg-slate-800/50 overflow-hidden animate-pulse">
                        <div className="w-full h-48 bg-slate-700/50" />
                        <div className="p-4 space-y-3">
                          <div className="h-4 bg-slate-700 rounded w-3/4" />
                          <div className="h-3 bg-slate-700 rounded w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6" variants={containerVariants} initial="hidden" animate="visible">
                    {entries.length === 0 ? (
                      <motion.div variants={itemVariants} className="rounded-lg border border-emerald-500/30 bg-slate-800/50 p-4 text-emerald-200/60">
                        No entries yet. Create your first one!
                      </motion.div>
                    ) : (
                      entries.map(entry => (
                        <motion.div
                          key={entry.id}
                          variants={itemVariants}
                          onClick={() => { setSelectedEntry(entry); setIsDetailModalOpen(true); }}
                          whileHover={{ y: -4 }}
                          className="rounded-lg border border-emerald-500/30 bg-slate-800/50 overflow-hidden shadow-md hover:shadow-lg hover:border-emerald-500/50 transition-all cursor-pointer"
                        >
                          {entry.photoUrl && (
                            <img src={entry.photoUrl} alt={entry.title} className="w-full h-48 object-cover" />
                          )}
                          <div className="p-4">
                            <h3 className="font-semibold text-white mb-1">{entry.title}</h3>
                            {entry.location && <p className="text-sm text-emerald-200/80 mb-2">📍 {entry.location}</p>}
                            <p className="text-sm text-emerald-200/60 mb-3">{new Date(entry.dateTime).toLocaleString()}</p>
                            {entry.authorName && entry.authorId !== currentUser?.id && (
                              <p className="text-xs text-emerald-400/70 mb-2">✍️ {entry.authorName}</p>
                            )}
                            <p className="text-sm text-emerald-100 line-clamp-3">{entry.story}</p>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </motion.div>
                )}
              </div>

              {/* Right sidebar */}
              <div className="lg:col-span-1 space-y-6">
                <TripPhotos
                  tripId={tripId}
                  photos={tripPhotos}
                  onPhotosChange={setTripPhotos}
                />
                <CollaboratorsPanel tripId={tripId} tripRole={role} />
              </div>
            </div>
          </div>

          {/* Modals */}
          <NewEntryModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onCreateEntry={handleEntryCreation}
            isLoading={loading}
            error={error}
          />
          <EntryDetailModal
            isOpen={isDetailModalOpen}
            onClose={() => { setIsDetailModalOpen(false); setSelectedEntry(null); }}
            entry={selectedEntry}
            onDelete={handleDeleteEntry}
            onEdit={handleEditEntry}
            isDeleting={isDeleting}
          />
          <EditEntryModal
            isOpen={isEditModalOpen}
            onClose={() => { setIsEditModalOpen(false); setSelectedEntry(null); }}
            entry={selectedEntry}
            onSave={handleSaveEntry}
            isLoading={isUpdating}
            error={null}
          />
          <ItineraryModal
            isOpen={isItineraryModalOpen}
            onClose={() => setIsItineraryModalOpen(false)}
            trip={formattedTrip}
            activities={activities}
          />
        </>
      )}
    </div>
  );
}
