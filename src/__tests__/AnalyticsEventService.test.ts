/**
 * Tests for Analytics Event Service
 */

import { analyticsEventService } from '../infrastructure/services/analytics-event.service';
import { nativeAnalyticsAdapter } from '../infrastructure/adapters/native-analytics.adapter';
import { webAnalyticsAdapter } from '../infrastructure/adapters/web-analytics.adapter';

// Mock the adapters
jest.mock('../infrastructure/adapters/native-analytics.adapter');
jest.mock('../infrastructure/adapters/web-analytics.adapter');

const mockNativeAdapter = nativeAnalyticsAdapter as jest.Mocked<typeof nativeAnalyticsAdapter> | null;
const mockWebAdapter = webAnalyticsAdapter as jest.Mocked<typeof webAnalyticsAdapter> | null;

describe('AnalyticsEventService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('logEvent', () => {
    it('should log event to native analytics', async () => {
      const mockInstance = { instance: {}, platform: 'native' as const };
      if (mockNativeAdapter) {
        mockNativeAdapter.logEvent = jest.fn().mockResolvedValue(undefined);
      }

      await analyticsEventService.logEvent(mockInstance, 'test_event', { param1: 'value1' });

      expect(mockNativeAdapter?.logEvent).toHaveBeenCalledWith(
        mockInstance.instance,
        'test_event',
        { param1: 'value1' }
      );
    });

    it('should log event to web analytics', async () => {
      const mockInstance = { instance: {}, platform: 'web' as const };
      if (mockWebAdapter) {
        mockWebAdapter.logEvent = jest.fn().mockResolvedValue(undefined);
      }

      await analyticsEventService.logEvent(mockInstance, 'test_event', { param1: 'value1' });

      expect(mockWebAdapter?.logEvent).toHaveBeenCalledWith(
        mockInstance.instance,
        'test_event',
        { param1: 'value1' }
      );
    });

    it('should handle null analytics instance', async () => {
      await analyticsEventService.logEvent(null, 'test_event');

      expect(mockNativeAdapter?.logEvent).not.toHaveBeenCalled();
      expect(mockWebAdapter?.logEvent).not.toHaveBeenCalled();
    });

    it('should handle logging errors gracefully', async () => {
      const mockInstance = { instance: {}, platform: 'native' as const };
      if (mockNativeAdapter) {
        mockNativeAdapter.logEvent = jest.fn().mockRejectedValue(new Error('Test error'));
      }

      await expect(
        analyticsEventService.logEvent(mockInstance, 'test_event')
      ).resolves.not.toThrow();
    });

    it('should log event without parameters', async () => {
      const mockInstance = { instance: {}, platform: 'native' as const };
      if (mockNativeAdapter) {
        mockNativeAdapter.logEvent = jest.fn().mockResolvedValue(undefined);
      }

      await analyticsEventService.logEvent(mockInstance, 'test_event');

      expect(mockNativeAdapter?.logEvent).toHaveBeenCalledWith(
        mockInstance.instance,
        'test_event',
        undefined
      );
    });
  });
});