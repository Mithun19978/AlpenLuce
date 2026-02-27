'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Users, Activity, Ticket, LayoutDashboard, Shield } from 'lucide-react';
import Link from 'next/link';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import Badge, { statusBadge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useAuthStore } from '@/lib/store';
import { userApi, logApi, ticketApi } from '@/lib/api';
import type { User, ActivityLog, SupportTicket } from '@/types';

const NAV_ITEMS = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/activity', label: 'Activity Logs', icon: Activity },
  { href: '/admin/tickets', label: 'Escalated Tickets', icon: Ticket },
];

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function AdminDashboard() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    if (!(user.role & 2)) { router.push('/dashboard'); return; }

    userApi.getAll().then((r) => setUsers(r.data)).catch(() => {});
    logApi.getAll().then((r) => setLogs(r.data)).catch(() => {});
    ticketApi.getEscalated().then((r) => setTickets(r.data)).catch(() => {});
  }, [user, router]);

  const stats = [
    { label: 'Total Users', value: users.length, color: 'text-gold' },
    { label: 'Activity Logs', value: logs.length, color: 'text-blue-400' },
    { label: 'Pending Tickets', value: tickets.filter((t) => t.status === 'ESCALATED').length, color: 'text-orange-400' },
    { label: 'Active Users', value: users.filter((u) => u.active === 'Y').length, color: 'text-green-400' },
  ];

  return (
    <div className="min-h-screen pt-20 px-4 pb-12">
      <div className="max-w-6xl mx-auto flex gap-6">
        <DashboardSidebar title="Admin Panel" items={NAV_ITEMS} />

        <div className="flex-1 min-w-0">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-8"
          >
            <Shield className="w-6 h-6 text-gold" />
            <div>
              <p className="text-gold text-xs tracking-[0.3em] uppercase">Admin</p>
              <h1 className="text-2xl font-black">Admin Dashboard</h1>
            </div>
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

          {/* Recent Users */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-surface border border-white/10 rounded-2xl p-6 mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold">Recent Users</h2>
              <Link href="/admin/users" className="text-gold text-sm hover:underline">
                View all
              </Link>
            </div>
            <div className="space-y-0">
              {users.slice(0, 5).map((u, i) => (
                <div
                  key={u.id}
                  className={`flex items-center justify-between py-3 ${
                    i < 4 ? 'border-b border-white/5' : ''
                  }`}
                >
                  <div>
                    <p className="text-sm font-medium">{u.username}</p>
                    <p className="text-white/40 text-xs">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-white/30 text-xs">role={u.role}</span>
                    <Badge
                      label={u.active === 'Y' ? 'Active' : 'Inactive'}
                      color={u.active === 'Y' ? 'green' : 'gray'}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Escalated Tickets */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-surface border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold">Escalated Tickets</h2>
              <Link href="/admin/tickets" className="text-gold text-sm hover:underline">
                View all
              </Link>
            </div>
            {tickets.length === 0 ? (
              <p className="text-white/30 text-sm py-6 text-center">No escalated tickets.</p>
            ) : (
              <div className="space-y-0">
                {tickets.slice(0, 5).map((t, i) => (
                  <div
                    key={t.id}
                    className={`flex items-center justify-between py-3 ${
                      i < tickets.slice(0, 5).length - 1 ? 'border-b border-white/5' : ''
                    }`}
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
