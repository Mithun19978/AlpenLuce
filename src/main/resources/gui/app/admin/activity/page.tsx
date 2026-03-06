'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Activity, Users, Ticket, Package, Megaphone, Tag, LayoutDashboard, BarChart3 } from 'lucide-react';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import { useAuthStore } from '@/lib/store';
import { logApi } from '@/lib/api';
import type { ActivityLog } from '@/types';

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

const EVENT_COLORS: Record<string, string> = {
  login:            'text-green-400',
  logout:           'text-white/40',
  user_register:    'text-blue-400',
  cart_add:         'text-gold',
  purchase:         'text-gold',
  garment_add:      'text-purple-400',
  ticket_open:      'text-orange-400',
  ticket_reply:     'text-orange-300',
  ticket_escalate:  'text-orange-400',
  user_role_change: 'text-red-400',
  return_decision:  'text-green-400',
};

export default function ActivityLogsPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    if (!(user.role & 2)) { router.push('/access-denied'); return; }
    logApi.getAll()
      .then((r) => {
        // backend returns Page<ActivityLogEntity>; extract .content array
        const data = r.data;
        setLogs(Array.isArray(data) ? data : (data?.content ?? []));
      })
      .catch(() => setError('Failed to load logs.'))
      .finally(() => setLoading(false));
  }, [user, router]);

  return (
    <div className="min-h-screen pt-20 px-4 pb-12">
      <div className="max-w-6xl mx-auto flex gap-6">
        <DashboardSidebar title="Admin Panel" items={NAV_ITEMS} />

        <div className="flex-1 min-w-0">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <p className="text-gold text-xs tracking-[0.3em] uppercase mb-1">Admin</p>
            <h1 className="text-2xl font-black flex items-center gap-3">
              <Activity className="w-6 h-6 text-gold" /> Activity Logs
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
            <div className="bg-surface border border-white/10 rounded-2xl overflow-hidden">
              <div className="divide-y divide-white/5 max-h-[680px] overflow-y-auto">
                {logs.length === 0 ? (
                  <p className="text-white/30 text-center py-12 text-sm">No activity logs yet.</p>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="flex items-start justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-start gap-4">
                        <span
                          className={`text-xs font-mono font-bold mt-0.5 min-w-[110px] ${
                            EVENT_COLORS[log.eventType] ?? 'text-white/60'
                          }`}
                        >
                          {log.eventType}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-white/80">User #{log.userId}</p>
                          {log.metadata && (
                            <p className="text-white/40 text-xs mt-0.5 font-mono">{log.metadata}</p>
                          )}
                          {log.ipAddress && (
                            <p className="text-white/20 text-xs mt-0.5">{log.ipAddress}</p>
                          )}
                        </div>
                      </div>
                      <time className="text-white/30 text-xs whitespace-nowrap ml-4 mt-0.5">
                        {new Date(log.createdAt).toLocaleString()}
                      </time>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
