import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bharatstream.tv',
  appName: 'BharatStream TV',
  webDir: 'dist',
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
    SystemBars: {
      hidden: true,
      insetsHandling: 'disable',
    },
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;
