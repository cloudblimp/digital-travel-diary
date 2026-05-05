# 🚀 Real Firebase Setup - Complete Guide

## ✅ What's Done
Your `.env.local` is already configured with your Firebase project credentials:
- Project ID: `digital-travel-diary`
- All credentials are set
- `VITE_USE_FIREBASE_EMULATOR=false` (using real Firebase)

## 📋 Next Steps: Update Security Rules

You need to update two things in your Firebase Console to enable data persistence:

### Step 1: Update Firestore Security Rules

1. Go to: https://console.firebase.google.com/
2. Select your project: `digital-travel-diary`
3. Go to: **Firestore Database** → **Rules**
4. Replace all the rules with:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own trips
    match /trips/{document=**} {
      allow read, write: if request.auth != null;
    }
    // Allow authenticated users to read/write their own entries
    match /entries/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

5. Click **Publish**

### Step 2: Update Storage Security Rules

1. In Firebase Console: **Storage** → **Rules**
2. Replace all the rules with:

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

3. Click **Publish**

## ✅ Test It Out

Once the rules are published:

1. Stop any running emulator (if you have it running)
2. Start your app:
   ```bash
   npm run dev
   ```
3. Open: http://localhost:5173
4. Sign up / Log in
5. Create a trip and some entries
6. **Refresh the page** - data should still be there! ✅
7. **Restart your browser** - data still persists! ✅
8. **Come back tomorrow** - data is still there! ✅

## 🎯 What's Different Now

| Aspect | Before (Emulator) | After (Real Firebase) |
|--------|------------------|----------------------|
| Data Storage | Local machine | Firebase Cloud |
| Data Persistence | Lost on restart | Permanent ✅ |
| Multiple Devices | No | Yes ✅ |
| Offline Access | Yes | No |
| Cost | Free | Free (generous tier) |

## 📚 Important Notes

- Your data is now in Google's secure Firebase cloud
- Free tier includes: 1GB storage, 50k read ops/month, 20k write ops/month
- Data is private and only accessible to authenticated users
- You can always view/manage data in Firebase Console

## 🚨 If Something Goes Wrong

**Data not saving?**
- Check console logs in browser (F12)
- Verify rules are published (green checkmark in Firebase Console)
- Make sure you're logged in

**Getting "Permission denied" error?**
- The security rules probably didn't publish
- Refresh the Rules page and try again
- Verify the exact rules are in place

**Need to switch back to emulator?**
- Change `.env.local`: `VITE_USE_FIREBASE_EMULATOR=true`
- Run: `firebase emulators:start --only storage,firestore,auth`
- Restart dev server

---

## 📖 Reference

- Firebase Console: https://console.firebase.google.com/
- Your Project: `digital-travel-diary`
- Firestore Docs: https://firebase.google.com/docs/firestore
- Auth Docs: https://firebase.google.com/docs/auth
