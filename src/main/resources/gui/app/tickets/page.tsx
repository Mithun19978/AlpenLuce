'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Ticket, ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Badge, { statusBadge } from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import { useAuthStore } from '@/lib/store';
import { ticketApi } from '@/lib/api';
import type { SupportTicket } from '@/types';

const ISSUE_TYPES = ['QUALITY_ISSUE', 'WRONG_ITEM', 'DAMAGED', 'OTHER'] as const;

export default function TicketsPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ orderId: '', issueType: 'QUALITY_ISSUE', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    ticketApi.getMine()
      .then((r) => setTickets(r.data))
      .catch(() => setError('Failed to load tickets.'))
      .finally(() => setLoading(false));
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.orderId || !form.description.trim()) {
      setError('Order ID and description are required.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await ticketApi.create({
        orderId: Number(form.orderId),
        issueType: form.issueType,
        description: form.description,
      });
      setTickets((t) => [res.data, ...t]);
      setSuccess('Ticket submitted. Our support team will review it shortly.');
      setShowForm(false);
      setForm({ orderId: '', issueType: 'QUALITY_ISSUE', description: '' });
    } catch {
      setError('Failed to submit ticket. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 px-4 pb-12">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-white/40 hover:text-white text-sm mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gold text-xs tracking-[0.3em] uppercase mb-1">Help</p>
              <h1 className="text-3xl font-black flex items-center gap-3">
                <Ticket className="w-7 h-7 text-gold" /> My Tickets
              </h1>
            </div>
            <Button variant="gold" onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Cancel' : 'Report Issue'}
            </Button>
          </div>
        </motion.div>

        {/* Non-return notice */}
        <div className="mb-6 px-4 py-3 bg-gold/5 border border-gold/20 rounded-xl text-xs text-white/50 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-gold shrink-0 mt-0.5" />
          <p>
            AlpenLuce does <strong className="text-white">not accept returns</strong>. If you have a quality concern,
            damage, or wrong item, please report it and our support team will investigate.
          </p>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 px-4 py-3 bg-gold/10 border border-gold/30 rounded-xl text-gold text-sm">
            {success}
          </div>
        )}

        {/* New ticket form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-surface border border-gold/20 rounded-2xl p-6 mb-6"
          >
            <h2 className="font-bold mb-4">Report an Issue</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Order ID"
                type="number"
                value={form.orderId}
                onChange={(e) => setForm({ ...form, orderId: e.target.value })}
                placeholder="e.g. 42"
                required
              />
              <div>
                <label className="block text-sm text-white/60 mb-1.5">Issue Type</label>
                <select
                  value={form.issueType}
                  onChange={(e) => setForm({ ...form, issueType: e.target.value })}
                  className="w-full bg-black border border-white/20 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-gold transition-colors"
                >
                  {ISSUE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1.5">Description</label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe the issue in detail…"
                  className="w-full bg-black border border-white/20 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-gold resize-none transition-colors"
                  required
                />
              </div>
              <Button type="submit" variant="gold" loading={submitting}>
                Submit Ticket
              </Button>
            </form>
          </motion.div>
        )}

        {/* Tickets list */}
        {loading ? (
          <p className="text-white/30 text-center py-16">Loading…</p>
        ) : tickets.length === 0 ? (
          <div className="bg-surface border border-white/10 rounded-2xl p-12 text-center">
            <Ticket className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/30">No tickets yet. Experiencing an issue? Report it above.</p>
          </div>
        ) : (
          <div className="bg-surface border border-white/10 rounded-2xl divide-y divide-white/5">
            {tickets.map((t) => (
              <div key={t.id} className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-sm">
                      #{t.id} — Order #{t.orderId}
                    </p>
                    <p className="text-white/40 text-xs mt-0.5">{t.issueType.replace('_', ' ')}</p>
                  </div>
                  <Badge {...statusBadge(t.status)} />
                </div>
                <p className="text-white/60 text-sm">{t.description}</p>
                {t.resolution && (
                  <div className="mt-3 px-3 py-2 bg-gold/5 border border-gold/20 rounded-lg text-xs text-white/70">
                    <span className="text-gold font-medium">Resolution: </span>
                    {t.resolution}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
