'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Globe, Package, Megaphone, Users, Activity, Ticket,
  Eye, EyeOff, CheckCircle2, XCircle, Tag, LayoutDashboard, BarChart3,
} from 'lucide-react';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import { useAuthStore } from '@/lib/store';
import { garmentAdminApi } from '@/lib/api';
import type { Garment } from '@/types';

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

const CATEGORIES = [
  { key: 'mens',   label: "Men's Wear",   tagline: 'Shown in the Men\'s section' },
  { key: 'womens', label: "Women's Wear", tagline: 'Shown in the Women\'s section' },
  { key: 'kids',   label: 'Kids Wear',    tagline: 'Shown in the Kids section' },
] as const;

type CategoryKey = typeof CATEGORIES[number]['key'];

const TYPE_EMOJI: Record<string, string> = {
  tshirt: '👕', hoodie: '🧥', jogger: '👖', polo: '👔',
  sweatshirt: '🧣', tracksuit: '🏃',
};

export default function AdminHomepagePage() {
  const router = useRouter();
  const user   = useAuthStore((s) => s.user);

  const [garments, setGarments] = useState<Garment[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [saving,   setSaving]   = useState<number | null>(null); // garment id being toggled

  // ── auth guard: admin (2) or technical (4) ─────────────────────
  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    if (!(user.role & 6)) { router.push('/dashboard'); return; }
    garmentAdminApi.getAll()
      .then((r) => setGarments(r.data))
      .catch(() => setError('Failed to load garments.'))
      .finally(() => setLoading(false));
  }, [user, router]);

  // ── toggle featured ────────────────────────────────────────────
  async function toggle(g: Garment) {
    if (!g.active) return;   // can't feature an inactive garment
    setSaving(g.id);
    setError('');
    try {
      await garmentAdminApi.setFeatured(g.id, !g.featured);
      setGarments((prev) =>
        prev.map((x) => x.id === g.id ? { ...x, featured: !x.featured } : x)
      );
    } catch {
      setError('Failed to update home page visibility.');
    } finally {
      setSaving(null);
    }
  }

  // ── derived ────────────────────────────────────────────────────
  const featuredCount = garments.filter((g) => g.active && g.featured).length;
  const totalActive   = garments.filter((g) => g.active).length;

  return (
    <div className="min-h-screen pt-20 px-4 pb-12">
      <div className="max-w-6xl mx-auto flex gap-6">
        <DashboardSidebar title="Admin Panel" items={NAV_ITEMS} />

        <div className="flex-1 min-w-0">
          {/* ── header ───────────────────────────────────────────── */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <p className="text-gold text-xs tracking-[0.3em] uppercase mb-1">Storefront</p>
            <h1 className="text-2xl font-black flex items-center gap-3">
              <Globe className="w-6 h-6 text-gold" /> Home Page Setup
            </h1>
            <p className="text-white/40 text-sm mt-2">
              Control which garments appear on the public home page. Changes take effect immediately for all visitors.
            </p>
          </motion.div>

          {/* ── summary bar ──────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-3 gap-4 mb-8"
          >
            {CATEGORIES.map(({ key, label }) => {
              const shown  = garments.filter((g) => g.garmentType === key && g.active && g.featured).length;
              const total  = garments.filter((g) => g.garmentType === key).length;
              return (
                <div key={key} className="bg-surface border border-white/10 rounded-2xl p-4 text-center">
                  <div className="text-2xl font-black text-gold">{shown}</div>
                  <div className="text-white/40 text-xs mt-1">of {total} shown</div>
                  <div className="text-white/60 text-xs font-medium mt-0.5">{label}</div>
                </div>
              );
            })}
          </motion.div>

          {/* ── info banner ──────────────────────────────────────── */}
          <div className="mb-6 px-4 py-3 bg-gold/5 border border-gold/20 rounded-xl text-gold/80 text-xs flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 shrink-0" />
            <span>
              <strong>{featuredCount}</strong> of <strong>{totalActive}</strong> active garments are currently visible on the home page.
              Inactive garments cannot be shown (enable them from the{' '}
              <a href="/admin/garments" className="underline hover:text-gold">Garments</a> page first).
            </span>
          </div>

          {/* ── error ────────────────────────────────────────────── */}
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* ── category sections ────────────────────────────────── */}
          {loading ? (
            <p className="text-white/30 text-center py-16">Loading…</p>
          ) : (
            <div className="space-y-8">
              {CATEGORIES.map(({ key, label, tagline }, idx) => {
                const items = garments.filter((g) => g.garmentType === key);
                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + idx * 0.07 }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-xs text-gold tracking-[0.25em] uppercase">{label}</h3>
                        <p className="text-white/30 text-xs mt-0.5">{tagline}</p>
                      </div>
                      <span className="text-xs text-white/40">
                        {items.filter((g) => g.active && g.featured).length} showing
                      </span>
                    </div>

                    <div className="bg-surface border border-white/10 rounded-2xl overflow-hidden">
                      {items.length === 0 ? (
                        <p className="text-white/30 text-sm text-center py-8">
                          No garments in this category. Add some from{' '}
                          <a href="/admin/garments" className="text-gold hover:underline">Garments</a>.
                        </p>
                      ) : (
                        <div className="divide-y divide-white/5">
                          {items.map((g) => {
                            const isShowing = g.active && g.featured;
                            const isDisabled = !g.active || saving === g.id;
                            return (
                              <div
                                key={g.id}
                                className={`flex items-center justify-between px-5 py-4 transition-colors ${
                                  isShowing ? 'hover:bg-gold/[0.03]' : 'hover:bg-white/[0.02]'
                                }`}
                              >
                                {/* garment info */}
                                <div className="flex items-center gap-3 min-w-0">
                                  <span className="text-2xl shrink-0">
                                    {TYPE_EMOJI[g.garmentType] ?? '👕'}
                                  </span>
                                  <div className="min-w-0">
                                    <p className={`text-sm font-medium truncate ${!g.active ? 'text-white/30' : ''}`}>
                                      {g.name}
                                    </p>
                                    <p className="text-white/30 text-xs">
                                      ₹{g.basePrice?.toLocaleString('en-IN')}
                                      {g.baseColor && <span className="ml-2">· {g.baseColor}</span>}
                                      {g.sizes && <span className="ml-2">· {g.sizes}</span>}
                                      {!g.active && (
                                        <span className="ml-2 text-red-400/60">inactive — enable first</span>
                                      )}
                                    </p>
                                  </div>
                                </div>

                                {/* toggle button */}
                                <button
                                  onClick={() => toggle(g)}
                                  disabled={isDisabled}
                                  title={
                                    !g.active ? 'Garment is inactive'
                                    : isShowing ? 'Click to hide from home page'
                                    : 'Click to show on home page'
                                  }
                                  className={`flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-full border transition-all shrink-0 ${
                                    isShowing
                                      ? 'border-gold/50 text-gold bg-gold/10 hover:bg-gold/20'
                                      : 'border-white/10 text-white/40 bg-transparent hover:border-white/30'
                                  } disabled:opacity-30 disabled:cursor-not-allowed`}
                                >
                                  {saving === g.id ? (
                                    <span className="w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin" />
                                  ) : isShowing ? (
                                    <><Eye className="w-3.5 h-3.5" /> Showing</>
                                  ) : (
                                    <><EyeOff className="w-3.5 h-3.5" /> Hidden</>
                                  )}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* live preview hint */}
                    {items.some((g) => g.active && g.featured) && (
                      <p className="text-xs text-white/25 mt-2 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-green-500/60" />
                        {items.filter((g) => g.active && g.featured).length} garment
                        {items.filter((g) => g.active && g.featured).length !== 1 ? 's' : ''} visible
                        in the <strong className="text-white/40">{label}</strong> section on the home page
                      </p>
                    )}
                    {items.every((g) => !g.active || !g.featured) && items.length > 0 && (
                      <p className="text-xs text-white/25 mt-2 flex items-center gap-1">
                        <XCircle className="w-3 h-3 text-red-500/40" />
                        No garments showing — the <strong className="text-white/40">{label}</strong> section will be hidden on the home page
                      </p>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
