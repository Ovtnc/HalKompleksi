export interface Product {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  price: number;
  currency?: string;
  category: string;
  images: string[] | Array<{ url: string; isPrimary?: boolean; type?: string }>;
  seller?: {
    _id?: string;
    id?: string;
    name: string;
    phone: string;
    location?: string;
    profileImage?: string;
  };
  location?: {
    city: string;
    district?: string;
    address?: string;
  } | string;
  isAvailable: boolean;
  isFeatured?: boolean;
  stock?: number;
  unit?: string;
  views?: number;
  favorites?: number;
  categoryData?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  _id?: string;
  id?: string;
  name: string;
  slug?: string;
  icon?: string;
  color?: string;
}

export interface MarketReport {
  _id: string;
  city: string;
  date: string;
  items: Array<{
    name: string;
    unit: string;
    minPrice: number;
    maxPrice: number;
    averagePrice: number;
  }>;
  image?: string;
  isActive: boolean;
  createdAt: string;
}

