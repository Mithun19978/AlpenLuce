'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Activity, Users, Ticket, LayoutDashboard } from 'lucide-react';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import { useAuthStore } from '@/lib/store';
import { logApi } from '@/lib/api';
import type { ActivityLog } from '@/types';

const NAV_ITEMS = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/activity', label: 'Activity Logs', icon: Activity },
  { href: '/admin/tickets', label: 'Escalated Tickets', icon: Ticket },
];

const ACTION_COLORS: Record<string, string> = {
  LOGIN: 'text-green-400',
  LOGOUT: 'text-white/40',
  REGISTER: 'text-blue-400',
  DESIGN_SUBMIT: 'text-gold',
  DESIGN_APPROVE: 'text-green-400',
  DESIGN_REJECT: 'text-red-400',
  TICKET_CREATE: 'text-orange-400',
  TICKET_ESCALATE: 'text-orange-400',
  TICKET_RESOLVE: 'text-green-400',
  CART_ADD: 'text-gold',
  ORDER_PLACE: 'text-gold',
};

export default function ActivityLogsPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    if (!(user.role & 2)) { router.push('/dashboard'); return; }
    logApi.getAll()
      .then((r) => setLogs(r.data))
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
                    <div key={log.id} className="flex items-start justify-between px-5 py-4 hover:bg-white/2 transition-colors">
                      <div className="flex items-start gap-4">
                        <span
                          className={`text-xs font-mono font-bold mt-0.5 ${
                            ACTION_COLORS[log.action] ?? 'text-white/60'
                          }`}
                        >
                          {log.action}
                        </span>
                        <div>
                          <p className="text-sm">
                            <span className="font-medium">{log.username}</span>
                            {log.details && (
                              <span className="text-white/40 ml-2 text-xs">{log.details}</span>
                            )}
                          </p>
                          <p className="text-white/30 text-xs mt-0.5">User #{log.userId}</p>
                        </div>
                      </div>
                      <time className="text-white/30 text-xs whitespace-nowrap ml-4">
                        {new Date(log.timestamp).toLocaleString()}
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
