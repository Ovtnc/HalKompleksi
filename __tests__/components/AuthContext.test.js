import React from 'react';
import { render, act } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '../../src/contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage');

// Mock API
jest.mock('../../src/services/api', () => ({
  authAPI: {
    login: jest.fn(),
    register: jest.fn()
  }
}));

// Test component to access context
const TestComponent = () => {
  const { user, isLoading, login, register, logout } = useAuth();
  
  return (
    <>
      <div data-testid="user">{user ? user.email : 'No user'}</div>
      <div data-testid="loading">{isLoading ? 'Loading' : 'Not loading'}</div>
      <button data-testid="login-btn" onPress={() => login('test@test.com', 'password')}>Login</button>
      <button data-testid="register-btn" onPress={() => register({ name: 'Test', email: 'test@test.com' })}>Register</button>
      <button data-testid="logout-btn" onPress={() => logout()}>Logout</button>
    </>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.clear();
  });

  test('should provide initial state', () => {
    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(getByTestId('user')).toHaveTextContent('No user');
    expect(getByTestId('loading')).toHaveTextContent('Not loading');
  });

  test('should load stored user on mount', async () => {
    const mockUser = {
      id: 'test-id',
      email: 'test@test.com',
      name: 'Test User'
    };

    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(mockUser));

    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      // Wait for useEffect to complete
    });

    expect(AsyncStorage.getItem).toHaveBeenCalledWith('userData');
  });

  test('should handle login successfully', async () => {
    const mockResponse = {
      token: 'test-token',
      user: {
        id: 'test-id',
        email: 'test@test.com',
        name: 'Test User'
      }
    };

    const { authAPI } = require('../../src/services/api');
    authAPI.login.mockResolvedValue(mockResponse);

    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      getByTestId('login-btn').props.onPress();
    });

    expect(authAPI.login).toHaveBeenCalledWith('test@test.com', 'password');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('authToken', 'test-token');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('userData', JSON.stringify(mockResponse.user));
  });

  test('should handle register successfully', async () => {
    const mockResponse = {
      token: 'test-token',
      user: {
        id: 'test-id',
        email: 'test@test.com',
        name: 'Test User'
      }
    };

    const { authAPI } = require('../../src/services/api');
    authAPI.register.mockResolvedValue(mockResponse);

    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      getByTestId('register-btn').props.onPress();
    });

    expect(authAPI.register).toHaveBeenCalledWith({ name: 'Test', email: 'test@test.com' });
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('authToken', 'test-token');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('userData', JSON.stringify(mockResponse.user));
  });

  test('should handle logout', async () => {
    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      getByTestId('logout-btn').props.onPress();
    });

    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('authToken');
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('userData');
  });
});
