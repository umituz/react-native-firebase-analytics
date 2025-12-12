/**
 * useScreenTime Hook
 *
 * Tracks how long users spend on each screen.
 * Automatically logs screen_time event when screen is unfocused.
 *
 * Platform-agnostic: Works on Web, iOS, and Android
 *
 * @example
 * ```typescript
 * import { useScreenTime } from '@umituz/react-native-firebase-analytics';
 *
 * function MyScreen() {
 *   useScreenTime('home', 'HomeScreen');
 *   // ... rest of component
 * }
 * ```
 */

import { useRef, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { firebaseAnalyticsService } from "../../infrastructure/services/FirebaseAnalyticsService";

/**
 * Track screen time when screen is focused/unfocused
 * @param screenName - Screen name (e.g., 'home', 'decks', 'settings')
 * @param screenClass - Screen class name (e.g., 'HomeScreen', 'DecksScreen')
 */
export function useScreenTime(screenName: string, screenClass?: string): void {
  const startTimeRef = useRef<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      // Record start time when screen is focused
      startTimeRef.current = Date.now();

      return () => {
        // Calculate time spent when screen is unfocused
        if (startTimeRef.current !== null) {
          const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000); // seconds

          // Only log if user spent at least 1 second on screen
          if (timeSpent >= 1) {
            /* eslint-disable-next-line no-console */
            if (__DEV__) {
              console.log("📊 Screen time tracked:", {
                screen: screenName,
                timeSpent: `${timeSpent}s`,
              });
            }

            firebaseAnalyticsService
              .logScreenTime({
                screen_name: screenName,
                screen_class: screenClass || screenName,
                time_spent_seconds: timeSpent,
              })
              .catch(() => {
                // Silent fail - analytics is non-critical
              });
          }

          startTimeRef.current = null;
        }
      };
    }, [screenName, screenClass]),
  );
}

