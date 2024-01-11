import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rodalm.budgetplanner',
  appName: 'Budget Planner',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  }
};

export default config;
