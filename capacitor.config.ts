import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sub2sub.app',
  appName: 'SUB2SUB',
  webDir: 'out',
  server: {
    url: 'https://sub2sub.com',
    cleartext: true,
  },
  android: {
    buildOptions: {},
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: '#dc2626',
    },
  },
};

export default config;
