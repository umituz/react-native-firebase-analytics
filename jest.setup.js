// Jest setup file
global.__DEV__ = true;

// Mock React Native modules
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
    select: jest.fn((obj) => obj.ios),
  },
  InteractionManager: {
    runAfterInteractions: jest.fn((callback) => {
      callback();
      return { cancel: jest.fn() };
    }),
  },
}));

// Mock React Navigation
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: jest.fn((effect) => {
    effect();
  }),
}));

// Mock Firebase packages
jest.mock('@umituz/react-native-firebase', () => ({
  getFirebaseApp: jest.fn(() => ({})),
}));

jest.mock('firebase/analytics', () => ({
  getAnalytics: jest.fn(() => ({})),
  logEvent: jest.fn(),
  setUserId: jest.fn(),
  setUserProperties: jest.fn(),
  isSupported: jest.fn(() => Promise.resolve(true)),
}));

// Mock React Native Firebase packages
jest.mock('@react-native-firebase/app', () => ({
  app: jest.fn(() => ({})),
}));

jest.mock('@react-native-firebase/analytics', () => ({
  default: jest.fn(() => ({
    logEvent: jest.fn(),
    setUserId: jest.fn(),
    setUserProperties: jest.fn(),
    resetAnalyticsData: jest.fn(),
  })),
}));