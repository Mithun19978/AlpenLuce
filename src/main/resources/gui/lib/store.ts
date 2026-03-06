import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from './api';
import type { AuthTokens, CartItem } from '@/types';

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

// ── Currency Store ───────────────────────────────────────────
interface CurrencyState {
  code:        string;
  symbol:      string;
  rate:        number;
  detected:    boolean;
  setCurrency: (c: { code: string; symbol: string; rate: number }) => void;
}

export const useCurrencyStore = create<CurrencyState>()((set) => ({
  code:        'EUR',
  symbol:      '€',
  rate:        0.011,
  detected:    false,
  setCurrency: ({ code, symbol, rate }) => set({ code, symbol, rate, detected: true }),
}));

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

