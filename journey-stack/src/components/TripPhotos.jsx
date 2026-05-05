import React, { useState, useRef } from 'react';
import { FaUpload, FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import apiClient from '../services/apiClient';
import { useAuth } from '../contexts/AuthContext';

export default function TripPhotos({ tripId, photos = [], onPhotosChange }) {
  const { currentUser } = useAuth();
  const [isUploading,    setIsUploading]    = useState(false);
  const [isDeletingId,   setIsDeletingId]   = useState(null);
  const [selectedIndex,  setSelectedIndex]  = useState(null);
  const [imageErrors,    setImageErrors]    = useState({});
  const fileInputRef = useRef(null);

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      files.forEach(f => formData.append('photos', f));

      const { data } = await apiClient.post(`/trips/${tripId}/photos`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (onPhotosChange) onPhotosChange([...data.photos, ...photos]);
    } catch (err) {
      alert('Failed to upload: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeletePhoto = async (photoId) => {
    setIsDeletingId(photoId);
    try {
      await apiClient.delete(`/photos/${photoId}`);
      if (onPhotosChange) onPhotosChange(photos.filter(p => p.id !== photoId));
    } catch (err) {
      alert('Failed to delete: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsDeletingId(null);
    }
  };

  const handleImageError = (id) => setImageErrors(prev => ({ ...prev, [id]: true }));

  return (
    <div className="bg-slate-800/50 rounded-lg border border-emerald-500/30 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Trip Photos ({photos.length})</h3>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="inline-flex items-center px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 transition-colors text-sm font-medium"
        >
          <FaUpload className="mr-2 h-4 w-4" />
          {isUploading ? 'Uploading...' : 'Upload'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handlePhotoUpload}
          disabled={isUploading}
          className="hidden"
        />
      </div>

      {photos.length === 0 ? (
        <div className="text-center py-8 text-emerald-200/60">
          <p className="mb-4">No photos yet</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="text-emerald-400 hover:text-emerald-300 font-medium"
          >
            Upload your first photo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              className="relative group rounded-lg overflow-hidden bg-slate-700/50 cursor-pointer border border-emerald-500/20 hover:border-emerald-500/50 transition-colors"
              onClick={() => setSelectedIndex(index)}
            >
              {imageErrors[photo.id] ? (
                <div className="w-full h-32 bg-slate-700 flex items-center justify-center">
                  <span className="text-emerald-200/60 text-sm">Image unavailable</span>
                </div>
              ) : (
                <img
                  src={photo.photoUrl}
                  alt="Trip photo"
                  className="w-full h-32 object-cover group-hover:opacity-75 transition-opacity"
                  onError={() => handleImageError(photo.id)}
                />
              )}
              <button
                onClick={(e) => { e.stopPropagation(); handleDeletePhoto(photo.id); }}
                disabled={isDeletingId === photo.id}
                className="absolute top-1 right-1 p-1 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors opacity-0 group-hover:opacity-100"
              >
                <FaTimes className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {selectedIndex !== null && photos.length > 0 && (
        <div
          className="fixed inset-0 bg-slate-950/95 backdrop-blur-sm z-50 flex flex-col items-center justify-between p-4"
          onClick={() => setSelectedIndex(null)}
        >
          <button
            onClick={() => setSelectedIndex(null)}
            className="self-end p-2 bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 rounded-full transition-colors"
          >
            <FaTimes className="h-6 w-6" />
          </button>
          <div
            className="flex-1 flex items-center justify-center w-full max-w-5xl max-h-[calc(100vh-200px)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {imageErrors[photos[selectedIndex]?.id] ? (
              <div className="text-emerald-200/60 text-lg">Image unavailable</div>
            ) : (
              <img
                src={photos[selectedIndex].photoUrl}
                alt={`Trip photo ${selectedIndex + 1}`}
                className="max-w-full max-h-full object-contain"
                onError={() => handleImageError(photos[selectedIndex].id)}
              />
            )}
          </div>
          <div className="flex items-center justify-center gap-8 mt-4 pb-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedIndex(i => Math.max(0, i - 1))}
              disabled={selectedIndex === 0}
              className="p-3 bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 rounded-full disabled:opacity-30 transition-colors"
            >
              <FaChevronLeft className="h-6 w-6" />
            </button>
            <span className="text-emerald-100 font-medium text-lg min-w-fit">
              {selectedIndex + 1} / {photos.length}
            </span>
            <button
              onClick={() => setSelectedIndex(i => Math.min(photos.length - 1, i + 1))}
              disabled={selectedIndex === photos.length - 1}
              className="p-3 bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 rounded-full disabled:opacity-30 transition-colors"
            >
              <FaChevronRight className="h-6 w-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
