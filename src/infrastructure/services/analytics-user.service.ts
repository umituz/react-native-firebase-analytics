/**
 * Analytics User Service
 * Single Responsibility: Handle user-related analytics operations
 */

import { webAnalyticsAdapter } from '../adapters/web-analytics.adapter';
import { nativeAnalyticsAdapter } from '../adapters/native-analytics.adapter';
import type { AnalyticsInstance } from './analytics-initializer.service';

export class AnalyticsUserService {
  /**
   * Set user ID
   */
  async setUserId(
    analyticsInstance: AnalyticsInstance | null,
    userId: string,
  ): Promise<void> {
    if (!analyticsInstance) {
      return;
    }

    try {
      if (analyticsInstance.platform === 'native' && nativeAnalyticsAdapter) {
        await nativeAnalyticsAdapter.setUserId(analyticsInstance.instance, userId);
      } else if (analyticsInstance.platform === 'web' && webAnalyticsAdapter) {
        await webAnalyticsAdapter.setUserId(analyticsInstance.instance, userId);
      }
    } catch (_error) {
      // Silent fail
    }
  }

  /**
   * Set user property
   */
  async setUserProperty(
    analyticsInstance: AnalyticsInstance | null,
    key: string,
    value: string,
  ): Promise<void> {
    if (!analyticsInstance) {
      return;
    }

    try {
      if (analyticsInstance.platform === 'native' && nativeAnalyticsAdapter) {
        await nativeAnalyticsAdapter.setUserProperties(analyticsInstance.instance, {
          [key]: value,
        });
      } else if (analyticsInstance.platform === 'web' && webAnalyticsAdapter) {
        await webAnalyticsAdapter.setUserProperties(analyticsInstance.instance, {
          [key]: value,
        });
      }
    } catch (_error) {
      // Silent fail
    }
  }

  /**
   * Set multiple user properties
   */
  async setUserProperties(
    analyticsInstance: AnalyticsInstance | null,
    properties: Record<string, string>,
  ): Promise<void> {
    for (const [key, value] of Object.entries(properties)) {
      await this.setUserProperty(analyticsInstance, key, value);
    }
  }

  /**
   * Clear user data
   */
  async clearUserData(analyticsInstance: AnalyticsInstance | null): Promise<void> {
    if (!analyticsInstance) {
      return;
    }

    try {
      if (analyticsInstance.platform === 'native' && nativeAnalyticsAdapter) {
        await nativeAnalyticsAdapter.setUserId(analyticsInstance.instance, '');
        await nativeAnalyticsAdapter.setUserProperties(analyticsInstance.instance, {});
        if (nativeAnalyticsAdapter.resetAnalyticsData) {
          await nativeAnalyticsAdapter.resetAnalyticsData(analyticsInstance.instance);
        }
      } else if (analyticsInstance.platform === 'web' && webAnalyticsAdapter) {
        await webAnalyticsAdapter.setUserId(analyticsInstance.instance, '');
        await webAnalyticsAdapter.setUserProperties(analyticsInstance.instance, {});
      }
    } catch (_error) {
      // Silent fail
    }
  }
}

export const analyticsUserService = new AnalyticsUserService();

