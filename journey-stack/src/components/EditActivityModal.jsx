import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useActivities } from '../hooks/useActivities';

export default function EditActivityModal({ isOpen, onClose, activity, onActivityUpdated }) {
  const [activityData, setActivityData] = useState({
    title: '',
    type: 'Activity',
    date: '',
    time: '00:00',
    location: '',
    description: ''
  });
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { updateActivity, deleteActivity } = useActivities();

  const activityTypes = [
    { icon: '↗', label: 'Activity' },
    { icon: '🏨', label: 'Accommodation' },
    { icon: '🍽', label: 'Food & Dining' },
    { icon: '✈', label: 'Transport' },
    { icon: '...', label: 'Other' }
  ];

  // Initialize form with activity data
  useEffect(() => {
    console.log('EditActivityModal - isOpen:', isOpen, 'activity:', activity);
    if (activity && isOpen) {
      const dateTime = new Date(activity.dateTime);
      const date = dateTime.toISOString().split('T')[0];
      const time = dateTime.toTimeString().slice(0, 5);

      setActivityData({
        title: activity.title || '',
        type: activity.type || 'Activity',
        date: date,
        time: time,
        location: activity.location || '',
        description: activity.description || ''
      });
    }
  }, [activity, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setActivityData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTypeSelect = (type) => {
    setActivityData(prev => ({
      ...prev,
      type: type
    }));
    setIsDropdownOpen(false);
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();

    if (!activityData.title) {
      toast.error('Please enter activity title');
      return;
    }

    if (!activityData.date) {
      toast.error('Please select a date');
      return;
    }

    const dateTime = `${activityData.date}T${activityData.time}`;

    try {
      await updateActivity(activity.id, {
        title: activityData.title,
        type: activityData.type,
        dateTime: dateTime,
        location: activityData.location,
        description: activityData.description
      });

      toast.success('Activity updated successfully! ✨');
      console.log('Activity updated successfully');
      onActivityUpdated?.();
      onClose();
    } catch (error) {
      console.error('Error updating activity:', error);
      toast.error('Failed to update activity: ' + error.message);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteActivity(activity.id);
      toast.success('Activity deleted successfully! 🗑️');
      console.log('Activity deleted successfully');
      onActivityUpdated?.();
      onClose();
    } catch (error) {
      console.error('Error deleting activity:', error);
      toast.error('Failed to delete activity: ' + error.message);
    }
    setIsDeleteConfirmOpen(false);
  };

  if (!isOpen || !activity) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-slate-900/95 rounded-xl w-full max-w-2xl max-h-[95vh] overflow-y-auto shadow-2xl border border-emerald-500/30 backdrop-blur-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-6 border-b border-emerald-500/20 sticky top-0 bg-slate-900/95">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-2xl font-bold text-white truncate">Edit Activity</h2>
            <p className="text-xs sm:text-sm text-emerald-200/70 mt-1">Update the details of your activity</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-emerald-500/10 rounded-lg transition-colors text-emerald-400/60 hover:text-emerald-400 flex-shrink-0"
          >
            <FaTimes className="text-lg sm:text-xl" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSaveChanges} className="p-3 sm:p-6 space-y-3 sm:space-y-6">
          {/* Title */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-emerald-100 mb-1 sm:mb-2">Title</label>
            <input
              type="text"
              name="title"
              value={activityData.title}
              onChange={handleChange}
              placeholder="e.g., Visit Eiffel Tower"
              className="w-full px-2 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-slate-800/50 rounded-lg border border-emerald-500/30 text-white placeholder-emerald-200/40 focus:bg-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Type Dropdown */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-emerald-100 mb-1 sm:mb-2">Type</label>
            <div className="relative">
              <button
                type="button"
                className="w-full px-2 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-slate-800/50 border-2 border-emerald-500/30 rounded-lg text-left flex items-center justify-between hover:border-emerald-500/50 hover:bg-slate-800 transition-all text-emerald-100"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span className="flex items-center gap-2 min-w-0">
                  <span className="text-base sm:text-lg flex-shrink-0">{activityTypes.find(t => t.label === activityData.type)?.icon}</span>
                  <span className="truncate">{activityData.type}</span>
                </span>
                <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800/95 border-2 border-emerald-500/30 rounded-lg shadow-2xl z-10 backdrop-blur-xl">
                {activityTypes.map((type) => (
                  <button
                    key={type.label}
                    type="button"
                    onClick={() => {
                      handleTypeSelect(type.label);
                    }}
                    className="w-full px-2 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-left flex items-center gap-2 hover:bg-emerald-500/10 transition-colors first:rounded-t-lg last:rounded-b-lg border-b border-emerald-500/20 last:border-b-0 text-emerald-100"
                  >
                    <span className="text-base sm:text-lg flex-shrink-0">{type.icon}</span>
                    <span className="truncate">{type.label}</span>
                    {activityData.type === type.label && (
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 ml-auto text-emerald-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
              )}
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-2 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-emerald-100 mb-1 sm:mb-2">Date</label>
              <div className="w-full px-2 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-slate-800/50 rounded-lg border-2 border-emerald-500/30 flex items-center justify-between cursor-not-allowed">
                <span className="text-emerald-100 font-medium truncate">
                  {activityData.date ? new Date(activityData.date).toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  }) : 'Select a day'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-emerald-100 mb-1 sm:mb-2">Time</label>
              <input
                type="time"
                name="time"
                value={activityData.time}
                onChange={handleChange}
                className="w-full px-2 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-slate-800/50 rounded-lg border border-emerald-500/30 text-white focus:bg-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-emerald-100 mb-1 sm:mb-2">Location (optional)</label>
            <input
              type="text"
              name="location"
              value={activityData.location}
              onChange={handleChange}
              placeholder="Where is this activity?"
              className="w-full px-2 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-slate-800/50 rounded-lg border border-emerald-500/30 text-white placeholder-emerald-200/40 focus:bg-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-emerald-100 mb-1 sm:mb-2">Description (optional)</label>
            <textarea
              name="description"
              value={activityData.description}
              onChange={handleChange}
              placeholder="Add notes, booking details, or other information..."
              rows={3}
              className="w-full px-2 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-slate-800/50 rounded-lg border border-emerald-500/30 text-white placeholder-emerald-200/40 focus:bg-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 justify-between pt-4 border-t border-emerald-500/20">
            <button
              type="button"
              onClick={() => setIsDeleteConfirmOpen(true)}
              className="px-3 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base text-white bg-red-600 rounded-lg hover:bg-red-700 active:bg-red-800 transition-all font-medium min-h-10 sm:min-h-11"
            >
              Delete
            </button>
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-3 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base text-emerald-200 bg-slate-800/50 border border-emerald-500/30 rounded-lg hover:bg-slate-800 hover:border-emerald-500/50 transition-all font-medium min-h-10 sm:min-h-11"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 active:bg-emerald-800 transition-all font-medium min-h-10 sm:min-h-11"
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-slate-900/95 rounded-xl w-full max-w-sm shadow-2xl border border-emerald-500/30 backdrop-blur-xl p-3 sm:p-6">
            <h3 className="text-base sm:text-xl font-bold text-white mb-2">Delete Activity?</h3>
            <p className="text-xs sm:text-sm text-emerald-200/70 mb-4 sm:mb-6 break-words">
              Are you sure you want to delete "<span className="font-semibold text-emerald-100">{activityData.title}</span>"? This action cannot be undone.
            </p>
            
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 justify-end">
              <button
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="px-3 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base text-emerald-200 bg-slate-800/50 border border-emerald-500/30 rounded-lg hover:bg-slate-800 hover:border-emerald-500/50 transition-all font-medium min-h-10 sm:min-h-11"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-3 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base text-white bg-red-600 rounded-lg hover:bg-red-700 active:bg-red-800 transition-all font-medium min-h-10 sm:min-h-11"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
