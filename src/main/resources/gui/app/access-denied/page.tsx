'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShieldOff, Home, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/lib/store';

export default function AccessDeniedPage() {
  const user = useAuthStore((s) => s.user);

  const homeLink = !user
    ? '/'
    : (user.role & 2) ? '/admin/dashboard'
    : (user.role & 4) ? '/tech/dashboard'
    : (user.role & 8) ? '/support/dashboard'
    : '/home';

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <ShieldOff className="w-10 h-10 text-red-400" />
        </div>

        <p className="text-red-400 text-xs tracking-[0.3em] uppercase mb-2">403 Forbidden</p>
        <h1 className="text-3xl font-black mb-3">Access Denied</h1>
        <p className="text-white/40 text-sm leading-relaxed mb-8">
          You don&apos;t have permission to view this page.
          {user
            ? ' Please contact an administrator if you believe this is an error.'
            : ' Please sign in with the appropriate account.'}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={homeLink}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gold text-black font-bold rounded-xl hover:bg-gold/90 transition-colors text-sm"
          >
            <Home className="w-4 h-4" /> Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 px-5 py-2.5 border border-white/20 rounded-xl text-white/60 hover:text-white hover:border-white/40 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
        </div>
      </motion.div>
    </div>
  );
}
