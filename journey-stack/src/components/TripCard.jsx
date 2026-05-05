import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTrip } from '../contexts/TripContext.jsx';
import { FaCalendarAlt } from 'react-icons/fa';
import TripCardPlaceholder from './TripCardPlaceholder';

export default function TripCard({ trip }) {
  const { setSelectedTrip } = useTrip();
  const [imageError, setImageError] = useState(false);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleClick = () => {
    setSelectedTrip(trip);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <Link
        to={`/trip/${trip.id}`}
        onClick={handleClick}
        className="block bg-white/20 backdrop-blur-md border border-white/30 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl hover:bg-white/30 hover:border-white/40 active:shadow-lg active:scale-98 transition-all duration-75 touch-manipulation"
      >
        {/* Image or Placeholder */}
        <motion.div 
          className="relative h-48 w-full bg-gray-800 overflow-hidden rounded-t-xl"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.4 }}
        >
          {imageError || !trip.coverImage ? (
            <TripCardPlaceholder />
          ) : (
            <img
              src={trip.coverImage}
              alt={trip.title}
              className="w-full h-full object-cover rounded-t-lg"
              onError={handleImageError}
            />
          )}
        </motion.div>

        {/* Content */}
        <div className="p-4 text-white">
          <h3 className="text-xl font-semibold text-white mb-2">
            {trip.title}
          </h3>
          <p className="text-white/80 text-sm mb-4 line-clamp-2">
            {trip.description}
          </p>
          <div className="flex items-center text-white/60 text-sm">
            <FaCalendarAlt className="h-4 w-4 mr-2" />
            <span>
              {formatDate(trip.startDate)}{trip.endDate ? ` - ${formatDate(trip.endDate)}` : ''}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

