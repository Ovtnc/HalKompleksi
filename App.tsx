import React, { useEffect } from 'react';
import { StatusBar, LogBox, Alert, Linking } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/contexts/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import ErrorBoundary from './src/components/ErrorBoundary';

// TypeScript declaration for ErrorUtils
declare const ErrorUtils: {
  setGlobalHandler: (handler: (error: Error, isFatal?: boolean) => void) => void;
} | undefined;

// Ignore specific warnings
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  '[expo-av]',
  'Constants.platform.ios.model has been deprecated',
]);

// Set LogBox theme to light (white background)
LogBox.install();

// Global error handler
const globalErrorHandler = (error: Error, isFatal?: boolean) => {
  console.error('🔴 Global Error:', error);
  if (isFatal) {
    Alert.alert(
      'Beklenmeyen Hata',
      'Uygulama beklenmedik bir hatayla karşılaştı. Lütfen uygulamayı yeniden başlatın.',
      [{ text: 'Tamam' }]
    );
  }
};

// Override console.error to catch all errors
const originalConsoleError = console.error;
console.error = (...args) => {
  originalConsoleError(...args);
  // Log to crash reporting service (Sentry, Firebase, etc.)
};

// Deep linking configuration
const linking = {
  prefixes: ['halkompleksi://', 'https://halkompleksi.com'],
  config: {
    screens: {
      MainTabs: {
        screens: {
          Home: 'home',
          Products: 'products',
          Profile: 'profile',
        },
      },
      ProductDetail: 'product/:productId',
      Login: 'login',
      Register: 'register',
    },
  },
};

export default function App() {
  useEffect(() => {
    // Set global error handler
    if (ErrorUtils) {
      ErrorUtils.setGlobalHandler(globalErrorHandler);
    }

    // Handle deep links
    const handleDeepLink = (event: { url: string }) => {
      console.log('🔗 Deep link received:', event.url);
      // Deep link handling is automatic with NavigationContainer linking config
    };

    // Listen for deep links
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Check if app was opened with a deep link
    Linking.getInitialURL().then(url => {
      if (url) {
        console.log('🔗 App opened with URL:', url);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <AuthProvider>
            <NavigationContainer linking={linking}>
              <AppNavigator />
            </NavigationContainer>
            <StatusBar barStyle="light-content" />
          </AuthProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}