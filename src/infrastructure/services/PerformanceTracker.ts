/**
 * Performance Tracker
 *
 * Single Responsibility: Track method execution time and log to Firebase Analytics
 */

import { firebaseAnalyticsService } from './FirebaseAnalyticsService';

interface PerformanceMetric {
  operation: string;
  duration_ms: number;
  success: boolean;
  metadata?: Record<string, string | number | boolean>;
}

class PerformanceTracker {
  private activeTimings: Map<string, number> = new Map();

  start(operationId: string): void {
    this.activeTimings.set(operationId, Date.now());
  }

  async end(
    operationId: string,
    metadata?: Record<string, string | number | boolean>
  ): Promise<void> {
    const startTime = this.activeTimings.get(operationId);
    if (!startTime) {
      return;
    }

    const duration = Date.now() - startTime;
    this.activeTimings.delete(operationId);

    await firebaseAnalyticsService.logEvent('performance_metric', {
      operation: operationId,
      duration_ms: duration,
      ...metadata,
    });
  }

  async track<T>(
    operationId: string,
    operation: () => Promise<T>
  ): Promise<T> {
    this.start(operationId);
    try {
      const result = await operation();
      await this.end(operationId, { success: true });
      return result;
    } catch (error) {
      await this.end(operationId, {
        success: false,
        error_message: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }
}

export const performanceTracker = new PerformanceTracker();
export { PerformanceTracker };

