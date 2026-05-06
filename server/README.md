# ⚙️ JourneyStack — Backend

The Node.js/Express REST API and real-time WebSocket server for JourneyStack.

## Tech Stack

- **Node.js + Express** — REST API framework
- **PostgreSQL** — Relational database
- **Socket.io** — Real-time collaboration via WebSockets
- **JWT** — Access + Refresh token authentication
- **Passport.js** — Google OAuth 2.0 integration
- **Cloudinary** — Image upload, transformation, and CDN
- **Helmet** — Security headers and Content Security Policy
- **Multer** — Multipart file upload handling

---

## 📁 Source Structure

```
server/
├── config/
│   ├── db.js                   # PostgreSQL pool + DATE parser fix
│   └── cloudinary.js           # Cloudinary SDK configuration
│
├── middleware/
│   ├── auth.js                 # JWT verification middleware
│   └── upload.js               # Multer + Cloudinary storage
│
├── routes/
│   ├── auth.js                 # Signup, Login, Google OAuth, Refresh, Forgot Password
│   ├── users.js                # Profile CRUD, avatar upload, account deletion
│   ├── trips.js                # Trip CRUD, cover image management
│   ├── entries.js              # Journal entry CRUD with photo attachments
│   ├── activities.js           # Itinerary activity CRUD
│   ├── photos.js               # Trip gallery photo upload/delete
│   └── collaboration.js        # Invite, accept/decline, remove collaborators
│
├── schema.sql                  # Full PostgreSQL schema (auto-initialized)
├── index.js                    # Express app, Socket.io, static hosting
├── package.json                # Dependencies and scripts
└── .env.example                # Environment variable template
```

---

## 🔧 Development

```bash
# Install dependencies
npm install

# Initialize the database (requires psql)
npm run db:init

# Start dev server with hot-reload (port 5001)
npm run dev

# Start production server
npm start

# Build frontend (for monolithic deployment)
npm run build
```

---

## 🔐 Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```env
# Server
PORT=5001
SERVER_URL=http://localhost:5001

# PostgreSQL
DATABASE_URL=postgresql://user:password@localhost:5432/journeystack

# JWT
JWT_SECRET=your_64_char_random_secret
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=another_64_char_random_secret
REFRESH_TOKEN_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google OAuth 2.0
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret

# SMTP (for password reset emails)
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_pass
EMAIL_FROM=noreply@journeystack.app
```

---

## 📡 API Endpoints

### Auth (`/api/auth`)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/signup` | Create account (email/password) |
| POST | `/login` | Login and receive JWT |
| POST | `/logout` | Invalidate refresh token |
| POST | `/refresh` | Get new access token |
| GET | `/me` | Get current user profile |
| GET | `/google` | Initiate Google OAuth flow |
| GET | `/google/callback` | Google OAuth callback |
| POST | `/forgot-password` | Send password reset email |
| POST | `/reset-password` | Reset password with token |

### Trips (`/api/trips`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List user's trips (owned + collaborating) |
| POST | `/` | Create a new trip |
| GET | `/:id` | Get trip details |
| PUT | `/:id` | Update trip |
| DELETE | `/:id` | Delete trip (cascades all related data + Cloudinary assets) |

### Entries (`/api/trips/:tripId/entries`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List entries for a trip |
| POST | `/` | Create journal entry (with optional photo) |
| PUT | `/:id` | Update entry |
| DELETE | `/:id` | Delete entry (+ Cloudinary cleanup) |

### Activities (`/api/trips/:tripId/activities`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List itinerary activities |
| POST | `/` | Add activity to itinerary |
| PUT | `/:id` | Update activity |
| DELETE | `/:id` | Delete activity |

### Photos (`/api/trips/:tripId/photos`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Get trip gallery photos |
| POST | `/` | Upload photo to gallery |
| DELETE | `/:id` | Delete photo (+ Cloudinary cleanup) |

### Collaboration (`/api/trips/:tripId/collaborators`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List collaborators |
| POST | `/invite` | Send collaboration invite |
| POST | `/respond` | Accept or decline invite |
| DELETE | `/:userId` | Remove collaborator |
| GET | `/api/invitations` | List pending invitations for current user |

---

## 🔌 Real-Time Events (Socket.io)

The server emits events to connected clients for real-time UI updates:

| Event | Trigger |
|-------|---------|
| `trip_updated` | Trip details modified |
| `entry_created` / `entry_updated` / `entry_deleted` | Journal entry changes |
| `activity_created` / `activity_updated` / `activity_deleted` | Itinerary changes |
| `photo_added` / `photo_deleted` | Gallery changes |
| `collaborator_added` / `collaborator_removed` | Team changes |
| `invitation_received` | New invite notification |

Clients join rooms via `join_trip` and `leave_trip` socket events.

---

## 🗄 Database Schema

The schema is defined in `schema.sql` and is **automatically initialized** on first server boot if the `users` table doesn't exist.

### Tables
- `users` — User accounts (email + Google OAuth)
- `refresh_tokens` — JWT refresh token hashes
- `trips` — Trip records with cover images
- `trip_collaborators` — Many-to-many trip ↔ user relationships
- `invitations` — Pending/accepted/declined invite records
- `entries` — Journal entries with optional photos
- `activities` — Itinerary activities with datetime and type
- `trip_photos` — Gallery photos

---

## 🏗 Architecture Notes

### Monolithic Production Hosting
In production, Express serves the built React frontend statically from `../journey-stack/dist`. A catch-all route serves `index.html` for client-side routing. This eliminates CORS entirely.

### Security
- **Helmet** enforces strict Content Security Policy
- **Socket.io** connections are JWT-authenticated during handshake
- **Cloudinary** assets are automatically deleted when parent records are removed
- **bcrypt** with 12 salt rounds for password hashing
- **HttpOnly cookies** for refresh tokens

### Timezone Handling
PostgreSQL `DATE` columns are returned as raw strings (type parser override) to prevent the Node.js `pg` driver from converting them into local-timezone `Date` objects.

---

## 📄 License

Part of the [digital-travel-diary](https://github.com/cloudblimp/digital-travel-diary) project by cloudblimp.
