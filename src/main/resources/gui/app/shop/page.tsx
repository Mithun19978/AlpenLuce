'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShoppingBag, Scissors, Info } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { garmentApi } from '@/lib/api';
import type { Garment } from '@/types';

// ── section definitions ────────────────────────────────────────────────────
const SECTIONS = [
  { key: 'mens',   label: "Men's Wear",   emoji: '👔' },
  { key: 'womens', label: "Women's Wear", emoji: '👗' },
  { key: 'kids',   label: 'Kids Wear',    emoji: '🧸' },
] as const;

const TYPE_EMOJI: Record<string, string> = {
  tshirt: '👕', hoodie: '🧥', jogger: '👖', polo: '👔',
  sweatshirt: '🧣', tracksuit: '🏃',
};

const TYPE_LABEL: Record<string, string> = {
  tshirt: 'T-Shirt', hoodie: 'Hoodie', jogger: 'Jogger', polo: 'Polo',
  sweatshirt: 'Sweatshirt', tracksuit: 'Tracksuit',
};

// ── coming-soon categories (no garments yet) ──────────────────────────────
const COMING_SOON = [
  { emoji: '💪', label: 'Gym & Activewear' },
  { emoji: '❤️',  label: 'Couple Collection' },
  { emoji: '🌸', label: 'Seasonal Collection' },
  { emoji: '✨', label: 'New Arrivals' },
  { emoji: '🔥', label: 'Best Sellers' },
];

export default function ShopPage() {
  const router  = useRouter();
  const user    = useAuthStore((s) => s.user);

  const [garments, setGarments] = useState<Garment[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    garmentApi.shopAll()
      .then((r) => setGarments(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, router]);

  return (
    <div className="min-h-screen pt-24 px-4 pb-16">
      <div className="max-w-5xl mx-auto">

        {/* ── header ─────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <p className="text-gold text-xs tracking-[0.3em] uppercase mb-1">Catalogue</p>
          <h1 className="text-3xl font-black flex items-center gap-3">
            <ShoppingBag className="w-7 h-7 text-gold" /> Shop
          </h1>
          <p className="text-white/40 text-sm mt-2">
            Pick a garment model below, then customize it in our 3D studio.
          </p>
        </motion.div>

        {loading ? (
          <p className="text-white/30 text-center py-20">Loading catalogue…</p>
        ) : (
          <div className="space-y-12">

            {/* ── garment sections ──────────────────────── */}
            {SECTIONS.map(({ key, label, emoji }, sIdx) => {
              const items = garments.filter((g) => g.category === key);
              if (items.length === 0) return null;
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: sIdx * 0.1 }}
                >
                  {/* section header */}
                  <div className="flex items-center gap-2 mb-5">
                    <span className="text-2xl">{emoji}</span>
                    <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-gold">{label}</h2>
                    <span className="text-white/20 text-xs ml-1">{items.length} model{items.length !== 1 ? 's' : ''}</span>
                  </div>

                  {/* garment cards grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((g, gIdx) => (
                      <motion.div
                        key={g.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: sIdx * 0.1 + gIdx * 0.05 }}
                        className="group bg-surface border border-white/10 rounded-2xl p-5 flex flex-col gap-4 hover:border-gold/25 transition-all"
                      >
                        {/* icon + type badge */}
                        <div className="flex items-start justify-between">
                          <span className="text-4xl">{TYPE_EMOJI[g.garmentType] ?? '👕'}</span>
                          {g.garmentType && (
                            <span className="text-xs px-2 py-0.5 rounded-full border border-white/10 text-white/30">
                              {TYPE_LABEL[g.garmentType] ?? g.garmentType}
                            </span>
                          )}
                        </div>

                        {/* name + description */}
                        <div className="flex-1">
                          <p className="font-bold text-sm leading-snug">{g.name}</p>
                          {g.description && (
                            <p className="text-white/35 text-xs mt-1 line-clamp-2 leading-relaxed">
                              {g.description}
                            </p>
                          )}
                          {g.gsm && (
                            <p className="text-white/25 text-xs mt-1">{g.gsm} GSM</p>
                          )}
                        </div>

                        {/* price + CTA */}
                        <div className="flex items-center justify-between pt-2 border-t border-white/5">
                          <span className="text-gold font-black text-sm">
                            ₹{g.basePrice.toLocaleString('en-IN')}
                          </span>
                          <Link
                            href={`/customize?garmentId=${g.id}`}
                            className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 bg-gold text-black rounded-xl hover:bg-gold/90 transition-colors group-hover:scale-105"
                          >
                            <Scissors className="w-3.5 h-3.5" /> Customize
                          </Link>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              );
            })}

            {/* ── coming soon ───────────────────────────── */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Info className="w-4 h-4 text-white/20" />
                <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-white/30">More Collections Coming Soon</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                {COMING_SOON.map(({ emoji, label }) => (
                  <div
                    key={label}
                    className="flex items-center gap-2 px-4 py-2 bg-surface border border-white/5 rounded-full text-sm text-white/25"
                  >
                    <span>{emoji}</span>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </motion.div>

          </div>
        )}
      </div>
    </div>
  );
}
