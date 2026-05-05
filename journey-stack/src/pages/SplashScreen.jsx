import React, { useCallback, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Lenis from 'lenis';
import TextType from '../components/TextType';

export default function SplashScreen({ onComplete }) {
  const [showContent, setShowContent] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // Show content after a brief delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  };

  const handleExplore = () => {
    setIsExiting(true);
    
    // Scroll down smoothly using Lenis
    const lenis = new Lenis({
      duration: 0.5,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      syncTouch: false,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Scroll to bottom of splash screen
    setTimeout(() => {
      lenis.scrollTo(window.innerHeight + 200, { duration: 0.5 });
    }, 50);

    // Fade out splash and complete
    setTimeout(() => {
      const splashElement = document.getElementById('splash-screen');
      if (splashElement) {
        splashElement.style.opacity = '0';
        splashElement.style.transition = 'opacity 0.3s ease-out';
        splashElement.style.pointerEvents = 'none';
      }
      
      setTimeout(() => {
        onComplete();
      }, 300);
    }, 600);
  };

  // Floating background elements
  const FloatingElement = ({ icon, delay, duration, x, y }) => (
    <motion.div
      className="floating-element"
      initial={{ opacity: 0, y: y + 20 }}
      animate={{ opacity: 0.15, y: y }}
      transition={{
        duration: duration,
        delay: delay,
        repeat: Infinity,
        repeatType: 'reverse',
        ease: 'easeInOut',
      }}
      style={{ left: x, position: 'absolute' }}
    >
      <span className="text-4xl">{icon}</span>
    </motion.div>
  );

  return (
    <motion.div
      id="splash-screen"
      className="splash-screen-container"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Floating Background Elements */}
      <div className="floating-elements-container">
        {/* Top Row */}
        <FloatingElement icon="✈" delay={0} duration={6} x="5%" y={-30} />
        <FloatingElement icon="📍" delay={0.5} duration={7} x="25%" y={-40} />
        <FloatingElement icon="📷" delay={1} duration={8} x="45%" y={-50} />
        <FloatingElement icon="🗺" delay={0.3} duration={6.5} x="65%" y={-35} />
        <FloatingElement icon="✓" delay={0.7} duration={7.5} x="85%" y={-45} />
        
        {/* Middle-Top Row */}
        <FloatingElement icon="🎒" delay={0.2} duration={7.2} x="15%" y={50} />
        <FloatingElement icon="🌍" delay={0.8} duration={6.8} x="35%" y={70} />
        <FloatingElement icon="📸" delay={1.2} duration={7.8} x="55%" y={40} />
        <FloatingElement icon="🧭" delay={0.5} duration={6.3} x="75%" y={60} />
        <FloatingElement icon="🚀" delay={0.9} duration={7.4} x="90%" y={45} />
        
        {/* Middle Row */}
        <FloatingElement icon="⭐" delay={0.4} duration={8} x="8%" y={150} />
        <FloatingElement icon="🏖" delay={1.1} duration={6.9} x="30%" y={160} />
        <FloatingElement icon="🗼" delay={0.6} duration={7.6} x="50%" y={140} />
        <FloatingElement icon="🎯" delay={0.3} duration={7.1} x="70%" y={170} />
        <FloatingElement icon="💼" delay={1} duration={6.5} x="88%" y={150} />
        
        {/* Middle-Bottom Row */}
        <FloatingElement icon="🌏" delay={0.7} duration={7.3} x="12%" y={280} />
        <FloatingElement icon="✈️" delay={1.3} duration={6.7} x="32%" y={270} />
        <FloatingElement icon="🎨" delay={0.2} duration={7.9} x="52%" y={290} />
        <FloatingElement icon="📍" delay={0.8} duration={6.4} x="72%" y={280} />
        <FloatingElement icon="🌟" delay={0.4} duration={7.7} x="92%" y={275} />
        
        {/* Bottom Row */}
        <FloatingElement icon="🏔" delay={0.6} duration={6.8} x="5%" y={380} />
        <FloatingElement icon="🎭" delay={0.9} duration={7.5} x="28%" y={390} />
        <FloatingElement icon="🌺" delay={0.3} duration={7.2} x="48%" y={385} />
        <FloatingElement icon="🎪" delay={1.1} duration={6.6} x="68%" y={395} />
        <FloatingElement icon="🎬" delay={0.5} duration={7.8} x="88%" y={380} />
      </div>

      {/* Content */}
      {showContent && (
        <motion.div
          className="splash-content"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Logo/Title */}
          <motion.div variants={itemVariants} className="splash-logo">
            <div className="flex items-center justify-center gap-2 mb-4">
              <motion.img 
                src="/journeyStack-logo-t.svg"
                alt="JourneyStack Logo"
                className="h-12 w-12 md:h-12 md:w-12 sm:h-6 sm:w-6"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              />
              <TextType 
                text="journeyStack"
                speed={40}
                delay={800}
                className="text-4xl md:text-4xl sm:text-1xl font-semibold text-white tracking-wider"
              />
            </div>
            <h1 className="text-7xl md:text-7xl sm:text-4xl font-black text-white drop-shadow-lg leading-tight">
              Capture Every<br />Journey
            </h1>
          </motion.div>

          {/* Tagline */}
          <motion.div variants={itemVariants} className="splash-tagline">
            <p className="text-lg md:text-lg sm:text-xs text-gray-100 drop-shadow-md max-w-2xl">
              Your digital travel companion for documenting adventures, memories, and discoveries around the world
            </p>
          </motion.div>

          {/* CTA Button */}
          <motion.div variants={itemVariants} className="splash-cta">
            <button
              onClick={handleExplore}
              className="px-8 md:px-8 sm:px-4 py-3 md:py-3 sm:py-2 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white font-semibold md:text-base sm:text-xs rounded-full transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95 border border-white/30 flex items-center gap-2"
            >
              Start Your Journey
              <span>→</span>
            </button>
          </motion.div>

          {/* Features Grid */}
          <motion.div variants={itemVariants} className="splash-features">
            <div className="features-grid">
              <div className="feature-card">
                <span className="text-3xl md:text-3xl sm:text-lg mb-2">⭐</span>
                <h3 className="font-semibold text-white md:text-base sm:text-xs mb-1">Smart Organization</h3>
                <p className="text-sm md:text-sm sm:text-xs text-gray-200">Organize by location, date, and tags</p>
              </div>
              <div className="feature-card">
                <span className="text-3xl md:text-3xl sm:text-lg mb-2">📍</span>
                <h3 className="font-semibold text-white md:text-base sm:text-xs mb-1">Interactive Maps</h3>
                <p className="text-sm md:text-sm sm:text-xs text-gray-200">Visualize adventures on maps</p>
              </div>
            </div>
          </motion.div>

          {/* Footer Text */}
          <motion.div variants={itemVariants} className="splash-footer">
            <p className="text-sm md:text-sm sm:text-xs text-gray-300 drop-shadow-md">
              Ready to start documenting your adventures?
            </p>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
