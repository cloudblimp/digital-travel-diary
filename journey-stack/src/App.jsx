import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./contexts/AuthContext.jsx"; // Import our auth hook
import { TripProvider } from "./contexts/TripContext.jsx";

// Import Pages
import Dashboard from "./pages/Dashboard.jsx";
import TripDetail from "./pages/TripDetail.jsx";
import MapView from "./pages/MapView.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Profile from "./pages/Profile.jsx";
import AccountSettings from "./pages/AccountSettings.jsx";
import TripSettings from "./pages/TripSettings.jsx";
import SplashScreen from "./pages/SplashScreen.jsx";
import Invitations from "./pages/Invitations.jsx";
import AuthCallback from "./pages/AuthCallback.jsx";

// Import Components
import Navbar from "./components/Navbar.jsx";

/**
 * A protected route component.
 * If the user is logged in (currentUser exists), it renders the requested component.
 * If not, it redirects them to the /login page.
 */
function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();
  if (!currentUser) {
    // User not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }
  return children; // User is logged in, render the component
}

/**
 * The main App component that sets up all the routes.
 */
export default function App() {
  const { loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  // Check if splash screen has been shown in this session
  useEffect(() => {
    const hasSeenSplashThisSession = sessionStorage.getItem('splashShown');
    if (hasSeenSplashThisSession) {
      setShowSplash(false);
    }
  }, []);

  const handleSplashComplete = () => {
    // Mark splash as shown in this session (will reset on browser restart)
    sessionStorage.setItem('splashShown', 'true');
    setShowSplash(false);
  };

  // Show splash screen on first visit (or after app restart)
  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  // Show a loading spinner while auth state is being restored from token
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="text-center">
          <div className="animate-spin inline-block w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full mb-3" />
          <div className="text-emerald-200 text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  // Auth state is loaded, render the app
  return (
    <TripProvider>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-gray-50">
        <Navbar /> {/* The Navbar will show on every page */}
        <main>
          <Routes>
          {/* Protected Routes:
            These routes can only be accessed if the user is logged in.
          */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trip/:tripId"
            element={
              <ProtectedRoute>
                <TripDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <AccountSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trip-settings"
            element={
              <ProtectedRoute>
                <TripSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/map"
            element={
              <ProtectedRoute>
                <MapView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/invitations"
            element={
              <ProtectedRoute>
                <Invitations />
              </ProtectedRoute>
            }
          />
          {/* Google OAuth callback — public, no auth required yet */}
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Public Routes:
            These routes are accessible to everyone.
          */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Catch-all Route:
            If no other route matches, redirect to the dashboard (which will
            then redirect to /login if the user is not authenticated).
          */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
    </TripProvider>
  );
}
