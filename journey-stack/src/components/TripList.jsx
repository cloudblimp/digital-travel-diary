import React from "react";
import { motion } from "framer-motion";
import { FaPlus } from "react-icons/fa";
import TripCard from "./TripCard";
import AnimatedDiaryBackground from "./AnimatedDiaryBackground";

export default function TripList({ trips = [], isLoading = false, onCreateTrip, onTripSelect }) {
  // Container animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  // Card animation
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="relative w-full">
      {/* Loading Spinner */}
      {isLoading && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin inline-block">
              <svg className="w-12 h-12 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p className="mt-4 text-emerald-200 text-lg">Loading your trips...</p>
          </div>
        </div>
      )}

      {/* Content - Only show when not loading */}
      {!isLoading && (
      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-8">
        {/* Page Header */}
        <motion.div
          className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-0 mb-6 sm:mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="text-white">
            <h1 className="text-2xl sm:text-3xl font-bold">My Travel Journeys</h1>
            <p className="mt-1 sm:mt-2 text-sm sm:text-base opacity-80">
              Document your adventures around the world
            </p>
          </div>
          <motion.button
            onClick={onCreateTrip}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center px-4 py-2 sm:px-5 sm:py-3 bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-lg hover:bg-white/30 hover:border-white/40 active:bg-white/25 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/50 transition-all duration-75 min-h-[44px] shadow-lg hover:shadow-xl"
          >
            <FaPlus className="h-4 w-4 mr-2" />
            New Trip
          </motion.button>
        </motion.div>

        {/* Trip Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          key={`trip-grid-${trips.length}`}
        >
          {trips.length > 0
            ? trips.map((trip, index) => (
                <motion.div key={trip.id} variants={cardVariants}>
                  <TripCard trip={trip} onTripSelect={onTripSelect} />
                </motion.div>
              ))
            : null}
        </motion.div>

        {/* Empty State */}
        {trips.length === 0 && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-lg font-medium text-white mb-2">
              No trips yet
            </h3>
            <p className="text-white/80">
              Create your first trip to start documenting your adventures!
            </p>
          </motion.div>
        )}
      </div>
      )}
    </div>
  );
}
