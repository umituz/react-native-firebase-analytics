/**
 * Tests for Performance Tracker
 */

import { performanceTracker, PerformanceTracker } from '../infrastructure/services/PerformanceTracker';
import { firebaseAnalyticsService } from '../infrastructure/services/FirebaseAnalyticsService';

// Mock the analytics service
jest.mock('../infrastructure/services/FirebaseAnalyticsService');

const mockFirebaseAnalyticsService = firebaseAnalyticsService as jest.Mocked<typeof firebaseAnalyticsService>;

describe('PerformanceTracker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('start and end', () => {
    it('should start and end timing', async () => {
      const operationId = 'test-operation';
      
      performanceTracker.start(operationId);
      jest.advanceTimersByTime(1000);
      
      await performanceTracker.end(operationId);

      expect(mockFirebaseAnalyticsService.logEvent).toHaveBeenCalledWith(
        'performance_metric',
        {
          operation: 'test-operation',
          duration_ms: 1000
        }
      );
    });

    it('should handle end without start', async () => {
      await performanceTracker.end('non-existent-operation');

      expect(mockFirebaseAnalyticsService.logEvent).not.toHaveBeenCalled();
    });

    it('should include metadata in event', async () => {
      const operationId = 'test-operation';
      const metadata = { success: true, items_processed: 10 };
      
      performanceTracker.start(operationId);
      jest.advanceTimersByTime(500);
      
      await performanceTracker.end(operationId, metadata);

      expect(mockFirebaseAnalyticsService.logEvent).toHaveBeenCalledWith(
        'performance_metric',
        {
          operation: 'test-operation',
          duration_ms: 500,
          success: true,
          items_processed: 10
        }
      );
    });
  });

  describe('track', () => {
    it('should track successful operation', async () => {
      const mockOperation = jest.fn().mockResolvedValue('result');
      
      const result = await performanceTracker.track('test-operation', mockOperation);

      expect(result).toBe('result');
      expect(mockOperation).toHaveBeenCalled();
      expect(mockFirebaseAnalyticsService.logEvent).toHaveBeenCalledWith(
        'performance_metric',
        {
          operation: 'test-operation',
          duration_ms: 0,
          success: true
        }
      );
    });

    it('should track failed operation', async () => {
      const error = new Error('Test error');
      const mockOperation = jest.fn().mockRejectedValue(error);
      
      await expect(
        performanceTracker.track('test-operation', mockOperation)
      ).rejects.toThrow('Test error');

      expect(mockOperation).toHaveBeenCalled();
      expect(mockFirebaseAnalyticsService.logEvent).toHaveBeenCalledWith(
        'performance_metric',
        {
          operation: 'test-operation',
          duration_ms: 0,
          success: false,
          error_message: 'Test error'
        }
      );
    });

    it('should handle operation with timing', async () => {
      const mockOperation = jest.fn().mockImplementation(() => {
        jest.advanceTimersByTime(2000);
        return 'result';
      });
      
      await performanceTracker.track('test-operation', mockOperation);

      expect(mockFirebaseAnalyticsService.logEvent).toHaveBeenCalledWith(
        'performance_metric',
        {
          operation: 'test-operation',
          duration_ms: 2000,
          success: true
        }
      );
    });
  });

  describe('PerformanceTracker class', () => {
    it('should work as a new instance', async () => {
      const tracker = new PerformanceTracker();
      const mockOperation = jest.fn().mockResolvedValue('result');
      
      const result = await tracker.track('class-operation', mockOperation);

      expect(result).toBe('result');
      expect(mockFirebaseAnalyticsService.logEvent).toHaveBeenCalledWith(
        'performance_metric',
        {
          operation: 'class-operation',
          duration_ms: 0,
          success: true
        }
      );
    });
  });
});