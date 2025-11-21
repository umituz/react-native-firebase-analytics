/**
 * Native Analytics Adapter
 * Single Responsibility: Handle Firebase Analytics native implementation
 */

export interface NativeAnalyticsAdapter {
  getAnalytics(): any;
  logEvent(analytics: any, eventName: string, params?: Record<string, any>): Promise<void>;
  setUserId(analytics: any, userId: string): Promise<void>;
  setUserProperties(analytics: any, properties: Record<string, string>): Promise<void>;
  resetAnalyticsData(analytics: any): Promise<void>;
}

let nativeAnalyticsModule: any = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('@react-native-firebase/app');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const analytics = require('@react-native-firebase/analytics');
  nativeAnalyticsModule = analytics;
} catch (error) {
  /* eslint-disable-next-line no-console */
  if (__DEV__) {
    console.warn('⚠️ Firebase Analytics: Native module not available', error);
  }
}

export const nativeAnalyticsAdapter: NativeAnalyticsAdapter | null = nativeAnalyticsModule
  ? {
      getAnalytics(): any {
        return nativeAnalyticsModule();
      },
      async logEvent(
        analytics: any,
        eventName: string,
        params?: Record<string, any>,
      ): Promise<void> {
        await analytics.logEvent(eventName, params);
      },
      async setUserId(analytics: any, userId: string): Promise<void> {
        await analytics.setUserId(userId);
      },
      async setUserProperties(
        analytics: any,
        properties: Record<string, string>,
      ): Promise<void> {
        await analytics.setUserProperties(properties);
      },
      async resetAnalyticsData(analytics: any): Promise<void> {
        await analytics.resetAnalyticsData();
      },
    }
  : null;

