'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Users, Shirt, ShoppingBag, Ticket, Tag, Activity,
  Megaphone, Package, LayoutDashboard, ChevronRight, User,
  TrendingUp, IndianRupee, AlertTriangle, BarChart3,
} from 'lucide-react';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import { useAuthStore } from '@/lib/store';
import { userApi, garmentAdminApi, ticketApi, analyticsApi } from '@/lib/api';

const NAV_ITEMS = [
  { href: '/admin/dashboard',  label: 'Dashboard',         icon: LayoutDashboard },
  { href: '/admin/inventory',  label: 'Inventory',         icon: Package },
  { href: '/admin/users',      label: 'Users',             icon: Users },
  { href: '/admin/homepage',   label: 'Advertising',       icon: Megaphone },
  { href: '/admin/categories', label: 'Categories',        icon: Tag },
  { href: '/admin/activity',   label: 'Activity Logs',     icon: Activity },
  { href: '/admin/tickets',    label: 'Escalated Tickets', icon: Ticket },
  { href: '/admin/financial',  label: 'Financial',         icon: BarChart3 },
];

const QUICK_NAV = [
  { href: '/admin/inventory',  label: 'Manage Inventory',       icon: Shirt,     desc: 'Add, edit, or deactivate products' },
  { href: '/admin/users',      label: 'Manage Users',           icon: Users,     desc: 'View and manage all user accounts' },
  { href: '/admin/categories', label: 'Categories',             icon: Tag,       desc: 'Organise product category tree' },
  { href: '/admin/tickets',    label: 'Escalated Tickets',      icon: Ticket,    desc: 'Review tickets escalated for decision' },
  { href: '/admin/activity',   label: 'Activity Logs',          icon: Activity,  desc: 'Audit trail for all system events' },
  { href: '/admin/homepage',   label: 'Homepage Advertising',   icon: Megaphone, desc: 'Control featured product placements' },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [stats, setStats] = useState({
    users: 0, garments: 0, openTickets: 0, lowStock: 0,
    totalRevenue: 0, totalProfit: 0, totalOrders: 0, totalUnitsSold: 0,
  });
  const [topSelling, setTopSelling] = useState<{ name: string; color: string | null; unitsSold: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.replace('/auth/login'); return; }
    if (!(user.role & 2)) { router.replace('/access-denied'); return; }

    Promise.allSettled([
      userApi.getAll(),
      garmentAdminApi.getAll(),
      ticketApi.getEscalated(),
      analyticsApi.getSummary(),
    ]).then(([users, garments, tickets, analytics]) => {
      const a = analytics.status === 'fulfilled' ? analytics.value.data : null;
      setStats({
        users:        users.status    === 'fulfilled' ? (users.value.data?.length    ?? 0) : 0,
        garments:     garments.status === 'fulfilled' ? (garments.value.data?.length ?? 0) : 0,
        openTickets:  tickets.status  === 'fulfilled' ? (tickets.value.data?.length  ?? 0) : 0,
        lowStock:     a?.lowStockCount  ?? 0,
        totalRevenue: a?.totalRevenue   ?? 0,
        totalProfit:  a?.totalProfit    ?? 0,
        totalOrders:  a?.totalOrders    ?? 0,
        totalUnitsSold: a?.totalUnitsSold ?? 0,
      });
      if (a?.topSelling) setTopSelling(a.topSelling);
    }).finally(() => setLoading(false));
  }, [user, router]);

  const fmt = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

  const STAT_CARDS = [
    { label: 'Total Revenue',     value: loading ? '—' : fmt(stats.totalRevenue),  icon: IndianRupee,  color: 'text-green-400',  bg: 'bg-green-400/10'  },
    { label: 'Total Profit',      value: loading ? '—' : fmt(stats.totalProfit),   icon: TrendingUp,   color: 'text-gold',        bg: 'bg-gold/10'       },
    { label: 'Orders Placed',     value: loading ? '—' : stats.totalOrders,        icon: ShoppingBag,  color: 'text-blue-400',   bg: 'bg-blue-400/10'   },
    { label: 'Units Sold',        value: loading ? '—' : stats.totalUnitsSold,     icon: Package,      color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { label: 'Total Users',       value: loading ? '—' : stats.users,              icon: Users,        color: 'text-cyan-400',   bg: 'bg-cyan-400/10'   },
    { label: 'Active Garments',   value: loading ? '—' : stats.garments,           icon: Shirt,        color: 'text-white/70',   bg: 'bg-white/5'       },
    { label: 'Escalated Tickets', value: loading ? '—' : stats.openTickets,        icon: Ticket,       color: 'text-orange-400', bg: 'bg-orange-400/10' },
    { label: 'Low / Out Stock',   value: loading ? '—' : stats.lowStock,           icon: AlertTriangle,color: 'text-red-400',    bg: 'bg-red-400/10'    },
  ];

  return (
    <div className="min-h-screen pt-20 px-4 pb-12">
      <div className="max-w-6xl mx-auto flex gap-6">
        <DashboardSidebar title="Admin Panel" items={NAV_ITEMS} />

        <div className="flex-1 min-w-0">
          {/* ── Header ───────────────────────────────────────── */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            {/* Logged-in-as strip */}
            <div className="flex items-center gap-2 mb-4 px-4 py-2.5 bg-gold/5 border border-gold/20 rounded-xl w-fit">
              <User className="w-3.5 h-3.5 text-gold" />
              <span className="text-xs text-white/50">Logged in as</span>
              <span className="text-sm font-bold text-gold">{user?.username}</span>
              <span className="text-[10px] text-gold/50 uppercase tracking-widest border-l border-gold/20 pl-2">Admin</span>
            </div>

            <p className="text-gold text-xs tracking-[0.3em] uppercase mb-1">Control Centre</p>
            <h1 className="text-2xl font-black flex items-center gap-3">
              <LayoutDashboard className="w-6 h-6 text-gold" /> Admin Dashboard
            </h1>
            <p className="text-white/40 text-sm mt-2">
              Overview of your platform — users, inventory, orders and support.
            </p>
          </motion.div>

          {/* ── Stat Cards ───────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            {STAT_CARDS.map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="bg-surface border border-white/10 rounded-2xl p-5 text-center">
                <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div className={`text-2xl font-black ${color} truncate`}>{value}</div>
                <div className="text-white/40 text-xs mt-1">{label}</div>
              </div>
            ))}
          </motion.div>

          {/* ── Top Selling ──────────────────────────────────── */}
          {topSelling.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="mb-8"
            >
              <h2 className="text-xs text-gold tracking-[0.25em] uppercase font-medium mb-3">Top Selling</h2>
              <div className="bg-surface border border-white/10 rounded-2xl overflow-hidden">
                {topSelling.map((item, i) => (
                  <div key={i} className="flex items-center justify-between px-5 py-3 border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="text-white/20 text-xs w-4 text-right">{i + 1}</span>
                      <div>
                        <p className="text-sm font-medium">{item.name}</p>
                        {item.color && <p className="text-xs text-white/30">{item.color}</p>}
                      </div>
                    </div>
                    <span className="text-gold font-bold text-sm">{item.unitsSold} sold</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── Quick Navigation ─────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <h2 className="text-xs text-gold tracking-[0.25em] uppercase font-medium mb-4">
              Quick Access
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {QUICK_NAV.map(({ href, label, icon: Icon, desc }, idx) => (
                <motion.div
                  key={href}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.18 + idx * 0.05 }}
                >
                  <Link
                    href={href}
                    className="group flex items-center gap-4 bg-surface border border-white/10 hover:border-gold/30 rounded-2xl p-5 transition-all hover:bg-white/[0.02]"
                  >
                    <div className="w-10 h-10 bg-gold/10 group-hover:bg-gold/20 rounded-xl flex items-center justify-center shrink-0 transition-colors">
                      <Icon className="w-5 h-5 text-gold" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm group-hover:text-gold transition-colors">{label}</p>
                      <p className="text-white/40 text-xs mt-0.5 line-clamp-1">{desc}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-gold/50 shrink-0 transition-colors" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
