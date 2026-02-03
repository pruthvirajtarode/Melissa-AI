import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.melissa.ai',
    appName: 'Melissa AI',
    webDir: 'public',
    server: {
        // REPLACE THIS with your actual Vercel URL so the mobile app stays in sync with your live site
        url: 'https://YOUR_VERCEL_URL.vercel.app',
        cleartext: true
    },
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
