# Mobile APK Fix Guide

## Problem
The APK you downloaded is not working on your mobile device.

## Root Cause
After reorganizing files into `frontend/` and `backend/` folders, the Android app needs to be rebuilt and the Vercel deployment needs to be updated.

## Solution Options

### Option 1: Use Live Vercel URL (Current Setup)
Your app is configured to load from: `https://melissa-ai.vercel.app`

**Requirements:**
- ✅ Internet connection on mobile device
- ⚠️ Vercel must be deployed with the new folder structure
- ⚠️ Backend API must be working on Vercel

**Steps to fix:**
1. Deploy updated code to Vercel:
   ```bash
   # Make sure you've committed the new folder structure
   git add .
   git commit -m "Reorganized frontend and backend folders"
   git push
   ```

2. Rebuild the APK:
   ```bash
   npx cap sync android
   cd android
   ./gradlew assembleDebug
   ```

3. APK will be at: `android/app/build/outputs/apk/debug/app-debug.apk`

---

### Option 2: Bundled App (Offline - No Backend Required)

If you want the app to work without internet, we need to:

**Important:** This will only show the frontend UI. The chatbot features won't work without a backend connection.

**Steps:**

1. Remove the server URL from capacitor config:
   ```typescript
   // capacitor.config.ts
   const config: CapacitorConfig = {
       appId: 'com.melissa.ai',
       appName: 'Melissa AI',
       webDir: 'frontend',
       // Remove or comment out the server section
       // server: {
       //     url: 'https://melissa-ai.vercel.app',
       //     cleartext: true
       // },
       plugins: { ... }
   };
   ```

2. Sync and build:
   ```bash
   npx cap sync android
   cd android
   ./gradlew assembleDebug
   ```

---

### Option 3: Use Your Own Backend URL

If you have deployed the backend elsewhere (Render, Railway, etc.):

1. Update `capacitor.config.ts`:
   ```typescript
   server: {
       url: 'https://your-backend-url.com',
       cleartext: true
   }
   ```

2. Sync and build:
   ```bash
   npx cap sync android
   cd android
   ./gradlew assembleDebug
   ```

---

## Quick Fix (If Vercel is already deployed)

Since Vercel URL is accessible, you just need to rebuild the APK:

```bash
# 1. Sync the new frontend files to Android
npx cap sync android

# 2. Build new APK
cd android
./gradlew assembleDebug

# 3. Get APK from
# android/app/build/outputs/apk/debug/app-debug.apk
```

---

## Testing Checklist

After installing the new APK:

- [ ] App opens without crashing
- [ ] Chat interface loads
- [ ] Can type messages
- [ ] Get responses from AI (requires internet + working backend)
- [ ] Admin panel accessible

---

## Common Issues

### App shows blank screen
- **Cause:** Vercel URL not accessible or backend not deployed
- **Fix:** Check internet connection, verify Vercel deployment

### App crashes on startup
- **Cause:** Old APK cache or bad build
- **Fix:** Uninstall old app completely, reinstall new APK

### Chat doesn't respond
- **Cause:** Backend API not working or not deployed
- **Fix:** Deploy backend to Vercel or another platform

---

## Next Steps

Let me know which option you prefer:

1. **Fix with Vercel** (rebuild APK with current setup)
2. **Offline bundled app** (no backend features)
3. **Use different backend URL** (specify your URL)

I'll help you build the APK accordingly!
