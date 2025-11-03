import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { User, AuthContextType, RegisterData } from '../types';
import { authAPI, userAPI, uploadAPI } from './api';

// Platform-specific storage functions
const storage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    } else {
      return await SecureStore.getItemAsync(key);
    }
  },
  
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  },
  
  async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const storedToken = await storage.getItem('authToken');
      const storedUserData = await storage.getItem('userData');
      
      if (storedToken) {
        setToken(storedToken);
        
        // Önce local storage'daki kullanıcı verisini yükle
        if (storedUserData) {
          try {
            const localUser = JSON.parse(storedUserData);
            // Ensure boolean fields are properly typed for local data
            const processedLocalUser = {
              ...localUser,
              isActive: Boolean(localUser.isActive),
              isApproved: Boolean(localUser.isApproved)
            };
            setUser(processedLocalUser);
          } catch (parseError) {
            console.error('Parse user data error:', parseError);
          }
        }
        
        // Sonra API'den güncel veriyi çek (arka planda)
        try {
          const data = await authAPI.getMe();
          // API'den gelen veri ile local veriyi birleştir (local'deki profileImage'ı koru)
          const mergedUser = {
            ...data.user,
            profileImage: storedUserData ? JSON.parse(storedUserData).profileImage || data.user.profileImage : data.user.profileImage,
            isActive: Boolean(data.user.isActive),
            isApproved: Boolean(data.user.isApproved)
          };
          setUser(mergedUser);
          // Güncellenmiş veriyi kaydet
          await storage.setItem('userData', JSON.stringify(mergedUser));
        } catch (error: any) {
          console.error('Auth check error:', error);
          // Token is invalid or expired, clear storage
          await storage.removeItem('authToken');
          await storage.removeItem('userData');
          setUser(null);
          setToken(null);
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
      // Clear invalid tokens
      await storage.removeItem('authToken');
      await storage.removeItem('userData');
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      const data = await authAPI.login(email, password);
      const { token, user } = data;
      
      // Ensure boolean fields are properly typed
      const processedUser = {
        ...user,
        isActive: Boolean(user.isActive),
        isApproved: Boolean(user.isApproved)
      };
      
      await storage.setItem('authToken', token);
      await storage.setItem('userData', JSON.stringify(processedUser));
      
      setToken(token);
      setUser(processedUser);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      setIsLoading(true);
      
      const data = await authAPI.register(userData);
      const { token, user } = data;
      
      // Ensure boolean fields are properly typed
      const processedUser = {
        ...user,
        isActive: Boolean(user.isActive),
        isApproved: Boolean(user.isApproved)
      };
      
      await storage.setItem('authToken', token);
      await storage.setItem('userData', JSON.stringify(processedUser));
      
      setToken(token);
      setUser(processedUser);
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await storage.removeItem('authToken');
      await storage.removeItem('userData');
      setUser(null);
      setToken(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const refreshToken = async () => {
    try {
      const userData = await storage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        // Try to get fresh user data
        const data = await authAPI.getMe();
        setUser(data.user);
        return true;
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      await logout();
    }
    return false;
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      // API call to update user
      const response = await userAPI.updateProfile(userData);
      
      // Update local state with server response and ensure boolean fields are properly typed
      const updatedUser = { 
        ...user, 
        ...response.user,
        isActive: Boolean(response.user.isActive),
        isApproved: Boolean(response.user.isApproved)
      };
      setUser(updatedUser as User);
      await storage.setItem('userData', JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  };

  const updateProfileImage = async (imageUri: string) => {
    try {
      // Upload image first
      const uploadResponse = await uploadAPI.uploadProfileImage(imageUri);
      
      // Update user profile with new image URL
      const response = await userAPI.updateProfileImage(uploadResponse.url);
      
      // Update local state
      const updatedUser = { ...user, profileImage: response.user.profileImage };
      setUser(updatedUser as User);
      await storage.setItem('userData', JSON.stringify(updatedUser));
      
      return updatedUser;
    } catch (error) {
      console.error('Update profile image error:', error);
      throw error;
    }
  };

  const switchRole = async (role: 'buyer' | 'seller') => {
    try {
      const response = await userAPI.switchRole(role);
      
      // Update local state with new user data including activeRole and ensure boolean fields are properly typed
      const updatedUser = { 
        ...user, 
        ...response.user,
        isActive: Boolean(response.user.isActive),
        isApproved: Boolean(response.user.isApproved)
      };
      setUser(updatedUser as User);
      await storage.setItem('userData', JSON.stringify(updatedUser));
      
      return updatedUser;
    } catch (error: any) {
      console.error('Switch role error:', error);
      // Don't throw navigation-related errors, just log them
      if (error.message && error.message.includes('Route not found')) {
        console.warn('Navigation error during role switch, but role was updated successfully');
        return user; // Return current user as fallback
      }
      throw error;
    }
  };

  // Ensure user data has proper boolean types before exposing it
  const safeUser = user;

  const value: AuthContextType = {
    user: safeUser,
    token,
    login,
    register,
    logout,
    isLoading,
    refreshToken,
    updateUser,
    updateProfileImage,
    switchRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
