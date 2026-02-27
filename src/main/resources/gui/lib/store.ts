import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from './api';
import type { AuthTokens, DesignLayer, CartItem } from '@/types';

// ── Auth Store ───────────────────────────────────────────────
interface AuthState {
  tokens: AuthTokens | null;
  user: { username: string; role: number } | null;
  login: (tokens: AuthTokens, user: { username: string; role: number }) => void;
  logout: () => Promise<void>;
  setTokens: (tokens: AuthTokens) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      tokens: null,
      user: null,
      login: (tokens, user) => set({ tokens, user }),
      logout: async () => {
        const rt = get().tokens?.refreshToken;
        try {
          if (rt) await authApi.logout(rt);
        } catch {
          // ignore
        }
        set({ tokens: null, user: null });
      },
      setTokens: (tokens) => set({ tokens }),
    }),
    {
      name: 'alpenluce-auth',
      partialize: (state) => ({ tokens: state.tokens, user: state.user }),
    }
  )
);

// ── Cart Store ───────────────────────────────────────────────
interface CartState {
  items: CartItem[];
  setItems: (items: CartItem[]) => void;
  addItem: (item: CartItem) => void;
  removeItem: (id: number) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()((set) => ({
  items: [],
  setItems: (items) => set({ items }),
  addItem: (item) => set((s) => ({ items: [...s.items, item] })),
  removeItem: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
  clear: () => set({ items: [] }),
}));

// ── Customizer Store ─────────────────────────────────────────
const DEFAULT_LAYERS: DesignLayer[] = [
  { area: 'FRONT', colorHex: '#1a1a1a', designText: '', scale: 1, rotation: 0, positionX: 50, positionY: 50 },
  { area: 'BACK', colorHex: '#1a1a1a', designText: '', scale: 1, rotation: 0, positionX: 50, positionY: 50 },
  { area: 'LEFT_SLEEVE', colorHex: '#1a1a1a', designText: '', scale: 1, rotation: 0, positionX: 50, positionY: 50 },
  { area: 'RIGHT_SLEEVE', colorHex: '#1a1a1a', designText: '', scale: 1, rotation: 0, positionX: 50, positionY: 50 },
];

interface CustomizerState {
  garmentId: number | null;
  selectedArea: string | null;
  layers: DesignLayer[];
  setGarmentId: (id: number | null) => void;
  setSelectedArea: (area: string | null) => void;
  updateLayer: (area: string, updates: Partial<DesignLayer>) => void;
  resetLayers: () => void;
}

export const useCustomizerStore = create<CustomizerState>()((set) => ({
  garmentId: null,
  selectedArea: 'FRONT',
  layers: DEFAULT_LAYERS,
  setGarmentId: (id) => set({ garmentId: id }),
  setSelectedArea: (area) => set({ selectedArea: area }),
  updateLayer: (area, updates) =>
    set((s) => ({
      layers: s.layers.map((l) => (l.area === area ? { ...l, ...updates } : l)),
    })),
  resetLayers: () => set({ layers: DEFAULT_LAYERS, garmentId: null, selectedArea: 'FRONT' }),
}));
