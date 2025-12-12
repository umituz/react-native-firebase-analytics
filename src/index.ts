/**
 * React Native Firebase Analytics - Public API
 *
 * Domain-Driven Design (DDD) Architecture
 */

// =============================================================================
// INFRASTRUCTURE LAYER - Services
// =============================================================================

export {
  firebaseAnalyticsService,
} from './infrastructure/services/FirebaseAnalyticsService';
export type { IAnalyticsService } from './infrastructure/services/FirebaseAnalyticsService';

export {
  performanceTracker,
  PerformanceTracker,
} from './infrastructure/services/PerformanceTracker';

// =============================================================================
// PRESENTATION LAYER - Decorators
// =============================================================================

export {
  TrackEvent,
  trackEvent,
} from './presentation/decorators/TrackingDecorator';

export {
  TrackPerformance,
  TrackOperation,
} from './presentation/decorators/PerformanceDecorator';

// =============================================================================
// PRESENTATION LAYER - Hooks
// =============================================================================

export {
  useScreenView,
} from './presentation/hooks/useScreenView';

export {
  useScreenTime,
} from './presentation/hooks/useScreenTime';

export {
  useNavigationTracking,
} from './presentation/hooks/useNavigationTracking';

// =============================================================================
// PRESENTATION LAYER - Utilities
// =============================================================================

export {
  trackButtonClick,
  trackCRUDOperation,
} from './presentation/utils/analyticsUtils';

