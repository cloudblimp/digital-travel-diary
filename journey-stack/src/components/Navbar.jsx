import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Menu, Transition } from '@headlessui/react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { getSocket } from '../services/socket';
import apiClient from '../services/apiClient';
import { FaSuitcase, FaMap, FaUser, FaCogs, FaSignOutAlt, FaBell, FaBars, FaTimes } from 'react-icons/fa';

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hasModalOpen, setHasModalOpen] = useState(false);
  const [inviteCount, setInviteCount] = useState(0);

  // Detect when modals are open
  useEffect(() => {
    const checkModals = () => {
      const modals = document.querySelectorAll('[role="dialog"], .fixed.inset-0.bg-slate-900');
      setHasModalOpen(modals.length > 0);
    };

    checkModals();
    const observer = new MutationObserver(checkModals);
    observer.observe(document.body, { childList: true, subtree: true });
    
    return () => observer.disconnect();
  }, []);

  // Fetch invite count and subscribe to real-time invite events
  useEffect(() => {
    if (!currentUser) return;

    const fetchInviteCount = () => {
      apiClient.get('/invitations/count')
        .then(({ data }) => setInviteCount(data.count))
        .catch(() => {});
    };

    fetchInviteCount();

    const socket = getSocket();
    if (socket) {
      const onNewInvite = () => setInviteCount(c => c + 1);
      const onAccepted  = () => setInviteCount(c => Math.max(0, c - 1));
      const onDeclined  = () => setInviteCount(c => Math.max(0, c - 1));
      socket.on('invite:new',      onNewInvite);
      socket.on('invite:accepted', onAccepted);
      socket.on('invite:declined', onDeclined);
      return () => {
        socket.off('invite:new',      onNewInvite);
        socket.off('invite:accepted', onAccepted);
        socket.off('invite:declined', onDeclined);
      };
    }
  }, [currentUser]);

  const handleLogout = async () => {
    setLoading(true);
    toast.promise(
      logout(),
      {
        loading: 'Logging out...',
        success: 'Logged out successfully! 👋',
        error: (err) => err?.message || 'Logout failed'
      }
    ).then(() => {
      navigate('/login');
    }).catch((err) => {
      console.error('Logout error', err);
    }).finally(() => {
      setLoading(false);
    });
  };

  // Get user's first initial for avatar
  const userInitial = currentUser?.displayName?.[0]?.toUpperCase() || currentUser?.email?.[0]?.toUpperCase() || '?';

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 shadow-lg sticky top-0 z-40 transition-all duration-200 ${hasModalOpen ? 'pointer-events-none opacity-50' : 'pointer-events-auto opacity-100'}`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex justify-between h-14 sm:h-16">
          {/* Logo / App Name */}
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <img 
                src="/journeyStack-logo-t.svg"
                alt="JourneyStack Logo"
                className="h-8 w-8 sm:h-10 sm:w-10"
              />
              <span className="text-lg sm:text-2xl font-bold text-white">
                journeyStack
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          {currentUser && (
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Invite Bell */}
              <Link
                to="/invitations"
                className="relative p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Trip Invitations"
              >
                <FaBell className="h-5 w-5" />
                {inviteCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full">
                    {inviteCount > 9 ? '9+' : inviteCount}
                  </span>
                )}
              </Link>
              {/* Desktop Links (hidden on mobile) */}
              <Link
                to="/"
                className={`hidden md:flex items-center space-x-2 px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium min-h-[44px] transition-all duration-75 active:scale-95 ${
                  isActive('/') 
                    ? 'text-white font-semibold bg-white/20'
                    : 'text-white hover:bg-white/10 active:bg-white/20'
                }`}
              >
                <FaSuitcase className="h-4 w-4" />
                <span className="hidden sm:inline">My Trips</span>
              </Link>
              
              <Link
                to="/map"
                className={`hidden md:flex items-center space-x-2 px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium min-h-[44px] transition-all duration-75 active:scale-95 ${
                  isActive('/map')
                    ? 'text-white font-semibold bg-white/20'
                    : 'text-white hover:bg-white/10 active:bg-white/20'
                }`}
              >
                <FaMap className="h-4 w-4" />
                <span className="hidden sm:inline">Map View</span>
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden flex items-center justify-center h-10 w-10 rounded-md text-white hover:bg-white/10 active:bg-white/20 transition-all duration-75 active:scale-95"
              >
                {mobileMenuOpen ? (
                  <FaTimes className="h-5 w-5" />
                ) : (
                  <FaBars className="h-5 w-5" />
                )}
              </button>

              {/* Mobile Navigation Menu */}
              {mobileMenuOpen && (
                <div className="md:hidden absolute top-14 left-0 right-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 shadow-lg border-t border-white/10 z-30">
                  <div className="px-3 py-3 space-y-1">
                    <Link
                      to="/"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 px-3 py-3 rounded-md text-sm font-medium min-h-[44px] transition-all duration-75 active:scale-95 ${
                        isActive('/')
                          ? 'text-white font-semibold bg-white/20'
                          : 'text-white hover:bg-white/10 active:bg-white/20'
                      }`}
                    >
                      <FaSuitcase className="h-4 w-4" />
                      <span>My Trips</span>
                    </Link>
                    
                    <Link
                      to="/map"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 px-3 py-3 rounded-md text-sm font-medium min-h-[44px] transition-all duration-75 active:scale-95 ${
                        isActive('/map')
                          ? 'text-white font-semibold bg-white/20'
                          : 'text-white hover:bg-white/10 active:bg-white/20'
                      }`}
                    >
                      <FaMap className="h-4 w-4" />
                      <span>Map View</span>
                    </Link>
                  </div>
                </div>
              )}

              {/* User Menu with Headless UI */}
              <Menu as="div" className="relative ml-3">
                <div>
                  <Menu.Button 
                    onClick={() => setMobileMenuOpen(false)}
                    className="h-10 w-10 sm:h-8 sm:w-8 rounded-full bg-white text-emerald-600 flex items-center justify-center text-sm font-medium hover:bg-white/90 active:bg-white/80 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-all duration-75 overflow-hidden">
                    {currentUser?.photoUrl ? (
                      <img src={currentUser.photoUrl} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      userInitial
                    )}
                  </Menu.Button>
                </div>

                <Transition
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none py-1 z-50">
                    {/* User Email Header */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Signed in as</p>
                      <p className="text-sm text-gray-900 font-medium truncate mt-1">{currentUser?.email}</p>
                    </div>

                    {/* My Profile */}
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="/profile"
                          className={`flex items-center space-x-3 px-4 py-3 text-sm min-h-[48px] ${
                            active ? 'bg-gray-100' : ''
                          } hover:bg-gray-50 active:bg-gray-200 active:scale-95 transition-all duration-75`}
                        >
                          <FaUser className="h-4 w-4 text-gray-600" />
                          <span>My Profile</span>
                        </Link>
                      )}
                    </Menu.Item>

                    {/* Account Settings */}
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="/account"
                          className={`flex items-center space-x-3 px-4 py-3 text-sm min-h-[48px] ${
                            active ? 'bg-gray-100' : ''
                          } hover:bg-gray-50 active:bg-gray-200 active:scale-95 transition-all duration-75`}
                        >
                          <FaCogs className="h-4 w-4 text-gray-600" />
                          <span>Account Settings</span>
                        </Link>
                      )}
                    </Menu.Item>

                    {/* Trip Settings */}
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="/trip-settings"
                          className={`flex items-center space-x-3 px-4 py-3 text-sm min-h-[48px] ${
                            active ? 'bg-gray-100' : ''
                          } hover:bg-gray-50 active:bg-gray-200 active:scale-95 transition-all duration-75`}
                        >
                          <FaCogs className="h-4 w-4 text-gray-600" />
                          <span>Trip Settings</span>
                        </Link>
                      )}
                    </Menu.Item>

                    {/* Invitations */}
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="/invitations"
                          className={`flex items-center space-x-3 px-4 py-3 text-sm min-h-[48px] ${
                            active ? 'bg-gray-100' : ''
                          } hover:bg-gray-50 active:bg-gray-200 active:scale-95 transition-all duration-75`}
                        >
                          <FaBell className="h-4 w-4 text-gray-600" />
                          <span className="flex items-center gap-2">
                            Invitations
                            {inviteCount > 0 && (
                              <span className="h-5 w-5 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full">
                                {inviteCount}
                              </span>
                            )}
                          </span>
                        </Link>
                      )}
                    </Menu.Item>

                    {/* Divider */}
                    <div className="border-t border-gray-100 my-1"></div>

                    {/* Logout */}
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleLogout}
                          disabled={loading}
                          className={`w-full flex items-center space-x-3 px-4 py-3 text-sm text-left min-h-[48px] ${
                            active ? 'bg-red-50' : ''
                          } text-red-600 hover:text-red-700 hover:bg-red-50 active:bg-red-100 active:scale-95 disabled:opacity-50 transition-all duration-75`}
                        >
                          <FaSignOutAlt className="h-4 w-4" />
                          <span>{loading ? 'Logging out...' : 'Logout'}</span>
                        </button>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          )}

          {/* Login/Signup for non-authenticated users */}
          {!currentUser && (
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link
                to="/login"
                className="text-white hover:bg-white/10 px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium min-h-[44px] transition-all duration-75 active:scale-95 active:bg-white/20"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="bg-white text-emerald-600 px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium hover:bg-white/90 active:bg-white/80 active:scale-95 min-h-[44px] transition-all duration-75"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}


