import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.melliss.ai',
    appName: 'MellissAI',
    webDir: 'frontend',
    server: {
        // Updated with your actual live Vercel URL
        url: 'https://melissa-ai.vercel.app',
        cleartext: true
    },
    plugins: {
        SplashScreen: {
            launchShowDuration: 3000,
            launchAutoHide: true,
            backgroundColor: "#14532d",
            androidScaleType: "CENTER_CROP",
            showSpinner: true,
            androidSpinnerStyle: "large",
            iosSpinnerStyle: "small",
            spinnerColor: "#ffffff"
        }
    }
};

export default config;
