'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Ticket, Users, Activity, LayoutDashboard, CheckCircle, XCircle } from 'lucide-react';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import Badge, { statusBadge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useAuthStore } from '@/lib/store';
import { ticketApi } from '@/lib/api';
import type { SupportTicket } from '@/types';

const NAV_ITEMS = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/activity', label: 'Activity Logs', icon: Activity },
  { href: '/admin/tickets', label: 'Escalated Tickets', icon: Ticket },
];

export default function AdminTicketsPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [deciding, setDeciding] = useState<number | null>(null);
  const [resolutions, setResolutions] = useState<Record<number, string>>({});
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    if (!(user.role & 2)) { router.push('/dashboard'); return; }
    ticketApi.getEscalated()
      .then((r) => setTickets(r.data))
      .catch(() => setError('Failed to load tickets.'))
      .finally(() => setLoading(false));
  }, [user, router]);

  const handleDecide = async (id: number, decision: 'APPROVE' | 'REJECT') => {
    const resolution = resolutions[id] || '';
    setDeciding(id);
    try {
      const res = await ticketApi.decide(id, decision, resolution);
      setTickets((t) => t.map((tk) => tk.id === id ? res.data : tk));
    } catch {
      setError('Failed to process decision.');
    } finally {
      setDeciding(null);
    }
  };

  const pending = tickets.filter((t) => t.status === 'ESCALATED');
  const resolved = tickets.filter((t) => t.status !== 'ESCALATED');

  return (
    <div className="min-h-screen pt-20 px-4 pb-12">
      <div className="max-w-6xl mx-auto flex gap-6">
        <DashboardSidebar title="Admin Panel" items={NAV_ITEMS} />

        <div className="flex-1 min-w-0">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <p className="text-gold text-xs tracking-[0.3em] uppercase mb-1">Admin</p>
            <h1 className="text-2xl font-black flex items-center gap-3">
              <Ticket className="w-6 h-6 text-gold" /> Escalated Tickets
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
              {/* Pending */}
              <div className="bg-surface border border-white/10 rounded-2xl p-6 mb-6">
                <h2 className="font-bold mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-400 inline-block" />
                  Awaiting Decision ({pending.length})
                </h2>
                {pending.length === 0 ? (
                  <p className="text-white/30 text-sm py-6 text-center">All clear — no pending tickets.</p>
                ) : (
                  <div className="space-y-4">
                    {pending.map((t) => (
                      <div key={t.id} className="border border-white/10 rounded-xl p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-medium text-sm">#{t.id} — Order #{t.orderId}</p>
                            <p className="text-white/40 text-xs mt-0.5">{t.issueType.replace('_', ' ')}</p>
                          </div>
                          <Badge {...statusBadge(t.status)} />
                        </div>
                        <p className="text-white/60 text-sm mb-4">{t.description}</p>

                        <div className="flex gap-3 flex-wrap items-center">
                          <input
                            type="text"
                            placeholder="Resolution note…"
                            value={resolutions[t.id] ?? ''}
                            onChange={(e) =>
                              setResolutions((r) => ({ ...r, [t.id]: e.target.value }))
                            }
                            className="flex-1 min-w-0 bg-black border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold transition-colors"
                          />
                          <Button
                            variant="gold"
                            size="sm"
                            loading={deciding === t.id}
                            onClick={() => handleDecide(t.id, 'APPROVE')}
                          >
                            <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Approve
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            loading={deciding === t.id}
                            onClick={() => handleDecide(t.id, 'REJECT')}
                          >
                            <XCircle className="w-3.5 h-3.5 mr-1.5" /> Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Resolved */}
              {resolved.length > 0 && (
                <div className="bg-surface border border-white/10 rounded-2xl p-6">
                  <h2 className="font-bold mb-4">Resolved ({resolved.length})</h2>
                  <div className="space-y-0">
                    {resolved.map((t, i) => (
                      <div
                        key={t.id}
                        className={`flex items-center justify-between py-3 ${
                          i < resolved.length - 1 ? 'border-b border-white/5' : ''
                        }`}
                      >
                        <div>
                          <p className="text-sm font-medium">#{t.id} — {t.issueType.replace('_', ' ')}</p>
                          {t.resolution && (
                            <p className="text-white/40 text-xs mt-0.5">{t.resolution}</p>
                          )}
                        </div>
                        <Badge {...statusBadge(t.status)} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
