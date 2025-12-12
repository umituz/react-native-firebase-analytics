/**
 * Analytics Event Service
 * Single Responsibility: Handle event logging operations
 */

import { webAnalyticsAdapter } from '../adapters/web-analytics.adapter';
import { nativeAnalyticsAdapter } from '../adapters/native-analytics.adapter';
import type { AnalyticsInstance } from './analytics-initializer.service';

export class AnalyticsEventService {
  /**
   * Log event to analytics
   */
  async logEvent(
    analyticsInstance: AnalyticsInstance | null,
    eventName: string,
    params?: Record<string, string | number | boolean | null>,
  ): Promise<void> {
    if (!analyticsInstance) {
      /* eslint-disable-next-line no-console */
      if (__DEV__) {
        console.warn('⚠️ Firebase Analytics: Cannot log event - Analytics not initialized', {
          eventName,
          reason: 'Analytics instance is null (native module not available in Expo Go)',
        });
      }
      return;
    }

    try {
      if (analyticsInstance.platform === 'native' && nativeAnalyticsAdapter) {
        await nativeAnalyticsAdapter.logEvent(
          analyticsInstance.instance,
          eventName,
          params,
        );
        /* eslint-disable-next-line no-console */
        if (__DEV__) {
          console.log('📊 Firebase Analytics Event (native):', {
            eventName,
            params,
            platform: 'iOS/Android',
          });
        }
      } else if (analyticsInstance.platform === 'web' && webAnalyticsAdapter) {
        await webAnalyticsAdapter.logEvent(
          analyticsInstance.instance,
          eventName,
          params,
        );
        /* eslint-disable-next-line no-console */
        if (__DEV__) {
          console.log('📊 Firebase Analytics Event:', {
            eventName,
            params,
          });
        }
      }
    } catch (error) {
      /* eslint-disable-next-line no-console */
      if (__DEV__) {
        console.warn('⚠️ Firebase Analytics: Failed to log event', {
          eventName,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }
}

export const analyticsEventService = new AnalyticsEventService();

