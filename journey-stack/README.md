# 🌍 JourneyStack - Digital Travel Diary

A modern, mobile-first web application for documenting travel adventures, planning trip itineraries, and capturing travel memories with photos and detailed entries.

## 📖 Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Configuration](#configuration)
- [Usage Guide](#usage-guide)
- [Mobile Responsiveness](#mobile-responsiveness)
- [Deployment](#deployment)
- [Key Improvements](#key-improvements)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

---

## 🎯 Project Overview

**JourneyStack** is a comprehensive travel documentation platform that allows users to:
- Create and manage multiple trips
- Document travel experiences with detailed entries
- Plan and organize trip itineraries with daily activities
- Capture and manage trip cover photos
- View trip locations on an interactive map
- Track accommodations, dining, transport, and other activities

### Why This Project?

Traditional travel diaries and planning apps are often cluttered or lack proper organization. JourneyStack provides a **modern, intuitive interface** for:
- ✅ Effortless trip planning with day-by-day itineraries
- ✅ Seamless activity management (accommodation, dining, transport, etc.)
- ✅ Beautiful photo management with drag-and-drop support
- ✅ Mobile-optimized experience for on-the-go access
- ✅ Real-time cloud synchronization across devices

---

## ✨ Features

### Core Features
- **Trip Management**
  - Create, edit, and delete trips
  - Set trip dates and locations
  - Add cover photos with easy management UI
  - Organize multiple trips in a dashboard

- **Trip Itineraries**
  - Plan daily activities organized by date
  - Add activities with type categorization (Accommodation, Dining, Transport, Activities, Other)
  - Set specific times for activities
  - Add descriptions and locations for each activity
  - Mark activities as complete with checkboxes

- **Travel Entries**
  - Create detailed journal entries
  - Add multiple photos per entry
  - Organize entries by trip
  - Edit and delete entries anytime

- **Trip Photos**
  - Drag-and-drop photo upload
  - Gallery view of all trip photos
  - Change or remove cover photos easily
  - Real-time photo management

- **Location Mapping**
  - Interactive map view showing trip locations
  - Visual representation of travel routes
  - Zoom and pan controls

- **User Accounts**
  - Secure authentication with Firebase
  - User profiles with settings
  - Account management and preferences
  - Profile picture and bio management

- **Responsive Design**
  - Mobile-first approach (optimized for iPhone SE 375px)
  - Seamless scaling to tablets and desktops
  - Touch-friendly interface with 44px+ minimum button sizes
  - Smooth scrolling and animations

---

## 🛠 Tech Stack

### Frontend
- **React 19.1.1** - Modern UI library with latest features
- **Vite 7.1.7** - Lightning-fast build tool and dev server
- **Tailwind CSS 4.1.16** - Utility-first CSS framework
- **Framer Motion 12.23.24** - Smooth animations and transitions

### State Management & Forms
- **React Context API** - Global state management (Auth, Trips)
- **React Hook Form 7.66.0** - Efficient form handling
- **Zod 4.1.12** - TypeScript-first schema validation

### UI Components & Icons
- **Headless UI 2.2.9** - Unstyled, accessible components
- **React Icons 5.5.0** - Comprehensive icon library
- **React Hot Toast 2.6.0** - Toast notifications

### Backend & Database
- **Firebase 12.5.0**
  - Firestore - Real-time cloud database
  - Authentication - Secure user management
  - Cloud Storage - Photo and media storage

### Maps & Utilities
- **Leaflet 1.9.4** - Interactive mapping library
- **React Leaflet 5.0.0** - React integration for Leaflet
- **Lenis 1.3.15** - Smooth scroll library
- **React Dropzone 14.3.8** - Drag-and-drop file uploads

---

## 📁 Project Structure

```
digital-travel-diary/
├── src/
│   ├── pages/                      # Page components
│   │   ├── Dashboard.jsx           # Main trips dashboard
│   │   ├── Login.jsx               # Authentication login
│   │   ├── Signup.jsx              # User registration
│   │   ├── TripDetail.jsx          # Trip detail view
│   │   ├── MapView.jsx             # Interactive map view
│   │   ├── Profile.jsx             # User profile page
│   │   ├── AccountSettings.jsx     # Account preferences
│   │   └── SplashScreen.jsx        # Welcome/splash screen
│   │
│   ├── components/                 # Reusable components
│   │   ├── Navbar.jsx              # Top navigation bar
│   │   ├── TripList.jsx            # Trips list display
│   │   ├── TripCard.jsx            # Individual trip card
│   │   ├── TripPhotos.jsx          # Photo gallery
│   │   ├── TripLocationMap.jsx     # Map component
│   │   ├── ItineraryModal.jsx      # Itinerary management
│   │   ├── AddActivityModal.jsx    # Add activity form
│   │   ├── EditActivityModal.jsx   # Edit activity form
│   │   ├── NewTripModal.jsx        # Create trip form
│   │   ├── NewEntryModal.jsx       # Create entry form
│   │   ├── EditEntryModal.jsx      # Edit entry form
│   │   ├── EntryDetailModal.jsx    # Entry detail view
│   │   └── ...other components
│   │
│   ├── contexts/                   # React Context providers
│   │   ├── AuthContext.jsx         # Authentication state
│   │   └── TripContext.jsx         # Trips state management
│   │
│   ├── hooks/                      # Custom React hooks
│   │   ├── useTrips.js             # Trip CRUD operations
│   │   ├── useEntries.js           # Entry CRUD operations
│   │   └── useActivities.js        # Activity CRUD operations
│   │
│   ├── utils/                      # Utility functions
│   │   └── dateUtils.js            # Date formatting helpers
│   │
│   ├── firebase/
│   │   └── config.js               # Firebase initialization
│   │
│   ├── App.jsx                     # Main app component
│   ├── main.jsx                    # React entry point
│   ├── index.css                   # Global styles
│   └── App.css                     # App-level styles
│
├── public/                         # Static assets
│   └── journeyStack-logo-t.svg    # App logo
│
├── vite.config.js                  # Vite configuration
├── tailwind.config.js              # Tailwind CSS config
├── postcss.config.cjs              # PostCSS configuration
├── firebase.json                   # Firebase hosting config
├── firestore.rules                 # Firestore security rules
├── storage.rules                   # Storage security rules
├── .env.local                      # Environment variables (local)
├── package.json                    # Project dependencies
└── README.md                       # This file
```

---

## 📦 Installation & Setup

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **Firebase Account** (free tier available)
- **Git** for version control

### Step 1: Clone Repository

```bash
git clone https://github.com/cloudblimp/journey-stack.git
cd digital-travel-diary
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Firebase

1. Create a Firebase project at [firebase.google.com](https://firebase.google.com)
2. Enable these services:
   - Firestore Database
   - Firebase Authentication (Email/Password & Google)
   - Cloud Storage

3. Get your Firebase configuration from Project Settings

### Step 4: Create Environment File

Create `.env.local` in the project root:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Step 5: Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## ⚙️ Configuration

### Tailwind CSS

Configured in `tailwind.config.js` with:
- Custom screen breakpoints (sm: 640px, md: 768px, lg: 1024px, xl: 1280px)
- Extended color palette (emerald, slate, teal, cyan)
- Custom animations and transitions

### Vite Configuration

Optimized in `vite.config.js` with:
- React Fast Refresh plugin
- Tailwind CSS Vite plugin
- Code splitting for better performance:
  - `firebase.js` - Firebase libraries
  - `ui.js` - React and routing
  - `animations.js` - Framer Motion
  - `toast.js` - React Hot Toast
  - `form.js` - Form handling libraries

### Firebase Rules

- **Firestore**: User-authenticated read/write access
- **Storage**: Secure photo uploads for authenticated users

---

## 🎮 Usage Guide

### Creating a Trip

1. Click **"+ New Trip"** button on Dashboard
2. Fill in trip details:
   - Trip name
   - Start and end dates
   - Description
   - Locations
3. Click **"Create Trip"**

### Planning an Itinerary

1. Open a trip detail page
2. Click **"View Itinerary"** button
3. Select a day from the itinerary view
4. Click **"+ Add Activity"**
5. Fill activity details:
   - Title
   - Type (Activity, Accommodation, Dining, Transport, Other)
   - Time
   - Location (optional)
   - Description (optional)
6. Click **"Add Activity"**

### Creating Trip Entries

1. On trip detail page, click **"+ New Entry"**
2. Write your travel story/journal entry
3. Add photos by dragging and dropping
4. Click **"Create Entry"**

### Managing Trip Photos

1. On trip detail page, go to **"Photos"** section
2. Click the edit button on trip cover image
3. Options:
   - **Add Photo** - If no cover image exists
   - **Change Photo** - Replace existing cover
   - **Remove Photo** - Delete current cover

### Viewing Map

1. Click **"Map View"** in navigation
2. See all your trip locations on the interactive map
3. View trip pins and explore routes

### Account Management

1. Click profile button (avatar circle) in navbar
2. Options:
   - **My Profile** - View and edit profile
   - **Account Settings** - Manage account preferences
   - **Logout** - Sign out

---

## 📱 Mobile Responsiveness

### Responsive Breakpoints

| Breakpoint | Width | Devices |
|-----------|-------|---------|
| **base** | 375px | iPhone SE, small phones |
| **sm** | 640px | Landscape phones, large phones |
| **md** | 768px | Tablets (iPad mini, etc.) |
| **lg** | 1024px | Small laptops, large tablets |
| **xl** | 1280px | Desktop, ultra-wide monitors |

### Mobile-First Design Principles

- ✅ Base styles optimized for 375px (smallest target)
- ✅ Progressive enhancement with `sm:`, `md:`, `lg:` prefixes
- ✅ All buttons minimum 44px height for touch targets
- ✅ Compact padding on mobile, expanded on desktop
- ✅ Touch-friendly spacing and interactions
- ✅ No horizontal scrolling on any viewport
- ✅ Hamburger menu for navigation on mobile
- ✅ Modal scroll locking to prevent background scroll

### Responsive Components

- **Navbar**: Hamburger menu on mobile, full menu on desktop
- **TripCard**: Single column on mobile, multi-column grid on desktop
- **Modals**: Full-width on mobile, centered with max-width on desktop
- **Forms**: Single column on mobile, optimized layout on desktop
- **Itinerary**: Horizontal tabs on mobile, sidebar on desktop

---

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

This creates optimized build in `dist/` folder.

### Deploy to Firebase Hosting

1. Install Firebase CLI (if not already):
   ```bash
   npm install -g firebase-tools
   ```

2. Authenticate with Firebase:
   ```bash
   firebase login
   ```

3. Deploy:
   ```bash
   firebase deploy
   ```

4. View your live site:
   ```bash
   firebase open hosting:site
   ```

### Environment Variables for Deployment

Ensure all `VITE_FIREBASE_*` variables are set in your deployment environment (Firebase Hosting, Vercel, etc.).

---

## 🎨 Key Improvements & Features

### Mobile-First UI Refactoring (Completed)
- ✅ All pages optimized for mobile first
- ✅ Responsive components with proper breakpoints
- ✅ Touch-friendly interface with proper spacing

### Component Optimization
- ✅ **SplashScreen**: Mobile-first CSS with no scrolling
- ✅ **Login/Signup**: Fully responsive forms
- ✅ **Dashboard**: Loading states and trip listing
- ✅ **TripDetail**: Responsive trip information display
- ✅ **Navbar**: Mobile hamburger menu + profile dropdown
- ✅ **NewTripModal**: Date sizing and debounced location search
- ✅ **ItineraryModal**: Mobile horizontal tabs, desktop sidebar
- ✅ **AddActivityModal/EditActivityModal**: Mobile button stacking
- ✅ **MapView**: Emerald/slate theme with responsive layout

### Performance Optimizations
- ✅ Code splitting for faster initial load
- ✅ Lazy loading of components and routes
- ✅ Image optimization
- ✅ Smooth scroll with Lenis
- ✅ Debounced search for location input

### UX Improvements
- ✅ Modal scroll locking (prevents background scroll)
- ✅ Hamburger menu auto-closes when profile opens
- ✅ Proper menu z-index layering
- ✅ Loading spinners for better feedback
- ✅ Toast notifications for actions
- ✅ Smooth animations with Framer Motion

---

## 🐛 Troubleshooting

### Common Issues

#### Firebase Configuration Error
**Problem**: `VITE_FIREBASE_API_KEY is undefined`
**Solution**: 
- Verify `.env.local` file exists in project root
- Ensure all `VITE_FIREBASE_*` variables are set correctly
- Restart dev server after updating `.env.local`

#### Build Size Warning
**Problem**: `Some chunks are larger than 500 kB`
**Solution**: Already optimized with code splitting in `vite.config.js`. No action needed.

#### Modal Scrolling Background
**Problem**: Page scrolls when modal is open
**Solution**: Fixed with `document.body.style.overflow = 'hidden'` when modals are open

#### Navbar Overlapping with Modal
**Problem**: Navbar visible during modal opening
**Solution**: Navbar automatically dims with `pointer-events-none` when modals are active

#### Menu Overlapping Issues
**Problem**: Burger menu and profile menu overlap
**Solution**: 
- Burger menu closes automatically when profile button is clicked
- Proper z-index layering (mobile menu: z-30, profile menu: z-50)

### Debug Mode

Enable additional logging:
```javascript
// In components
console.log('Debug info:', variable);
```

Check browser console for errors and warnings.

---

## 🤝 Contributing

### Code Standards

1. **Mobile-First Approach**
   - Always start with base (mobile) styles
   - Add responsive prefixes: `sm:`, `md:`, `lg:`

2. **Component Structure**
   - Keep components focused and reusable
   - Use custom hooks for logic
   - Props with TypeScript-like documentation

3. **Styling**
   - Use Tailwind CSS classes
   - Maintain design system colors (emerald, slate, teal, cyan)
   - Ensure 44px minimum button heights

4. **Testing**
   - Test on mobile (375px), tablet (768px), desktop (1280px)
   - Verify no horizontal scrolling
   - Check touch interactions
   - Test modal interactions

### Git Workflow

```bash
# Create feature branch
git checkout -b feat/your-feature

# Make changes and commit
git add .
git commit -m "feat: description of changes"

# Push and create pull request
git push origin feat/your-feature
```

---

## 📄 License

This project is part of the journey-stack repository by cloudblimp.

---

## 👨‍💻 Project Information

- **Repository**: [journey-stack](https://github.com/cloudblimp/journey-stack)
- **Owner**: cloudblimp
- **Current Branch**: main
- **Version**: 0.0.0 (In Development)

---

## 📞 Support & Questions

For issues, feature requests, or questions:
1. Check existing GitHub issues
2. Create a new issue with detailed description
3. Include steps to reproduce for bugs
4. Include screenshots/videos for UI issues

---

**Happy travels with JourneyStack! 🌍✈️📸**
