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
  const analyticsModule = require('@react-native-firebase/analytics');
  
  // @react-native-firebase/analytics returns a factory function via createModuleNamespace
  // Handle CommonJS (require) and ES6 (import) module formats
  // The module can be:
  // 1. Direct function: analyticsModule()
  // 2. Object with default: analyticsModule.default()
  // 3. Object with __esModule: analyticsModule.default() or analyticsModule()
  
  if (typeof analyticsModule === 'function') {
    // Direct function export
    nativeAnalyticsModule = analyticsModule;
  } else if (analyticsModule && typeof analyticsModule.default === 'function') {
    // ES6 default export in CommonJS format
    nativeAnalyticsModule = analyticsModule.default;
  } else if (analyticsModule && typeof analyticsModule === 'object') {
    // Try to use the module itself if it's callable
    // Some bundlers wrap the function in an object
    nativeAnalyticsModule = analyticsModule;
  }
} catch (error) {
  /* eslint-disable-next-line no-console */
  if (__DEV__) {
    console.warn('⚠️ Firebase Analytics: Native module not available', error);
  }
}

export const nativeAnalyticsAdapter: NativeAnalyticsAdapter | null =
  nativeAnalyticsModule && (typeof nativeAnalyticsModule === 'function' || typeof nativeAnalyticsModule === 'object')
    ? {
        getAnalytics(): any {
          // Try calling as function first, then as object method
          if (typeof nativeAnalyticsModule === 'function') {
            return nativeAnalyticsModule();
          }
          // If it's an object, try calling it directly (some modules are callable objects)
          if (typeof nativeAnalyticsModule === 'object' && nativeAnalyticsModule.default) {
            return typeof nativeAnalyticsModule.default === 'function'
              ? nativeAnalyticsModule.default()
              : nativeAnalyticsModule.default;
          }
          return nativeAnalyticsModule;
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

