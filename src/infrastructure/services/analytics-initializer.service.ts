/**
 * Analytics Initializer Service
 * Single Responsibility: Handle analytics initialization logic
 */

import { Platform } from 'react-native';
import { getFirebaseApp } from '@umituz/react-native-firebase';
import { webAnalyticsAdapter } from '../adapters/web-analytics.adapter';
import { nativeAnalyticsAdapter } from '../adapters/native-analytics.adapter';

export interface AnalyticsInstance {
  instance: any;
  platform: 'web' | 'native';
}

export class AnalyticsInitializerService {
  private static nativeWarningLogged = false;

  /**
   * Initialize analytics instance
   * Returns null if initialization fails
   */
  async initialize(): Promise<AnalyticsInstance | null> {
    // Platform-specific initialization
    // iOS/Android: Only use native
    // Web: Only use web
    if (Platform.OS === 'web') {
      if (webAnalyticsAdapter) {
        return this.initializeWeb();
      }
      return null;
    }

    // iOS/Android: Try native only
    if (nativeAnalyticsAdapter) {
      return this.initializeNative();
    }

    // Native not available on iOS/Android - return null
    // Only log warning once
    if (__DEV__ && !AnalyticsInitializerService.nativeWarningLogged) {
      AnalyticsInitializerService.nativeWarningLogged = true;
      /* eslint-disable-next-line no-console */
      console.warn(
        '⚠️ Firebase Analytics: Native module not available on iOS/Android (Expo Go limitation)',
      );
    }
    return null;
  }

  private async initializeNative(): Promise<AnalyticsInstance | null> {
    try {
      if (!nativeAnalyticsAdapter) {
        /* eslint-disable-next-line no-console */
        if (__DEV__) {
          console.warn(
            '⚠️ Firebase Analytics: Native adapter not available - ensure @react-native-firebase/app and @react-native-firebase/analytics are installed',
          );
        }
        return null;
      }

      const instance = nativeAnalyticsAdapter.getAnalytics();
      if (!instance) {
        /* eslint-disable-next-line no-console */
        if (__DEV__) {
          console.warn('⚠️ Firebase Analytics: getAnalytics() returned null');
        }
        return null;
      }

      /* eslint-disable-next-line no-console */
      if (__DEV__) {
        console.log('✅ Firebase Analytics initialized (native)');
      }
      return { instance, platform: 'native' };
    } catch (error) {
      /* eslint-disable-next-line no-console */
      if (__DEV__) {
        console.warn('⚠️ Firebase Analytics: Native initialization failed', error);
      }
      return null;
    }
  }

  private async initializeWeb(): Promise<AnalyticsInstance | null> {
    try {
      // Check if Analytics is supported
      if (webAnalyticsAdapter) {
        const isSupported = await webAnalyticsAdapter.isSupported();
        if (!isSupported) {
          /* eslint-disable-next-line no-console */
          if (__DEV__) {
            console.warn('⚠️ Firebase Analytics: Not supported in this environment (web)');
          }
          return null;
        }
      }

      const app = getFirebaseApp();
      if (!app) {
        /* eslint-disable-next-line no-console */
        if (__DEV__) {
          console.warn('⚠️ Firebase Analytics: Firebase app not available');
        }
        return null;
      }

      try {
        const instance = webAnalyticsAdapter!.getAnalytics(app);
        /* eslint-disable-next-line no-console */
        if (__DEV__) {
          console.log('✅ Firebase Analytics initialized (web)');
        }
        return { instance, platform: 'web' };
      } catch (analyticsError) {
        /* eslint-disable-next-line no-console */
        if (__DEV__) {
          console.warn('⚠️ Firebase Analytics: getAnalytics failed', analyticsError);
        }
        return null;
      }
    } catch (error) {
      /* eslint-disable-next-line no-console */
      if (__DEV__) {
        console.warn('⚠️ Firebase Analytics: Web initialization failed', error);
      }
      return null;
    }
  }
}

export const analyticsInitializerService = new AnalyticsInitializerService();

