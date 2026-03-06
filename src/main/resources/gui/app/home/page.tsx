'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, ShoppingBag, Package, Ticket, LayoutDashboard, ArrowRight, Tag } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useAuthStore, useCurrencyStore } from '@/lib/store';
import { garmentApi } from '@/lib/api';
import { formatPrice } from '@/lib/currency';
import type { Garment } from '@/types';

const CATEGORIES = [
  { key: 'mens',     label: "Men's",          emoji: '👔', color: 'from-blue-900/40 to-blue-800/20' },
  { key: 'womens',   label: "Women's",        emoji: '👗', color: 'from-pink-900/40 to-pink-800/20' },
  { key: 'kids',     label: 'Kids',           emoji: '🧒', color: 'from-yellow-900/40 to-yellow-800/20' },
  { key: 'gym',      label: 'Gym',            emoji: '💪', color: 'from-green-900/40 to-green-800/20' },
  { key: 'couple',   label: 'Couple',         emoji: '💑', color: 'from-red-900/40 to-red-800/20' },
  { key: 'seasonal', label: 'Seasonal',       emoji: '🍂', color: 'from-orange-900/40 to-orange-800/20' },
];

const OFFERS = [
  { title: 'New Arrivals',       sub: 'Fresh drops this week',        badge: 'NEW',       gradient: 'from-gold/30 to-amber-900/20' },
  { title: 'Bundle & Save',      sub: 'Buy 3 get 10% off',           badge: '10% OFF',   gradient: 'from-blue-900/40 to-blue-800/20' },
  { title: 'Free Shipping',      sub: 'On orders above ₹1,999',      badge: 'FREE SHIP', gradient: 'from-green-900/40 to-green-800/20' },
];

interface FeaturedGroups {
  mens:   Garment[];
  womens: Garment[];
  kids:   Garment[];
}

export default function HomePage() {
  const router   = useRouter();
  const user     = useAuthStore((s) => s.user);
  const currency = useCurrencyStore(useShallow((s) => ({ code: s.code, symbol: s.symbol, rate: s.rate })));

  const [query,    setQuery]    = useState('');
  const [featured, setFeatured] = useState<FeaturedGroups>({ mens: [], womens: [], kids: [] });
  const [loading,  setLoading]  = useState(true);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) { router.replace('/auth/login'); return; }
    if (user.role & 2) { router.replace('/admin/inventory'); return; }
    if (user.role & 4) { router.replace('/tech'); return; }
    if (user.role & 8) { router.replace('/support'); return; }

    garmentApi.getFeatured()
      .then((r) => setFeatured(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, router]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) router.push(`/shop?search=${encodeURIComponent(query.trim())}`);
  }

  const allFeatured = [
    ...featured.mens,
    ...featured.womens,
    ...featured.kids,
  ].slice(0, 9);

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-5xl mx-auto">

        {/* ── Hero ──────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10 pt-6"
        >
          <p className="text-gold text-xs tracking-[0.35em] uppercase mb-3">
            Welcome back{user ? `, ${user.username}` : ''}
          </p>
          <h1 className="text-4xl sm:text-5xl font-black mb-3 leading-tight">
            Discover Your<br />
            <span className="text-gold">Perfect Style</span>
          </h1>
          <p className="text-white/40 text-sm mb-8 max-w-md mx-auto">
            Premium garments crafted for every occasion. Shop new arrivals and exclusive collections.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="max-w-lg mx-auto flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for hoodies, joggers, polo shirts…"
                className="w-full bg-surface border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-gold/60 placeholder:text-white/25"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-3 bg-gold text-black font-bold text-sm rounded-2xl hover:bg-gold/90 transition-colors shrink-0"
            >
              Search
            </button>
          </form>
        </motion.div>

        {/* ── Category Quick-Links ──────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs text-gold tracking-[0.25em] uppercase font-medium">Shop by Category</h2>
            <Link href="/shop" className="text-xs text-white/40 hover:text-white flex items-center gap-1 transition-colors">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {CATEGORIES.map(({ key, label, emoji, color }, idx) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.12 + idx * 0.04 }}
              >
                <Link
                  href={`/shop?type=${key}`}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl bg-gradient-to-b ${color} border border-white/10 hover:border-gold/40 transition-all group`}
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">{emoji}</span>
                  <span className="text-xs font-medium text-white/70 group-hover:text-white transition-colors">{label}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── Offers Strip ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10"
        >
          {OFFERS.map(({ title, sub, badge, gradient }) => (
            <div
              key={title}
              className={`flex items-center gap-4 px-5 py-4 rounded-2xl bg-gradient-to-r ${gradient} border border-white/10`}
            >
              <div>
                <span className="text-[10px] text-gold font-bold tracking-wider">{badge}</span>
                <p className="text-sm font-bold text-white">{title}</p>
                <p className="text-xs text-white/40">{sub}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* ── Featured Products ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
          className="mb-10"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xs text-gold tracking-[0.25em] uppercase font-medium">Featured Products</h2>
            <Link href="/shop" className="text-xs text-white/40 hover:text-white flex items-center gap-1 transition-colors">
              Shop all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-surface border border-white/10 rounded-2xl h-40 animate-pulse" />
              ))}
            </div>
          ) : allFeatured.length === 0 ? (
            <div className="text-center py-12 text-white/30 text-sm border border-white/10 rounded-2xl">
              No featured products yet.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {allFeatured.map((g, idx) => (
                <motion.div
                  key={g.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + idx * 0.05 }}
                >
                  <Link href={`/shop?search=${encodeURIComponent(g.name)}`} className="block bg-surface border border-white/10 rounded-2xl p-4 hover:border-gold/40 transition-all group">
                    <div className="mb-3 flex justify-center">
                      {g.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={g.imageUrl} alt={g.name} className="w-20 h-20 rounded-xl object-cover border border-white/10" />
                      ) : (
                        <span className="text-3xl">👕</span>
                      )}
                    </div>
                    <p className="text-sm font-bold text-white/90 line-clamp-1 group-hover:text-gold transition-colors">
                      {g.name}
                    </p>
                    <p className="text-xs text-white/40 mt-0.5 capitalize">{g.type ?? g.garmentType}</p>
                    <p className="text-gold font-black text-sm mt-2">
                      {formatPrice(g.basePrice ?? 0, currency)}
                    </p>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* ── Quick Actions ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-xs text-gold tracking-[0.25em] uppercase font-medium mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { href: '/cart',      icon: ShoppingBag,    label: 'My Cart',      desc: 'View your cart' },
              { href: '/orders',    icon: Package,        label: 'My Orders',    desc: 'Track your orders' },
              { href: '/tickets',   icon: Ticket,         label: 'Raise Ticket', desc: 'Get support' },
              { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard',  desc: 'Account overview' },
            ].map(({ href, icon: Icon, label, desc }) => (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center text-center gap-2 p-4 bg-surface border border-white/10 rounded-2xl hover:border-gold/40 hover:bg-gold/5 transition-all group"
              >
                <Icon className="w-5 h-5 text-gold/70 group-hover:text-gold transition-colors" />
                <span className="text-sm font-bold text-white/80 group-hover:text-white transition-colors">{label}</span>
                <span className="text-xs text-white/30">{desc}</span>
              </Link>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
