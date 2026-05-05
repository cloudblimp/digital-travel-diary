import React from 'react';
import { motion } from 'framer-motion';

export default function TripDetailHeroPlaceholder() {
  // Animated floating elements
  const floatingEmojis = ['✈️', '🗺️', '📸', '🎒', '🌍', '🏖️', '🎫'];
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.15
      }
    }
  };

  const floatingVariants = (delay) => ({
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 0.5,
      y: 0,
      transition: {
        delay,
        duration: 0.6,
        ease: "easeOut"
      }
    },
    animate: {
      y: [0, -30, 0],
      x: [0, 15, -8, 0],
      rotate: [-8, 8, -8],
      transition: {
        delay: 1.2 + delay,
        duration: 5 + delay * 0.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  });

  const orbVariants = {
    animate: {
      scale: [1, 1.3, 1],
      opacity: [0.25, 0.5, 0.25],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="relative w-full h-72 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 overflow-hidden flex items-center justify-center">
      {/* Background grid pattern */}
      <svg
        className="absolute inset-0 w-full h-full opacity-10"
        width="100%"
        height="100%"
      >
        <defs>
          <pattern id="grid-large" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-large)" />
      </svg>

      {/* Animated orbs - breathing effect */}
      <motion.div
        className="absolute top-16 left-16 w-32 h-32 bg-white/20 rounded-full blur-3xl"
        variants={orbVariants}
        animate="animate"
      />
      <motion.div
        className="absolute bottom-12 right-20 w-40 h-40 bg-white/15 rounded-full blur-3xl"
        variants={orbVariants}
        animate="animate"
        transition={{
          duration: 4.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5
        }}
      />
      <motion.div
        className="absolute top-1/3 right-1/4 w-24 h-24 bg-white/10 rounded-full blur-2xl"
        variants={orbVariants}
        animate="animate"
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
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
              className="absolute text-5xl"
              variants={floatingVariants(index * 0.12)}
              animate="animate"
              style={{
                left: `${15 + (index % 3) * 35}%`,
                top: `${25 + (index % 4) * 25}%`
              }}
            >
              {emoji}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Overlay text hint */}
      <div className="absolute inset-0 flex items-end justify-center pb-6 pointer-events-none">
        <p className="text-white/70 text-sm font-medium px-4 text-center">
          This trip doesn't have a cover photo yet
        </p>
      </div>
    </div>
  );
}
