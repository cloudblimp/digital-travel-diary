# 🎨 JourneyStack — Frontend

The React single-page application for JourneyStack.

## Tech Stack

- **React 19** with functional components and hooks
- **Vite 7** — Fast HMR and optimized production builds
- **Tailwind CSS 4** — Utility-first styling (mobile-first)
- **Framer Motion** — Page transitions and micro-animations
- **Socket.io Client** — Real-time collaboration updates
- **Leaflet** — Interactive trip location maps
- **React Hook Form + Zod** — Form handling with schema validation

---

## 📁 Source Structure

```
src/
├── pages/                      # Route-level components
│   ├── Dashboard.jsx           # Main trips dashboard
│   ├── Login.jsx               # Email/password login
│   ├── Signup.jsx              # User registration
│   ├── TripDetail.jsx          # Trip detail view
│   ├── MapView.jsx             # Interactive map view
│   ├── Profile.jsx             # User profile page
│   ├── Invitations.jsx         # Trip invite management
│   ├── AuthCallback.jsx        # Google OAuth callback handler
│   └── SplashScreen.jsx        # Welcome screen
│
├── components/                 # Reusable UI components
│   ├── Navbar.jsx              # Top navigation (responsive)
│   ├── TripCard.jsx            # Trip card in dashboard grid
│   ├── TripPhotos.jsx          # Photo gallery with drag-and-drop
│   ├── TripLocationMap.jsx     # Leaflet map component
│   ├── ItineraryModal.jsx      # Day-by-day itinerary planner
│   ├── NewTripModal.jsx        # Trip creation form
│   ├── NewEntryModal.jsx       # Journal entry creation
│   ├── EntryDetailModal.jsx    # Entry detail viewer
│   └── InviteCollaborator.jsx  # Collaborator invitation UI
│
├── contexts/                   # React Context providers
│   ├── AuthContext.jsx         # JWT auth state + Google OAuth
│   └── TripContext.jsx         # Trip data state management
│
├── services/                   # API & real-time services
│   ├── apiClient.js            # Axios instance with JWT interceptors
│   └── socket.js               # Socket.io connection manager
│
├── hooks/                      # Custom React hooks
│   ├── useTrips.js             # Trip CRUD operations
│   ├── useEntries.js           # Entry CRUD operations
│   └── useActivities.js        # Activity CRUD operations
│
├── utils/
│   └── dateUtils.js            # IST-locked date/time utilities
│
├── App.jsx                     # Root component with routes
├── main.jsx                    # React entry point
└── index.css                   # Global styles
```

---

## 🔧 Development

```bash
# Install dependencies
npm install

# Start dev server (port 5173)
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

### Environment Variables

Create a `.env` file in this directory:

```env
VITE_API_URL=http://localhost:5001/api
```

> **Note:** In production, the frontend uses relative paths (`/api`) automatically since it is served by the Express backend. No env variable is needed in production.

---

## 🏗 Architecture Notes

### API Communication
- All API calls go through `services/apiClient.js`
- Axios interceptors handle JWT attachment and automatic token refresh on 401 responses
- In production, the API base is `/api` (relative — same origin as the frontend)

### Real-Time Updates
- `services/socket.js` manages the Socket.io connection
- JWT is passed during the WebSocket handshake for authentication
- Components listen for events like `trip_updated`, `entry_created`, etc.

### Auth Flow
- **Email/Password**: Standard signup/login via `/api/auth/signup` and `/api/auth/login`
- **Google OAuth**: Browser redirects to `/api/auth/google` → Google consent → callback stores JWT → redirects to `/auth/callback`

### Timezone Handling
- All dates are parsed as "timezone-agnostic" strings via `dateUtils.js`
- All times are displayed in **IST (Asia/Kolkata)** for global consistency

---

## 📱 Responsive Design

- **Mobile-first** approach (optimized for 375px+)
- All interactive elements have 44px+ touch targets
- Responsive breakpoints: `sm:640px`, `md:768px`, `lg:1024px`, `xl:1280px`

---

## 📄 License

Part of the [digital-travel-diary](https://github.com/cloudblimp/digital-travel-diary) project by cloudblimp.
