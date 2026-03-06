'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { ShoppingBag, ShoppingCart, Ticket, LogOut, LayoutDashboard, PackageCheck } from 'lucide-react';
import Link from 'next/link';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import Badge, { statusBadge } from '@/components/ui/Badge';
import { useAuthStore } from '@/lib/store';
import { cartApi, ticketApi, orderApi } from '@/lib/api';
import type { CartItem, SupportTicket, Order } from '@/types';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/shop', label: 'Shop', icon: ShoppingCart },
  { href: '/cart', label: 'Cart', icon: ShoppingBag },
  { href: '/orders', label: 'My Orders', icon: PackageCheck },
  { href: '/tickets', label: 'My Tickets', icon: Ticket },
];

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const ORDER_STATUS_COLORS: Record<string, string> = {
  PLACED:     'bg-blue-500/20 text-blue-400',
  PROCESSING: 'bg-yellow-500/20 text-yellow-400',
  SHIPPED:    'bg-purple-500/20 text-purple-400',
  DELIVERED:  'bg-green-500/20 text-green-400',
  CANCELLED:  'bg-red-500/20 text-red-400',
};

export default function UserDashboard() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const [orders, setOrders]   = useState<Order[]>([]);
  const [cart, setCart]       = useState<CartItem[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    orderApi.getMine().then((r) => setOrders(r.data)).catch(() => {});
    cartApi.getMine().then((r) => setCart(r.data)).catch(() => {});
    ticketApi.getMine().then((r) => setTickets(r.data)).catch(() => {});
  }, [user, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  const delivered = orders.filter((o) => o.orderStatus === 'DELIVERED').length;

  const stats = [
    { label: 'Orders',    value: orders.length,  color: 'text-gold' },
    { label: 'In Cart',   value: cart.length,    color: 'text-green-400' },
    { label: 'Tickets',   value: tickets.length, color: 'text-blue-400' },
    { label: 'Delivered', value: delivered,       color: 'text-gold' },
  ];

  return (
    <div className="min-h-screen pt-20 px-4 pb-12">
      <div className="max-w-6xl mx-auto flex gap-6">
        <DashboardSidebar title="My Account" items={NAV_ITEMS} />

        <div className="flex-1 min-w-0">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <p className="text-gold text-xs tracking-[0.3em] uppercase mb-1">Dashboard</p>
              <h1 className="text-2xl font-black">
                Welcome, {user?.username ?? 'Shopper'}
              </h1>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-white/40 hover:text-white text-sm transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            {stats.map((s) => (
              <motion.div
                key={s.label}
                variants={fadeUp}
                className="bg-surface border border-white/10 rounded-2xl p-5 text-center"
              >
                <div className={`text-3xl font-black ${s.color}`}>{s.value}</div>
                <div className="text-white/40 text-xs mt-1">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-surface border border-white/10 rounded-2xl p-6 mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold">Recent Orders</h2>
              <Link href="/orders" className="text-gold text-sm hover:underline">
                View all
              </Link>
            </div>

            {orders.length === 0 ? (
              <p className="text-white/30 text-sm py-8 text-center">
                No orders yet.{' '}
                <Link href="/shop" className="text-gold hover:underline">
                  Browse the shop
                </Link>
              </p>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 5).map((o) => (
                  <Link
                    key={o.id}
                    href={`/orders?id=${o.id}`}
                    className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 hover:bg-white/3 rounded-lg px-2 -mx-2 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium">Order #{o.id}</p>
                      <p className="text-white/40 text-xs mt-0.5">
                        {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-gold font-bold text-sm">
                        ₹{o.totalAmount.toLocaleString('en-IN')}
                      </span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ORDER_STATUS_COLORS[o.orderStatus] ?? 'bg-white/10 text-white/50'}`}>
                        {o.orderStatus}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </motion.div>

          {/* Recent Tickets */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-surface border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold">My Tickets</h2>
              <Link href="/tickets" className="text-gold text-sm hover:underline">
                View all
              </Link>
            </div>

            {tickets.length === 0 ? (
              <p className="text-white/30 text-sm py-8 text-center">No tickets yet.</p>
            ) : (
              <div className="space-y-3">
                {tickets.slice(0, 3).map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between py-3 border-b border-white/5 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium line-clamp-1">{t.description}</p>
                      <p className="text-white/40 text-xs mt-0.5">
                        #{t.id} · {t.issueType}
                      </p>
                    </div>
                    <Badge {...statusBadge(t.status)} />
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
