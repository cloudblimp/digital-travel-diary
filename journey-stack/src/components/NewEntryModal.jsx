import React, { useState } from 'react';
import { FaCloudUploadAlt } from 'react-icons/fa';
import { getCurrentISTDateTime } from '../utils/dateUtils';

export default function NewEntryModal({ isOpen, onClose, onCreateEntry, isLoading, error }) {
  const [entryData, setEntryData] = useState({
    title: '',
    dateTime: getCurrentISTDateTime(),
    location: '',
    story: '',
    photoFile: null
  });

  const [previewUrl, setPreviewUrl] = useState(null);

  const resetForm = () => {
    setEntryData({
      title: '',
      dateTime: getCurrentISTDateTime(),
      location: '',
      story: '',
      photoFile: null
    });
    setPreviewUrl(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onCreateEntry(entryData);
      resetForm();
      onClose();
    } catch (err) {
      console.error('Error in form submission:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === 'photoFile' && files && files[0]) {
      const file = files[0];
      setEntryData(prev => ({
        ...prev,
        photoFile: file
      }));

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setEntryData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 sm:items-center overflow-hidden">
      <div className="w-full max-w-md my-4 sm:my-auto max-h-[calc(100vh-2rem)] flex flex-col border shadow-2xl rounded-xl bg-slate-900/95 border-emerald-500/30 backdrop-blur-xl">
        <div className="flex justify-between items-center mb-4 p-6 border-b border-emerald-500/20 flex-shrink-0">
          <h3 className="text-lg font-semibold text-white">New Journal Entry</h3>
          <button
            onClick={onClose}
            className="text-emerald-400/60 hover:text-emerald-400 transition-colors"
            disabled={isLoading}
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
            <label htmlFor="title" className="block text-sm font-medium text-emerald-100">
              Title
            </label>
            <input
              type="text"
              id="title"
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
            <label htmlFor="dateTime" className="block text-sm font-medium text-emerald-100">
              Date & Time
            </label>
            <input
              type="datetime-local"
              id="dateTime"
              name="dateTime"
              value={entryData.dateTime}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-emerald-500/30 rounded-lg shadow-sm bg-slate-800/50 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors sm:text-sm"
            />
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-emerald-100">
              Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={entryData.location}
              onChange={handleChange}
              placeholder="Where are you?"
              className="mt-1 block w-full px-3 py-2 border border-emerald-500/30 rounded-lg shadow-sm placeholder-emerald-200/40 bg-slate-800/50 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors sm:text-sm"
            />
          </div>

          {/* Story */}
          <div>
            <label htmlFor="story" className="block text-sm font-medium text-emerald-100">
              Your Story
            </label>
            <textarea
              id="story"
              name="story"
              value={entryData.story}
              onChange={handleChange}
              placeholder="What happened today? What did you see, feel, and experience?"
              rows={4}
              className="mt-1 block w-full px-3 py-2 border border-emerald-500/30 rounded-lg shadow-sm placeholder-emerald-200/40 bg-slate-800/50 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors sm:text-sm"
            />
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-emerald-100 mb-2">Photo Upload</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-emerald-500/30 rounded-lg hover:border-emerald-500/60 hover:bg-emerald-500/5 transition-all">
              <div className="space-y-1 text-center">
                {previewUrl ? (
                  <div className="relative">
                    <img src={previewUrl} alt="Preview" className="mx-auto h-32 w-auto object-cover rounded" />
                    <button
                      type="button"
                      onClick={() => {
                        setEntryData(prev => ({ ...prev, photoFile: null }));
                        setPreviewUrl(null);
                      }}
                      className="absolute top-0 right-0 -mr-2 -mt-2 bg-red-500/30 rounded-full p-1 hover:bg-red-500/50 transition-colors"
                    >
                      <svg className="h-4 w-4 text-red-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <>
                    <FaCloudUploadAlt className="mx-auto h-12 w-12 text-emerald-400/50" />
                    <div className="flex text-sm text-emerald-200/70">
                      <label htmlFor="photoFile" className="relative cursor-pointer rounded-md font-medium text-emerald-300 hover:text-emerald-200">
                        <span>Upload a file</span>
                        <input
                          id="photoFile"
                          name="photoFile"
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={handleChange}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-emerald-200/40">PNG, JPG, GIF up to 10MB</p>
                  </>
                )}
              </div>
            </div>
            
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg bg-red-500/20 p-3 border border-red-500/30">
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-emerald-200 bg-slate-800/50 border border-emerald-500/30 rounded-lg hover:bg-slate-800 hover:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 active:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors disabled:opacity-50 flex items-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                'Create Entry'
              )}
            </button>
          </div>
        </form>

        <div className="border-t border-emerald-500/20 p-6 flex-shrink-0">
          {/* Footer section - can add additional actions here if needed */}
        </div>
      </div>
    </div>
  );
}
