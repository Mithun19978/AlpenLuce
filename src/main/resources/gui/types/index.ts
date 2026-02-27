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
  basePrice: number;
  available?: boolean;
  category?: string;
  baseColor?: string;
  gsm?: number | null;
  fabricDescription?: string;
  active?: boolean;
  featured?: boolean;
}

export interface Category {
  id: number;
  name: string;
  active: boolean;
  depth: number;
  parentId?: number | null;
}

export interface DesignLayer {
  area: string;
  designText?: string;
  colorHex: string;
  fontFamily?: string;
  fontSize?: number;
  positionX?: number;
  positionY?: number;
  scale?: number;
  rotation?: number;
}

export interface Customization {
  id: number;
  garmentId: number;
  userId: number;
  status: string;
  notes?: string;
  approvedPrice?: number;
  technicalNotes?: string;
  layers: DesignLayer[];
  createdAt: string;
}

export interface CartItem {
  id: number;
  customizationId: number;
  price?: number;
  addedAt: string;
}

export interface OrderItem {
  id: number;
  customizationId: number;
  price: number;
}

export interface Order {
  id: number;
  userId: number;
  status: string;
  totalPrice: number;
  items: OrderItem[];
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
  username: string;
  action: string;
  details?: string;
  timestamp: string;
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

export interface CustomizerStore {
  garmentId: number | null;
  selectedArea: string | null;
  layers: DesignLayer[];
  setGarmentId: (id: number | null) => void;
  setSelectedArea: (area: string | null) => void;
  updateLayer: (area: string, updates: Partial<DesignLayer>) => void;
  resetLayers: () => void;
}
