# 🚀 Get Started in 2 Minutes

## Step 1: Choose Your Path

### Path A: Local Development (No Firebase Account Needed)
```
Have Java? ──Yes──> Go to "Option A" below
         │
         └──No──> Download from https://www.java.com/
                  Then go to "Option A"
```

### Path B: Cloud Storage (Need Firebase Account)
```
Have Google Account? ──Yes──> Go to "Option B" below
                    │
                    └──No──> Create one (free at google.com)
                             Then go to "Option B"
```

---

## Option A: Local Firebase Emulator (Recommended for Development)

### Prerequisites ✓
- [ ] Java installed: `java -version`
- [ ] Firebase CLI: `npm install -g firebase-tools`
- [ ] Node.js & npm already installed

### Setup (Copy & Paste)

**Terminal 1 - Start Emulator**:
```bash
firebase emulators:start --only storage,firestore,auth
```
Wait for: `All emulators ready! It is now safe to connect.`

**Terminal 2 - Start App**:
```bash
# Copy env file
cp .env.local.example .env.local

# Make sure VITE_USE_FIREBASE_EMULATOR=true in .env.local

# Start dev server
npm run dev
```

**Browser**:
```
Open: http://localhost:5173
```

**Emulator UI** (optional):
```
Open: http://localhost:4000
(See your Firestore data and more)
```

### ✅ You're Done!
Start creating trips and entries. They will persist!

---

## Option B: Real Firebase Cloud

### Prerequisites ✓
- [ ] Google Account
- [ ] Browser

### Setup (5 minutes)

**Step 1: Create Firebase Project**
```
1. Go to: https://console.firebase.google.com/
2. Click: "+ Add project"
3. Name: "digital-travel-diary"
4. Continue and finish setup
```

**Step 2: Set Up Firestore Database**
```
In Firebase Console:
1. Build → Firestore Database
2. Click: "Create Database"
3. "Start in test mode"
4. Choose nearest region
5. "Enable"
```

**Step 3: Set Up Cloud Storage**
```
In Firebase Console:
1. Build → Storage
2. "Get Started"
3. Next → Done
```

**Step 4: Get Your Credentials**
```
In Firebase Console:
1. Click gear (Settings)
2. "Project settings"
3. "Your apps" → Web
4. Copy the whole config object
```

**Step 5: Update Your App**
```bash
# Copy env file
cp .env.local.example .env.local

# Edit .env.local with your credentials from Step 4
# Example:
# VITE_FIREBASE_API_KEY=xxxxxxxx
# VITE_FIREBASE_AUTH_DOMAIN=xxx.firebaseapp.com
# ... etc

# Make sure VITE_USE_FIREBASE_EMULATOR=false

# Start app
npm run dev
```

**Step 6: Update Firestore Rules** (Important!)
```
In Firebase Console:
Firestore Database → Rules

Replace with:
─────────────────────────────────────────────────
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /trips/{document=**} {
      allow read, write: if request.auth != null;
    }
    match /entries/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
─────────────────────────────────────────────────
```

**Step 7: Update Storage Rules** (Important!)
```
In Firebase Console:
Storage → Rules

Replace with:
─────────────────────────────────────────────────
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /trip-covers/{userId}/{allPaths=**} {
      allow read, write: if request.auth.uid == userId;
    }
    match /entry-photos/{userId}/{allPaths=**} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
─────────────────────────────────────────────────
```

**Browser**:
```bash
Open: http://localhost:5173
```

### ✅ You're Done!
Start creating trips and entries. They persist to the cloud!

---

## Test Your Setup ✓

### Test 1: Create Trip
1. Click "New Trip"
2. Fill details, upload photo
3. Click "Create"
4. **Refresh page** → Trip still there? ✅

### Test 2: Create Entry
1. Click on trip
2. Click "New Entry"
3. Fill details, upload photo
4. Click "Create"
5. **Refresh page** → Entry still there? ✅

### Test 3: Edit Entry
1. Click entry card
2. Click "Edit"
3. Change text
4. Click "Save Changes"
5. **Refresh page** → Changes there? ✅

### Test 4: Delete Entry
1. Click entry card
2. Click "Delete"
3. Confirm
4. **Refresh page** → Gone? ✅

**All ✅?** → Setup complete! 🎉

---

## Troubleshooting

### "Java not found"
```bash
# Download from: https://www.java.com/
# Verify: java -version
```

### "Emulator won't start"
```bash
# Check ports are free: 8080, 9199, 4000
# Try: firebase emulators:start --debug
```

### "Data disappearing"
```bash
# Check: Are you logged in? (Check browser console)
# Check: Is emulator running? (if using Option A)
# Check: Is Firestore connected? (check console logs)
```

### "Photos not uploading"
```bash
# Option A: Start emulator with: 
#   firebase emulators:start --only storage,firestore,auth
#
# Option B: Check Storage rules in Firebase Console
```

### "Can't find .env.local"
```bash
# This file should be in your project root
# Create it: cp .env.local.example .env.local
```

---

## Quick Commands Reference

| Command | Purpose |
|---------|---------|
| `firebase emulators:start --only storage,firestore,auth` | Start emulator |
| `npm run dev` | Start dev server |
| `java -version` | Check Java installed |
| `firebase --version` | Check Firebase CLI installed |
| `node --version` | Check Node.js installed |

---

## File Locations

```
Your Project/
├── .env.local ← Copy from .env.local.example
├── src/
│   ├── firebase/config.js ← Firebase setup
│   ├── contexts/TripContext.jsx ← Trip data
│   └── pages/TripDetail.jsx ← Entry data
├── FIREBASE_SETUP.md ← Detailed guide
├── SETUP_CHECKLIST.md ← Step-by-step checklist
└── SOLUTION_SUMMARY.md ← Technical details
```

---

## Still Confused?

1. Read: **SETUP_CHECKLIST.md** (detailed step-by-step)
2. Read: **FIREBASE_SETUP.md** (technical details)
3. Check: Browser console (F12) for errors
4. Check: Terminal output for logs

---

## What's Different Now?

**Before**: Data deleted on refresh ❌
**Now**: Data persists automatically ✅

**Before**: Manual emulator startup ❌
**Now**: Clear setup guide provided ✅

**Before**: No clear structure ❌
**Now**: Production-ready architecture ✅

---

**Ready? Start with Option A or B above! 🚀**
