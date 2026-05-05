import React from 'react';
import { motion } from 'framer-motion';

export default function AnimatedDiaryBackground() {
  // Animated travel diary cards with different designs
  const DiaryCard = ({ delay, x, y, rotation, title, icon }) => (
    <motion.div
      className="absolute pointer-events-none select-none"
      initial={{ opacity: 0, scale: 0.5, rotate: rotation }}
      animate={{
        opacity: [0.4, 0.6, 0.4],
        scale: [0.95, 1.05, 0.95],
        rotate: [rotation, rotation + 5, rotation - 5, rotation],
        y: [0, -20, 0],
      }}
      transition={{
        duration: 6 + delay,
        delay: delay,
        repeat: Infinity,
        repeatType: 'loop',
      }}
      style={{ left: x, top: y, perspective: '1000px' }}
    >
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 w-40 h-32 shadow-lg pointer-events-none">
        <div className="text-3xl mb-2">{icon}</div>
        <p className="text-white text-sm font-semibold truncate">{title}</p>
        <div className="mt-2 h-1 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full w-3/4"></div>
      </div>
    </motion.div>
  );

  // Floating orbs
  const FloatingOrb = ({ delay, x, y, size, color }) => (
    <motion.div
      className="absolute rounded-full pointer-events-none select-none"
      style={{
        background: `radial-gradient(circle at 30% 30%, ${color}40, ${color}10)`,
        width: size,
        height: size,
        left: x,
        top: y,
        border: `2px solid ${color}20`,
      }}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.3, 0.5, 0.3],
        y: [0, -30, 0],
        x: [0, 10, 0],
      }}
      transition={{
        duration: 5 + delay,
        delay: delay,
        repeat: Infinity,
        repeatType: 'loop',
      }}
    />
  );

  // Animated lines connecting elements
  const ConnectingLine = ({ delay, start, end }) => (
    <motion.svg
      className="absolute pointer-events-none select-none"
      width="100%"
      height="100%"
      style={{ top: 0, left: 0 }}
      viewBox="0 0 1400 900"
    >
      <motion.line
        x1={start.x}
        y1={start.y}
        x2={end.x}
        y2={end.y}
        stroke="url(#lineGradient)"
        strokeWidth="2"
        strokeDasharray="100"
        initial={{ strokeDashoffset: 100 }}
        animate={{ strokeDashoffset: [100, 0, 100] }}
        transition={{
          duration: 4,
          delay: delay,
          repeat: Infinity,
        }}
        opacity="0.3"
      />
      <defs>
        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>
      </defs>
    </motion.svg>
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 select-none">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900" />

      {/* Animated grid */}
      <svg
        className="absolute inset-0 w-full h-full opacity-10 pointer-events-none"
        viewBox="0 0 1400 900"
      >
        <defs>
          <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="white" strokeWidth="1" />
          </pattern>
        </defs>
        <motion.rect
          width="1400"
          height="900"
          fill="url(#grid)"
          animate={{ y: [0, 50] }}
          transition={{ duration: 20, repeat: Infinity, repeatType: 'loop' }}
        />
      </svg>

      {/* Floating orbs */}
      <FloatingOrb delay={0} x="10%" y="20%" size="200px" color="#10b981" />
      <FloatingOrb delay={0.5} x="70%" y="60%" size="150px" color="#34d399" />
      <FloatingOrb delay={1} x="80%" y="10%" size="120px" color="#6ee7b7" />
      <FloatingOrb delay={1.5} x="15%" y="70%" size="100px" color="#a7f3d0" />

      {/* Travel diary cards */}
      <DiaryCard delay={0} x="5%" y="10%" rotation={-15} title="Paris Trip" icon="🗼" />
      <DiaryCard delay={0.3} x="75%" y="15%" rotation={12} title="Beach Day" icon="🏖️" />
      <DiaryCard delay={0.6} x="10%" y="60%" rotation={-8} title="Mountain Hike" icon="🏔️" />
      <DiaryCard delay={0.9} x="78%" y="65%" rotation={18} title="City Lights" icon="🌃" />
      <DiaryCard delay={1.2} x="40%" y="75%" rotation={-12} title="Adventure" icon="🎒" />

      {/* Connecting lines */}
      <ConnectingLine delay={0} start={{ x: 100, y: 100 }} end={{ x: 300, y: 300 }} />
      <ConnectingLine delay={0.5} start={{ x: 1000, y: 200 }} end={{ x: 800, y: 500 }} />
      <ConnectingLine delay={1} start={{ x: 200, y: 600 }} end={{ x: 600, y: 400 }} />

      {/* Particle effects */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none select-none"
          style={{
            background: `rgba(${[59, 130, 246, 168, 215, 247][i % 6]}, 0.5)`,
            width: Math.random() * 4 + 2,
            height: Math.random() * 4 + 2,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -100 - Math.random() * 100],
            opacity: [0, 1, 0],
            x: (Math.random() - 0.5) * 100,
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            delay: Math.random() * 3,
            repeat: Infinity,
          }}
        />
      ))}
    </div>
  );
}
