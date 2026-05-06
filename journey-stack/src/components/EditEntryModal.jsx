import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { convertToIST } from '../utils/dateUtils';
import apiClient from '../services/apiClient';

export default function EditEntryModal({ isOpen, onClose, entry, onSave, isLoading }) {
  const { currentUser } = useAuth();
  const [entryData, setEntryData] = useState({
    title: '',
    dateTime: '',
    location: '',
    story: '',
    photoUrl: '',
    photoFile: null
  });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [localError, setLocalError] = useState(null);

  // Pre-fill form when entry is passed
  useEffect(() => {
    if (entry) {
      setEntryData({
        title: entry.title || '',
        dateTime: entry.dateTime ? convertToIST(entry.dateTime) : '',
        location: entry.location || '',
        story: entry.story || '',
        photoUrl: entry.photoUrl || '',
        photoFile: null
      });
      setLocalError(null);
    }
  }, [entry]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEntryData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setEntryData(prev => ({ ...prev, photoFile: file }));
    }
  };

  const handleRemovePhoto = () => {
    setEntryData(prev => ({ ...prev, photoFile: null, photoUrl: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    setUploadingPhoto(!!entryData.photoFile);

    try {
      // Build multipart form data so a new photo is uploaded through Cloudinary
      const formData = new FormData();
      formData.append('title',    entryData.title);
      // Append IST offset so PostgreSQL stores the correct absolute time
      const dt = entryData.dateTime;
      const dateTimeIST = dt && !dt.includes('+') ? `${dt}:00+05:30` : dt;
      formData.append('dateTime', dateTimeIST);
      formData.append('location', entryData.location || '');
      formData.append('story',    entryData.story || '');
      // If a new file was picked, attach it; otherwise pass the existing URL (or empty to clear)
      if (entryData.photoFile) {
        formData.append('photo', entryData.photoFile);
      } else {
        formData.append('photoUrl', entryData.photoUrl || '');
      }

      const { data } = await apiClient.patch(`/entries/${entry.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Pass the updated entry back to the parent so it can update state
      onSave(data.entry);
    } catch (err) {
      setLocalError(err.response?.data?.error || 'Failed to save entry');
    } finally {
      setUploadingPhoto(false);
    }
  };

  if (!isOpen || !entry) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 sm:items-center overflow-hidden">
      <div className="w-full max-w-2xl my-4 sm:my-auto max-h-[calc(100vh-2rem)] flex flex-col border shadow-2xl rounded-xl bg-slate-900/95 border-emerald-500/30 backdrop-blur-xl">
        <div className="flex justify-between items-center mb-4 p-6 border-b border-emerald-500/20 flex-shrink-0">
          <h3 className="text-lg font-semibold text-white">Edit Entry</h3>
          <button
            onClick={onClose}
            className="text-emerald-400/60 hover:text-emerald-400 transition-colors"
            disabled={isLoading || uploadingPhoto}
          >
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto flex-1 px-6 py-4">
          {/* Title */}
          <div>
            <label htmlFor="edit-title" className="block text-sm font-medium text-emerald-100">
              Title
            </label>
            <input
              type="text"
              id="edit-title"
              name="title"
              value={entryData.title}
              onChange={handleChange}
              placeholder="Give your entry a title..."
              required
              className="mt-1 block w-full px-3 py-2 border border-emerald-500/30 rounded-lg shadow-sm placeholder-emerald-200/40 bg-slate-800/50 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors sm:text-sm"
            />
          </div>

          {/* Date & Time */}
          <div>
            <label htmlFor="edit-dateTime" className="block text-sm font-medium text-emerald-100">
              Date & Time
            </label>
            <input
              type="datetime-local"
              id="edit-dateTime"
              name="dateTime"
              value={entryData.dateTime}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-emerald-500/30 rounded-lg shadow-sm bg-slate-800/50 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors sm:text-sm"
            />
          </div>

          {/* Location */}
          <div>
            <label htmlFor="edit-location" className="block text-sm font-medium text-emerald-100">
              Location
            </label>
            <input
              type="text"
              id="edit-location"
              name="location"
              value={entryData.location}
              onChange={handleChange}
              placeholder="Where are you?"
              className="mt-1 block w-full px-3 py-2 border border-emerald-500/30 rounded-lg shadow-sm placeholder-emerald-200/40 bg-slate-800/50 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors sm:text-sm"
            />
          </div>

          {/* Story */}
          <div>
            <label htmlFor="edit-story" className="block text-sm font-medium text-emerald-100">
              Your Story
            </label>
            <textarea
              id="edit-story"
              name="story"
              value={entryData.story}
              onChange={handleChange}
              placeholder="What happened today? What did you see, feel, and experience?"
              rows={6}
              className="mt-1 block w-full px-3 py-2 border border-emerald-500/30 rounded-lg shadow-sm placeholder-emerald-200/40 bg-slate-800/50 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors sm:text-sm"
            />
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-emerald-100 mb-2">
              Photo
            </label>

            {/* Current or New Photo Preview */}
            {(entryData.photoFile || entryData.photoUrl) && (
              <div className="mb-4 relative">
                <img
                  src={entryData.photoFile ? URL.createObjectURL(entryData.photoFile) : entryData.photoUrl}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  disabled={isLoading || uploadingPhoto}
                  className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-2 disabled:opacity-50 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            )}

            {/* Upload Input */}
            <label className="flex items-center justify-center w-full px-4 py-6 text-sm font-medium text-emerald-200 bg-slate-800/50 border-2 border-dashed border-emerald-500/30 rounded-lg cursor-pointer hover:border-emerald-500/60 hover:bg-emerald-500/5 transition-all">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                disabled={isLoading || uploadingPhoto}
                className="hidden"
              />
              <div className="flex flex-col items-center">
                <svg className="w-8 h-8 text-emerald-400/50 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-xs text-center text-emerald-200/70">
                  {uploadingPhoto ? 'Uploading...' : 'Click to upload or replace photo'}
                </span>
              </div>
            </label>
          </div>

          {/* Error */}
          {localError && (
            <div className="rounded-lg bg-red-500/20 p-3 border border-red-500/30">
              <p className="text-sm text-red-200">{localError}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-emerald-500/20">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading || uploadingPhoto}
              className="px-4 py-3 text-sm font-medium text-emerald-200 bg-slate-800/50 border border-emerald-500/30 rounded-lg hover:bg-slate-800 hover:border-emerald-500/50 active:bg-slate-700 active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 transition-all duration-75 min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || uploadingPhoto}
              className="px-4 py-3 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 active:bg-emerald-800 active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 flex items-center transition-all duration-75 min-h-[44px]"
            >
              {isLoading || uploadingPhoto ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {uploadingPhoto ? 'Uploading Photo...' : 'Saving...'}
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
