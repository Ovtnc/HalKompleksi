import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';
import { ENV } from '../config/env';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  userType: 'buyer' | 'seller' | 'admin';
  userRoles: string[];
  activeRole: 'buyer' | 'seller' | 'admin';
  profileImage?: string;
  isActive: boolean;
  isApproved: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  unreadNotificationCount: number;
  sessionExpired: boolean;
  profileUpdated: number;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  forceLogout: () => Promise<void>;
  clearToken: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  updateNotificationCount: (count: number) => void;
  loadRememberedCredentials: () => Promise<{email: string, password: string} | null>;
  clearRememberedCredentials: () => Promise<void>;
  clearSessionExpired: () => void;
  setSessionExpired: (expired: boolean) => void;
  validateToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [profileUpdated, setProfileUpdated] = useState(0); // Counter to trigger refreshes

  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('authToken');
      const userData = await AsyncStorage.getItem('userData');
      
      console.log('🔑 AuthContext - Token found:', !!token);
      console.log('🔑 AuthContext - User data found:', !!userData);
      
      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        console.log('🔑 AuthContext - User loaded:', parsedUser.email);
      }
    } catch (error) {
      console.error('Error loading stored user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      setIsLoading(true);
      console.log('🔐 [AUTH] Login started for:', email);
      const response = await authAPI.login(email, password);
      
      if (response.token && response.user) {
        console.log('🔐 [AUTH] Login response received, token length:', response.token.length);
        console.log('🔐 [AUTH] Token preview:', response.token.substring(0, 30) + '...');
        
        await AsyncStorage.setItem('authToken', response.token);
        console.log('✅ [AUTH] Token saved to AsyncStorage');
        
        // Verify token was saved
        const savedToken = await AsyncStorage.getItem('authToken');
        console.log('✅ [AUTH] Token verification - saved token length:', savedToken?.length || 0);
        console.log('✅ [AUTH] Token match:', savedToken === response.token ? 'YES' : 'NO');
        
        await AsyncStorage.setItem('userData', JSON.stringify(response.user));
        console.log('✅ [AUTH] User data saved to AsyncStorage');
        
        // Save credentials if rememberMe is true
        if (rememberMe) {
          await AsyncStorage.setItem('rememberedCredentials', JSON.stringify({
            email,
            password
          }));
        } else {
          // Clear remembered credentials if user doesn't want to be remembered
          await AsyncStorage.removeItem('rememberedCredentials');
        }
        
        setUser(response.user);
        console.log('✅ [AUTH] Login completed successfully');
      } else {
        console.error('❌ [AUTH] Login response missing token or user');
      }
    } catch (error) {
      console.error('❌ [AUTH] Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any) => {
    try {
      setIsLoading(true);
      const response = await authAPI.register(userData);
      
      if (response.token && response.user) {
        await AsyncStorage.setItem('authToken', response.token);
        await AsyncStorage.setItem('userData', JSON.stringify(response.user));
        setUser(response.user);
        
        // Refresh user data to ensure userRoles are properly set
        console.log('🔄 Refreshing user data after registration...');
        try {
          const userResponse = await fetch(`${ENV.API_BASE_URL}/auth/me`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${response.token}`
            }
          });
          
          if (userResponse.ok) {
            const userData = await userResponse.json();
            console.log('✅ User data refreshed:', userData.user);
            await AsyncStorage.setItem('userData', JSON.stringify(userData.user));
            setUser(userData.user);
          }
        } catch (refreshError) {
          console.error('❌ Error refreshing user data:', refreshError);
        }
      }
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');
      // Note: We don't clear remembered credentials on logout
      // so user can still be remembered for next login
      setUser(null);
      console.log('✅ User logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const forceLogout = async () => {
    console.log('🔄 Force logout due to token expiration');
    await logout();
  };

  const clearToken = async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');
      setUser(null);
      console.log('✅ Token cleared manually');
    } catch (error) {
      console.error('Clear token error:', error);
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return false;
      
      console.log('🔄 [REFRESH] Attempting token refresh...');
      const response = await fetch(`${ENV.API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('🔄 [REFRESH] Response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        await AsyncStorage.setItem('authToken', result.token);
        console.log('✅ [REFRESH] Token refreshed successfully');
        return true;
      } else {
        const errorData = await response.json();
        console.error('❌ [REFRESH] Token refresh failed:', errorData);
      }
      
      return false;
    } catch (error) {
      console.error('❌ [REFRESH] Token refresh error:', error);
      return false;
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      if (user) {
        // Get token from storage
        const token = await AsyncStorage.getItem('authToken');
        console.log('🔑 AuthContext Token check:', token ? 'Token found' : 'No token');
        
        if (!token) {
          console.log('⚠️ No token found, updating locally only');
          // For now, just update locally without backend
          const updatedUser = { ...user, ...userData };
          await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
          setUser(updatedUser);
          return;
        }

        try {
          console.log('🚀 Calling backend API with data:', userData);
          
          // Determine which endpoint to use based on data type
          const isProfileImageUpdate = userData.profileImage && Object.keys(userData).length === 1;
          const endpoint = isProfileImageUpdate ? '/users/profile-image' : '/users/profile';
          
          console.log('📡 Using endpoint:', endpoint);
          console.log('📡 Full URL:', `${ENV.API_BASE_URL}${endpoint}`);
          
          // Call backend API
          const response = await fetch(`${ENV.API_BASE_URL}${endpoint}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(userData)
          });
          
          console.log('📡 Backend response status:', response.status);
          
          if (!response.ok) {
            const errorData = await response.json();
            
            // If token is invalid, set session expired but don't clear data immediately
            if (errorData.message?.includes('Token is not valid') || errorData.message?.includes('authorization denied')) {
              console.log('🔄 Token invalid, setting session expired...');
              setSessionExpired(true);
              throw new Error('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
            }
            
            throw new Error(errorData.message || 'Backend update failed');
          }

          const result = await response.json();
          
          console.log('📡 Backend response result:', result);
          console.log('📡 Backend user data:', result.user);
          console.log('📡 Backend user activeRole:', result.user?.activeRole);
          console.log('📡 Backend user userRoles:', result.user?.userRoles);
          
          // Update local storage with backend response
          if (result.user) {
            const updatedUser = { ...user, ...result.user };
            console.log('📡 Updated user object:', updatedUser);
            console.log('📡 Updated user activeRole:', updatedUser.activeRole);
            
            await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
            setUser(updatedUser);
            console.log('✅ User updated from backend response');
          } else {
            // Fallback: update with userData if no user in response
            const updatedUser = { ...user, ...userData };
            console.log('📡 Fallback: Updated user object:', updatedUser);
            
            await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
            setUser(updatedUser);
            console.log('✅ User updated from fallback data');
          }
          
          // Trigger profile update event to refresh product lists
          setProfileUpdated(prev => prev + 1);
          
          console.log('✅ User state updated successfully');
        } catch (networkError) {
          // If backend fails, update locally
          console.log('Backend update failed, updating locally:', (networkError as Error).message);
          const updatedUser = { ...user, ...userData };
          await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
          setUser(updatedUser);
        }
      }
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  };

  const updateNotificationCount = (count: number) => {
    setUnreadNotificationCount(count);
  };

  const loadRememberedCredentials = async (): Promise<{email: string, password: string} | null> => {
    try {
      const credentials = await AsyncStorage.getItem('rememberedCredentials');
      if (credentials) {
        return JSON.parse(credentials);
      }
      return null;
    } catch (error) {
      console.error('Error loading remembered credentials:', error);
      return null;
    }
  };

  const clearRememberedCredentials = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem('rememberedCredentials');
    } catch (error) {
      console.error('Error clearing remembered credentials:', error);
    }
  };

  const clearSessionExpired = () => {
    setSessionExpired(false);
  };

  const validateToken = async (): Promise<boolean> => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        console.log('🔑 No token found');
        return false;
      }

      const response = await fetch(`${ENV.API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        console.log('✅ Token is valid');
        return true;
      } else {
        console.log('❌ Token is invalid, status:', response.status);
        return false;
      }
    } catch (error) {
      console.error('🔑 Token validation error:', error);
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    unreadNotificationCount,
    sessionExpired,
    profileUpdated,
    login,
    register,
    logout,
    forceLogout,
    clearToken,
    refreshToken,
    updateUser,
    updateNotificationCount,
    loadRememberedCredentials,
    clearRememberedCredentials,
    clearSessionExpired,
    setSessionExpired,
    validateToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
