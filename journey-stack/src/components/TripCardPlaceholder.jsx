import React from 'react';
import { motion } from 'framer-motion';

export default function TripCardPlaceholder() {
  // Animated floating elements
  const floatingEmojis = ['✈️', '🗺️', '📸', '🎒', '🌍'];
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const floatingVariants = (delay) => ({
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 0.6,
      y: 0,
      transition: {
        delay,
        duration: 0.5,
        ease: "easeOut"
      }
    },
    animate: {
      y: [0, -20, 0],
      x: [0, 10, -5, 0],
      rotate: [-5, 5, -5],
      transition: {
        delay: 1 + delay,
        duration: 4 + delay * 0.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  });

  const orbVariants = {
    animate: {
      scale: [1, 1.2, 1],
      opacity: [0.3, 0.6, 0.3],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="relative h-48 w-full bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 overflow-hidden rounded-t-xl flex items-center justify-center">
      {/* Background grid pattern */}
      <svg
        className="absolute inset-0 w-full h-full opacity-10"
        width="100%"
        height="100%"
      >
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Animated orbs - breathing effect */}
      <motion.div
        className="absolute top-8 left-12 w-20 h-20 bg-white/20 rounded-full blur-2xl"
        variants={orbVariants}
        animate="animate"
      />
      <motion.div
        className="absolute bottom-6 right-8 w-24 h-24 bg-white/15 rounded-full blur-2xl"
        variants={orbVariants}
        animate="animate"
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5
        }}
      />

      {/* Floating elements container */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="relative w-full h-full flex items-center justify-center">
          {floatingEmojis.map((emoji, index) => (
            <motion.div
              key={index}
              className="absolute text-3xl"
              variants={floatingVariants(index * 0.15)}
              animate="animate"
              style={{
                left: `${20 + (index % 2) * 60}%`,
                top: `${30 + (index % 3) * 30}%`
              }}
            >
              {emoji}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Overlay text hint */}
      <div className="absolute inset-0 flex items-end justify-center pb-3 pointer-events-none">
        <p className="text-white/60 text-xs font-medium px-3 text-center">
          Add a cover photo to your trip
        </p>
      </div>
    </div>
  );
}
