'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShoppingBag, Trash2, Minus, Plus, ArrowRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useShallow } from 'zustand/react/shallow';
import { useAuthStore, useCurrencyStore } from '@/lib/store';
import { cartApi, garmentApi } from '@/lib/api';
import { formatPrice } from '@/lib/currency';
import type { CartItem, Garment } from '@/types';

export default function CartPage() {
  const router = useRouter();
  const user     = useAuthStore((s) => s.user);
  const currency = useCurrencyStore(useShallow((s) => ({ code: s.code, symbol: s.symbol, rate: s.rate })));

  const [cart, setCart]       = useState<CartItem[]>([]);
  const [garments, setGarments] = useState<Record<number, Garment>>({});
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<number | null>(null);
  const [error, setError]     = useState('');

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    cartApi.getMine()
      .then(async (r) => {
        const items: CartItem[] = r.data;
        setCart(items);
        // fetch garments for display
        const allRes = await garmentApi.getAll();
        const map: Record<number, Garment> = {};
        (allRes.data as Garment[]).forEach((g) => { map[g.id] = g; });
        setGarments(map);
      })
      .catch(() => setError('Failed to load cart.'))
      .finally(() => setLoading(false));
  }, [user, router]);

  const handleRemove = async (id: number) => {
    setRemoving(id);
    try {
      await cartApi.remove(id);
      setCart((c) => c.filter((item) => item.id !== id));
    } catch {
      setError('Failed to remove item.');
    } finally {
      setRemoving(null);
    }
  };

  const handleQty = async (item: CartItem, delta: number) => {
    const newQty = item.quantity + delta;
    if (newQty < 1) return handleRemove(item.id);
    try {
      await cartApi.updateQty(item.id, newQty);
      setCart((c) => c.map((i) => i.id === item.id ? { ...i, quantity: newQty } : i));
    } catch {
      setError('Failed to update quantity.');
    }
  };

  const total = cart.reduce((sum, item) => {
    const price = garments[item.garmentId]?.basePrice ?? 0;
    return sum + price * item.quantity;
  }, 0);

  return (
    <div className="min-h-screen pt-24 px-4 pb-16">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-white/40 hover:text-white text-sm mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <p className="text-gold text-xs tracking-[0.3em] uppercase mb-1">Your Order</p>
          <h1 className="text-3xl font-black flex items-center gap-3">
            <ShoppingBag className="w-7 h-7 text-gold" /> Cart
          </h1>
        </motion.div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-white/30 text-center py-20">Loading…</p>
        ) : cart.length === 0 ? (
          <div className="bg-surface border border-white/10 rounded-2xl p-16 text-center">
            <ShoppingBag className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/30 mb-6">Your cart is empty.</p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gold text-black font-bold rounded-xl hover:bg-gold/90 transition-colors"
            >
              Browse the Shop
            </Link>
          </div>
        ) : (
          <>
            <div className="bg-surface border border-white/10 rounded-2xl divide-y divide-white/5 mb-6">
              {cart.map((item) => {
                const g = garments[item.garmentId];
                const lineTotal = (g?.basePrice ?? 0) * item.quantity;
                return (
                  <div key={item.id} className="flex items-center gap-4 p-5">
                    <span className="text-3xl">👕</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">{g?.name ?? `Garment #${item.garmentId}`}</p>
                      <p className="text-white/40 text-xs mt-0.5">Size: <span className="text-white/60 font-medium">{item.size}</span></p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleQty(item, -1)}
                        className="w-7 h-7 rounded-lg border border-white/20 flex items-center justify-center hover:border-gold/40 transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                      <button
                        onClick={() => handleQty(item, 1)}
                        className="w-7 h-7 rounded-lg border border-white/20 flex items-center justify-center hover:border-gold/40 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="text-gold font-black text-sm w-20 text-right">
                      {formatPrice(lineTotal, currency)}
                    </span>
                    <button
                      onClick={() => handleRemove(item.id)}
                      disabled={removing === item.id}
                      className="text-white/25 hover:text-red-400 transition-colors ml-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}

              <div className="flex items-center justify-between p-5 bg-gold/5">
                <span className="font-bold">Total</span>
                <span className="text-gold font-black text-xl">
                  {formatPrice(total, currency)}
                </span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="flex items-center justify-center gap-2 w-full py-4 bg-gold text-black font-black rounded-2xl hover:bg-gold/90 transition-colors text-sm"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
