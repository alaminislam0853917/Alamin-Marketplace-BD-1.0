export interface StoreSettings {
  shopName?: string;
  deliveryCharge?: number;
  phone?: string;
  notice?: string;
  logo?: string;
}

export interface Banner {
  id: string;
  image: string;
  title?: string;
  createdAt?: number;
}

export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  stock: number;
  category: string; // categoryId or category name
  image: string;
  desc?: string;
  terms?: string;
  active?: boolean;
  createdAt?: number;
}

export interface UserProfile {
  name: string;
  phone: string;
  address: string;
  points: number;
}

export interface OrderItem {
  name: string;
  price: number;
  qty: number;
  image: string;
}

export interface Order {
  id: string;
  uid: string;
  name: string;
  phone: string;
  address: string;
  items: Record<string, OrderItem>;
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | string;
  createdAt: number;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  oldPrice?: number;
  image: string;
  qty: number;
  stock: number;
}

