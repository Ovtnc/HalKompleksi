export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  userType: 'buyer' | 'seller' | 'admin';
  userRoles?: ('buyer' | 'seller')[];
  activeRole?: 'buyer' | 'seller' | 'admin';
  profileImage?: string;
  isActive?: boolean;
  isApproved?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  _id?: string; // MongoDB ID
  title: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  images: Array<string | { url: string; isPrimary?: boolean; type?: string }>;
  seller: User;
  location: string | { city: string; district?: string; address?: string };
  isAvailable: boolean;
  isApproved: boolean;
  isFeatured?: boolean;
  isFavorite?: boolean;
  stock: number;
  unit: string;
  views: number;
  favorites?: string[];
  categoryData: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}


export interface NavigationProps {
  navigation: any;
  route: any;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  refreshToken: () => Promise<boolean>;
  updateUser: (userData: Partial<User>) => Promise<any>;
  updateProfileImage: (imageUri: string) => Promise<any>;
  switchRole: (role: 'buyer' | 'seller') => Promise<void>;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
  userType: 'buyer' | 'seller' | 'admin';
}
