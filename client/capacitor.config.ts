import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.margo.game',
  appName: 'Margo',
  webDir: 'dist',
  server: {
    url: 'http://145.239.89.133:3002',
    cleartext: true,
    allowNavigation: ['145.239.89.133'],
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
};

export default config;
