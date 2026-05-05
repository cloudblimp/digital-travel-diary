import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import Lenis from 'lenis';
import { AuthProvider } from './contexts/AuthContext.jsx'; // Import our provider
import App from './App.jsx';
import './index.css'; // This imports our Tailwind styles
import 'leaflet/dist/leaflet.css'; // Import Leaflet CSS for map styling

// Initialize Lenis for smooth scrolling
function initLenis() {
  try {
    const lenis = new Lenis({
      duration: 0.6,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      syncTouch: false,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
      prevent: (node) => {
        // Don't apply Lenis smooth scroll to modal forms and other scrollable containers
        if (node.closest('[role="dialog"]')) return true;
        if (node.closest('.overflow-y-auto')) return true;
        return false;
      }
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
    return lenis;
  } catch (err) {
    console.warn('Lenis initialization failed:', err);
  }
}

// Initialize Lenis on page load with 500ms delay to prevent animation conflicts
if (typeof window !== 'undefined') {
  setTimeout(() => {
    initLenis();
  }, 500);
}

// We wrap the <App /> component with our providers.
// The order matters: BrowserRouter should be on the outside.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

