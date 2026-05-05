# Setup Checklist ✅

## Before You Start
- [ ] Node.js installed (`node --version`)
- [ ] npm packages installed (`npm install`)
- [ ] Code editor open (VS Code)

## Choose Your Setup

### Option A: Local Firebase Emulator
**Best for**: Quick development, testing, no Firebase account needed

**Requirements**:
- [ ] Java installed on your system (`java -version`)
  - If not: Download from https://www.java.com/
- [ ] Firebase CLI installed (`firebase --version`)
  - If not: `npm install -g firebase-tools`

**Setup Steps**:
```bash
# 1. Create .env.local file (from example)
cp .env.local.example .env.local

# 2. Update .env.local for emulator
# Change: VITE_USE_FIREBASE_EMULATOR=true
# Other values can stay as dummy values for local testing

# 3. Start Firebase Emulator (in Terminal 1)
firebase emulators:start --only storage,firestore,auth

# 4. Wait for it to start (takes 10-15 seconds)
# You should see: "All emulators ready! It is now safe to connect."
# UI will be at: http://localhost:4000

# 5. Start dev server (in Terminal 2)
npm run dev

# 6. Open http://localhost:5173 in browser
```

**Checklist**:
- [ ] Java installed and working
- [ ] Firebase CLI installed
- [ ] `.env.local` created with `VITE_USE_FIREBASE_EMULATOR=true`
- [ ] Emulator running on Terminal 1
- [ ] Dev server running on Terminal 2
- [ ] App opens in browser at http://localhost:5173

---

### Option B: Real Firebase (Cloud)
**Best for**: Production, sharing across devices, permanent data

**Prerequisites**:
- [ ] Google account (free Firebase tier available)
- [ ] Browser access to https://console.firebase.google.com/

**Setup Steps**:

```bash
# 1. Create Firebase Project
# Go to: https://console.firebase.google.com/
# Click: "Add project"
# Name: "digital-travel-diary"
# Continue through setup

# 2. Set up Firestore Database
# In Firebase Console:
# - Go to: Build → Firestore Database
# - Click: Create Database
# - Select: Start in test mode
# - Choose: Nearest region
# - Click: Enable

# 3. Set up Cloud Storage
# In Firebase Console:
# - Go to: Build → Storage
# - Click: Get Started
# - Follow prompts with default settings

# 4. Get Your Credentials
# In Firebase Console:
# - Click: Project Settings (gear icon)
# - Go to: Your apps → Web
# - Copy the configuration object

# 5. Create .env.local file
cp .env.local.example .env.local

# 6. Edit .env.local with your Firebase credentials
# VITE_FIREBASE_API_KEY=xxxx
# VITE_FIREBASE_AUTH_DOMAIN=xxxx.firebaseapp.com
# ... (all the values from step 4)
# VITE_USE_FIREBASE_EMULATOR=false

# 7. Start dev server
npm run dev

# 8. Open http://localhost:5173 in browser
```

**Checklist**:
- [ ] Firebase project created
- [ ] Firestore Database enabled
- [ ] Cloud Storage enabled
- [ ] Firestore security rules updated (see FIREBASE_SETUP.md)
- [ ] Storage security rules updated (see FIREBASE_SETUP.md)
- [ ] `.env.local` created with all credentials
- [ ] `VITE_USE_FIREBASE_EMULATOR=false`
- [ ] Dev server running
- [ ] App opens in browser

---

## Verify Setup is Working

After starting the app, test these features:

### Test 1: Create a Trip
- [ ] Click "New Trip" button
- [ ] Fill in trip details
- [ ] Upload a cover photo
- [ ] Click "Create Trip"
- [ ] Trip appears in list
- [ ] **Refresh page** → Trip still there? ✅

### Test 2: Create an Entry
- [ ] Click on a trip to view details
- [ ] Click "New Entry" button
- [ ] Fill in entry details
- [ ] Upload a photo
- [ ] Click "Create Entry"
- [ ] Entry appears in list
- [ ] **Refresh page** → Entry still there? ✅

### Test 3: Edit an Entry
- [ ] Click on an entry to view details
- [ ] Click "Edit" button
- [ ] Change some text
- [ ] Upload a new photo (optional)
- [ ] Click "Save Changes"
- [ ] Changes appear
- [ ] **Refresh page** → Changes still there? ✅

### Test 4: Delete an Entry
- [ ] Click on an entry
- [ ] Click "Delete" button
- [ ] Entry disappears
- [ ] **Refresh page** → Entry still gone? ✅

If all tests pass ✅ → **Setup is complete!**

---

## Troubleshooting

### Problem: "Cannot find module" errors
**Solution**:
```bash
npm install
npm run dev
```

### Problem: Emulator won't start
**Solution**:
1. Check Java is installed: `java -version`
2. Check port 8080 and 9199 are free
3. Try: `firebase emulators:start --only storage,firestore,auth --debug`

### Problem: Data disappearing after refresh
**Solution**:
1. Check browser console for errors
2. Make sure you're logged in
3. Check Firestore security rules (if using real Firebase)
4. Verify `.env.local` configuration

### Problem: Photos not uploading
**Solution**:
1. Check Storage emulator is running (if using local)
2. Check Storage security rules
3. Check file size is under 5MB
4. Check browser console for specific errors

### Problem: "VITE_USE_FIREBASE_EMULATOR is not defined"
**Solution**:
1. Create `.env.local` file (copy from `.env.local.example`)
2. Make sure you set the variable (not in `.env`)
3. Restart dev server: `npm run dev`

---

## Quick Reference

### Terminal Commands

**Start Firebase Emulator**:
```bash
firebase emulators:start --only storage,firestore,auth
```

**Start Dev Server**:
```bash
npm run dev
```

**View app**: http://localhost:5173

**View Firestore/Emulator UI**: http://localhost:4000 (if using emulator)

**View Firebase Console**: https://console.firebase.google.com/

---

## Key Files to Know

| File | Purpose |
|------|---------|
| `.env.local` | Your Firebase configuration (create from .env.local.example) |
| `src/firebase/config.js` | Firebase initialization |
| `src/contexts/TripContext.jsx` | Trip data management |
| `src/pages/TripDetail.jsx` | Entry data management |
| `FIREBASE_SETUP.md` | Detailed Firebase setup guide |
| `DATA_PERSISTENCE_FIX.md` | What changed and why |

---

## Need Help?

1. Check browser console for error messages (F12)
2. Check terminal output for Firebase errors
3. Read `FIREBASE_SETUP.md` for detailed explanations
4. Read `DATA_PERSISTENCE_FIX.md` for what changed

---

**You're all set! 🎉** Start with "Option A" if you just want to test locally, or "Option B" if you want cloud storage.
