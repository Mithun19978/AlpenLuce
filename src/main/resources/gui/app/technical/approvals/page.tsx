'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckSquare, LayoutDashboard, CheckCircle, XCircle } from 'lucide-react';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import Badge, { statusBadge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useAuthStore } from '@/lib/store';
import { customizationApi } from '@/lib/api';
import type { Customization } from '@/types';

const NAV_ITEMS = [
  { href: '/technical', label: 'Overview', icon: LayoutDashboard },
  { href: '/technical/approvals', label: 'Pending Approvals', icon: CheckSquare },
];

export default function ApprovalsPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [customizations, setCustomizations] = useState<Customization[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<number | null>(null);
  const [prices, setPrices] = useState<Record<number, string>>({});
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    if (!(user.role & 4)) { router.push('/dashboard'); return; }
    customizationApi.getPending()
      .then((r) => setCustomizations(r.data))
      .catch(() => setError('Failed to load designs.'))
      .finally(() => setLoading(false));
  }, [user, router]);

  const handleApprove = async (id: number) => {
    const priceInCents = Math.round(parseFloat(prices[id] || '0') * 100);
    if (!priceInCents || priceInCents <= 0) {
      setError('Please enter a valid price before approving.');
      return;
    }
    setActing(id);
    setError('');
    try {
      const res = await customizationApi.approve(id, priceInCents, notes[id] ?? '');
      setCustomizations((c) => c.map((item) => item.id === id ? res.data : item));
    } catch {
      setError('Failed to approve design.');
    } finally {
      setActing(null);
    }
  };

  const handleReject = async (id: number) => {
    setActing(id);
    setError('');
    try {
      const res = await customizationApi.reject(id, notes[id] ?? '');
      setCustomizations((c) => c.map((item) => item.id === id ? res.data : item));
    } catch {
      setError('Failed to reject design.');
    } finally {
      setActing(null);
    }
  };

  const pending = customizations.filter((c) => c.status === 'PENDING');
  const reviewed = customizations.filter((c) => c.status !== 'PENDING');

  return (
    <div className="min-h-screen pt-20 px-4 pb-12">
      <div className="max-w-6xl mx-auto flex gap-6">
        <DashboardSidebar title="Technical" items={NAV_ITEMS} />

        <div className="flex-1 min-w-0">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <p className="text-gold text-xs tracking-[0.3em] uppercase mb-1">Technical</p>
            <h1 className="text-2xl font-black flex items-center gap-3">
              <CheckSquare className="w-6 h-6 text-gold" /> Design Approvals
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
                <h2 className="font-bold mb-4">
                  Pending Review ({pending.length})
                </h2>
                {pending.length === 0 ? (
                  <p className="text-white/30 text-center py-8 text-sm">
                    No designs awaiting review.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {pending.map((c) => (
                      <div
                        key={c.id}
                        className="border border-white/10 rounded-xl p-5"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium">Design #{c.id}</p>
                            <p className="text-white/40 text-xs mt-0.5">Garment #{c.garmentId}</p>
                          </div>
                          <Badge {...statusBadge(c.status)} />
                        </div>
                        {c.notes && (
                          <p className="text-white/60 text-sm mb-4 bg-white/3 rounded-lg px-3 py-2">
                            &ldquo;{c.notes}&rdquo;
                          </p>
                        )}

                        {/* Layers summary */}
                        {c.layers && c.layers.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {c.layers.map((layer, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-1.5 text-xs"
                              >
                                <span
                                  className="w-3 h-3 rounded-full border border-white/20"
                                  style={{ background: layer.colorHex }}
                                />
                                <span className="text-white/50">{layer.area}</span>
                                {layer.designText && (
                                  <span className="text-white/70">&quot;{layer.designText}&quot;</span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex flex-wrap gap-3 items-center">
                          {/* Price input */}
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">$</span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="Set price"
                              value={prices[c.id] ?? ''}
                              onChange={(e) => setPrices((p) => ({ ...p, [c.id]: e.target.value }))}
                              className="w-32 bg-black border border-white/20 rounded-lg pl-6 pr-3 py-2 text-sm focus:outline-none focus:border-gold transition-colors"
                            />
                          </div>
                          <input
                            type="text"
                            placeholder="Notes (optional)"
                            value={notes[c.id] ?? ''}
                            onChange={(e) => setNotes((n) => ({ ...n, [c.id]: e.target.value }))}
                            className="flex-1 min-w-0 bg-black border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold transition-colors"
                          />
                          <Button
                            variant="gold"
                            size="sm"
                            loading={acting === c.id}
                            onClick={() => handleApprove(c.id)}
                          >
                            <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Approve
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            loading={acting === c.id}
                            onClick={() => handleReject(c.id)}
                          >
                            <XCircle className="w-3.5 h-3.5 mr-1.5" /> Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Reviewed */}
              {reviewed.length > 0 && (
                <div className="bg-surface border border-white/10 rounded-2xl p-6">
                  <h2 className="font-bold mb-4">Already Reviewed ({reviewed.length})</h2>
                  <div className="space-y-0">
                    {reviewed.map((c, i) => (
                      <div
                        key={c.id}
                        className={`flex items-center justify-between py-3 ${
                          i < reviewed.length - 1 ? 'border-b border-white/5' : ''
                        }`}
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
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
