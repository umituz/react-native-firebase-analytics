/**
 * Firebase Analytics Service
 * Single Responsibility: Orchestrate analytics operations
 * Delegates to specialized services for initialization, events, and user management
 */

import { analyticsInitializerService } from './analytics-initializer.service';
import { analyticsEventService } from './analytics-event.service';
import { analyticsUserService } from './analytics-user.service';
import type { AnalyticsInstance } from './analytics-initializer.service';

export interface IAnalyticsService {
  init(userId?: string): Promise<void>;
  setUserId(userId: string): Promise<void>;
  logEvent(
    eventName: string,
    params?: Record<string, string | number | boolean | null>,
  ): Promise<void>;
  setUserProperty(key: string, value: string): Promise<void>;
  setUserProperties(properties: Record<string, string>): Promise<void>;
  clearUserData(): Promise<void>;
  getCurrentUserId(): string | null;
  logScreenView(params: { screen_name: string; screen_class?: string }): Promise<void>;
  logScreenTime(params: {
    screen_name: string;
    screen_class?: string;
    time_spent_seconds: number;
  }): Promise<void>;
  logNavigation(params: {
    from_screen: string;
    to_screen: string;
    screen_class?: string;
  }): Promise<void>;
  logButtonClick(params: {
    button_id: string;
    button_name?: string;
    screen_name: string;
    screen_class?: string;
  }): Promise<void>;
}

class FirebaseAnalyticsService implements IAnalyticsService {
  private isInitialized = false;
  private userId: string | null = null;
  private userProperties: Record<string, string> = {};
  private analyticsInstance: AnalyticsInstance | null = null;

  async init(userId?: string): Promise<void> {
    if (this.isInitialized) {
      // Already initialized, just update user ID if provided
      if (userId && userId !== this.userId) {
        await this.setUserId(userId);
      }
      return;
    }

    try {
      this.analyticsInstance = await analyticsInitializerService.initialize();

      if (this.analyticsInstance) {
        if (userId) {
          this.userId = userId;
          await analyticsUserService.setUserId(this.analyticsInstance, userId);
          await this.setUserProperty('user_type', 'authenticated');
        } else {
          await this.setUserProperty('user_type', 'guest');
        }
        /* eslint-disable-next-line no-console */
        if (__DEV__) {
          console.log('✅ Firebase Analytics initialized successfully', {
            platform: this.analyticsInstance.platform,
            userId: userId || 'guest',
          });
        }
      } else {
        /* eslint-disable-next-line no-console */
        if (__DEV__) {
          console.warn('⚠️ Firebase Analytics: Initialization returned null instance', {
            reason: 'Native module not available (Expo Go limitation) or web analytics not supported',
            note: 'Events will be logged to console but not sent to Firebase',
          });
        }
      }
    } catch (_error) {
      // Analytics is non-critical, fail silently
    } finally {
      this.isInitialized = true;
    }
  }

  async setUserId(userId: string): Promise<void> {
    if (!this.isInitialized || !this.analyticsInstance) {
      // Not initialized yet, will be set during init
      return;
    }

    if (this.userId === userId) {
      // Already set to this user ID
      return;
    }

    try {
      this.userId = userId;
      await analyticsUserService.setUserId(this.analyticsInstance, userId);
      await this.setUserProperty('user_type', 'authenticated');
    } catch (_error) {
      // Analytics is non-critical, fail silently
    }
  }

  async logEvent(
    eventName: string,
    params?: Record<string, string | number | boolean | null>,
  ): Promise<void> {
    if (!this.isInitialized) {
      /* eslint-disable-next-line no-console */
      if (__DEV__) {
        console.warn('⚠️ Firebase Analytics: Cannot log event - Service not initialized', {
          eventName,
        });
      }
      return;
    }
    await analyticsEventService.logEvent(this.analyticsInstance, eventName, params);
  }

  async setUserProperty(key: string, value: string): Promise<void> {
    this.userProperties[key] = value;
    await analyticsUserService.setUserProperty(this.analyticsInstance, key, value);
  }

  async setUserProperties(properties: Record<string, string>): Promise<void> {
    await analyticsUserService.setUserProperties(this.analyticsInstance, properties);
    Object.assign(this.userProperties, properties);
  }

  async clearUserData(): Promise<void> {
    await analyticsUserService.clearUserData(this.analyticsInstance);
    this.userId = null;
    this.userProperties = {};
    this.isInitialized = false;
  }

  getCurrentUserId(): string | null {
    return this.userId;
  }

  async logScreenView(params: {
    screen_name: string;
    screen_class?: string;
  }): Promise<void> {
    await this.logEvent('screen_view', {
      screen_name: params.screen_name,
      screen_class: params.screen_class || params.screen_name,
    });
  }

  async logScreenTime(params: {
    screen_name: string;
    screen_class?: string;
    time_spent_seconds: number;
  }): Promise<void> {
    await this.logEvent('screen_time', {
      screen_name: params.screen_name,
      screen_class: params.screen_class || params.screen_name,
      time_spent_seconds: params.time_spent_seconds,
    });
  }

  async logNavigation(params: {
    from_screen: string;
    to_screen: string;
    screen_class?: string;
  }): Promise<void> {
    await this.logEvent('navigation', {
      from_screen: params.from_screen,
      to_screen: params.to_screen,
      screen_class: params.screen_class || params.to_screen,
    });
  }

  async logButtonClick(params: {
    button_id: string;
    button_name?: string;
    screen_name: string;
    screen_class?: string;
  }): Promise<void> {
    await this.logEvent('button_click', {
      button_id: params.button_id,
      button_name: params.button_name || params.button_id,
      screen_name: params.screen_name,
      screen_class: params.screen_class || params.screen_name,
    });
  }
}

export const firebaseAnalyticsService = new FirebaseAnalyticsService();
