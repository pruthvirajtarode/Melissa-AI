# Alternative: Make APK Work WITHOUT Internet

If you want the mobile app to work offline (without connecting to Vercel), follow these steps.

⚠️ **Important:** This will only show the UI. The chatbot features won't work without a backend connection.

## Option 1: Remove Server URL (Offline Mode)

### Step 1: Update Capacitor Config

Edit `capacitor.config.ts`:

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.melissa.ai',
    appName: 'Melissa AI',
    webDir: 'frontend',
    // Comment out or remove the server section:
    // server: {
    //     url: 'https://melissa-ai.vercel.app',
    //     cleartext: true
    // },
    plugins: {
        SplashScreen: {
            launchShowDuration: 3000,
            launchAutoHide: true,
            backgroundColor: "#667eea",
            androidScaleType: "CENTER_CROP",
            showSpinner: true,
            androidSpinnerStyle: "large",
            iosSpinnerStyle: "small",
            spinnerColor: "#ffffff"
        }
    }
};

export default config;
```

### Step 2: Sync and Build

```bash
npx cap sync android
```

Then build with Android Studio as described in `BUILD_APK_GUIDE.md`

---

## Option 2: Use Local Backend (Advanced)

If you want the chatbot to work, you need a backend running somewhere. Options:

### A) Deploy Backend to Free Service

1. **Render.com** (Recommended)
   - Deploy backend folder to Render
   - Update capacitor config with Render URL

2. **Railway.app**
   - Deploy backend folder
   - Update capacitor config with Railway URL

### B) Run Backend on Your Computer

⚠️ This only works when your phone and computer are on the same WiFi network

1. Start the backend on your computer:
   ```bash
   npm start
   ```

2. Find your computer's local IP address:
   ```bash
   ipconfig
   ```
   Look for "IPv4 Address" (something like 192.168.1.x)

3. Update `capacitor.config.ts`:
   ```typescript
   server: {
       url: 'http://192.168.1.x:3000',  // Replace x with your IP
       cleartext: true
   }
   ```

4. Sync and rebuild:
   ```bash
   npx cap sync android
   ```

---

## Option 3: Hybrid Approach

Keep the frontend bundled but connect to a live backend:

1. Deploy backend to anywhere (Vercel, Render, Railway)
2. Update the frontend code to point to that backend URL
3. Keep `capacitor.config.ts` without the server URL
4. The bundled app will make API calls to your backend

This is the best approach for a production app!

---

## Recommended Setup

For a fully working mobile app:

1. ✅ Deploy backend to **Render** or **Railway** (free tier available)
2. ✅ Update `capacitor.config.ts` with backend URL
3. ✅ Build APK
4. ✅ App works anywhere with internet

Would you like help deploying the backend to a free service?
