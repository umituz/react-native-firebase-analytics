/**
 * Firebase Analytics Service
 *
 * Single Responsibility: Handle Firebase Analytics tracking
 * Platform-agnostic: Works on all platforms (Web, iOS, Android)
 */

import { getFirebaseApp } from '@umituz/react-native-firebase';

// Try to load both implementations - whichever is available will be used
let webAnalytics: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { getAnalytics, logEvent, setUserId, setUserProperties, Analytics } = require('firebase/analytics');
  webAnalytics = { getAnalytics, logEvent, setUserId, setUserProperties, Analytics };
} catch {
  // firebase/analytics not available (e.g., on native platforms)
}

let nativeAnalytics: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('@react-native-firebase/app');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const analytics = require('@react-native-firebase/analytics');
  nativeAnalytics = {
    getAnalytics: analytics.getAnalytics,
    setUserId: analytics.setUserId,
    setUserProperties: analytics.setUserProperties,
    logEvent: analytics.logEvent,
    resetAnalyticsData: analytics.resetAnalyticsData,
  };
} catch {
  // @react-native-firebase/analytics not available (e.g., on web)
}

export interface IAnalyticsService {
  init(userId?: string): Promise<void>;
  logEvent(eventName: string, params?: Record<string, string | number | boolean | null>): Promise<void>;
  setUserProperty(key: string, value: string): Promise<void>;
  setUserProperties(properties: Record<string, string>): Promise<void>;
  clearUserData(): Promise<void>;
  getCurrentUserId(): string | null;
}

class FirebaseAnalyticsService implements IAnalyticsService {
  private isInitialized = false;
  private userId: string | null = null;
  private userProperties: Record<string, string> = {};
  private analytics: any = null;

  async init(userId?: string): Promise<void> {
    try {
      // Try native first, then web - whichever is available
      if (nativeAnalytics) {
        await this.initNative(userId);
      } else if (webAnalytics) {
        await this.initWeb(userId);
      } else {
        // No analytics implementation available
        this.isInitialized = true;
      }
    } catch (_error) {
      // Analytics is non-critical, fail silently
      this.isInitialized = true;
    }
  }

  private async initWeb(userId?: string): Promise<void> {
    if (!webAnalytics) {
      this.isInitialized = true;
      return;
    }

    try {
      const app = getFirebaseApp();
      if (!this.analytics) {
        this.analytics = webAnalytics.getAnalytics(app);
      }
    } catch {
      this.isInitialized = true;
      return;
    }

    if (userId) {
      this.userId = userId;
      await webAnalytics.setUserId(this.analytics, userId);
      await this.setUserProperty('user_type', 'authenticated');
    } else {
      await this.setUserProperty('user_type', 'guest');
    }

    this.isInitialized = true;
  }

  private async initNative(userId?: string): Promise<void> {
    if (!nativeAnalytics) {
      this.isInitialized = true;
      return;
    }

    try {
      this.analytics = nativeAnalytics.getAnalytics();
      
      if (userId) {
        this.userId = userId;
        await nativeAnalytics.setUserId(this.analytics, userId);
        await this.setUserProperty('user_type', 'authenticated');
      } else {
        await this.setUserProperty('user_type', 'guest');
      }
    } catch {
      // Silent fail
    }

    this.isInitialized = true;
  }

  async logEvent(
    eventName: string,
    params?: Record<string, string | number | boolean | null>
  ): Promise<void> {
    try {
      if (!this.analytics) {
        return;
      }

      // Use whichever implementation initialized analytics
      if (nativeAnalytics && this.analytics) {
        await nativeAnalytics.logEvent(this.analytics, eventName, params);
      } else if (webAnalytics && this.analytics) {
        await webAnalytics.logEvent(this.analytics, eventName, params);
      }
    } catch (_error) {
      // Silent fail
    }
  }

  async setUserProperty(key: string, value: string): Promise<void> {
    try {
      if (!this.analytics) {
        return;
      }

      this.userProperties[key] = value;

      // Use whichever implementation initialized analytics
      if (nativeAnalytics && this.analytics) {
        await nativeAnalytics.setUserProperties(this.analytics, { [key]: value });
      } else if (webAnalytics && this.analytics) {
        await webAnalytics.setUserProperties(this.analytics, { [key]: value });
      }
    } catch (_error) {
      // Silent fail
    }
  }

  async setUserProperties(properties: Record<string, string>): Promise<void> {
    for (const [key, value] of Object.entries(properties)) {
      await this.setUserProperty(key, value);
    }
  }

  async clearUserData(): Promise<void> {
    try {
      if (!this.analytics) {
        return;
      }

      // Use whichever implementation initialized analytics
      if (nativeAnalytics && this.analytics) {
        await nativeAnalytics.setUserId(this.analytics, '');
        await nativeAnalytics.setUserProperties(this.analytics, {});
        if (nativeAnalytics.resetAnalyticsData) {
          await nativeAnalytics.resetAnalyticsData(this.analytics);
        }
      } else if (webAnalytics && this.analytics) {
        await webAnalytics.setUserId(this.analytics, '');
        await webAnalytics.setUserProperties(this.analytics, {});
      }

      this.userId = null;
      this.userProperties = {};
      this.isInitialized = false;
    } catch (_error) {
      // Silent fail
    }
  }

  getCurrentUserId(): string | null {
    return this.userId;
  }

  /**
   * Log screen view
   */
  async logScreenView(params: {
    screen_name: string;
    screen_class?: string;
  }): Promise<void> {
    try {
      await this.logEvent('screen_view', {
        screen_name: params.screen_name,
        screen_class: params.screen_class || params.screen_name,
      });
    } catch (_error) {
      // Silent fail
    }
  }
}

export const firebaseAnalyticsService = new FirebaseAnalyticsService();

