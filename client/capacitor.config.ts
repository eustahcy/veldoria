import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.margo.game',
  appName: 'Margo',
  webDir: 'dist',
  server: {
    url: 'http://148.113.237.210:3002',
    cleartext: true,
    allowNavigation: ['148.113.237.210'],
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
};

export default config;
