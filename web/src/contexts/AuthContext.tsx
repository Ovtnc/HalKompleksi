import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/api';

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
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  switchRole: (role: 'buyer' | 'seller') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      setIsLoading(true);
      
      // Önce localStorage'dan kontrol et (rememberMe true ise)
      let token = localStorage.getItem('authToken');
      let userData = localStorage.getItem('userData');
      
      // Eğer localStorage'da yoksa sessionStorage'dan kontrol et
      if (!token || !userData) {
        token = sessionStorage.getItem('authToken');
        userData = sessionStorage.getItem('userData');
      }
      
      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        
        // Validate token
        try {
          await authAPI.getMe();
        } catch (error) {
          // Token invalid, clear storage
          localStorage.removeItem('authToken');
          localStorage.removeItem('userData');
          localStorage.removeItem('rememberMe');
          sessionStorage.removeItem('authToken');
          sessionStorage.removeItem('userData');
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Error loading stored user:', error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      localStorage.removeItem('rememberMe');
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('userData');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      setIsLoading(true);
      const response = await authAPI.login(email, password);
      
      if (response.token && response.user) {
        // rememberMe true ise localStorage, false ise sessionStorage kullan
        const storage = rememberMe ? localStorage : sessionStorage;
        
        storage.setItem('authToken', response.token);
        storage.setItem('userData', JSON.stringify(response.user));
        storage.setItem('rememberMe', String(rememberMe));
        
        // Eğer rememberMe false ise, localStorage'dan temizle (varsa)
        if (!rememberMe) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('userData');
        }
        
        setUser(response.user);
      }
    } catch (error) {
      console.error('Login error:', error);
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
        // Kayıt olurken varsayılan olarak rememberMe true (localStorage)
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('userData', JSON.stringify(response.user));
        localStorage.setItem('rememberMe', 'true');
        setUser(response.user);
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
      await authAPI.logout();
      // Hem localStorage hem de sessionStorage'dan temizle
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      localStorage.removeItem('rememberMe');
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('userData');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Hata olsa bile storage'ı temizle
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      localStorage.removeItem('rememberMe');
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('userData');
      setUser(null);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      // Hangi storage kullanılıyorsa oraya kaydet
      const rememberMe = localStorage.getItem('rememberMe') === 'true';
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('userData', JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  };

  const switchRole = async (role: 'buyer' | 'seller') => {
    if (!user) return;
    
    // Hangi storage kullanılıyorsa oraya kaydet
    const rememberMe = localStorage.getItem('rememberMe') === 'true' || sessionStorage.getItem('authToken') === null;
    const storage = rememberMe ? localStorage : sessionStorage;
    
    try {
      // Update role on backend
      const response = await authAPI.switchRole(role);
      
      // Update local state
      if (response.user) {
        storage.setItem('userData', JSON.stringify(response.user));
        setUser(response.user);
      } else {
        // Fallback: update locally if backend doesn't return user
        const updatedUser = { ...user, activeRole: role };
        storage.setItem('userData', JSON.stringify(updatedUser));
        setUser(updatedUser);
        console.warn('⚠️ Backend did not return user data, updated locally');
      }
    } catch (error: any) {
      console.error('Error switching role:', error);
      
      // Backend hatası olsa bile rolü local'de güncelle (kullanıcı deneyimi için)
      // Ancak sadece network hatası veya geçici hatalar için, auth hatası değilse
      const isAuthError = error?.message?.includes('Unauthorized') || 
                         error?.message?.includes('401') ||
                         error?.message?.includes('403');
      
      if (!isAuthError) {
        // Geçici hata (network, timeout vb.) - local'de güncelle ama hata fırlatma
        const updatedUser = { ...user, activeRole: role };
        storage.setItem('userData', JSON.stringify(updatedUser));
        setUser(updatedUser);
        console.warn('⚠️ Backend error but role updated locally:', error.message);
        // Hata fırlatma - rol zaten güncellendi
        return;
      } else {
        // Auth hatası - hata fırlat
        throw error;
      }
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    switchRole,
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

