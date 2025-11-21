/**
 * useScreenView Hook
 *
 * Comprehensive screen tracking hook that combines:
 * - Screen view tracking (when screen is focused)
 * - Screen time tracking (how long user stays on screen)
 * - Navigation tracking (from/to screen transitions)
 *
 * Platform-agnostic: Works on Web, iOS, and Android
 *
 * @example
 * ```typescript
 * import { useScreenView } from '@umituz/react-native-firebase-analytics';
 *
 * function MyScreen() {
 *   useScreenView('home', 'HomeScreen');
 *   // ... rest of component
 * }
 * ```
 */

import { useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { InteractionManager } from "react-native";
import { firebaseAnalyticsService } from "../../infrastructure/services/FirebaseAnalyticsService";
import { useScreenTime } from "./useScreenTime";
import { useNavigationTracking } from "./useNavigationTracking";

/**
 * Track screen view, time, and navigation when screen is focused
 * @param screenName - Screen name (e.g., 'home', 'decks', 'settings')
 * @param screenClass - Screen class name (e.g., 'HomeScreen', 'DecksScreen')
 */
export function useScreenView(screenName: string, screenClass?: string): void {
  // Track screen time (how long user stays on screen)
  useScreenTime(screenName, screenClass);

  // Track navigation (from/to screen transitions)
  useNavigationTracking(screenName, screenClass);

  // Track screen view (when screen is focused)
  useFocusEffect(
    useCallback(() => {
      // Defer analytics until screen transition animation completes
      const task = InteractionManager.runAfterInteractions(() => {
        /* eslint-disable-next-line no-console */
        if (__DEV__) {
          console.log("📊 Screen view tracked:", {
            screen: screenName,
            screenClass: screenClass || screenName,
          });
        }

        firebaseAnalyticsService
          .logScreenView({
            screen_name: screenName,
            screen_class: screenClass || screenName,
          })
          .catch(() => {
            // Silent fail - analytics is non-critical
          });
      });

      return () => {
        task.cancel();
      };
    }, [screenName, screenClass]),
  );
}

