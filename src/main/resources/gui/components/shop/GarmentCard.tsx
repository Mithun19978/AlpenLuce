'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import type { Garment } from '@/types';

interface Props {
  garment: Garment;
}

export default function GarmentCard({ garment }: Props) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group relative bg-surface border border-white/10 rounded-2xl overflow-hidden hover:border-gold/40 transition-colors"
    >
      {/* Image placeholder */}
      <div className="h-48 bg-gradient-to-br from-white/5 to-white/10 flex items-center justify-center">
        <span className="text-5xl">{garment.garmentType === 'hoodie' ? '🧥' : '👕'}</span>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-base mb-1">{garment.name}</h3>
        <p className="text-white/40 text-xs mb-3 line-clamp-2">{garment.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-gold font-bold text-lg">
            ${(garment.basePrice / 100).toFixed(2)}
          </span>
          <span className="text-white/30 text-xs capitalize bg-white/5 px-2 py-1 rounded">
            {garment.garmentType}
          </span>
        </div>
      </div>

      {/* Hover overlay */}
      <Link
        href="/customize"
        className="absolute inset-0 flex items-center justify-center bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <span className="bg-gold text-black font-bold text-sm px-6 py-2.5 rounded-full shadow-gold">
          Customize →
        </span>
      </Link>
    </motion.div>
  );
}
