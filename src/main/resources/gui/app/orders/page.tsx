'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { PackageCheck, ArrowRight, ChevronLeft, CheckCircle, MapPin, CreditCard, Package } from 'lucide-react';
import Link from 'next/link';
import { useShallow } from 'zustand/react/shallow';
import { useAuthStore, useCurrencyStore } from '@/lib/store';
import { orderApi, garmentApi } from '@/lib/api';
import { formatPrice } from '@/lib/currency';
import type { Order, OrderItem, Garment } from '@/types';

const STATUS_STYLES: Record<string, string> = {
  PLACED:     'bg-blue-500/20 text-blue-400 border-blue-500/20',
  PROCESSING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20',
  SHIPPED:    'bg-purple-500/20 text-purple-400 border-purple-500/20',
  DELIVERED:  'bg-green-500/20 text-green-400 border-green-500/20',
  CANCELLED:  'bg-red-500/20 text-red-400 border-red-500/20',
};

const STATUS_ORDER = ['PLACED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

// ── Order Detail View ──────────────────────────────────────
function OrderDetail({ orderId, justPlaced }: { orderId: number; justPlaced: boolean }) {
  const router   = useRouter();
  const user     = useAuthStore((s) => s.user);
  const currency = useCurrencyStore(useShallow((s) => ({ code: s.code, symbol: s.symbol, rate: s.rate })));

  const [order,    setOrder]    = useState<Order | null>(null);
  const [items,    setItems]    = useState<OrderItem[]>([]);
  const [garments, setGarments] = useState<Record<number, Garment>>({});
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    Promise.all([orderApi.getById(orderId), garmentApi.getAll()])
      .then(([orderRes, garmentRes]) => {
        const data = orderRes.data as { order: Order; items: OrderItem[] };
        setOrder(data.order);
        setItems(data.items);
        const map: Record<number, Garment> = {};
        (garmentRes.data as Garment[]).forEach((g) => { map[g.id] = g; });
        setGarments(map);
      })
      .catch(() => setError('Failed to load order.'))
      .finally(() => setLoading(false));
  }, [user, router, orderId]);

  if (loading) return <p className="text-white/30 text-center py-20">Loading…</p>;

  if (error || !order) {
    return (
      <div className="text-center py-20">
        <p className="text-red-400">{error || 'Order not found.'}</p>
      </div>
    );
  }

  const currentStep = STATUS_ORDER.indexOf(order.orderStatus);

  return (
    <div>
      {/* Back */}
      <button
        onClick={() => router.push('/orders')}
        className="inline-flex items-center gap-1 text-white/40 hover:text-white text-sm mb-6 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Orders
      </button>

      {/* Success banner */}
      {justPlaced && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center gap-3 px-5 py-4 bg-green-500/10 border border-green-500/30 rounded-2xl text-green-400"
        >
          <CheckCircle className="w-5 h-5 shrink-0" />
          <div>
            <p className="font-bold text-sm">Order placed successfully!</p>
            <p className="text-xs text-green-400/70 mt-0.5">We'll send updates as your order progresses.</p>
          </div>
        </motion.div>
      )}

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <p className="text-gold text-xs tracking-[0.3em] uppercase mb-1">Order Details</p>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-black">Order #{order.id}</h1>
          <span className={`text-sm font-medium px-3 py-1 rounded-full border ${STATUS_STYLES[order.orderStatus] ?? 'bg-white/10 text-white/50 border-white/10'}`}>
            {order.orderStatus}
          </span>
        </div>
        <p className="text-white/40 text-sm mt-1">
          Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </motion.div>

      {/* Status timeline */}
      {order.orderStatus !== 'CANCELLED' && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-surface border border-white/10 rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 right-0 top-4 h-0.5 bg-white/10 mx-8" />
            {STATUS_ORDER.map((step, idx) => (
              <div key={step} className="relative flex flex-col items-center gap-2 flex-1">
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center z-10 transition-all ${
                  idx <= currentStep
                    ? 'bg-gold border-gold text-black'
                    : 'bg-[#111] border-white/20 text-white/30'
                }`}>
                  <Package className="w-3.5 h-3.5" />
                </div>
                <span className={`text-xs font-medium ${idx <= currentStep ? 'text-gold' : 'text-white/30'}`}>
                  {step.charAt(0) + step.slice(1).toLowerCase()}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Items */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-surface border border-white/10 rounded-2xl p-6 mb-6"
      >
        <h2 className="font-bold mb-4">Items</h2>
        <div className="space-y-4">
          {items.map((item) => {
            const g = garments[item.garmentId];
            return (
              <div key={item.id} className="flex items-center gap-4">
                <span className="text-3xl">👕</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{g?.name ?? `Garment #${item.garmentId}`}</p>
                  <p className="text-white/40 text-xs mt-0.5">
                    Size: <span className="text-white/60">{item.size}</span>
                    {' · '}Qty: <span className="text-white/60">{item.quantity}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-gold font-bold text-sm">{formatPrice(item.unitPrice * item.quantity, currency)}</p>
                  <p className="text-white/30 text-xs">{formatPrice(item.unitPrice, currency)} each</p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="border-t border-white/10 mt-5 pt-4 flex items-center justify-between">
          <span className="font-bold">Total</span>
          <span className="text-gold font-black text-xl">{formatPrice(Number(order.totalAmount), currency)}</span>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Shipping */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-surface border border-white/10 rounded-2xl p-6"
        >
          <h2 className="font-bold mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gold" /> Shipping Address
          </h2>
          <div className="text-sm text-white/60 space-y-1">
            <p className="font-medium text-white">{order.shippingName}</p>
            <p>{order.shippingAddress}</p>
            <p>{order.shippingCity}{order.shippingPincode ? ` – ${order.shippingPincode}` : ''}</p>
            {order.shippingPhone && <p className="text-white/40">{order.shippingPhone}</p>}
          </div>
        </motion.div>

        {/* Payment */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-surface border border-white/10 rounded-2xl p-6"
        >
          <h2 className="font-bold mb-4 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-gold" /> Payment
          </h2>
          <div className="text-sm text-white/60 space-y-2">
            <div className="flex justify-between">
              <span>Method</span>
              <span className="text-white font-medium uppercase">{order.paymentMethod ?? '—'}</span>
            </div>
            <div className="flex justify-between">
              <span>Status</span>
              <span className={`font-medium ${order.paymentStatus === 'PAID' ? 'text-green-400' : 'text-yellow-400'}`}>
                {order.paymentStatus}
              </span>
            </div>
            {order.paymentRef && (
              <div className="flex justify-between">
                <span>Ref</span>
                <span className="text-white/40 font-mono text-xs">{order.paymentRef}</span>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ── Order List View ────────────────────────────────────────
function OrderList() {
  const router   = useRouter();
  const user     = useAuthStore((s) => s.user);
  const currency = useCurrencyStore(useShallow((s) => ({ code: s.code, symbol: s.symbol, rate: s.rate })));

  const [orders,  setOrders]  = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    orderApi.getMine()
      .then((r) => setOrders(r.data))
      .catch(() => setError('Failed to load orders.'))
      .finally(() => setLoading(false));
  }, [user, router]);

  if (loading) return <p className="text-white/30 text-center py-20">Loading…</p>;

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-white/40 hover:text-white text-sm mb-4 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <p className="text-gold text-xs tracking-[0.3em] uppercase mb-1">Your Purchases</p>
        <h1 className="text-3xl font-black flex items-center gap-3">
          <PackageCheck className="w-7 h-7 text-gold" /> My Orders
        </h1>
      </motion.div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="bg-surface border border-white/10 rounded-2xl p-16 text-center">
          <PackageCheck className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/30 mb-6">No orders yet.</p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gold text-black font-bold rounded-xl hover:bg-gold/90 transition-colors"
          >
            Browse the Shop
          </Link>
        </div>
      ) : (
        <div className="bg-surface border border-white/10 rounded-2xl divide-y divide-white/5">
          {orders.map((order) => (
            <button
              key={order.id}
              onClick={() => router.push(`/orders?id=${order.id}`)}
              className="w-full flex items-center gap-4 p-5 hover:bg-white/3 transition-colors group text-left"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-bold text-sm">Order #{order.id}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${STATUS_STYLES[order.orderStatus] ?? 'bg-white/10 text-white/50 border-white/10'}`}>
                    {order.orderStatus}
                  </span>
                </div>
                <p className="text-white/40 text-xs">
                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}
                  {order.shippingCity ? ` · ${order.shippingCity}` : ''}
                </p>
              </div>
              <span className="text-gold font-black text-base">
                {formatPrice(Number(order.totalAmount), currency)}
              </span>
              <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-colors" />
            </button>
          ))}
        </div>
      )}
    </>
  );
}

// ── Inner component that uses useSearchParams ──────────────
function OrdersPageInner() {
  const searchParams = useSearchParams();
  const idParam      = searchParams.get('id');
  const placed       = searchParams.get('placed') === '1';

  return (
    <div className="min-h-screen pt-24 px-4 pb-16">
      <div className="max-w-3xl mx-auto">
        {idParam
          ? <OrderDetail orderId={Number(idParam)} justPlaced={placed} />
          : <OrderList />
        }
      </div>
    </div>
  );
}

// ── Page Entry — Suspense required for useSearchParams ─────
export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-24 px-4 text-center text-white/30">Loading…</div>}>
      <OrdersPageInner />
    </Suspense>
  );
}
