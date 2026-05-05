-- ============================================================
-- JourneyStack — PostgreSQL Schema
-- Run: psql $DATABASE_URL -f schema.sql
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────────
-- ENUM TYPES
-- ─────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE collab_role AS ENUM ('editor', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE invite_status AS ENUM ('pending', 'accepted', 'declined');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─────────────────────────────────────────────
-- USERS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email               TEXT UNIQUE NOT NULL,
  password_hash       TEXT,                        -- NULL for OAuth-only accounts
  display_name        TEXT,
  photo_url           TEXT,
  provider            TEXT DEFAULT 'email',        -- 'email' | 'google'
  google_id           TEXT UNIQUE,
  reset_token         TEXT,                        -- hashed password-reset token
  reset_token_expires TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- REFRESH TOKENS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  TEXT NOT NULL UNIQUE,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_refresh_user ON refresh_tokens(user_id);

-- ─────────────────────────────────────────────
-- TRIPS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS trips (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  destination TEXT,
  start_date  DATE,
  end_date    DATE,
  description TEXT,
  cover_image TEXT,         -- Cloudinary URL
  cover_image_public_id TEXT, -- Cloudinary public_id for deletion
  locations   JSONB DEFAULT '[]',
  is_archived BOOLEAN DEFAULT FALSE,
  archived_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_trips_owner ON trips(owner_id);

-- ─────────────────────────────────────────────
-- TRIP COLLABORATORS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS trip_collaborators (
  trip_id  UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  user_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role     collab_role NOT NULL DEFAULT 'editor',
  added_by UUID REFERENCES users(id) ON DELETE SET NULL,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (trip_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_collab_user ON trip_collaborators(user_id);
CREATE INDEX IF NOT EXISTS idx_collab_trip ON trip_collaborators(trip_id);

-- ─────────────────────────────────────────────
-- INVITATIONS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS invitations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id         UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  invited_by_uid  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  invitee_uid     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role            collab_role NOT NULL DEFAULT 'editor',
  status          invite_status NOT NULL DEFAULT 'pending',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  responded_at    TIMESTAMPTZ,
  UNIQUE(trip_id, invitee_uid)   -- one active invite per user per trip
);
CREATE INDEX IF NOT EXISTS idx_invite_invitee ON invitations(invitee_uid);
CREATE INDEX IF NOT EXISTS idx_invite_trip ON invitations(trip_id);

-- ─────────────────────────────────────────────
-- JOURNAL ENTRIES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS entries (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id     UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  author_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  date_time   TIMESTAMPTZ,
  location    TEXT,
  story       TEXT,
  type        TEXT DEFAULT 'Activity',
  photo_url   TEXT,
  photo_public_id TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_entries_trip ON entries(trip_id);

-- ─────────────────────────────────────────────
-- ITINERARY ACTIVITIES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS activities (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id     UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  author_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  date_time   TIMESTAMPTZ,
  location    TEXT,
  description TEXT,
  type        TEXT DEFAULT 'Activity',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_activities_trip ON activities(trip_id);

-- ─────────────────────────────────────────────
-- TRIP GALLERY PHOTOS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS trip_photos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id     UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  uploader_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  photo_url   TEXT NOT NULL,
  public_id   TEXT,          -- Cloudinary public_id for deletion
  file_name   TEXT,
  caption     TEXT DEFAULT '',
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_photos_trip ON trip_photos(trip_id);
