/**
 * Tests for Firebase Analytics Service
 */

import { firebaseAnalyticsService } from '../infrastructure/services/FirebaseAnalyticsService';
import { analyticsInitializerService } from '../infrastructure/services/analytics-initializer.service';
import { analyticsEventService } from '../infrastructure/services/analytics-event.service';
import { analyticsUserService } from '../infrastructure/services/analytics-user.service';

// Mock the dependencies
jest.mock('../infrastructure/services/analytics-initializer.service');
jest.mock('../infrastructure/services/analytics-event.service');
jest.mock('../infrastructure/services/analytics-user.service');

const mockAnalyticsInitializerService = analyticsInitializerService as jest.Mocked<typeof analyticsInitializerService>;
const mockAnalyticsEventService = analyticsEventService as jest.Mocked<typeof analyticsEventService>;
const mockAnalyticsUserService = analyticsUserService as jest.Mocked<typeof analyticsUserService>;

describe('FirebaseAnalyticsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('init', () => {
    it('should initialize analytics successfully with userId', async () => {
      const mockInstance = { instance: {}, platform: 'native' as const };
      mockAnalyticsInitializerService.initialize.mockResolvedValue(mockInstance);
      mockAnalyticsUserService.setUserId.mockResolvedValue();
      mockAnalyticsUserService.setUserProperty.mockResolvedValue();

      await firebaseAnalyticsService.init('test-user');

      expect(mockAnalyticsInitializerService.initialize).toHaveBeenCalled();
      expect(mockAnalyticsUserService.setUserId).toHaveBeenCalledWith(mockInstance, 'test-user');
      expect(firebaseAnalyticsService.getCurrentUserId()).toBe('test-user');
    });

    it('should initialize analytics successfully without userId', async () => {
      const mockInstance = { instance: {}, platform: 'web' as const };
      mockAnalyticsInitializerService.initialize.mockResolvedValue(mockInstance);

      await firebaseAnalyticsService.init();

      expect(mockAnalyticsInitializerService.initialize).toHaveBeenCalled();
      expect(mockAnalyticsUserService.setUserId).not.toHaveBeenCalled();
      expect(firebaseAnalyticsService.getCurrentUserId()).toBeNull();
    });

    it('should handle initialization failure gracefully', async () => {
      mockAnalyticsInitializerService.initialize.mockResolvedValue(null);

      await firebaseAnalyticsService.init('test-user');

      expect(firebaseAnalyticsService.getCurrentUserId()).toBeNull();
    });

    it('should not initialize twice', async () => {
      const mockInstance = { instance: {}, platform: 'native' as const };
      mockAnalyticsInitializerService.initialize.mockResolvedValue(mockInstance);

      await firebaseAnalyticsService.init('test-user');
      await firebaseAnalyticsService.init('test-user-2');

      expect(mockAnalyticsInitializerService.initialize).toHaveBeenCalledTimes(1);
    });
  });

  describe('setUserId', () => {
    it('should set user ID after initialization', async () => {
      const mockInstance = { instance: {}, platform: 'native' as const };
      mockAnalyticsInitializerService.initialize.mockResolvedValue(mockInstance);
      mockAnalyticsUserService.setUserId.mockResolvedValue();
      mockAnalyticsUserService.setUserProperty.mockResolvedValue();

      await firebaseAnalyticsService.init();
      await firebaseAnalyticsService.setUserId('new-user');

      expect(mockAnalyticsUserService.setUserId).toHaveBeenCalledWith(mockInstance, 'new-user');
      expect(firebaseAnalyticsService.getCurrentUserId()).toBe('new-user');
    });

    it('should not set user ID if not initialized', async () => {
      await firebaseAnalyticsService.setUserId('test-user');

      expect(mockAnalyticsUserService.setUserId).not.toHaveBeenCalled();
    });

    it('should not set same user ID twice', async () => {
      const mockInstance = { instance: {}, platform: 'native' as const };
      mockAnalyticsInitializerService.initialize.mockResolvedValue(mockInstance);
      mockAnalyticsUserService.setUserId.mockResolvedValue();

      await firebaseAnalyticsService.init('test-user');
      await firebaseAnalyticsService.setUserId('test-user');

      expect(mockAnalyticsUserService.setUserId).toHaveBeenCalledTimes(1);
    });
  });

  describe('logEvent', () => {
    it('should log event after initialization', async () => {
      const mockInstance = { instance: {}, platform: 'native' as const };
      mockAnalyticsInitializerService.initialize.mockResolvedValue(mockInstance);
      mockAnalyticsEventService.logEvent.mockResolvedValue();

      await firebaseAnalyticsService.init();
      await firebaseAnalyticsService.logEvent('test_event', { param1: 'value1' });

      expect(mockAnalyticsEventService.logEvent).toHaveBeenCalledWith(
        mockInstance,
        'test_event',
        { param1: 'value1' }
      );
    });

    it('should not log event if not initialized', async () => {
      await firebaseAnalyticsService.logEvent('test_event');

      expect(mockAnalyticsEventService.logEvent).not.toHaveBeenCalled();
    });
  });

  describe('setUserProperty', () => {
    it('should set user property', async () => {
      const mockInstance = { instance: {}, platform: 'native' as const };
      mockAnalyticsInitializerService.initialize.mockResolvedValue(mockInstance);
      mockAnalyticsUserService.setUserProperty.mockResolvedValue();

      await firebaseAnalyticsService.init();
      await firebaseAnalyticsService.setUserProperty('theme', 'dark');

      expect(mockAnalyticsUserService.setUserProperty).toHaveBeenCalledWith(
        mockInstance,
        'theme',
        'dark'
      );
    });
  });

  describe('setUserProperties', () => {
    it('should set multiple user properties', async () => {
      const mockInstance = { instance: {}, platform: 'native' as const };
      mockAnalyticsInitializerService.initialize.mockResolvedValue(mockInstance);
      mockAnalyticsUserService.setUserProperties.mockResolvedValue();

      await firebaseAnalyticsService.init();
      await firebaseAnalyticsService.setUserProperties({
        theme: 'dark',
        language: 'en'
      });

      expect(mockAnalyticsUserService.setUserProperties).toHaveBeenCalledWith(
        mockInstance,
        {
          theme: 'dark',
          language: 'en'
        }
      );
    });
  });

  describe('clearUserData', () => {
    it('should clear user data', async () => {
      const mockInstance = { instance: {}, platform: 'native' as const };
      mockAnalyticsInitializerService.initialize.mockResolvedValue(mockInstance);
      mockAnalyticsUserService.clearUserData.mockResolvedValue();

      await firebaseAnalyticsService.init('test-user');
      await firebaseAnalyticsService.clearUserData();

      expect(mockAnalyticsUserService.clearUserData).toHaveBeenCalledWith(mockInstance);
      expect(firebaseAnalyticsService.getCurrentUserId()).toBeNull();
    });
  });

  describe('convenience methods', () => {
    beforeEach(() => {
      const mockInstance = { instance: {}, platform: 'native' as const };
      mockAnalyticsInitializerService.initialize.mockResolvedValue(mockInstance);
      mockAnalyticsEventService.logEvent.mockResolvedValue();
    });

    it('should log screen view', async () => {
      await firebaseAnalyticsService.init();
      await firebaseAnalyticsService.logScreenView({
        screen_name: 'Home',
        screen_class: 'HomeScreen'
      });

      expect(mockAnalyticsEventService.logEvent).toHaveBeenCalledWith(
        expect.any(Object),
        'screen_view',
        {
          screen_name: 'Home',
          screen_class: 'HomeScreen'
        }
      );
    });

    it('should log screen time', async () => {
      await firebaseAnalyticsService.init();
      await firebaseAnalyticsService.logScreenTime({
        screen_name: 'Home',
        screen_class: 'HomeScreen',
        time_spent_seconds: 30
      });

      expect(mockAnalyticsEventService.logEvent).toHaveBeenCalledWith(
        expect.any(Object),
        'screen_time',
        {
          screen_name: 'Home',
          screen_class: 'HomeScreen',
          time_spent_seconds: 30
        }
      );
    });

    it('should log navigation', async () => {
      await firebaseAnalyticsService.init();
      await firebaseAnalyticsService.logNavigation({
        from_screen: 'Home',
        to_screen: 'Profile',
        screen_class: 'ProfileScreen'
      });

      expect(mockAnalyticsEventService.logEvent).toHaveBeenCalledWith(
        expect.any(Object),
        'navigation',
        {
          from_screen: 'Home',
          to_screen: 'Profile',
          screen_class: 'ProfileScreen'
        }
      );
    });

    it('should log button click', async () => {
      await firebaseAnalyticsService.init();
      await firebaseAnalyticsService.logButtonClick({
        button_id: 'submit',
        button_name: 'Submit Button',
        screen_name: 'Form',
        screen_class: 'FormScreen'
      });

      expect(mockAnalyticsEventService.logEvent).toHaveBeenCalledWith(
        expect.any(Object),
        'button_click',
        {
          button_id: 'submit',
          button_name: 'Submit Button',
          screen_name: 'Form',
          screen_class: 'FormScreen'
        }
      );
    });
  });
});