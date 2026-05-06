# 🌍 JourneyStack — Collaborative Travel Diary Platform

A full-stack, real-time collaborative travel diary application where users can create trips, write journal entries, manage photo galleries, plan itineraries, and invite friends to co-author their adventures.

## ✨ Highlights

- **Real-Time Collaboration** — Instant updates via WebSockets (Socket.io)
- **Custom Auth System** — JWT + Google OAuth 2.0 (no Firebase dependency)
- **Cloud Media** — Image uploads powered by Cloudinary
- **IST-Locked Scheduling** — Timezone-safe itinerary management
- **Monolithic Deployment** — Single-origin architecture on Railway (zero CORS)

---

## 📂 Repository Structure

```
digital-travel-diary/
├── journey-stack/          # React Frontend (Vite + Tailwind)
│   ├── src/
│   │   ├── pages/          # Route-level page components
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # Auth & Trip context providers
│   │   ├── services/       # API client & Socket.io
│   │   ├── hooks/          # Custom React hooks
│   │   └── utils/          # Date utilities
│   └── dist/               # Production build (served by Express)
│
├── server/                 # Node.js/Express Backend
│   ├── config/             # Database & Cloudinary config
│   ├── middleware/          # Auth & file upload middleware
│   ├── routes/             # REST API route handlers
│   ├── schema.sql          # PostgreSQL schema (auto-initialized)
│   └── index.js            # Server entry point
│
├── package.json            # Root build/start scripts
└── railway.toml            # Railway deployment config
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites

- **Node.js** v18+
- **PostgreSQL** running locally
- **Cloudinary** account (free tier)
- **Google Cloud** OAuth 2.0 credentials

### 1. Clone & Install

```bash
git clone https://github.com/cloudblimp/digital-travel-diary.git
cd digital-travel-diary

# Install backend dependencies
npm install --prefix server

# Install frontend dependencies
npm install --prefix journey-stack
```

### 2. Configure Environment

Copy the example and fill in your credentials:

```bash
cp server/.env.example server/.env
```

Key variables to set:
- `DATABASE_URL` — Your local PostgreSQL connection string
- `JWT_SECRET` — A random 64+ character secret
- `CLOUDINARY_*` — Your Cloudinary API credentials
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — From Google Cloud Console

### 3. Initialize Database

```bash
cd server && npm run db:init
```

### 4. Start Development Servers

```bash
# Terminal 1 — Backend (port 5001)
cd server && npm run dev

# Terminal 2 — Frontend (port 5173)
cd journey-stack && npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite, Tailwind CSS, Framer Motion |
| **Backend** | Node.js, Express, Socket.io |
| **Database** | PostgreSQL |
| **Auth** | JWT (Access + Refresh tokens), Google OAuth 2.0 |
| **Media** | Cloudinary |
| **Maps** | Leaflet + OpenStreetMap Nominatim |
| **Deployment** | Railway (monolithic) |

---

## 🌐 Production Deployment (Railway)

The app is deployed as a monolith on [Railway](https://railway.app):

1. Push code to GitHub.
2. Connect the repo to Railway.
3. Add a PostgreSQL service.
4. Set environment variables (see `server/.env.example`).
5. Railway auto-builds the frontend and starts the server.

The server automatically initializes the database schema on first boot.

---

## 📄 License

This project is part of the digital-travel-diary repository by [cloudblimp](https://github.com/cloudblimp).

---

**Happy travels with JourneyStack! 🌍✈️📸**
