'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { ShoppingBag, Layers, Ticket, LogOut, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import Badge, { statusBadge } from '@/components/ui/Badge';
import { useAuthStore } from '@/lib/store';
import { customizationApi, cartApi, ticketApi } from '@/lib/api';
import type { Customization, CartItem, SupportTicket } from '@/types';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/customize', label: 'New Design', icon: Layers },
  { href: '/cart', label: 'Cart', icon: ShoppingBag },
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

export default function UserDashboard() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const [customizations, setCustomizations] = useState<Customization[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    customizationApi.getMine().then((r) => setCustomizations(r.data)).catch(() => {});
    cartApi.getMine().then((r) => setCart(r.data)).catch(() => {});
    ticketApi.getMine().then((r) => setTickets(r.data)).catch(() => {});
  }, [user, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  const stats = [
    { label: 'Designs', value: customizations.length, color: 'text-gold' },
    { label: 'In Cart', value: cart.length, color: 'text-green-400' },
    { label: 'Tickets', value: tickets.length, color: 'text-blue-400' },
    {
      label: 'Approved',
      value: customizations.filter((c) => c.status === 'APPROVED').length,
      color: 'text-gold',
    },
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
                Welcome, {user?.username ?? 'Designer'}
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

          {/* Recent Designs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-surface border border-white/10 rounded-2xl p-6 mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold">My Designs</h2>
              <Link href="/customize" className="text-gold text-sm hover:underline">
                + New Design
              </Link>
            </div>

            {customizations.length === 0 ? (
              <p className="text-white/30 text-sm py-8 text-center">
                No designs yet.{' '}
                <Link href="/customize" className="text-gold hover:underline">
                  Start designing
                </Link>
              </p>
            ) : (
              <div className="space-y-3">
                {customizations.slice(0, 5).map((c) => (
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
                    </div>
                  </div>
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
