'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Headphones, LayoutDashboard, Ticket, CheckCircle, ArrowUpCircle } from 'lucide-react';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import Badge, { statusBadge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useAuthStore } from '@/lib/store';
import { ticketApi } from '@/lib/api';
import type { SupportTicket } from '@/types';

const NAV_ITEMS = [
  { href: '/support', label: 'Tickets Queue', icon: LayoutDashboard },
];

export default function SupportDashboard() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<number | null>(null);
  const [resolutions, setResolutions] = useState<Record<number, string>>({});
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    if (!(user.role & 8)) { router.push('/dashboard'); return; }
    ticketApi.getAll()
      .then((r) => setTickets(r.data))
      .catch(() => setError('Failed to load tickets.'))
      .finally(() => setLoading(false));
  }, [user, router]);

  const handleResolve = async (id: number) => {
    const resolution = resolutions[id] || '';
    if (!resolution.trim()) {
      setError('Please enter a resolution note before resolving.');
      return;
    }
    setActing(id);
    setError('');
    try {
      const res = await ticketApi.resolve(id, resolution);
      setTickets((t) => t.map((tk) => tk.id === id ? res.data : tk));
    } catch {
      setError('Failed to resolve ticket.');
    } finally {
      setActing(null);
    }
  };

  const handleEscalate = async (id: number) => {
    setActing(id);
    setError('');
    try {
      const res = await ticketApi.escalate(id);
      setTickets((t) => t.map((tk) => tk.id === id ? res.data : tk));
    } catch {
      setError('Failed to escalate ticket.');
    } finally {
      setActing(null);
    }
  };

  const open = tickets.filter((t) => t.status === 'OPEN');
  const escalated = tickets.filter((t) => t.status === 'ESCALATED');
  const resolved = tickets.filter((t) => !['OPEN', 'ESCALATED'].includes(t.status));

  const stats = [
    { label: 'Open', value: open.length, color: 'text-orange-400' },
    { label: 'Escalated', value: escalated.length, color: 'text-red-400' },
    { label: 'Resolved', value: resolved.length, color: 'text-green-400' },
    { label: 'Total', value: tickets.length, color: 'text-gold' },
  ];

  return (
    <div className="min-h-screen pt-20 px-4 pb-12">
      <div className="max-w-6xl mx-auto flex gap-6">
        <DashboardSidebar title="Support" items={NAV_ITEMS} />

        <div className="flex-1 min-w-0">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <p className="text-gold text-xs tracking-[0.3em] uppercase mb-1">Support</p>
            <h1 className="text-2xl font-black flex items-center gap-3">
              <Headphones className="w-6 h-6 text-gold" /> Support Queue
            </h1>
          </motion.div>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((s) => (
              <div key={s.label} className="bg-surface border border-white/10 rounded-2xl p-5 text-center">
                <div className={`text-3xl font-black ${s.color}`}>{s.value}</div>
                <div className="text-white/40 text-xs mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {loading ? (
            <p className="text-white/30 text-center py-16">Loading…</p>
          ) : (
            <>
              {/* Open tickets */}
              <div className="bg-surface border border-white/10 rounded-2xl p-6 mb-6">
                <h2 className="font-bold mb-4 flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-orange-400" />
                  Open Tickets ({open.length})
                </h2>
                {open.length === 0 ? (
                  <p className="text-white/30 text-center py-8 text-sm">No open tickets.</p>
                ) : (
                  <div className="space-y-4">
                    {open.map((t) => (
                      <div key={t.id} className="border border-white/10 rounded-xl p-5">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium text-sm">#{t.id} — Order #{t.orderId}</p>
                            <p className="text-white/40 text-xs mt-0.5">
                              {t.issueType.replace('_', ' ')}
                            </p>
                          </div>
                          <Badge {...statusBadge(t.status)} />
                        </div>
                        <p className="text-white/60 text-sm mb-4">{t.description}</p>

                        <div className="flex flex-wrap gap-3 items-center">
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
                            loading={acting === t.id}
                            onClick={() => handleResolve(t.id)}
                          >
                            <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Resolve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            loading={acting === t.id}
                            onClick={() => handleEscalate(t.id)}
                          >
                            <ArrowUpCircle className="w-3.5 h-3.5 mr-1.5" /> Escalate
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Escalated */}
              {escalated.length > 0 && (
                <div className="bg-surface border border-white/10 rounded-2xl p-6 mb-6">
                  <h2 className="font-bold mb-4">Escalated to Admin ({escalated.length})</h2>
                  <div className="space-y-0">
                    {escalated.map((t, i) => (
                      <div
                        key={t.id}
                        className={`flex items-center justify-between py-3 ${
                          i < escalated.length - 1 ? 'border-b border-white/5' : ''
                        }`}
                      >
                        <div>
                          <p className="text-sm font-medium">#{t.id} — {t.issueType.replace('_', ' ')}</p>
                          <p className="text-white/40 text-xs line-clamp-1">{t.description}</p>
                        </div>
                        <Badge {...statusBadge(t.status)} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Resolved */}
              {resolved.length > 0 && (
                <div className="bg-surface border border-white/10 rounded-2xl p-6">
                  <h2 className="font-bold mb-4">Resolved ({resolved.length})</h2>
                  <div className="space-y-0">
                    {resolved.slice(0, 10).map((t, i) => (
                      <div
                        key={t.id}
                        className={`flex items-center justify-between py-3 ${
                          i < Math.min(resolved.length, 10) - 1 ? 'border-b border-white/5' : ''
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
