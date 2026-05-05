import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useDropzone } from 'react-dropzone';
import { Dialog, Transition } from '@headlessui/react';
import { FaTimes, FaSpinner, FaMapPin, FaCloudUploadAlt } from 'react-icons/fa';

// Zod validation schema
const tripSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  destination: z.string().min(2, 'Destination must be at least 2 characters'),
  startDate: z.string().min(1, 'Start date is required').refine((date) => {
    const year = new Date(date).getFullYear();
    return year > 1949;
  }, 'Start date year must be after 1949'),
  endDate: z.string().min(1, 'End date is required'),
  description: z.string().optional()
}).refine((data) => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return start <= end;
}, {
  message: 'End date must be on or after start date',
  path: ['endDate']
});

export default function NewTripModal({ isOpen, onClose, onCreateTrip, isLoading, error }) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [locationInput, setLocationInput] = useState('');
  const [locations, setLocations] = useState([]);
  const [isGeocodingLoading, setIsGeocodingLoading] = useState(false);
  const [geocodingError, setGeocodingError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const debounceTimerRef = useRef(null);
  const scrollContainerRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: zodResolver(tripSchema)
  });

  // Handle dropzone
  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }

      setCoverImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
      toast.success('Image selected');
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false)
  });

  const resetForm = () => {
    reset();
    setPreviewUrl(null);
    setCoverImageFile(null);
    setLocationInput('');
    setLocations([]);
    setGeocodingError(null);
    setIsDragActive(false);
    setSuggestions([]);
  };

  // Debounced location search for suggestions
  const handleLocationInputChange = (value) => {
    setLocationInput(value);
    
    // Clear previous timeout
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Clear suggestions if input is empty
    if (!value.trim()) {
      setSuggestions([]);
      return;
    }

    // Set new timeout for debounced search (1 second)
    debounceTimerRef.current = setTimeout(async () => {
      setIsLoadingSuggestions(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(value)}&format=json&limit=5`
        );
        const data = await response.json();
        setSuggestions(data || []);
      } catch (err) {
        console.error('Error fetching suggestions:', err);
        setSuggestions([]);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 1000);
  };

  // Handle suggestion selection
  const handleSuggestionSelect = async (suggestion) => {
    const { lat, lon, display_name } = suggestion;
    const newLocation = {
      id: Date.now(),
      name: display_name,
      lat: parseFloat(lat),
      lng: parseFloat(lon)
    };

    setLocations([...locations, newLocation]);
    setLocationInput('');
    setSuggestions([]);
    toast.success(`Location "${display_name.split(',')[0]}" added`);
  };

  const handleGetCoordinates = async () => {
    if (!locationInput.trim()) {
      toast.error('Please enter a location');
      return;
    }

    setIsGeocodingLoading(true);
    setGeocodingError(null);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationInput)}&format=json&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        await handleSuggestionSelect(data[0]);
      } else {
        setGeocodingError('Location not found. Please try a different search.');
        toast.error('Location not found');
      }
    } catch (err) {
      const message = 'Error geocoding location';
      setGeocodingError(message);
      toast.error(message);
      console.error(err);
    } finally {
      setIsGeocodingLoading(false);
    }
  };

  const handleRemoveLocation = (id) => {
    setLocations(locations.filter(loc => loc.id !== id));
    toast.success('Location removed');
  };

  const onFormSubmit = async (data) => {
    try {
      await onCreateTrip({
        ...data,
        coverImageFile,
        locations
      });
      resetForm();
      toast.success('Trip created successfully! 🎉');
    } catch (err) {
      toast.error(err.message || 'Failed to create trip');
    }
  };

  const handleCloseModal = () => {
    resetForm();
    onClose();
  };

  const handleWheel = (e) => {
    // Wheel event handler - browser will handle scroll naturally
  };

  return (
    <Transition show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-40" onClose={handleCloseModal}>
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-sm sm:max-w-lg transform rounded-xl bg-slate-900/95 backdrop-blur-xl border border-emerald-500/30 text-left align-middle shadow-2xl transition-all mx-4 sm:mx-0 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-500/20">
                  <Dialog.Title className="text-lg font-semibold text-white">
                    Plan a New Trip
                  </Dialog.Title>
                  <button
                    onClick={handleCloseModal}
                    className="text-emerald-400/60 hover:text-emerald-300 transition-colors"
                  >
                    <FaTimes className="h-5 w-5" />
                  </button>
                </div>

                {/* Scrollable Form Container */}
                <div 
                  ref={scrollContainerRef}
                  className="flex-1 overflow-y-auto overscroll-contain" 
                  style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
                >
                <form
                  onSubmit={handleSubmit(onFormSubmit)}
                  className="px-4 sm:px-6 py-4 sm:py-5 space-y-4 sm:space-y-5"
                >
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-emerald-100 mb-1">
                      Trip Title *
                    </label>
                    <input
                      {...register('title')}
                      type="text"
                      placeholder="e.g., European Summer Adventure"
                      className={`w-full px-3 py-2 border rounded-md bg-slate-800/50 text-white placeholder-emerald-200/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${
                        errors.title ? 'border-red-500/50' : 'border-emerald-500/30'
                      }`}
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-400">{errors.title.message}</p>
                    )}
                  </div>

                  {/* Destination */}
                  <div>
                    <label className="block text-sm font-medium text-emerald-100 mb-1">
                      Destination *
                    </label>
                    <input
                      {...register('destination')}
                      type="text"
                      placeholder="e.g., Paris, France"
                      className={`w-full px-3 py-2 border rounded-md bg-slate-800/50 text-white placeholder-emerald-200/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${
                        errors.destination ? 'border-red-500/50' : 'border-emerald-500/30'
                      }`}
                    />
                    {errors.destination && (
                      <p className="mt-1 text-sm text-red-400">{errors.destination.message}</p>
                    )}
                  </div>

                  {/* Dates Row */}
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    {/* Start Date */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-emerald-100 mb-1">
                        Start Date *
                      </label>
                      <input
                        {...register('startDate')}
                        type="date"
                        className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-md bg-slate-800/50 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${
                          errors.startDate ? 'border-red-500/50' : 'border-emerald-500/30'
                        }`}
                      />
                      {errors.startDate && (
                        <p className="mt-1 text-xs sm:text-sm text-red-400">{errors.startDate.message}</p>
                      )}
                    </div>

                    {/* End Date */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-emerald-100 mb-1">
                        End Date *
                      </label>
                      <input
                        {...register('endDate')}
                        type="date"
                        className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-md bg-slate-800/50 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${
                          errors.endDate ? 'border-red-500/50' : 'border-emerald-500/30'
                        }`}
                      />
                      {errors.endDate && (
                        <p className="mt-1 text-xs sm:text-sm text-red-400">{errors.endDate.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-emerald-100 mb-1">
                      Description
                    </label>
                    <textarea
                      {...register('description')}
                      placeholder="Share details about your trip..."
                      rows={3}
                      className="w-full px-3 py-2 border border-emerald-500/30 rounded-md bg-slate-800/50 text-white placeholder-emerald-200/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                    />
                  </div>

                  {/* Cover Image with Dropzone */}
                  <div>
                    <label className="block text-sm font-medium text-emerald-100 mb-2">
                      Cover Image
                    </label>
                    <div
                      {...getRootProps()}
                      className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all min-h-[200px] active:scale-95 ${
                        isDragActive
                          ? 'border-emerald-400 bg-emerald-500/20 scale-105'
                          : previewUrl
                          ? 'border-emerald-500/30'
                          : 'border-emerald-500/30 hover:border-emerald-400/50 hover:bg-emerald-500/10 active:border-emerald-400 active:bg-emerald-500/20'
                      }`}
                    >
                      <input {...getInputProps()} />
                      {!previewUrl ? (
                        <div className="space-y-2">
                          <FaCloudUploadAlt className="h-10 w-10 text-emerald-400/60 mx-auto" />
                          <div>
                            <p className="text-emerald-100/80 font-medium">
                              {isDragActive ? 'Drop your image here' : 'Drag & drop or click to select'}
                            </p>
                            <p className="text-xs text-emerald-200/50 mt-1">PNG, JPG, GIF up to 10MB</p>
                          </div>
                        </div>
                      ) : (
                        <div className="relative">
                          <img src={previewUrl} alt="Preview" className="max-h-40 mx-auto rounded-md" />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewUrl(null);
                              setCoverImageFile(null);
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 active:bg-red-700 active:scale-90 transition-all duration-75 shadow-lg hover:shadow-xl min-h-[32px] min-w-[32px] flex items-center justify-center"
                          >
                            <FaTimes className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Locations */}
                  <div>
                    <label className="block text-sm font-medium text-emerald-100 mb-2">
                      Trip Location (Optional)
                    </label>
                    <div className="space-y-2">
                      <div className="flex gap-2 relative">
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            value={locationInput}
                            onChange={(e) => handleLocationInputChange(e.target.value)}
                            placeholder="Search for a location..."
                            className="w-full px-3 py-2 border border-emerald-500/30 rounded-md bg-slate-800/50 text-white placeholder-emerald-200/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                            onKeyPress={(e) => e.key === 'Enter' && handleGetCoordinates()}
                          />
                          
                          {/* Suggestions Dropdown */}
                          {suggestions.length > 0 && locationInput.trim() && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-emerald-500/30 rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
                              {suggestions.map((suggestion, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => handleSuggestionSelect(suggestion)}
                                  className="w-full text-left px-3 py-2 text-sm text-emerald-100 hover:bg-emerald-500/20 active:bg-emerald-500/30 transition-colors border-b border-emerald-500/10 last:border-b-0 flex items-center gap-2"
                                >
                                  <FaMapPin className="h-3 w-3 text-emerald-400 flex-shrink-0" />
                                  <span className="truncate">{suggestion.display_name}</span>
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Loading Suggestions */}
                          {isLoadingSuggestions && locationInput.trim() && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-emerald-500/30 rounded-md p-3 z-50">
                              <div className="flex items-center gap-2 text-sm text-emerald-200">
                                <FaSpinner className="animate-spin h-4 w-4" />
                                Searching locations...
                              </div>
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={handleGetCoordinates}
                          disabled={isGeocodingLoading || !locationInput.trim()}
                          className="px-3 py-2 sm:px-4 sm:py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 active:bg-emerald-800 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-75 flex items-center gap-2 font-medium min-h-[44px]"
                        >
                          {isGeocodingLoading ? <FaSpinner className="animate-spin" /> : <FaMapPin />}
                          <span className="hidden sm:inline">Add</span>
                        </button>
                      </div>

                      {geocodingError && (
                        <p className="text-sm text-red-600">{geocodingError}</p>
                      )}

                      {/* Locations List */}
                      {locations.length > 0 && (
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {locations.map((loc) => (
                            <div key={loc.id} className="flex items-center justify-between bg-green-50 border border-green-200 p-2 sm:p-3 rounded-md hover:bg-green-100 active:bg-green-200 transition-all duration-75 min-h-[44px]">
                              <span className="text-sm text-gray-700 truncate font-medium">{loc.name}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveLocation(loc.id)}
                                className="text-red-500 hover:text-red-700 active:text-red-900 active:scale-90 transition-all duration-75 flex-shrink-0 p-1 rounded hover:bg-red-50 active:bg-red-100"
                              >
                                <FaTimes className="h-5 w-5 sm:h-4 sm:w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="rounded-md bg-red-50 p-3 border border-red-200">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-emerald-500/20">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      disabled={isLoading}
                      className="px-4 py-3 text-sm font-medium text-emerald-100 bg-slate-700/50 border border-emerald-500/30 rounded-md hover:bg-slate-700/70 active:bg-slate-700/90 active:scale-95 disabled:opacity-50 transition-all duration-75 min-h-[44px]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-4 py-3 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 active:bg-emerald-800 active:scale-95 disabled:opacity-50 flex items-center gap-2 transition-all duration-75 min-h-[44px]"
                    >
                      {isLoading ? (
                        <>
                          <FaSpinner className="animate-spin h-4 w-4" />
                          Creating...
                        </>
                      ) : (
                        'Create Trip'
                      )}
                    </button>
                  </div>
                </form>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
