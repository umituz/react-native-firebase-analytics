/**
 * Web Analytics Adapter
 * Single Responsibility: Handle Firebase Analytics web implementation
 */

export interface WebAnalyticsAdapter {
  isSupported(): Promise<boolean>;
  getAnalytics(app: any): any;
  logEvent(analytics: any, eventName: string, params?: Record<string, any>): Promise<void>;
  setUserId(analytics: any, userId: string): Promise<void>;
  setUserProperties(analytics: any, properties: Record<string, string>): Promise<void>;
}

let webAnalyticsModule: any = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const {
    getAnalytics,
    logEvent,
    setUserId,
    setUserProperties,
    isSupported,
  } = require('firebase/analytics');
  webAnalyticsModule = {
    getAnalytics,
    logEvent,
    setUserId,
    setUserProperties,
    isSupported,
  };
} catch {
  // firebase/analytics not available
}

export const webAnalyticsAdapter: WebAnalyticsAdapter | null = webAnalyticsModule
  ? {
      async isSupported(): Promise<boolean> {
        if (!webAnalyticsModule.isSupported) return true;
        return webAnalyticsModule.isSupported();
      },
      getAnalytics(app: any): any {
        return webAnalyticsModule.getAnalytics(app);
      },
      async logEvent(
        analytics: any,
        eventName: string,
        params?: Record<string, any>,
      ): Promise<void> {
        await webAnalyticsModule.logEvent(analytics, eventName, params);
      },
      async setUserId(analytics: any, userId: string): Promise<void> {
        await webAnalyticsModule.setUserId(analytics, userId);
      },
      async setUserProperties(
        analytics: any,
        properties: Record<string, string>,
      ): Promise<void> {
        await webAnalyticsModule.setUserProperties(analytics, properties);
      },
    }
  : null;

