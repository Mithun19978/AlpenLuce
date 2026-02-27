'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShoppingBag, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Badge, { statusBadge } from '@/components/ui/Badge';
import { useAuthStore } from '@/lib/store';
import { cartApi, customizationApi } from '@/lib/api';
import type { CartItem, Customization } from '@/types';

export default function CartPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [approved, setApproved] = useState<Customization[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<number | null>(null);
  const [adding, setAdding] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    Promise.all([
      cartApi.getMine().then((r) => setCart(r.data)),
      customizationApi.getMine().then((r) =>
        setApproved(r.data.filter((c: Customization) => c.status === 'APPROVED'))
      ),
    ])
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

  const handleAdd = async (customizationId: number) => {
    setAdding(customizationId);
    try {
      const res = await cartApi.add(customizationId);
      setCart((c) => [...c, res.data]);
    } catch {
      setError('Failed to add to cart.');
    } finally {
      setAdding(null);
    }
  };

  const total = cart.reduce((sum, item) => sum + (item.price ?? 0), 0);
  const inCartIds = new Set(cart.map((c) => c.customizationId));

  return (
    <div className="min-h-screen pt-20 px-4 pb-12">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-white/40 hover:text-white text-sm mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to dashboard
          </Link>
          <p className="text-gold text-xs tracking-[0.3em] uppercase mb-1">Checkout</p>
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
          <p className="text-white/30 text-center py-16">Loading…</p>
        ) : (
          <>
            {/* Cart Items */}
            {cart.length === 0 ? (
              <div className="bg-surface border border-white/10 rounded-2xl p-12 text-center mb-8">
                <ShoppingBag className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <p className="text-white/30 mb-4">Your cart is empty.</p>
                <Link href="/customize">
                  <Button variant="gold">Start Designing</Button>
                </Link>
              </div>
            ) : (
              <div className="bg-surface border border-white/10 rounded-2xl divide-y divide-white/5 mb-6">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-5">
                    <div>
                      <p className="font-medium text-sm">Design #{item.customizationId}</p>
                      <p className="text-white/40 text-xs mt-0.5">
                        Added {new Date(item.addedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-gold font-bold">
                        ${((item.price ?? 0) / 100).toFixed(2)}
                      </span>
                      <button
                        onClick={() => handleRemove(item.id)}
                        disabled={removing === item.id}
                        className="text-white/30 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Total */}
                <div className="flex items-center justify-between p-5 bg-gold/5">
                  <span className="font-bold">Total</span>
                  <span className="text-gold font-black text-xl">
                    ${(total / 100).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {cart.length > 0 && (
              <Button variant="gold" className="w-full mb-8">
                Proceed to Checkout
              </Button>
            )}

            {/* Add Approved Designs */}
            {approved.length > 0 && (
              <div className="bg-surface border border-white/10 rounded-2xl p-6">
                <h2 className="font-bold mb-1">Approved Designs</h2>
                <p className="text-white/40 text-xs mb-4">
                  These designs have been reviewed and priced — ready to add to cart.
                </p>
                <div className="space-y-3">
                  {approved.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between py-3 border-b border-white/5 last:border-0"
                    >
                      <div>
                        <p className="text-sm font-medium">Design #{c.id}</p>
                        <p className="text-white/40 text-xs mt-0.5">{c.notes || 'No notes'}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        {c.approvedPrice && (
                          <span className="text-gold font-bold text-sm">
                            ${(c.approvedPrice / 100).toFixed(2)}
                          </span>
                        )}
                        <Badge {...statusBadge(c.status)} />
                        {!inCartIds.has(c.id) && (
                          <Button
                            variant="outline"
                            size="sm"
                            loading={adding === c.id}
                            onClick={() => handleAdd(c.id)}
                          >
                            Add to Cart
                          </Button>
                        )}
                        {inCartIds.has(c.id) && (
                          <span className="text-xs text-white/30">In cart</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
