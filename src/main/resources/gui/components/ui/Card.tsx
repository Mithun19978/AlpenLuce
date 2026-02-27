'use client';

import { motion } from 'framer-motion';
import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
}

export default function Card({ children, className, hoverable = false, onClick }: CardProps) {
  return (
    <motion.div
      whileHover={hoverable ? { y: -4 } : undefined}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={clsx(
        'bg-surface border border-white/10 rounded-2xl p-6',
        hoverable && 'cursor-pointer hover:border-gold/30 transition-colors',
        className
      )}
    >
      {children}
    </motion.div>
  );
}
