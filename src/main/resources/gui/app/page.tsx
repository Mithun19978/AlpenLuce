'use client';

import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, Sparkles, Layers, ShoppingBag, Shield } from 'lucide-react';
import Button from '@/components/ui/Button';
import { garmentApi } from '@/lib/api';
import type { Garment } from '@/types';

const features = [
  {
    icon: Layers,
    title: '3D Customization',
    desc: 'Design every surface — front, back, left sleeve, right sleeve — with our real-time 3D viewer.',
  },
  {
    icon: Sparkles,
    title: 'Premium Quality',
    desc: 'Every garment is crafted from curated fabrics. Your design, our craftsmanship.',
  },
  {
    icon: ShoppingBag,
    title: 'Seamless Ordering',
    desc: 'From design to delivery, a frictionless experience built for creators.',
  },
  {
    icon: Shield,
    title: 'Expert Review',
    desc: 'Our technical team reviews every design before production to guarantee quality.',
  },
];

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55 } },
};

export default function LandingPage() {
  const [garments, setGarments] = useState<Garment[]>([]);

  useEffect(() => {
    garmentApi.getAll().then((r) => setGarments(r.data.slice(0, 4))).catch(() => {});
  }, []);

  return (
    <div className="overflow-x-hidden">
      {/* ─── Hero ─────────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center min-h-screen text-center px-6 pt-24 pb-16">
        {/* ambient glow */}
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

          <motion.h1
            variants={fadeUp}
            className="text-5xl md:text-7xl font-black leading-[1.05] mb-6"
          >
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
            AlpenLuce lets you design premium garments in real‑time 3D. Choose a base, place your artwork, submit — our team handles the rest.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/customize">
              <Button variant="gold" size="lg" className="group">
                Start Designing
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" size="lg">
                Sign In
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* scroll indicator */}
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

      {/* ─── Garment Showcase ─────────────────────────────────────── */}
      {garments.length > 0 && (
        <section className="py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3">Our Collection</p>
              <h2 className="text-3xl md:text-5xl font-black">Choose Your Canvas</h2>
              <p className="text-white/50 mt-4 max-w-xl mx-auto">
                Start with a premium base garment, then make it entirely yours.
              </p>
            </motion.div>

            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {garments.map((g) => (
                <motion.div
                  key={g.id}
                  variants={fadeUp}
                  className="group relative bg-surface border border-white/10 rounded-2xl overflow-hidden hover:border-gold/40 transition-all cursor-pointer"
                >
                  {/* placeholder image area */}
                  <div className="h-52 bg-gradient-to-br from-white/5 to-white/10 flex items-center justify-center">
                    <span className="text-5xl">👕</span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-base mb-1">{g.name}</h3>
                    <p className="text-white/40 text-xs mb-3 line-clamp-2">{g.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-gold font-bold">
                        ${(g.basePrice / 100).toFixed(2)}
                      </span>
                      <span className="text-white/30 text-xs capitalize">{g.garmentType}</span>
                    </div>
                  </div>
                  <Link
                    href="/customize"
                    className="absolute inset-0 flex items-center justify-center bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <span className="bg-gold text-black font-bold text-sm px-5 py-2 rounded-full">
                      Customize
                    </span>
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            <div className="text-center mt-10">
              <Link href="/customize">
                <Button variant="outline">View All Garments</Button>
              </Link>
            </div>
          </div>
        </section>
      )}

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
          <h2 className="text-4xl font-black mb-4">Your Design Awaits</h2>
          <p className="text-white/50 mb-8 max-w-lg mx-auto">
            Create an account, pick a garment, design it in 3D, and let us bring it to life.
          </p>
          <Link href="/auth/register">
            <Button variant="gold" size="lg">
              Create Free Account
            </Button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
