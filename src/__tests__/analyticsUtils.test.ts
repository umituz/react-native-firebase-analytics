/**
 * Tests for Analytics Utilities
 */

import { trackButtonClick, trackCRUDOperation } from '../presentation/utils/analyticsUtils';
import { firebaseAnalyticsService } from '../infrastructure/services/FirebaseAnalyticsService';

// Mock the analytics service
jest.mock('../infrastructure/services/FirebaseAnalyticsService');

const mockFirebaseAnalyticsService = firebaseAnalyticsService as jest.Mocked<typeof firebaseAnalyticsService>;

describe('Analytics Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('trackButtonClick', () => {
    it('should track button click with minimal parameters', () => {
      trackButtonClick('submit-button');

      expect(mockFirebaseAnalyticsService.logButtonClick).toHaveBeenCalledWith({
        button_id: 'submit-button',
        button_name: 'submit-button',
        screen_name: 'unknown',
        screen_class: 'unknown'
      });
    });

    it('should track button click with all parameters', () => {
      trackButtonClick('submit-button', {
        buttonName: 'Submit Form',
        screenName: 'ContactForm',
        screenClass: 'ContactFormScreen',
        category: 'form',
        priority: 'high'
      });

      expect(mockFirebaseAnalyticsService.logButtonClick).toHaveBeenCalledWith({
        button_id: 'submit-button',
        button_name: 'Submit Form',
        screen_name: 'ContactForm',
        screen_class: 'ContactFormScreen',
        category: 'form',
        priority: 'high'
      });
    });

    it('should track button click with partial parameters', () => {
      trackButtonClick('delete-button', {
        screenName: 'UserList',
        category: 'action'
      });

      expect(mockFirebaseAnalyticsService.logButtonClick).toHaveBeenCalledWith({
        button_id: 'delete-button',
        button_name: 'delete-button',
        screen_name: 'UserList',
        screen_class: 'UserList',
        category: 'action'
      });
    });
  });

  describe('trackCRUDOperation', () => {
    it('should track create operation', () => {
      trackCRUDOperation('create', 'user', 'user-123', {
        role: 'admin',
        department: 'engineering'
      });

      expect(mockFirebaseAnalyticsService.logEvent).toHaveBeenCalledWith(
        'user_created',
        {
          user_id: 'user-123',
          operation: 'create',
          entity_type: 'user',
          role: 'admin',
          department: 'engineering'
        }
      );
    });

    it('should track update operation', () => {
      trackCRUDOperation('update', 'product', 'product-456', {
        price: 99.99,
        in_stock: true
      });

      expect(mockFirebaseAnalyticsService.logEvent).toHaveBeenCalledWith(
        'product_updated',
        {
          product_id: 'product-456',
          operation: 'update',
          entity_type: 'product',
          price: 99.99,
          in_stock: true
        }
      );
    });

    it('should track delete operation', () => {
      trackCRUDOperation('delete', 'order', 'order-789');

      expect(mockFirebaseAnalyticsService.logEvent).toHaveBeenCalledWith(
        'order_deleted',
        {
          order_id: 'order-789',
          operation: 'delete',
          entity_type: 'order'
        }
      );
    });

    it('should track read operation', () => {
      trackCRUDOperation('read', 'document', 'doc-101', {
        access_level: 'public',
        file_size: 1024
      });

      expect(mockFirebaseAnalyticsService.logEvent).toHaveBeenCalledWith(
        'document_read',
        {
          document_id: 'doc-101',
          operation: 'read',
          entity_type: 'document',
          access_level: 'public',
          file_size: 1024
        }
      );
    });

    it('should handle null values in additional parameters', () => {
      trackCRUDOperation('update', 'profile', 'profile-202', {
        bio: null,
        last_seen: '2023-01-01'
      });

      expect(mockFirebaseAnalyticsService.logEvent).toHaveBeenCalledWith(
        'profile_updated',
        {
          profile_id: 'profile-202',
          operation: 'update',
          entity_type: 'profile',
          bio: null,
          avatar_url: undefined,
          last_seen: '2023-01-01'
        }
      );
    });
  });
});