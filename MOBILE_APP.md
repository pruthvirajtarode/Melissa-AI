# 📱 Melissa AI - Mobile App Guide

This guide explains how to build and distribute the **Melissa AI Mobile App** for Android and iOS.

---

## 🚀 How This App Works

We use **Capacitor** to turn your web app into a mobile application. Your app is configured as a **"Web Wrapper"**, meaning:
1. It opens your live Vercel/Render website.
2. It looks and feels like a native app (no browser bars).
3. It stays up-to-date automatically whenever you push code to GitHub.

---

## 🛠️ Prerequisites

Before building, ensure you have:
1. **Node.js** installed.
2. **Android Studio** (for Android APKs).
3. **Xcode** (for iOS apps - requires a Mac).

---

## 🏗️ Building the Android App (APK)

To create an installer (`.apk`) that you can send to users:

1. **Update the URL**:
   Open `capacitor.config.ts` and replace `https://YOUR_VERCEL_URL.vercel.app` with your actual live URL.

2. **Sync the Project**:
   ```bash
   npx cap sync android
   ```

3. **Open in Android Studio**:
   ```bash
   npx cap open android
   ```

4. **Generate APK**:
   - In Android Studio, wait for the project to load.
   - Go to **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**.
   - Once finished, click **"locate"** in the bottom right popup.
   - **Send the `app-debug.apk` to the user!**

---

## 🍏 Building the iOS App

(Requires a Mac with Xcode)

1. **Update the URL** in `capacitor.config.ts`.
2. **Add iOS Platform**:
   ```bash
   npx cap add ios
   ```
3. **Sync & Open**:
   ```bash
   npx cap sync ios
   npx cap open ios
   ```
4. **Deploy**: In Xcode, select your connected iPhone or a simulator and click the **Play** button.

---

## 📲 Alternative: Progressive Web App (PWA)

You don't even need to build an APK! Since we added a `manifest.json`, users can:
1. Visit your Vercel URL on their phone.
2. Tap the **Share** button (iOS) or **Menu dots** (Android).
3. Select **"Add to Home Screen"**.
4. Melissa AI will appear on their phone with its own icon and no browser bars.

---

## 🎨 Professional Icons & Splash Screens

I have already configured basic icons. To generate all necessary mobile sizes, run:

1. Install the generator:
   ```bash
   npm install @capacitor/assets --save-dev
   ```
2. Place a large `icon-only.png` (1024x1024) and `splash.png` (2732x2732) in an `assets` folder.
3. Run:
   ```bash
   npx capacitor-assets generate
   ```

---

## 🎯 Next Steps

1. **Finalize your Vercel URL** in `capacitor.config.ts`.
2. **Run `npx cap sync`**.
3. **Build your APK** in Android Studio and share it!

**Your mobile app is ready to go! 🚀**
