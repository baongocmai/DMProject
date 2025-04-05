export interface User {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  isVerified: boolean;
  token?: string;
  phoneNumber?: string;
}

export interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  stock: number;
  image: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
}

export interface OrderItem {
  product: string;
  name: string;
  image: string;
  price: number;
  qty: number;
}

export interface ShippingAddress {
  address: string;
  city: string;
  postalCode: string;
  country: string;
  district?: string;
  province?: string;
  phoneNumber?: string;
  fullName?: string;
}

export interface GuestInfo {
  name: string;
  email: string;
  phone: string;
}

export interface Order {
  _id: string;
  orderItems: OrderItem[];
  user?: string | User;
  guestInfo?: GuestInfo;
  shippingAddress: ShippingAddress;
  paymentMethod?: string;
  totalPrice: number;
  isDelivered: boolean;
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;
}

export interface OtpVerification {
  userId: string;
  otp: string;
}

export interface PasswordReset {
  email: string;
  otp: string;
  newPassword: string;
}

export interface RecommendationItem {
  items: string[];
  support?: number;
} 