/**
 * Performance Decorator
 *
 * DDD Pattern: Decorator for automatic performance tracking
 */

import { performanceTracker } from '../../infrastructure/services/PerformanceTracker';

export function TrackPerformance(operationName?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const operation = operationName || `${target?.constructor?.name || 'Unknown'}.${propertyKey}`;

    descriptor.value = async function (...args: unknown[]) {
      const trackingId = `${operation}_${Date.now()}`;
      return await performanceTracker.track(trackingId, async () => {
        return await originalMethod.apply(this, args);
      });
    };

    return descriptor;
  };
}

export function TrackOperation(
  operationName: string,
  errorType: 'database' | 'network' | 'auth' | 'cache' | 'generic' = 'generic'
) {
  return function (
    _target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      const trackingId = `${operationName}_${Date.now()}`;
      const startTime = Date.now();

      try {
        performanceTracker.start(trackingId);
        const result = await originalMethod.apply(this, args);

        await performanceTracker.end(trackingId, {
          operation: operationName,
          method: propertyKey,
          success: true,
        });

        return result;
      } catch (error) {
        await performanceTracker.end(trackingId, {
          operation: operationName,
          method: propertyKey,
          success: false,
          duration_ms: Date.now() - startTime,
        });



        throw error;
      }
    };

    return descriptor;
  };
}

