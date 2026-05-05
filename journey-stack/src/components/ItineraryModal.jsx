import React, { useState, useMemo, useEffect } from 'react';
import { FaTimes, FaChevronLeft, FaChevronRight, FaPlus } from 'react-icons/fa';
import AddActivityModal from './AddActivityModal';
import EditActivityModal from './EditActivityModal';
import { useActivities } from '../hooks/useActivities';
import { parseLocalDate, formatISTTime, getISTDateKey } from '../utils/dateUtils';

export default function ItineraryModal({ isOpen, onClose, trip, activities = [] }) {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [isAddActivityModalOpen, setIsAddActivityModalOpen] = useState(false);
  const [isEditActivityModalOpen, setIsEditActivityModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [checkedEntries, setCheckedEntries] = useState({});
  const { createActivity } = useActivities();

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const activityTypes = [
    { icon: '↗', label: 'Activity', color: 'bg-blue-100 text-blue-700' },
    { icon: '🏨', label: 'Accommodation', color: 'bg-orange-100 text-orange-700' },
    { icon: '🍽', label: 'Food & Dining', color: 'bg-red-100 text-red-700' },
    { icon: '✈', label: 'Transport', color: 'bg-green-100 text-green-700' },
    { icon: '...', label: 'Other', color: 'bg-gray-100 text-gray-700' }
  ];

  // Format date to YYYY-MM-DD in local timezone (not UTC)
  const formatDateToKey = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const date = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${date}`;
  };

  // Calculate trip days - simplified
  const tripDays = useMemo(() => {
    try {
      if (!trip?.startDate || !trip?.endDate) return [];

      const start = parseLocalDate(trip.startDate);
      const end = parseLocalDate(trip.endDate);
      const days = [];

      const current = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      const endDate = new Date(end.getFullYear(), end.getMonth(), end.getDate());

      while (current <= endDate) {
        days.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }

      return days;
    } catch (error) {
      console.error('Error calculating trip days:', error);
      return [];
    }
  }, [trip?.startDate, trip?.endDate]);

  // Group activities by day
  const activitiesByDay = useMemo(() => {
    const grouped = {};

    tripDays.forEach((day) => {
      const dayKey = formatDateToKey(day);
      grouped[dayKey] = [];
    });

    activities.forEach((activity) => {
      try {
        // Use getISTDateKey to ensure 2:30 AM IST doesn't get grouped into the previous day in Western timezones
        const activityDate = getISTDateKey(activity.dateTime);
        if (grouped[activityDate]) {
          grouped[activityDate].push(activity);
        }
      } catch (e) {
        console.error('Error processing activity:', e);
      }
    });

    return grouped;
  }, [activities, tripDays, formatDateToKey]);

  // Early return AFTER all hooks
  if (!isOpen) return null;
  if (!trip || tripDays.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6">
          <p>No trip data available</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-gray-900 text-white rounded">
            Close
          </button>
        </div>
      </div>
    );
  }

  const currentDay = tripDays[selectedDayIndex];
  const currentDayKey = currentDay ? formatDateToKey(currentDay) : null;
  const currentDayActivities = currentDayKey ? (activitiesByDay[currentDayKey] || []) : [];

  const handlePrevDay = () => {
    if (selectedDayIndex > 0) {
      setSelectedDayIndex(selectedDayIndex - 1);
    }
  };

  const handleNextDay = () => {
    if (selectedDayIndex < tripDays.length - 1) {
      setSelectedDayIndex(selectedDayIndex + 1);
    }
  };

  const formatDate = (d) => {
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const formatDayOfWeek = (d) => {
    return d.toLocaleDateString('en-US', { weekday: 'long' });
  };

  const handleCheckboxChange = (entryId) => {
    setCheckedEntries(prev => ({
      ...prev,
      [entryId]: !prev[entryId]
    }));
  };

  const handleAddActivity = async (activityData) => {
    try {
      if (!createActivity) {
        console.error('createActivity function not provided');
        return;
      }

      // Call createActivity with the activity data
      await createActivity(trip.id, {
        title: activityData.title || '',
        type: activityData.type || 'Activity',
        dateTime: activityData.dateTime || '',
        location: activityData.location || '',
        description: activityData.description || ''
      });

      console.log('Activity added successfully');
    } catch (error) {
      console.error('Error adding activity:', error);
      throw error;
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-slate-900/95 rounded-xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col border border-emerald-500/30 backdrop-blur-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-6 border-b border-emerald-500/20">
          <div className="flex-1">
            <h1 className="text-lg sm:text-2xl font-bold text-white">Trip Itinerary</h1>
            <p className="text-xs sm:text-sm text-emerald-200/70 mt-1">Plan your daily activities and keep track of your schedule</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-emerald-500/10 rounded-lg text-emerald-400/60 hover:text-emerald-400 transition-colors flex-shrink-0">
            <FaTimes className="text-lg sm:text-xl" />
          </button>
        </div>

        {/* Body - Responsive Layout */}
        <div className="flex flex-col lg:flex-row flex-1 gap-0 lg:gap-6 p-3 sm:p-6 overflow-y-auto">
          {/* Sidebar - Hidden on mobile, shown as tabs */}
          <div className="hidden lg:block w-64 border-r border-emerald-500/20 pr-6 overflow-y-auto">
            <h3 className="font-semibold text-emerald-100 mb-4 text-xs sm:text-sm uppercase">Trip Days</h3>
            <div className="space-y-2">
              {tripDays.map((day, index) => {
                const dayKey = formatDateToKey(day);
                const count = activitiesByDay[dayKey]?.length || 0;
                const isSelected = selectedDayIndex === index;

                return (
                  <button
                    key={index}
                    onClick={() => setSelectedDayIndex(index)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      isSelected ? 'bg-emerald-500/20 border-2 border-emerald-500' : 'border-2 border-emerald-500/20 hover:bg-emerald-500/10 hover:border-emerald-500/40'
                    }`}
                  >
                    <div className="font-semibold text-white text-sm">Day {index + 1}</div>
                    <div className="text-xs text-emerald-200/70 mt-1">
                      {day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="text-xs text-emerald-200/50 mt-2">{count}/{count}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden min-w-0">
            {/* Day Selector - Mobile Only */}
            <div className="lg:hidden mb-4">
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={handlePrevDay}
                  disabled={selectedDayIndex === 0}
                  className="p-2 hover:bg-emerald-500/10 rounded-lg disabled:opacity-50 text-emerald-400 hover:text-emerald-300 transition-colors flex-shrink-0"
                >
                  <FaChevronLeft className="text-lg" />
                </button>

                {/* Horizontal Day Scroll - Mobile */}
                <div className="flex-1 overflow-x-auto scrollbar-hide">
                  <div className="flex gap-2 pb-2">
                    {tripDays.map((day, index) => {
                      const isSelected = selectedDayIndex === index;
                      return (
                        <button
                          key={index}
                          onClick={() => setSelectedDayIndex(index)}
                          className={`px-3 py-2 rounded-lg text-xs font-medium flex-shrink-0 transition-all whitespace-nowrap ${
                            isSelected
                              ? 'bg-emerald-500 text-white'
                              : 'bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30'
                          }`}
                        >
                          Day {index + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={handleNextDay}
                  disabled={selectedDayIndex === tripDays.length - 1}
                  className="p-2 hover:bg-emerald-500/10 rounded-lg disabled:opacity-50 text-emerald-400 hover:text-emerald-300 transition-colors flex-shrink-0"
                >
                  <FaChevronRight className="text-lg" />
                </button>
              </div>
            </div>

            {/* Day Header */}
            <div className="flex items-center justify-between mb-3 sm:mb-6">
              <div className="min-w-0">
                <h2 className="text-lg sm:text-xl font-semibold text-white truncate">Day {selectedDayIndex + 1}</h2>
                <p className="text-xs sm:text-sm text-emerald-200/70">{formatDayOfWeek(currentDay)}, {formatDate(currentDay)}</p>
                <p className="text-xs text-emerald-200/50 mt-1">{currentDayActivities.length} activities planned</p>
              </div>

              {/* Navigation Buttons - Desktop Only */}
              <div className="hidden lg:flex gap-2 flex-shrink-0">
                <button
                  onClick={handlePrevDay}
                  disabled={selectedDayIndex === 0}
                  className="p-2 hover:bg-emerald-500/10 rounded-lg disabled:opacity-50 text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  <FaChevronLeft />
                </button>
                <button
                  onClick={handleNextDay}
                  disabled={selectedDayIndex === tripDays.length - 1}
                  className="p-2 hover:bg-emerald-500/10 rounded-lg disabled:opacity-50 text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  <FaChevronRight />
                </button>
              </div>
            </div>

            <button 
              onClick={() => setIsAddActivityModalOpen(true)}
              className="inline-flex items-center px-3 sm:px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 active:bg-emerald-800 mb-3 sm:mb-6 w-fit transition-colors font-medium text-sm sm:text-base min-h-10 sm:min-h-11">
              <FaPlus className="mr-2 h-4 w-4" /> Add Activity
            </button>

            {/* Activities List */}
            <div className="flex-1 overflow-y-auto space-y-2 sm:space-y-3">
              {currentDayActivities.length === 0 ? (
                <p className="text-emerald-200/50 text-center py-8 text-sm">No activities for this day</p>
              ) : (
                currentDayActivities.map((activity) => {
                  const time = formatISTTime(activity.dateTime);
                  const isChecked = checkedEntries[activity.id] || false;

                  const activityType = activityTypes.find(t => t.label === activity.type) || activityTypes[0];

                  return (
                    <div key={activity.id} className="border border-emerald-500/30 rounded-lg p-2 sm:p-4 flex gap-2 sm:gap-4 bg-slate-800/30 hover:bg-slate-800/50 transition-colors">
                      <input 
                        type="checkbox" 
                        checked={isChecked}
                        onChange={() => handleCheckboxChange(activity.id)}
                        className="mt-1 w-4 h-4 sm:w-5 sm:h-5 cursor-pointer accent-emerald-500 flex-shrink-0" 
                      />
                      <button
                        onClick={() => {
                          console.log('Clicked on activity:', activity);
                          setSelectedActivity(activity);
                          setIsEditActivityModalOpen(true);
                        }}
                        type="button"
                        className="flex-1 text-left hover:opacity-80 transition-opacity min-w-0"
                      >
                        <div className="flex items-center gap-1 sm:gap-2 mb-1 flex-wrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded flex items-center gap-1 flex-shrink-0 ${
                            activity.type === 'Activity' ? 'bg-cyan-500/30 text-cyan-200' :
                            activity.type === 'Accommodation' ? 'bg-amber-500/30 text-amber-200' :
                            activity.type === 'Food & Dining' ? 'bg-orange-500/30 text-orange-200' :
                            activity.type === 'Transport' ? 'bg-teal-500/30 text-teal-200' :
                            'bg-emerald-500/30 text-emerald-200'
                          }`}>
                            <span>{activityType.icon}</span>
                            <span className="hidden sm:inline">{activityType.label}</span>
                          </span>
                          <span className="text-xs sm:text-sm text-emerald-200/70">{time}</span>
                        </div>
                        <h4 className={`font-semibold text-white text-sm sm:text-base break-words ${isChecked ? 'line-through text-emerald-200/50' : ''}`}>{activity.title}</h4>
                        {activity.description && <p className="text-xs sm:text-sm text-emerald-200/70 mt-2 break-words">{activity.description}</p>}
                        {activity.location && <p className="text-xs sm:text-sm text-emerald-200/70 mt-2 break-words">📍 {activity.location}</p>}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Activity Modal */}
      <AddActivityModal
        isOpen={isAddActivityModalOpen}
        onClose={() => setIsAddActivityModalOpen(false)}
        tripId={trip?.id}
        selectedDate={currentDayKey}
        onAddActivity={handleAddActivity}
      />

      {/* Edit Activity Modal */}
      <EditActivityModal
        isOpen={isEditActivityModalOpen}
        onClose={() => {
          setIsEditActivityModalOpen(false);
          setSelectedActivity(null);
        }}
        activity={selectedActivity}
        onActivityUpdated={() => {
          // Activities will update automatically via Firestore listener
        }}
      />
    </div>
  );
}
