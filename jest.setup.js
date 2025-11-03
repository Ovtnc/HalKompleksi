import '@testing-library/jest-native/extend-expect';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock Expo modules
jest.mock('expo-camera', () => ({
  Camera: {
    requestCameraPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
    getCameraPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' }))
  }
}));

jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  launchImageLibraryAsync: jest.fn(() => Promise.resolve({ 
    cancelled: false, 
    uri: 'mock-image-uri' 
  }))
}));

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  getCurrentPositionAsync: jest.fn(() => Promise.resolve({
    coords: { latitude: 41.0082, longitude: 28.9784 }
  }))
}));

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
  }),
  useRoute: () => ({
    params: {},
  }),
}));

// Mock API calls
global.fetch = jest.fn();

// Global test utilities
global.testUtils = {
  mockUser: {
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@test.com',
    phone: '05551234567',
    userType: 'buyer',
    userRoles: ['buyer'],
    activeRole: 'buyer',
    profileImage: null,
    isActive: true,
    isApproved: true
  },
  
  mockProduct: {
    id: 'test-product-id',
    title: 'Test Product',
    description: 'Test product description',
    price: 100,
    category: 'meyve',
    images: [],
    seller: 'test-seller-id',
    location: { city: 'Test City', district: 'Test District' },
    isAvailable: true,
    stock: 10,
    unit: 'kg'
  }
};
