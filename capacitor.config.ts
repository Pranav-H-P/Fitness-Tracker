import type { CapacitorConfig } from '@capacitor/cli';
import { SECRETS } from './src/environments/environment.secrets';

const config: CapacitorConfig = {
  appId: 'com.panic.fitnesstracker',
  appName: 'FitnessTracker',
  webDir: 'dist/workout-tracker/browser',
  android: {
    buildOptions: {
      releaseType: 'APK',
      keystorePath: SECRETS.KEYSTORE_PATH,
      keystorePassword: SECRETS.KEYSTORE_PASSWORD,
      keystoreAlias: SECRETS.KEYSTORE_ALIAS,
      keystoreAliasPassword: SECRETS.KEYSTORE_ALIAS_PASSWORD,
    },
  },
  plugins: {
    CapacitorSQLite: {
      androidIsEncryption: true,
      androidBiometric: {
        biometricAuth: false,
        biometricTitle: 'Biometric login for capacitor sqlite',
        biometricSubTitle: 'Log in using your biometric',
      },
    },
  },
};

export default config;
