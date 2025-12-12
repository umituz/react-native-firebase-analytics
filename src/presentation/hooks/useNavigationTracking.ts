/**
 * useNavigationTracking Hook
 *
 * Tracks navigation between screens for user journey analysis.
 * Logs navigation events when user navigates from one screen to another.
 *
 * Platform-agnostic: Works on Web, iOS, and Android
 *
 * @example
 * ```typescript
 * import { useNavigationTracking } from '@umituz/react-native-firebase-analytics';
 *
 * function MyScreen() {
 *   useNavigationTracking('home', 'HomeScreen');
 *   // ... rest of component
 * }
 * ```
 */

import { useRef, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { firebaseAnalyticsService } from "../../infrastructure/services/FirebaseAnalyticsService";

/**
 * Track navigation between screens
 * @param screenName - Current screen name (e.g., 'home', 'decks', 'settings')
 * @param screenClass - Current screen class name (e.g., 'HomeScreen', 'DecksScreen')
 */
export function useNavigationTracking(
  screenName: string,
  screenClass?: string,
): void {
  const previousScreenRef = useRef<string | null>(null);
  const isFirstFocusRef = useRef(true);

  useFocusEffect(
    useCallback(() => {
      // Skip first focus (app start)
      if (isFirstFocusRef.current) {
        isFirstFocusRef.current = false;
        previousScreenRef.current = screenName;
        return;
      }

      // Log navigation if coming from another screen
      if (previousScreenRef.current && previousScreenRef.current !== screenName) {
        /* eslint-disable-next-line no-console */
        if (__DEV__) {
          console.log("📊 Navigation tracked:", {
            from: previousScreenRef.current,
            to: screenName,
          });
        }

        firebaseAnalyticsService
          .logNavigation({
            from_screen: previousScreenRef.current,
            to_screen: screenName,
            screen_class: screenClass || screenName,
          })
          .catch(() => {
            // Silent fail - analytics is non-critical
          });
      }

      previousScreenRef.current = screenName;
    }, [screenName, screenClass]),
  );
}

