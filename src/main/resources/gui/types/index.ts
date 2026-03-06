export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  mobileNumber: string;
  role: number;
  active: string;
  creationTime: string;
}

export interface Garment {
  id: number;
  name: string;
  description: string;
  garmentType: string;
  type?: string;
  basePrice: number;
  available?: boolean;
  categoryId?: number | null;
  baseColor?: string;
  gsm?: number | null;
  fabricDescription?: string;
  sizes?: string;
  imageUrl?: string;
  stockQuantity?: number;
  costPrice?: number;
  active?: boolean;
  featured?: boolean;
}

export interface Category {
  id: number;
  name: string;
  active: boolean;
  depth: number;
  parentId?: number | null;
  displayOrder?: number;
}

export interface CartItem {
  id: number;
  userId: number;
  garmentId: number;
  size: string;
  quantity: number;
  addedAt: string;
}

export interface OrderItem {
  id: number;
  orderId: number;
  garmentId: number;
  size: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: number;
  userId: number;
  totalAmount: number;
  paymentStatus: string;
  paymentMethod?: string;
  paymentRef?: string;
  shippingName?: string;
  shippingAddress?: string;
  shippingCity?: string;
  shippingPincode?: string;
  shippingPhone?: string;
  orderStatus: string;
  createdAt: string;
}

export interface SupportTicket {
  id: number;
  userId: number;
  orderId: number;
  issueType: string;
  description: string;
  status: string;
  resolution?: string;
  createdAt: string;
}

export interface ActivityLog {
  id: number;
  userId: number;
  roleMask: number;
  eventType: string;
  metadata?: string;
  ipAddress?: string;
  createdAt: string;
}

// Zustand store interfaces
export interface AuthStore {
  tokens: AuthTokens | null;
  user: { username: string; role: number } | null;
  login: (tokens: AuthTokens, user: { username: string; role: number }) => void;
  logout: () => Promise<void>;
  setTokens: (tokens: AuthTokens) => void;
}

export interface CartStore {
  items: CartItem[];
  setItems: (items: CartItem[]) => void;
  addItem: (item: CartItem) => void;
  removeItem: (id: number) => void;
  clear: () => void;
}
