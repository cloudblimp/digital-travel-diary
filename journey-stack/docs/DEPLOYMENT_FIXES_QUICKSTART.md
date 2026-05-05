# 🔧 Pre-Deployment Fixes - Quick Reference

## Critical Fixes Priority Order

### 1️⃣ HIGHEST PRIORITY: Firebase Listener Memory Leak
**File**: `src/pages/TripDetail.jsx`
**Time**: 30 minutes
**Impact**: Prevents app from crashing on long sessions

**Current Code (Lines 51-160)**:
```javascript
// Problem: 3 listeners, only 1 unsubscribe
useEffect(() => {
  const unsubscribe = onSnapshot(q1, (snapshot) => { /* ... */ });
  const unsubscribe2 = onSnapshot(q2, (snapshot) => { /* ... */ });
  const unsubscribe3 = onSnapshot(q3, (snapshot) => { /* ... */ });
  return unsubscribe; // ❌ Only returns first unsubscribe
}, [tripId, currentUser]);
```

**Fix**:
```javascript
useEffect(() => {
  if (!tripId || !currentUser) return;
  
  const unsub1 = onSnapshot(q1, ...);
  const unsub2 = onSnapshot(q2, ...);
  const unsub3 = onSnapshot(q3, ...);
  
  return () => {
    unsub1?.();
    unsub2?.();
    unsub3?.();
  };
}, [tripId, currentUser]);
```

---

### 2️⃣ CRITICAL: Remove Console Logs
**Files**: 
- `src/hooks/useTrips.js` (Lines 32, 36, 39, 43, 45-48)
- `src/firebase/config.js` (Lines 43, 47, 49, 58)
- Others: 30+ console statements

**Time**: 30 minutes

**Fix Strategy**:
```javascript
// Add this at top of file:
const isDev = process.env.NODE_ENV === 'development';

// Wrap all logs:
if (isDev) console.log('message');

// For production build, add to vite.config.js:
build: {
  minify: 'terser',
  terserOptions: {
    compress: { drop_console: true }
  }
}
```

---

### 3️⃣ CRITICAL: Add Firestore Query Limits
**Files**: 
- `src/contexts/TripContext.jsx`
- `src/pages/TripDetail.jsx` (3 queries)

**Time**: 1 hour

**Current** (Bad):
```javascript
const q = query(
  collection(db, 'entries'),
  where('tripId', '==', tripId),
  where('userId', '==', currentUser.uid)
  // ❌ No limit
);
```

**Fix**:
```javascript
const q = query(
  collection(db, 'entries'),
  where('tripId', '==', tripId),
  where('userId', '==', currentUser.uid),
  orderBy('dateTime', 'desc'),
  limit(20) // ✅ Limit to 20 items
);
```

**Apply to**:
- TripContext.jsx: Line 20-25 (trips query)
- TripDetail.jsx: Line 58-65 (entries query)
- TripDetail.jsx: Line 96-103 (activities query)
- TripDetail.jsx: Line 131-138 (photos query)

---

### 4️⃣ HIGH: Image Compression on Upload
**File**: `src/hooks/useTrips.js`
**Time**: 2-3 hours
**Impact**: Reduce image size 5-10x, save bandwidth

**Location**: Lines 27-50

**Solution**:
```javascript
// Add image compression function
const compressImage = async (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1920;
        const scale = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scale;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob(resolve, 'image/jpeg', 0.7);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });
};

// Use in createTrip:
if (coverImageFile) {
  const compressedFile = await compressImage(coverImageFile);
  const uploadResult = await uploadBytes(imageRef, compressedFile);
  // ...
}
```

---

### 5️⃣ HIGH: Add Error Boundaries
**Create New File**: `src/components/ErrorBoundary.jsx`
**Time**: 1 hour

**Code**:
```jsx
import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Oops! Something went wrong</h1>
            <p className="text-gray-600 mb-6">{this.state.error?.message}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-500 text-white rounded"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
```

**Usage in App.jsx**:
```jsx
import ErrorBoundary from './components/ErrorBoundary';

<ErrorBoundary>
  <YourApp />
</ErrorBoundary>
```

---

### 6️⃣ MEDIUM: Enable Offline Persistence
**File**: `src/firebase/config.js`
**Time**: 15 minutes

**Add at end of config.js**:
```javascript
import { enableIndexedDbPersistence } from 'firebase/firestore';

// Enable offline persistence
try {
  enableIndexedDbPersistence(db);
} catch (err) {
  if (err.code !== 'failed-precondition') {
    console.error('Offline persistence error:', err);
  }
}
```

**Benefits**:
- App works offline
- Faster initial load (reads from cache first)
- Syncs when back online

---

### 7️⃣ MEDIUM: Optimize Build Size
**File**: `vite.config.js`
**Time**: 30 minutes

**Update config**:
```javascript
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    minify: 'terser',
    terserOptions: {
      compress: { drop_console: true },
      mangle: true
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'firebase': ['firebase/app', 'firebase/firestore', 'firebase/storage'],
          'react-vendors': ['react', 'react-dom', 'react-router-dom'],
        }
      }
    }
  }
})
```

---

### 8️⃣ MEDIUM: Add Lazy Loading to Images
**File**: `src/components/TripCard.jsx`
**Time**: 15 minutes

**Current**:
```jsx
<img src={imageError || !trip.coverImage ? ... : trip.coverImage} />
```

**Fix**:
```jsx
<img 
  loading="lazy"
  src={imageError || !trip.coverImage ? ... : trip.coverImage}
/>
```

**Apply to**:
- TripCard.jsx (line 50)
- TripDetail.jsx (line 255, 345)
- TripPhotos.jsx (wherever images render)

---

## 📊 Impact Summary

| Fix | Effort | Impact | Priority |
|-----|--------|--------|----------|
| Remove console logs | 30 min | Medium | 🔴 Critical |
| Fix listener leak | 30 min | Critical | 🔴 Critical |
| Add query limits | 1 hour | High | 🔴 Critical |
| Image compression | 2-3 hours | High | 🔴 Critical |
| Error boundaries | 1 hour | Medium | 🟠 High |
| Offline persistence | 15 min | Medium | 🟠 High |
| Build optimization | 30 min | Medium | 🟠 High |
| Lazy loading images | 15 min | Low | 🟡 Medium |

**Total Time: ~6-7 hours**
**Performance Improvement: 60-80%**

---

## 🧪 Testing Checklist

After applying fixes:

- [ ] No console errors on page load
- [ ] Navigate between trips (check for memory leaks in DevTools)
- [ ] Upload image (< 500KB final size)
- [ ] Offline mode works (DevTools → offline)
- [ ] Error boundary triggers when needed
- [ ] Build size < 1MB gzipped
- [ ] Lighthouse score > 80
- [ ] Page loads in < 3 seconds (with throttling)

---

## 🚀 Deployment Commands

```bash
# Build with optimizations
npm run build

# Check build size
npm run build -- --outDir dist
du -sh dist/

# Preview production build locally
npm run preview

# Deploy to Firebase
firebase deploy
```

---

**Estimated GO LIVE Date**: 7 days after starting fixes
