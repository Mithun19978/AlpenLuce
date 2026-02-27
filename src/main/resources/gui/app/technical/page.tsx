'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Layers, LayoutDashboard, CheckSquare } from 'lucide-react';
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

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function TechnicalDashboard() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [customizations, setCustomizations] = useState<Customization[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    if (!(user.role & 4)) { router.push('/dashboard'); return; }
    customizationApi.getPending()
      .then((r) => setCustomizations(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, router]);

  const pending = customizations.filter((c) => c.status === 'PENDING');
  const approved = customizations.filter((c) => c.status === 'APPROVED');
  const rejected = customizations.filter((c) => c.status === 'REJECTED');

  const stats = [
    { label: 'Pending', value: pending.length, color: 'text-orange-400' },
    { label: 'Approved', value: approved.length, color: 'text-green-400' },
    { label: 'Rejected', value: rejected.length, color: 'text-red-400' },
    { label: 'Total', value: customizations.length, color: 'text-gold' },
  ];

  return (
    <div className="min-h-screen pt-20 px-4 pb-12">
      <div className="max-w-6xl mx-auto flex gap-6">
        <DashboardSidebar title="Technical" items={NAV_ITEMS} />

        <div className="flex-1 min-w-0">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <p className="text-gold text-xs tracking-[0.3em] uppercase mb-1">Technical</p>
            <h1 className="text-2xl font-black flex items-center gap-3">
              <Layers className="w-6 h-6 text-gold" /> Technical Dashboard
            </h1>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            {stats.map((s) => (
              <motion.div
                key={s.label}
                variants={fadeUp}
                className="bg-surface border border-white/10 rounded-2xl p-5 text-center"
              >
                <div className={`text-3xl font-black ${s.color}`}>{s.value}</div>
                <div className="text-white/40 text-xs mt-1">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Recent pending */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-surface border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold">Designs Awaiting Review</h2>
              <Button variant="outline" size="sm" onClick={() => router.push('/technical/approvals')}>
                View all
              </Button>
            </div>
            {loading ? (
              <p className="text-white/30 text-center py-8">Loading…</p>
            ) : pending.length === 0 ? (
              <p className="text-white/30 text-center py-8 text-sm">
                No pending designs. All caught up!
              </p>
            ) : (
              <div className="space-y-0">
                {pending.slice(0, 5).map((c, i) => (
                  <div
                    key={c.id}
                    className={`flex items-center justify-between py-3 ${
                      i < Math.min(pending.length, 5) - 1 ? 'border-b border-white/5' : ''
                    }`}
                  >
                    <div>
                      <p className="text-sm font-medium">Design #{c.id}</p>
                      <p className="text-white/40 text-xs mt-0.5">{c.notes || 'No notes'}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge {...statusBadge(c.status)} />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push('/technical/approvals')}
                      >
                        Review
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
