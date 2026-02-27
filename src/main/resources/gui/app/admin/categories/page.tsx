'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Users, Shirt, Globe, Activity, Ticket,
  Tag, Eye, EyeOff,
} from 'lucide-react';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import { useAuthStore } from '@/lib/store';
import { categoryApi } from '@/lib/api';
import type { Category } from '@/types';

const NAV_ITEMS = [
  { href: '/admin',            label: 'Overview',          icon: LayoutDashboard },
  { href: '/admin/users',      label: 'Users',             icon: Users },
  { href: '/admin/garments',   label: 'Garments',          icon: Shirt },
  { href: '/admin/homepage',   label: 'Home Page',         icon: Globe },
  { href: '/admin/categories', label: 'Categories',        icon: Tag },
  { href: '/admin/activity',   label: 'Activity Logs',     icon: Activity },
  { href: '/admin/tickets',    label: 'Escalated Tickets', icon: Ticket },
];

const DEPTH_LABELS = ['Main', 'Sub', 'Type'] as const;
const DEPTH_INDENT = ['', 'pl-6', 'pl-12'] as const;
const DEPTH_COLOR  = ['text-gold', 'text-white/80', 'text-white/50'] as const;

export default function AdminCategoriesPage() {
  const router = useRouter();
  const user   = useAuthStore((s) => s.user);

  const [cats,    setCats]    = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<number | null>(null);
  const [error,   setError]   = useState('');

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    if (!(user.role & 6)) { router.push('/dashboard'); return; }  // admin(2) | tech(4)
    categoryApi.getAll()
      .then((r) => setCats(r.data))
      .catch(() => setError('Failed to load categories.'))
      .finally(() => setLoading(false));
  }, [user, router]);

  const handleToggle = async (cat: Category) => {
    setToggling(cat.id);
    setError('');
    try {
      await categoryApi.setActive(cat.id, !cat.active);
      setCats((prev) =>
        prev.map((c) => c.id === cat.id ? { ...c, active: !c.active } : c)
      );
    } catch {
      setError('Failed to update category.');
    } finally {
      setToggling(null);
    }
  };

  // group rows under their main category for visual sections
  const mains     = cats.filter((c) => c.depth === 0);
  const bySectionId: Record<number, Category[]> = {};
  mains.forEach((m) => { bySectionId[m.id] = [m]; });

  cats.filter((c) => c.depth > 0).forEach((c) => {
    // find root ancestor
    let root = c;
    while (root.parentId !== null && root.parentId !== undefined) {
      const parent = cats.find((x) => x.id === root.parentId);
      if (!parent) break;
      root = parent;
    }
    if (bySectionId[root.id]) bySectionId[root.id].push(c);
  });

  return (
    <div className="min-h-screen pt-20 px-4 pb-12">
      <div className="max-w-6xl mx-auto flex gap-6">
        <DashboardSidebar title="Admin Panel" items={NAV_ITEMS} />

        <div className="flex-1 min-w-0">
          {/* header */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <p className="text-gold text-xs tracking-[0.3em] uppercase mb-1">Storefront</p>
            <h1 className="text-2xl font-black flex items-center gap-3">
              <Tag className="w-6 h-6 text-gold" /> Category Management
            </h1>
            <p className="text-white/40 text-sm mt-2">
              Show or hide categories and sub-categories on the Shop page. Changes reflect immediately for all logged-in users.
            </p>
          </motion.div>

          {/* summary */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-3 gap-4 mb-8"
          >
            {[
              { label: 'Main Categories', count: cats.filter((c) => c.depth === 0 && c.active).length, total: cats.filter((c) => c.depth === 0).length },
              { label: 'Sub-Categories',  count: cats.filter((c) => c.depth === 1 && c.active).length, total: cats.filter((c) => c.depth === 1).length },
              { label: 'Types',           count: cats.filter((c) => c.depth === 2 && c.active).length, total: cats.filter((c) => c.depth === 2).length },
            ].map(({ label, count, total }) => (
              <div key={label} className="bg-surface border border-white/10 rounded-2xl p-4 text-center">
                <div className="text-2xl font-black text-gold">{count}</div>
                <div className="text-white/40 text-xs mt-0.5">of {total} showing</div>
                <div className="text-white/60 text-xs font-medium mt-0.5">{label}</div>
              </div>
            ))}
          </motion.div>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <p className="text-white/30 text-center py-16">Loading…</p>
          ) : (
            <div className="space-y-4">
              {mains.map((main, idx) => (
                <motion.div
                  key={main.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 + idx * 0.04 }}
                  className="bg-surface border border-white/10 rounded-2xl overflow-hidden"
                >
                  {(bySectionId[main.id] ?? []).map((cat) => {
                    const depth = cat.depth as 0 | 1 | 2;
                    const isHidden = !cat.active;

                    return (
                      <div
                        key={cat.id}
                        className={`flex items-center justify-between px-5 py-3 border-b border-white/5 last:border-0 ${
                          isHidden ? 'opacity-50' : ''
                        }`}
                      >
                        <div className={`flex items-center gap-3 ${DEPTH_INDENT[depth]}`}>
                          {/* depth indicator line */}
                          {depth > 0 && (
                            <span className="text-white/15 text-xs select-none">
                              {'─'.repeat(depth)}
                            </span>
                          )}
                          <span className={`text-sm font-medium ${DEPTH_COLOR[depth]}`}>
                            {cat.name}
                          </span>
                          <span className="text-white/20 text-xs">
                            {DEPTH_LABELS[depth]}
                          </span>
                        </div>

                        <button
                          onClick={() => handleToggle(cat)}
                          disabled={toggling === cat.id}
                          title={cat.active ? 'Click to hide from Shop' : 'Click to show in Shop'}
                          className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
                            cat.active
                              ? 'border-gold/40 text-gold bg-gold/10 hover:bg-gold/20'
                              : 'border-white/10 text-white/40 hover:border-white/30'
                          }`}
                        >
                          {toggling === cat.id ? (
                            <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                          ) : cat.active ? (
                            <><Eye className="w-3 h-3" /> Visible</>
                          ) : (
                            <><EyeOff className="w-3 h-3" /> Hidden</>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
