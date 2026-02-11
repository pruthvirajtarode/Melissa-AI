# Build APK with Android Studio - Step by Step

## Prerequisites
- Android Studio installed on your computer
- Java JDK 17 or higher

## Steps

### 1. Sync Frontend Files (Already Done ✅)
```bash
npx cap sync android
```

### 2. Open Project in Android Studio

1. Open **Android Studio**
2. Click **"Open an Existing Project"**
3. Navigate to:
   ```
   c:\Users\pruth\OneDrive\Desktop\Melissa AI-Business Development Chatbot\android
   ```
4. Click **"OK"**

### 3. Let Gradle Sync

- Android Studio will automatically sync Gradle
- Wait for the sync to complete (may take a few minutes)
- If you see any errors, click "Sync Project withGradle Files" button

### 4. Build APK

**Method A - Using Menu:**
1. Click **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
2. Wait for build to complete
3. Click "locate" in the notification to find your APK

**Method B - Using Terminal in Android Studio:**
1. Click **Terminal** tab at bottom
2. Run:
   ```bash
   .\gradlew assembleDebug
   ```

### 5. Get Your APK

The APK will be located at:
```
android\app\build\outputs\apk\debug\app-debug.apk
```

### 6. Install on Mobile

1. Transfer `app-debug.apk` to your phone
2. Enable "Install from Unknown Sources" in phone settings
3. Install the APK
4. **Make sure your phone has internet connection** (app connects to Vercel)

---

## Troubleshooting

### Build Fails with Java Error
- **Solution:** Install JDK 17
- Download from: https://www.oracle.com/java/technologies/downloads/#java17

### Gradle Sync Fails
- **Solution:** Click "File" → "Invalidate Caches and Restart"

### APK Installs but Shows Blank Screen
- **Cause:** No internet connection or Vercel backend not working
- **Solution:** 
  1. Check phone has internet
  2. Try opening https://melissa-ai.vercel.app in phone browser
  3. If URL doesn't work, deploy to Vercel first

---

## Alternative: Use Command Line (If Android Studio not available)

If you don't want to use Android Studio, you can try building with Java directly:

```bash
# Make sure you're in the android folder
cd "c:\Users\pruth\OneDrive\Desktop\Melissa AI-Business Development Chatbot\android"

# Build with gradlew
.\gradlew.bat assembleDebug
```

If this fails, you **must** use Android Studio to build.

---

## What's Next?

After building the APK:

1. **Install on phone**
2. **Test it** - The app should:
   - Open without crashing
   - Show Melissa AI interface
   - Connect to the chatbot (requires internet)

If the app still doesn't work after rebuilding, let me know what error you see!
