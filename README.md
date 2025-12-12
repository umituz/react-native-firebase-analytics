# @umituz/react-native-firebase-analytics

Firebase Analytics service for React Native apps - Platform-agnostic analytics tracking with decorators.

Built with **Domain-Driven Design (DDD)** principles.

## Installation

```bash
npm install @umituz/react-native-firebase-analytics
```

## Peer Dependencies

- `@umituz/react-native-firebase` >= 1.0.0 (for Firebase App initialization)
- `firebase` >= 11.0.0
- `react` >= 18.2.0
- `react-native` >= 0.74.0

## Features

- ✅ Platform-agnostic (Web, iOS, Android)
- ✅ Automatic event tracking with decorators
- ✅ Performance tracking
- ✅ Screen view tracking
- ✅ Screen time tracking (how long users stay on screens)
- ✅ Navigation tracking (user journey analysis)
- ✅ Button click tracking
- ✅ CRUD operation tracking
- ✅ User property management
- ✅ Domain-Driven Design architecture

## Usage

### 1. Initialize Firebase App First

```typescript
import { initializeFirebase } from '@umituz/react-native-firebase';
import { firebaseAnalyticsService } from '@umituz/react-native-firebase-analytics';

// Initialize Firebase App
const config = {
  apiKey: 'your-api-key',
  authDomain: 'your-project.firebaseapp.com',
  projectId: 'your-project-id',
};
initializeFirebase(config);

// Initialize Analytics
await firebaseAnalyticsService.init();
```

### 2. Track Events

```typescript
import { firebaseAnalyticsService } from '@umituz/react-native-firebase-analytics';

// Log custom event
await firebaseAnalyticsService.logEvent('button_clicked', {
  button_name: 'sign_up',
  screen: 'login',
});

// Log screen view
await firebaseAnalyticsService.logScreenView({
  screen_name: 'HomeScreen',
  screen_class: 'HomeScreen',
});

// Log screen time
await firebaseAnalyticsService.logScreenTime({
  screen_name: 'HomeScreen',
  screen_class: 'HomeScreen',
  time_spent_seconds: 45,
});

// Log navigation
await firebaseAnalyticsService.logNavigation({
  from_screen: 'HomeScreen',
  to_screen: 'SettingsScreen',
  screen_class: 'SettingsScreen',
});

// Log button click
await firebaseAnalyticsService.logButtonClick({
  button_id: 'create_deck',
  button_name: 'Create Deck',
  screen_name: 'HomeScreen',
  screen_class: 'HomeScreen',
});
```

### 3. Use Decorators

```typescript
import { TrackEvent } from '@umituz/react-native-firebase-analytics';

class UserService {
  @TrackEvent('user_created', { source: 'signup' })
  async createUser(data: UserData) {
    // Your logic here
    return user;
  }
}
```

### 4. Screen Tracking Hooks

```typescript
import { useScreenView, useScreenTime, useNavigationTracking } from '@umituz/react-native-firebase-analytics';

function HomeScreen() {
  // Comprehensive tracking (screen view + time + navigation)
  useScreenView('home', 'HomeScreen');
  
  // OR use individual hooks
  useScreenTime('home', 'HomeScreen'); // Track time spent
  useNavigationTracking('home', 'HomeScreen'); // Track navigation
  
  return <View>...</View>;
}
```

### 5. Utility Functions

```typescript
import { trackButtonClick, trackCRUDOperation } from '@umituz/react-native-firebase-analytics';

// Track button clicks
trackButtonClick('create_deck', {
  buttonName: 'Create Deck',
  screenName: 'HomeScreen',
  screenClass: 'HomeScreen',
});

// Track CRUD operations
trackCRUDOperation('create', 'deck', 'deck_123', {
  deck_title: 'Spanish Vocabulary',
  card_count: 10,
});
```

### 6. Performance Tracking

```typescript
import { TrackPerformance, TrackOperation } from '@umituz/react-native-firebase-analytics';

class DataService {
  @TrackPerformance('data_fetch')
  async fetchData() {
    // Automatically tracks execution time
    return data;
  }

  @TrackOperation('database_query', 'database')
  async queryDatabase() {
    // Tracks performance and errors
    return results;
  }
}
```

## API

### Services

- `firebaseAnalyticsService.init(userId?)` - Initialize analytics
- `firebaseAnalyticsService.logEvent(eventName, params?)` - Log custom event
- `firebaseAnalyticsService.logScreenView(params)` - Log screen view
- `firebaseAnalyticsService.logScreenTime(params)` - Log screen time (seconds)
- `firebaseAnalyticsService.logNavigation(params)` - Log navigation between screens
- `firebaseAnalyticsService.logButtonClick(params)` - Log button click
- `firebaseAnalyticsService.setUserProperty(key, value)` - Set user property
- `firebaseAnalyticsService.setUserProperties(properties)` - Set multiple user properties
- `firebaseAnalyticsService.clearUserData()` - Clear user data
- `firebaseAnalyticsService.getCurrentUserId()` - Get current user ID

### Hooks

- `useScreenView(screenName, screenClass?)` - Comprehensive screen tracking (view + time + navigation)
- `useScreenTime(screenName, screenClass?)` - Track time spent on screen
- `useNavigationTracking(screenName, screenClass?)` - Track navigation between screens

### Utilities

- `trackButtonClick(buttonId, options?)` - Track button clicks
- `trackCRUDOperation(operation, entityType, entityId, params?)` - Track CRUD operations

### Decorators

- `@TrackEvent(eventName, staticParams?)` - Automatic event tracking
- `@TrackPerformance(operationName?)` - Performance tracking
- `@TrackOperation(operationName, errorType?)` - Performance + error tracking

### Performance Tracker

- `performanceTracker.start(operationId)` - Start tracking
- `performanceTracker.end(operationId, metadata?)` - End tracking
- `performanceTracker.track(operationId, operation)` - Track async operation

## Architecture

This package follows Domain-Driven Design principles:

- **Infrastructure Layer**: Firebase Analytics implementation
- **Presentation Layer**: Decorators for automatic tracking
- **Platform-agnostic**: Works on Web, iOS, and Android

## License

MIT

