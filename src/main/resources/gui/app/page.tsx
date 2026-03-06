'use client';

import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, Sparkles, ShoppingCart, ShoppingBag, Shield } from 'lucide-react';
import Button from '@/components/ui/Button';
import { garmentApi } from '@/lib/api';
import { useShallow } from 'zustand/react/shallow';
import { useCurrencyStore } from '@/lib/store';
import { formatPrice } from '@/lib/currency';
import type { Garment } from '@/types';

const features = [
  {
    icon: ShoppingCart,
    title: 'Easy Shopping',
    desc: 'Browse our premium catalogue, pick your size, and add to cart in seconds.',
  },
  {
    icon: Sparkles,
    title: 'Premium Quality',
    desc: 'Every garment is crafted from curated fabrics. Your style, our craftsmanship.',
  },
  {
    icon: ShoppingBag,
    title: 'Seamless Ordering',
    desc: 'From browse to delivery, a frictionless experience built for you.',
  },
  {
    icon: Shield,
    title: 'Secure Checkout',
    desc: 'Multiple payment options with a smooth, secure checkout flow.',
  },
];

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

interface FeaturedData {
  mens:   Garment[];
  womens: Garment[];
  kids:   Garment[];
}

const GENDER_SECTIONS = [
  { key: 'mens'   as const, label: "Men's Collection",   emoji: '👔', limit: 4 },
  { key: 'womens' as const, label: "Women's Collection", emoji: '👗', limit: 4 },
  { key: 'kids'   as const, label: "Kids' Collection",   emoji: '👕', limit: 4 },
];

function GarmentCard({ g }: { g: Garment }) {
  const currency = useCurrencyStore(useShallow((s) => ({ code: s.code, symbol: s.symbol, rate: s.rate })));
  return (
    <motion.div
      variants={fadeUp}
      className="group relative bg-surface border border-white/10 rounded-2xl overflow-hidden hover:border-gold/40 transition-all cursor-pointer"
    >
      <div className="h-48 bg-gradient-to-br from-white/5 to-white/10 flex flex-col items-center justify-center gap-2 overflow-hidden">
        {g.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={g.imageUrl} alt={g.name} className="w-full h-full object-cover" />
        ) : (
          <>
            <span className="text-4xl">👕</span>
            {g.baseColor && (
              <span className="text-xs text-white/30">{g.baseColor}</span>
            )}
          </>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-bold text-sm leading-tight">{g.name}</h3>
          {g.type && (
            <span className="shrink-0 text-[10px] bg-gold/10 text-gold px-2 py-0.5 rounded-full">
              {g.type}
            </span>
          )}
        </div>
        <p className="text-white/40 text-xs mb-3 line-clamp-2">{g.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-gold font-bold text-sm">
            {formatPrice(g.basePrice, currency)}
          </span>
          {g.gsm && (
            <span className="text-white/25 text-xs">{g.gsm} GSM</span>
          )}
        </div>
      </div>
      <Link
        href={`/shop?search=${encodeURIComponent(g.name)}`}
        className="absolute inset-0 flex items-center justify-center bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <span className="bg-gold text-black font-bold text-sm px-5 py-2 rounded-full">
          Shop Now
        </span>
      </Link>
    </motion.div>
  );
}

function PlaceholderCard({ label }: { label: string }) {
  return (
    <motion.div
      variants={fadeUp}
      className="bg-surface border border-white/5 rounded-2xl overflow-hidden opacity-40"
    >
      <div className="h-48 flex items-center justify-center">
        <span className="text-4xl">🧵</span>
      </div>
      <div className="p-4">
        <p className="text-white/30 text-sm font-medium">{label}</p>
        <p className="text-white/15 text-xs mt-1">Coming soon</p>
      </div>
    </motion.div>
  );
}

export default function LandingPage() {
  const [featured, setFeatured] = useState<FeaturedData | null>(null);
  const currency = useCurrencyStore(useShallow((s) => ({ code: s.code, symbol: s.symbol, rate: s.rate })));

  useEffect(() => {
    garmentApi.getFeatured()
      .then((r) => setFeatured(r.data))
      .catch(() => {});
  }, []);

  const hasFeatured =
    featured &&
    (featured.mens.length > 0 || featured.womens.length > 0 || featured.kids.length > 0);

  return (
    <div className="overflow-x-hidden">
      {/* ─── Hero ─────────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center min-h-screen text-center px-6 pt-24 pb-16">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/10 rounded-full blur-[120px]" />
        </div>

        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="relative z-10 max-w-4xl mx-auto"
        >
          <motion.p variants={fadeUp} className="text-gold text-sm tracking-[0.3em] uppercase font-medium mb-4">
            Premium Custom Clothing
          </motion.p>

          <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-black leading-[1.05] mb-6">
            Wear Your{' '}
            <span className="text-gold relative">
              Vision
              <span className="absolute -bottom-1 left-0 right-0 h-px bg-gold/50" />
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            AlpenLuce brings you premium garments crafted with care. Browse our collection, choose your size, and order — we handle the rest.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/shop">
              <Button variant="gold" size="lg" className="group">
                Shop Now
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" size="lg">Sign In</Button>
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
        >
          <span className="text-white/30 text-xs tracking-widest uppercase">Scroll</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.4 }}
            className="w-px h-8 bg-gradient-to-b from-gold/60 to-transparent"
          />
        </motion.div>
      </section>

      {/* ─── Features ─────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-surface/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3">Why AlpenLuce</p>
            <h2 className="text-3xl md:text-5xl font-black">Crafted for Creators</h2>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {features.map(({ icon: Icon, title, desc }) => (
              <motion.div
                key={title}
                variants={fadeUp}
                className="bg-surface border border-white/10 rounded-2xl p-6 hover:border-gold/40 transition-colors group"
              >
                <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-gold/20 transition-colors">
                  <Icon className="w-5 h-5 text-gold" />
                </div>
                <h3 className="font-bold text-lg mb-2">{title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Featured Products (4 Men · 4 Women · 2 Kids) ─────────── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-6"
          >
            <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3">Featured Collection</p>
            <h2 className="text-3xl md:text-5xl font-black">Featured Collection</h2>
            <p className="text-white/50 mt-4 max-w-xl mx-auto">
              Explore our curated premium garments and find what suits your style.
            </p>
          </motion.div>

          {GENDER_SECTIONS.map(({ key, label, emoji, limit }) => {
            const items = featured?.[key] ?? [];
            const placeholders = Math.max(0, limit - items.length);

            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mt-12"
              >
                {/* section header */}
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-2xl">{emoji}</span>
                  <h3 className="text-xl font-black">{label}</h3>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                <motion.div
                  variants={stagger}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                  {items.map((g) => (
                    <GarmentCard key={g.id} g={g} />
                  ))}
                  {Array.from({ length: placeholders }).map((_, i) => (
                    <PlaceholderCard key={`ph-${key}-${i}`} label="Coming Soon" />
                  ))}
                </motion.div>
              </motion.div>
            );
          })}

          <div className="text-center mt-12">
            <Link href="/shop">
              <Button variant="outline">Browse Full Collection</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center bg-surface border border-gold/30 rounded-3xl p-12 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gold/5 pointer-events-none" />
          <p className="text-gold text-xs tracking-[0.3em] uppercase mb-4">Get Started Today</p>
          <h2 className="text-4xl font-black mb-4">Your Wardrobe Awaits</h2>
          <p className="text-white/50 mb-8 max-w-lg mx-auto">
            Create an account, browse our collection, and get premium garments delivered to your door.
          </p>
          <Link href="/auth/register">
            <Button variant="gold" size="lg">Create Free Account</Button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
