'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Monitor, Ticket, MessageSquare, CheckCircle2, Clock,
  AlertCircle, BarChart3, Wifi, CreditCard, Shield,
} from 'lucide-react';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import Badge, { statusBadge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useAuthStore } from '@/lib/store';
import { ticketApi } from '@/lib/api';
import type { SupportTicket } from '@/types';

const NAV_ITEMS = [
  { href: '/tech',          label: 'Escalated Tickets', icon: Ticket },
  { href: '/tech#monitor',  label: 'System Monitor',    icon: Monitor },
  { href: '/tech#comms',    label: 'Internal Comms',    icon: MessageSquare },
];

const SYSTEM_SERVICES = [
  { name: 'API Health',        status: 'Operational', icon: BarChart3,  color: 'text-green-400' },
  { name: 'Auth Service',      status: 'Operational', icon: Shield,     color: 'text-green-400' },
  { name: 'Payment Gateway',   status: 'Operational', icon: CreditCard, color: 'text-green-400' },
  { name: 'Database',          status: 'Operational', icon: Wifi,       color: 'text-green-400' },
];

export default function TechDashboard() {
  const router = useRouter();
  const user   = useAuthStore((s) => s.user);

  const [tickets,     setTickets]     = useState<SupportTicket[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [acting,      setActing]      = useState<number | null>(null);
  const [notes,       setNotes]       = useState<Record<number, string>>({});
  const [error,       setError]       = useState('');
  const [successMsg,  setSuccessMsg]  = useState('');

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    if (!(user.role & 4)) { router.push('/access-denied'); return; }
    loadTickets();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  function loadTickets() {
    setLoading(true);
    ticketApi.getEscalated()
      .then((r) => setTickets(r.data))
      .catch(() => setError('Failed to load escalated tickets.'))
      .finally(() => setLoading(false));
  }

  async function handleResolve(id: number) {
    const note = notes[id] ?? '';
    if (!note.trim()) { setError('Please enter a resolution note before marking resolved.'); return; }
    setActing(id);
    setError('');
    try {
      await ticketApi.decide(id, 'APPROVE', note);
      setTickets((prev) => prev.filter((t) => t.id !== id));
      setSuccessMsg('Ticket resolved successfully.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch {
      setError('Failed to resolve ticket.');
    } finally {
      setActing(null);
    }
  }

  async function handleReject(id: number) {
    const note = notes[id] ?? '';
    if (!note.trim()) { setError('Please enter a note before rejecting.'); return; }
    setActing(id);
    setError('');
    try {
      await ticketApi.decide(id, 'REJECT', note);
      setTickets((prev) => prev.filter((t) => t.id !== id));
      setSuccessMsg('Ticket rejected.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch {
      setError('Failed to reject ticket.');
    } finally {
      setActing(null);
    }
  }

  const openCount       = tickets.filter((t) => t.status === 'OPEN').length;
  const inProgressCount = tickets.filter((t) => t.status === 'IN_PROGRESS').length;
  const resolvedCount   = tickets.filter((t) => t.status === 'RESOLVED').length;

  return (
    <div className="min-h-screen pt-20 px-4 pb-12">
      <div className="max-w-6xl mx-auto flex gap-6">
        <DashboardSidebar title="Tech Panel" items={NAV_ITEMS} />

        <div className="flex-1 min-w-0">
          {/* ── header ───────────────────────────────────────────── */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <p className="text-gold text-xs tracking-[0.3em] uppercase mb-1">Technical</p>
            <h1 className="text-2xl font-black flex items-center gap-3">
              <Monitor className="w-6 h-6 text-gold" /> Tech Dashboard
            </h1>
            <p className="text-white/40 text-sm mt-2">
              Manage escalated tickets, monitor system health, and coordinate with the team.
            </p>
          </motion.div>

          {/* ── stats row ─────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8"
          >
            {[
              { label: 'Total Escalated', value: tickets.length,  icon: Ticket,       color: 'text-white' },
              { label: 'Open',            value: openCount,        icon: AlertCircle,  color: 'text-red-400' },
              { label: 'In Progress',     value: inProgressCount,  icon: Clock,        color: 'text-yellow-400' },
              { label: 'Resolved',        value: resolvedCount,    icon: CheckCircle2, color: 'text-green-400' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-surface border border-white/10 rounded-2xl p-4 text-center">
                <Icon className={`w-4 h-4 mx-auto mb-1 ${color}`} />
                <div className={`text-2xl font-black ${color}`}>{value}</div>
                <div className="text-white/40 text-xs mt-0.5">{label}</div>
              </div>
            ))}
          </motion.div>

          {/* ── alerts ───────────────────────────────────────────── */}
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="mb-4 px-4 py-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> {successMsg}
            </div>
          )}

          {/* ── escalated tickets ─────────────────────────────────── */}
          <motion.div
            id="tickets"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="mb-10"
          >
            <h2 className="text-xs text-gold tracking-[0.25em] uppercase font-medium mb-4 flex items-center gap-2">
              <Ticket className="w-3.5 h-3.5" /> Escalated Tickets
            </h2>

            {loading ? (
              <p className="text-white/30 text-center py-12">Loading tickets…</p>
            ) : tickets.length === 0 ? (
              <div className="text-center py-12 text-white/30 text-sm bg-surface border border-white/10 rounded-2xl">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-400/40" />
                No escalated tickets. All clear!
              </div>
            ) : (
              <div className="space-y-4">
                {tickets.map((ticket, idx) => (
                  <motion.div
                    key={ticket.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + idx * 0.05 }}
                    className="bg-surface border border-white/10 rounded-2xl p-5"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-white/40">#{ticket.id}</span>
                          <Badge {...statusBadge(ticket.status)} />
                        </div>
                        <p className="font-medium text-sm">{ticket.issueType}</p>
                        <p className="text-white/50 text-xs mt-1 leading-relaxed">{ticket.description}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-white/30">Order #{ticket.orderId}</p>
                        <p className="text-xs text-white/30 mt-0.5">
                          {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString('en-IN') : '—'}
                        </p>
                      </div>
                    </div>

                    <textarea
                      rows={2}
                      value={notes[ticket.id] ?? ''}
                      onChange={(e) => setNotes((prev) => ({ ...prev, [ticket.id]: e.target.value }))}
                      placeholder="Add resolution note or technical findings…"
                      className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold resize-none mb-3"
                    />

                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReject(ticket.id)}
                        disabled={acting === ticket.id}
                      >
                        Reject
                      </Button>
                      <Button
                        variant="gold"
                        size="sm"
                        onClick={() => handleResolve(ticket.id)}
                        disabled={acting === ticket.id}
                      >
                        {acting === ticket.id ? 'Processing…' : 'Mark Resolved'}
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* ── system monitor ────────────────────────────────────── */}
          <motion.div
            id="monitor"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-10"
          >
            <h2 className="text-xs text-gold tracking-[0.25em] uppercase font-medium mb-4 flex items-center gap-2">
              <Monitor className="w-3.5 h-3.5" /> System Monitor
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {SYSTEM_SERVICES.map(({ name, status, icon: Icon, color }) => (
                <div key={name} className="bg-surface border border-white/10 rounded-2xl p-4 text-center">
                  <Icon className={`w-5 h-5 mx-auto mb-2 ${color}`} />
                  <p className="text-xs font-medium text-white/80">{name}</p>
                  <p className={`text-xs mt-1 ${color}`}>{status}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── internal comms ────────────────────────────────────── */}
          <motion.div
            id="comms"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <h2 className="text-xs text-gold tracking-[0.25em] uppercase font-medium mb-4 flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5" /> Internal Comms
            </h2>
            <div className="bg-surface border border-white/10 rounded-2xl p-8 text-center">
              <MessageSquare className="w-8 h-8 mx-auto mb-3 text-white/20" />
              <p className="text-white/40 text-sm font-medium">Coming Soon</p>
              <p className="text-white/25 text-xs mt-1">Internal messaging between tech and support teams.</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
