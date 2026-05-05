# Firebase Setup Guide

This guide explains how to set up Firebase for the Digital Travel Diary app with two options: local emulator or real Firebase.

## Option 1: Using Real Firebase (Recommended for Production)

### Step 1: Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Name it "digital-travel-diary" and create the project
4. Enable Google Analytics (optional)

### Step 2: Get Your Firebase Credentials
1. In the Firebase Console, click "Project Settings" (gear icon)
2. Go to "Your apps" section
3. Click "Web" to add a web app
4. Copy the configuration object

### Step 3: Set Up Firestore Database
1. Go to "Build" → "Firestore Database"
2. Click "Create Database"
3. Select "Start in test mode" (for development)
4. Choose the nearest region
5. Click "Enable"

### Step 4: Set Up Firebase Storage
1. Go to "Build" → "Storage"
2. Click "Get Started"
3. Click "Next"
4. Choose the default location
5. Click "Done"

### Step 5: Update `.env.local` File
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your Firebase credentials:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
VITE_USE_FIREBASE_EMULATOR=false
```

### Step 6: Firestore Security Rules
Go to "Firestore Database" → "Rules" and paste:

```firestore
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
```

### Step 7: Storage Security Rules
Go to "Storage" → "Rules" and paste:

```
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
```

## Option 2: Using Firebase Emulator (Local Development)

### Prerequisites
- Java Runtime Environment (JRE) installed
- Firebase CLI installed (`npm install -g firebase-tools`)

### Step 1: Install Java
- Download from [java.com](https://www.java.com/)
- Verify installation: `java -version`

### Step 2: Initialize Firebase
```bash
firebase login
firebase init emulators
```

When prompted, select:
- Firestore
- Authentication
- Storage
- Hosting (optional)

### Step 3: Update `.env.local`
```env
VITE_FIREBASE_API_KEY=test
VITE_FIREBASE_AUTH_DOMAIN=localhost
VITE_FIREBASE_PROJECT_ID=demo-project
VITE_FIREBASE_STORAGE_BUCKET=demo-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
VITE_USE_FIREBASE_EMULATOR=true
```

### Step 4: Start Emulator
```bash
firebase emulators:start --only storage,firestore,auth
```

The emulator UI will be available at: http://localhost:4000

### Step 5: Run Your App
In a new terminal:
```bash
npm run dev
```

## Data Persistence

### With Real Firebase
- ✅ Data persists automatically
- ✅ No setup required beyond initial configuration
- ✅ Data available on any device

### With Local Emulator
- ❌ Data is stored locally only (not persisted between emulator restarts by default)
- ✅ Can be configured for persistence (see firebase.json)
- ⚠️ Perfect for testing/development

## Troubleshooting

### Trips/Entries disappearing on page refresh
- **Cause**: Data not persisted to Firestore
- **Solution**: 
  1. Make sure you're logged in (check browser console)
  2. Verify Firestore is connected (check browser console logs)
  3. Check Firestore rules allow your user to write data
  4. Check that `userId` field is being saved with trips/entries

### Photos not uploading
- **Cause**: Storage emulator/rules not set up correctly
- **Solution**:
  1. If using emulator, make sure it's running: `firebase emulators:start`
  2. Check Storage rules allow uploads
  3. Check browser console for specific error messages

### "Failed to connect to emulator"
- **Cause**: Emulator not running or Java not installed
- **Solution**:
  1. Install Java: Download from [java.com](https://www.java.com/)
  2. Verify Java: `java -version`
  3. Start emulator: `firebase emulators:start --only storage,firestore,auth`
  4. Wait 10-15 seconds for startup

### Auth not working
- **Cause**: Authentication emulator not connected
- **Solution**:
  1. Update firebase.json to include auth emulator (see Step 2 above)
  2. Restart emulator: `firebase emulators:start --only storage,firestore,auth`

## Database Structure

### Trips Collection
```
/trips/{tripId}
  - title: string
  - description: string
  - startDate: string (ISO 8601)
  - endDate: string (ISO 8601)
  - coverImage: string (URL)
  - userId: string (Firebase UID)
  - createdAt: timestamp
  - updatedAt: timestamp
```

### Entries Collection
```
/entries/{entryId}
  - title: string
  - story: string
  - location: string
  - dateTime: string (ISO 8601)
  - photoUrl: string (URL, optional)
  - tripId: string (reference to trip)
  - userId: string (Firebase UID)
  - createdAt: timestamp
  - updatedAt: timestamp
```

## Development Tips

1. **Use Emulator for Development**: Faster feedback, no quota limits, local data
2. **Switch to Real Firebase for Testing**: Verify production behavior
3. **Check Console Logs**: Browser console shows Firebase connection status
4. **Inspect Data**: Use Firestore UI (localhost:4000) to see emulated data
5. **Test Without Network**: Local emulator works offline

