'use client';

import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'gold' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const variants = {
  gold: 'bg-gold text-black font-bold hover:bg-gold/90 shadow-gold-sm hover:shadow-gold',
  outline: 'border border-gold/50 text-gold hover:bg-gold/10 hover:border-gold',
  ghost: 'text-white/60 hover:text-white hover:bg-white/5',
  danger: 'bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20',
};

const sizes = {
  sm: 'text-xs px-3 py-1.5 rounded-lg',
  md: 'text-sm px-5 py-2.5 rounded-xl',
  lg: 'text-base px-7 py-3.5 rounded-xl',
};

export default function Button({
  variant = 'gold',
  size = 'md',
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      {...(props as object)}
    >
      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </motion.button>
  );
}
