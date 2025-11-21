/**
 * Analytics Utilities
 *
 * Helper functions for tracking user interactions and events.
 * Platform-agnostic: Works on Web, iOS, and Android
 */

import { firebaseAnalyticsService } from "../../infrastructure/services/FirebaseAnalyticsService";

/**
 * Track button click
 * @param buttonId - Unique button identifier (e.g., 'create_deck', 'delete_card')
 * @param options - Optional parameters
 */
export function trackButtonClick(
  buttonId: string,
  options?: {
    buttonName?: string;
    screenName?: string;
    screenClass?: string;
    [key: string]: string | number | boolean | null | undefined;
  },
): void {
  const { buttonName, screenName, screenClass, ...additionalParams } =
    options || {};

  firebaseAnalyticsService
    .logButtonClick({
      button_id: buttonId,
      button_name: buttonName || buttonId,
      screen_name: screenName || "unknown",
      screen_class: screenClass || screenName || "unknown",
      ...additionalParams,
    })
    .catch(() => {
      // Silent fail - analytics is non-critical
    });
}

/**
 * Track CRUD operation
 * @param operation - Operation type ('create', 'update', 'delete', 'read')
 * @param entityType - Entity type ('deck', 'card', 'category', etc.)
 * @param entityId - Entity ID
 * @param additionalParams - Additional parameters to track
 */
export function trackCRUDOperation(
  operation: "create" | "update" | "delete" | "read",
  entityType: string,
  entityId: string,
  additionalParams?: Record<string, string | number | boolean | null>,
): void {
  const eventName = `${entityType}_${operation}d` as const;

  firebaseAnalyticsService
    .logEvent(eventName, {
      [`${entityType}_id`]: entityId,
      operation,
      entity_type: entityType,
      ...additionalParams,
    })
    .catch(() => {
      // Silent fail - analytics is non-critical
    });
}

