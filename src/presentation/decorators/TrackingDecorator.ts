/**
 * Tracking Decorator
 *
 * DDD Pattern: Decorator for automatic Firebase Analytics tracking
 */

import { firebaseAnalyticsService } from '../../infrastructure/services/FirebaseAnalyticsService';

export function TrackEvent(
  eventName: string,
  staticParams?: Record<string, string | number | boolean>
) {
  return function (
    _target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      const startTime = Date.now();

      try {
        const result = await originalMethod.apply(this, args);

        await firebaseAnalyticsService.logEvent(eventName, {
          method: propertyKey,
          duration_ms: Date.now() - startTime,
          success: true,
          ...staticParams,
        });

        return result;
      } catch (error) {
        await firebaseAnalyticsService.logEvent(`${eventName}_failed`, {
          method: propertyKey,
          duration_ms: Date.now() - startTime,
          success: false,
          error_message: error instanceof Error ? error.message : 'Unknown error',
          ...staticParams,
        });

        throw error;
      }
    };

    return descriptor;
  };
}

export async function trackEvent<T>(
  eventName: string,
  operation: () => Promise<T>,
  params?: Record<string, string | number | boolean>
): Promise<T> {
  const startTime = Date.now();

  try {
    const result = await operation();

    await firebaseAnalyticsService.logEvent(eventName, {
      duration_ms: Date.now() - startTime,
      success: true,
      ...params,
    });

    return result;
  } catch (error) {
    await firebaseAnalyticsService.logEvent(`${eventName}_failed`, {
      duration_ms: Date.now() - startTime,
      success: false,
      error_message: error instanceof Error ? error.message : 'Unknown',
      ...params,
    });

    throw error;
  }
}

