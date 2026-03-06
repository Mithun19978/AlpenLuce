'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Headphones, Ticket, CheckCircle, ArrowUpCircle,
  Search, Phone, Plus, ClipboardList, Package,
} from 'lucide-react';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import Badge, { statusBadge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useAuthStore } from '@/lib/store';
import { ticketApi, orderApi } from '@/lib/api';
import type { SupportTicket } from '@/types';

const NAV_ITEMS = [
  { href: '/support',           label: 'Ticket Queue',   icon: Ticket },
  { href: '/support#orders',    label: 'Order Lookup',   icon: Search },
  { href: '/support#calllog',   label: 'Call Log',       icon: Phone },
];

interface CallEntry {
  id: number;
  caller: string;
  issue: string;
  time: string;
  status: 'Open' | 'Resolved';
}

export default function SupportDashboard() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  // tickets
  const [tickets,     setTickets]     = useState<SupportTicket[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [acting,      setActing]      = useState<number | null>(null);
  const [resolutions, setResolutions] = useState<Record<number, string>>({});
  const [error,       setError]       = useState('');

  // order lookup
  const [orderId,      setOrderId]      = useState('');
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderResult,  setOrderResult]  = useState<any>(null);
  const [orderError,   setOrderError]   = useState('');

  // call log (local state only)
  const [callLog,       setCallLog]       = useState<CallEntry[]>([]);
  const [callForm,      setCallForm]      = useState({ caller: '', issue: '' });
  const [showCallForm,  setShowCallForm]  = useState(false);

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    if (!(user.role & 8)) { router.push('/access-denied'); return; }
    ticketApi.getAll()
      .then((r) => setTickets(r.data))
      .catch(() => setError('Failed to load tickets.'))
      .finally(() => setLoading(false));
  }, [user, router]);

  const handleResolve = async (id: number) => {
    const resolution = resolutions[id] || '';
    if (!resolution.trim()) { setError('Please enter a resolution note before resolving.'); return; }
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

  const handleOrderLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = parseInt(orderId.trim(), 10);
    if (!id) { setOrderError('Enter a valid order ID.'); return; }
    setOrderLoading(true);
    setOrderError('');
    setOrderResult(null);
    try {
      const res = await orderApi.getById(id);
      setOrderResult(res.data);
    } catch {
      setOrderError('Order not found or you do not have permission to view it.');
    } finally {
      setOrderLoading(false);
    }
  };

  const addCallEntry = () => {
    if (!callForm.caller.trim() || !callForm.issue.trim()) return;
    setCallLog((prev) => [
      {
        id: Date.now(),
        caller: callForm.caller.trim(),
        issue: callForm.issue.trim(),
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        status: 'Open',
      },
      ...prev,
    ]);
    setCallForm({ caller: '', issue: '' });
    setShowCallForm(false);
  };

  const toggleCallStatus = (id: number) => {
    setCallLog((prev) =>
      prev.map((c) => c.id === id ? { ...c, status: c.status === 'Open' ? 'Resolved' : 'Open' } : c)
    );
  };

  const open      = tickets.filter((t) => t.status === 'OPEN');
  const escalated = tickets.filter((t) => t.status === 'ESCALATED');
  const resolved  = tickets.filter((t) => !['OPEN', 'ESCALATED'].includes(t.status));

  const stats = [
    { label: 'Open',      value: open.length,      color: 'text-orange-400' },
    { label: 'Escalated', value: escalated.length,  color: 'text-red-400' },
    { label: 'Resolved',  value: resolved.length,   color: 'text-green-400' },
    { label: 'Total',     value: tickets.length,    color: 'text-gold' },
  ];

  return (
    <div className="min-h-screen pt-20 px-4 pb-12">
      <div className="max-w-6xl mx-auto flex gap-6">
        <DashboardSidebar title="Support" items={NAV_ITEMS} />

        <div className="flex-1 min-w-0">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <p className="text-gold text-xs tracking-[0.3em] uppercase mb-1">Customer Support</p>
            <h1 className="text-2xl font-black flex items-center gap-3">
              <Headphones className="w-6 h-6 text-gold" /> Support Operations
            </h1>
            <p className="text-white/40 text-sm mt-2">
              Handle customer tickets, look up orders, and log call interactions.
            </p>
          </motion.div>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* ── Stats ──────────────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((s) => (
              <div key={s.label} className="bg-surface border border-white/10 rounded-2xl p-5 text-center">
                <div className={`text-3xl font-black ${s.color}`}>{s.value}</div>
                <div className="text-white/40 text-xs mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* ── Ticket Queue ─────────────────────────────────────── */}
          <div id="tickets" className="mb-8">
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
                              <p className="text-white/40 text-xs mt-0.5">{t.issueType.replace('_', ' ')}</p>
                            </div>
                            <Badge {...statusBadge(t.status)} />
                          </div>
                          <p className="text-white/60 text-sm mb-4">{t.description}</p>

                          <div className="flex flex-wrap gap-3 items-center">
                            <input
                              type="text"
                              placeholder="Resolution note…"
                              value={resolutions[t.id] ?? ''}
                              onChange={(e) => setResolutions((r) => ({ ...r, [t.id]: e.target.value }))}
                              className="flex-1 min-w-0 bg-black border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold transition-colors"
                            />
                            <Button variant="gold" size="sm" loading={acting === t.id} onClick={() => handleResolve(t.id)}>
                              <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Resolve
                            </Button>
                            <Button variant="outline" size="sm" loading={acting === t.id} onClick={() => handleEscalate(t.id)}>
                              <ArrowUpCircle className="w-3.5 h-3.5 mr-1.5" /> Escalate to Admin / Tech Team
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
                    <h2 className="font-bold mb-4">Escalated to Admin / Tech Team ({escalated.length})</h2>
                    <div className="space-y-0">
                      {escalated.map((t, i) => (
                        <div
                          key={t.id}
                          className={`flex items-center justify-between py-3 ${i < escalated.length - 1 ? 'border-b border-white/5' : ''}`}
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
                          className={`flex items-center justify-between py-3 ${i < Math.min(resolved.length, 10) - 1 ? 'border-b border-white/5' : ''}`}
                        >
                          <div>
                            <p className="text-sm font-medium">#{t.id} — {t.issueType.replace('_', ' ')}</p>
                            {t.resolution && <p className="text-white/40 text-xs mt-0.5">{t.resolution}</p>}
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

          {/* ── Customer Order Lookup ─────────────────────────────── */}
          <motion.div
            id="orders"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-8"
          >
            <h2 className="text-xs text-gold tracking-[0.25em] uppercase font-medium mb-4 flex items-center gap-2">
              <Package className="w-3.5 h-3.5" /> Customer Order Lookup
            </h2>
            <div className="bg-surface border border-white/10 rounded-2xl p-5">
              <form onSubmit={handleOrderLookup} className="flex gap-3 mb-4">
                <input
                  type="number"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="Enter Order ID…"
                  className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold"
                />
                <Button variant="gold" size="sm" disabled={orderLoading}>
                  <Search className="w-3.5 h-3.5 mr-1.5" />
                  {orderLoading ? 'Looking up…' : 'Look up'}
                </Button>
              </form>

              {orderError && (
                <p className="text-red-400 text-sm">{orderError}</p>
              )}

              {orderResult && (
                <div className="border border-white/10 rounded-xl p-4 text-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white/40 text-xs">Order #{orderResult.order?.id ?? orderResult.id}</span>
                    <Badge {...statusBadge(orderResult.order?.orderStatus ?? orderResult.orderStatus ?? 'UNKNOWN')} />
                  </div>
                  <p>
                    <span className="text-white/40">Total: </span>
                    <span className="text-gold font-bold">
                      ₹{(orderResult.order?.totalAmount ?? orderResult.totalAmount ?? 0).toLocaleString('en-IN')}
                    </span>
                  </p>
                  <p>
                    <span className="text-white/40">Ship to: </span>
                    {orderResult.order?.shippingName ?? orderResult.shippingName ?? '—'},{' '}
                    {orderResult.order?.shippingCity ?? orderResult.shippingCity ?? '—'}
                  </p>
                  {(orderResult.items ?? []).length > 0 && (
                    <div className="mt-2 space-y-1">
                      <p className="text-white/40 text-xs">Items:</p>
                      {(orderResult.items ?? []).map((item: any) => (
                        <div key={item.id} className="flex justify-between text-xs text-white/60">
                          <span>{item.garmentId} × {item.quantity} ({item.size})</span>
                          <span>₹{item.unitPrice?.toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>

          {/* ── Call Log ──────────────────────────────────────────── */}
          <motion.div
            id="calllog"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-xs text-gold tracking-[0.25em] uppercase font-medium mb-4 flex items-center gap-2">
              <ClipboardList className="w-3.5 h-3.5" /> Call Log
              <span className="text-white/25 normal-case tracking-normal text-[10px] ml-1">(session only)</span>
            </h2>
            <div className="bg-surface border border-white/10 rounded-2xl p-5">
              <div className="flex justify-end mb-4">
                <Button variant="outline" size="sm" onClick={() => setShowCallForm((v) => !v)}>
                  <Plus className="w-3.5 h-3.5 mr-1" /> Log Call
                </Button>
              </div>

              {showCallForm && (
                <div className="border border-white/10 rounded-xl p-4 mb-4 space-y-3">
                  <input
                    type="text"
                    value={callForm.caller}
                    onChange={(e) => setCallForm((f) => ({ ...f, caller: e.target.value }))}
                    placeholder="Caller name / customer ID"
                    className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold"
                  />
                  <input
                    type="text"
                    value={callForm.issue}
                    onChange={(e) => setCallForm((f) => ({ ...f, issue: e.target.value }))}
                    placeholder="Issue summary"
                    className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold"
                  />
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" size="sm" onClick={() => setShowCallForm(false)}>Cancel</Button>
                    <Button variant="gold" size="sm" onClick={addCallEntry}>Save</Button>
                  </div>
                </div>
              )}

              {callLog.length === 0 ? (
                <p className="text-white/30 text-sm text-center py-8">No calls logged yet.</p>
              ) : (
                <div className="space-y-0">
                  {callLog.map((c, i) => (
                    <div
                      key={c.id}
                      className={`flex items-center justify-between py-3 ${i < callLog.length - 1 ? 'border-b border-white/5' : ''}`}
                    >
                      <div>
                        <p className="text-sm font-medium">{c.caller}</p>
                        <p className="text-white/40 text-xs">{c.issue}</p>
                        <p className="text-white/25 text-xs mt-0.5">{c.time}</p>
                      </div>
                      <button
                        onClick={() => toggleCallStatus(c.id)}
                        className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                          c.status === 'Resolved'
                            ? 'border-green-500/30 text-green-400 bg-green-500/10'
                            : 'border-orange-500/30 text-orange-400 bg-orange-500/10 hover:bg-orange-500/20'
                        }`}
                      >
                        {c.status}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
