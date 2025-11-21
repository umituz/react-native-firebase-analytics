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
  const { getAnalytics, logEvent, setUserId, setUserProperties, Analytics, isSupported } = require('firebase/analytics');
  webAnalytics = { getAnalytics, logEvent, setUserId, setUserProperties, Analytics, isSupported };
} catch {
  // firebase/analytics not available (e.g., on native platforms)
}

let nativeAnalytics: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('@react-native-firebase/app');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const analytics = require('@react-native-firebase/analytics');
  // React Native Firebase Analytics API
  // analytics() returns the default instance, no need for getAnalytics()
  nativeAnalytics = {
    getAnalytics: () => analytics(), // analytics() returns default instance
    setUserId: (instance: any, userId: string) => instance.setUserId(userId),
    setUserProperties: (instance: any, properties: Record<string, string>) => instance.setUserProperties(properties),
    logEvent: (instance: any, eventName: string, params?: Record<string, any>) => instance.logEvent(eventName, params),
    resetAnalyticsData: (instance: any) => instance.resetAnalyticsData(),
  };
} catch (error) {
  // @react-native-firebase/analytics not available (e.g., on web)
  /* eslint-disable-next-line no-console */
  if (__DEV__) {
    console.warn("⚠️ Firebase Analytics: Native module not available", error);
  }
}

export interface IAnalyticsService {
  init(userId?: string): Promise<void>;
  logEvent(eventName: string, params?: Record<string, string | number | boolean | null>): Promise<void>;
  setUserProperty(key: string, value: string): Promise<void>;
  setUserProperties(properties: Record<string, string>): Promise<void>;
  clearUserData(): Promise<void>;
  getCurrentUserId(): string | null;
  logScreenView(params: { screen_name: string; screen_class?: string }): Promise<void>;
  logScreenTime(params: { screen_name: string; screen_class?: string; time_spent_seconds: number }): Promise<void>;
  logNavigation(params: { from_screen: string; to_screen: string; screen_class?: string }): Promise<void>;
  logButtonClick(params: { button_id: string; button_name?: string; screen_name: string; screen_class?: string }): Promise<void>;
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
      /* eslint-disable-next-line no-console */
      if (__DEV__) {
        console.warn("⚠️ Firebase Analytics: webAnalytics not available");
      }
      this.isInitialized = true;
      return;
    }

    try {
      // Check if Analytics is supported in this environment
      if (webAnalytics.isSupported) {
        const isSupported = await webAnalytics.isSupported();
        if (!isSupported) {
          /* eslint-disable-next-line no-console */
          if (__DEV__) {
            console.warn("⚠️ Firebase Analytics: Not supported in this environment (web)");
          }
          this.isInitialized = true;
          return;
        }
      }

      const app = getFirebaseApp();
      if (!app) {
        /* eslint-disable-next-line no-console */
        if (__DEV__) {
          console.warn("⚠️ Firebase Analytics: Firebase app not available");
        }
        this.isInitialized = true;
        return;
      }

      if (!this.analytics) {
        // Wrap getAnalytics in try-catch to handle document/DOM errors
        try {
          this.analytics = webAnalytics.getAnalytics(app);
          /* eslint-disable-next-line no-console */
          if (__DEV__) {
            console.log("✅ Firebase Analytics initialized (web)", {
              hasAnalytics: !!this.analytics,
              userId: userId || "guest",
            });
          }
        } catch (analyticsError) {
          /* eslint-disable-next-line no-console */
          if (__DEV__) {
            console.warn("⚠️ Firebase Analytics: getAnalytics failed", analyticsError);
          }
          this.isInitialized = true;
          return;
        }
      }
    } catch (error) {
      /* eslint-disable-next-line no-console */
      if (__DEV__) {
        console.warn("⚠️ Firebase Analytics initialization failed:", error);
      }
      this.isInitialized = true;
      return;
    }

    // Only set user properties if analytics is initialized
    if (this.analytics) {
      try {
        if (userId) {
          this.userId = userId;
          await webAnalytics.setUserId(this.analytics, userId);
          await this.setUserProperty('user_type', 'authenticated');
        } else {
          await this.setUserProperty('user_type', 'guest');
        }
      } catch (error) {
        /* eslint-disable-next-line no-console */
        if (__DEV__) {
          console.warn("⚠️ Firebase Analytics: Failed to set user properties", error);
        }
      }
    }

    this.isInitialized = true;
  }

  private async initNative(userId?: string): Promise<void> {
    if (!nativeAnalytics) {
      /* eslint-disable-next-line no-console */
      if (__DEV__) {
        console.warn("⚠️ Firebase Analytics: nativeAnalytics not available (iOS/Android)");
      }
      this.isInitialized = true;
      return;
    }

    try {
      this.analytics = nativeAnalytics.getAnalytics();
      
      /* eslint-disable-next-line no-console */
      if (__DEV__) {
        console.log("✅ Firebase Analytics initialized (native)", {
          hasAnalytics: !!this.analytics,
          userId: userId || "guest",
          platform: "iOS/Android",
        });
      }
      
      if (userId) {
        this.userId = userId;
        await nativeAnalytics.setUserId(this.analytics, userId);
        await this.setUserProperty('user_type', 'authenticated');
      } else {
        await this.setUserProperty('user_type', 'guest');
      }
    } catch (error) {
      /* eslint-disable-next-line no-console */
      if (__DEV__) {
        console.warn("⚠️ Firebase Analytics: Native initialization failed:", error);
      }
    }

    this.isInitialized = true;
  }

  async logEvent(
    eventName: string,
    params?: Record<string, string | number | boolean | null>
  ): Promise<void> {
    try {
      if (!this.analytics) {
        // Silent fail - analytics not available
        return;
      }

      // Use whichever implementation initialized analytics
      if (nativeAnalytics && this.analytics) {
        try {
          await nativeAnalytics.logEvent(this.analytics, eventName, params);
          /* eslint-disable-next-line no-console */
          if (__DEV__) {
            console.log("📊 Firebase Analytics Event (native):", {
              eventName,
              params,
              userId: this.userId || "guest",
              platform: "iOS/Android",
            });
          }
        } catch (error) {
          /* eslint-disable-next-line no-console */
          if (__DEV__) {
            console.warn("⚠️ Firebase Analytics: Failed to log event (native)", {
              eventName,
              error,
            });
          }
        }
      } else if (webAnalytics && this.analytics) {
        try {
          await webAnalytics.logEvent(this.analytics, eventName, params);
          /* eslint-disable-next-line no-console */
          if (__DEV__) {
            console.log("📊 Firebase Analytics Event:", {
              eventName,
              params,
              userId: this.userId || "guest",
            });
          }
        } catch (error) {
          /* eslint-disable-next-line no-console */
          if (__DEV__) {
            // Only log in dev mode, don't show errors to users
            console.warn("⚠️ Firebase Analytics: Failed to log event (web)", {
              eventName,
              error: error instanceof Error ? error.message : String(error),
            });
          }
        }
      }
    } catch (error) {
      // Silent fail - analytics is non-critical
      /* eslint-disable-next-line no-console */
      if (__DEV__) {
        console.warn("⚠️ Firebase Analytics: Failed to log event", {
          eventName,
          error: error instanceof Error ? error.message : String(error),
        });
      }
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

  /**
   * Log screen time (how long user spent on screen)
   */
  async logScreenTime(params: {
    screen_name: string;
    screen_class?: string;
    time_spent_seconds: number;
  }): Promise<void> {
    try {
      await this.logEvent('screen_time', {
        screen_name: params.screen_name,
        screen_class: params.screen_class || params.screen_name,
        time_spent_seconds: params.time_spent_seconds,
      });
    } catch (_error) {
      // Silent fail
    }
  }

  /**
   * Log navigation between screens
   */
  async logNavigation(params: {
    from_screen: string;
    to_screen: string;
    screen_class?: string;
  }): Promise<void> {
    try {
      await this.logEvent('navigation', {
        from_screen: params.from_screen,
        to_screen: params.to_screen,
        screen_class: params.screen_class || params.to_screen,
      });
    } catch (_error) {
      // Silent fail
    }
  }

  /**
   * Log button click
   */
  async logButtonClick(params: {
    button_id: string;
    button_name?: string;
    screen_name: string;
    screen_class?: string;
  }): Promise<void> {
    try {
      await this.logEvent('button_click', {
        button_id: params.button_id,
        button_name: params.button_name || params.button_id,
        screen_name: params.screen_name,
        screen_class: params.screen_class || params.screen_name,
      });
    } catch (_error) {
      // Silent fail
    }
  }
}

export const firebaseAnalyticsService = new FirebaseAnalyticsService();

