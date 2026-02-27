'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';
import { useAuthStore } from '@/lib/store';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/customize', label: 'Customize' },
];

export default function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setProfileOpen(false);
    router.push('/auth/login');
  };

  const getDashboardPath = () => {
    if (!user) return '/auth/login';
    if (user.role & 2) return '/admin';
    if (user.role & 4) return '/technical';
    if (user.role & 8) return '/support';
    return '/dashboard';
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/8">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <span className="text-gold font-black text-xl tracking-tight">AlpenLuce</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-sm text-white/60 hover:text-white transition-colors font-medium"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Auth section */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-gold" />
                </div>
                <span className="font-medium">{user.username}</span>
                <ChevronDown className="w-3.5 h-3.5 text-white/40" />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-10 w-44 bg-[#111] border border-white/10 rounded-xl shadow-xl overflow-hidden"
                  >
                    <Link
                      href={getDashboardPath()}
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white/70 hover:text-red-400 hover:bg-red-500/5 transition-colors border-t border-white/5"
                    >
                      <LogOut className="w-4 h-4" /> Sign out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-sm text-white/60 hover:text-white transition-colors font-medium"
              >
                Sign in
              </Link>
              <Link
                href="/auth/register"
                className="text-sm bg-gold text-black font-bold px-4 py-2 rounded-lg hover:bg-gold/90 transition-colors"
              >
                Get started
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-white/60 hover:text-white transition-colors"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-black border-t border-white/8 px-4 py-4 space-y-3"
          >
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="block text-sm text-white/60 hover:text-white py-2 transition-colors"
              >
                {label}
              </Link>
            ))}
            {user ? (
              <>
                <Link
                  href={getDashboardPath()}
                  onClick={() => setMenuOpen(false)}
                  className="block text-sm text-white/60 hover:text-white py-2 transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => { handleLogout(); setMenuOpen(false); }}
                  className="block text-sm text-red-400 py-2 transition-colors"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                href="/auth/login"
                onClick={() => setMenuOpen(false)}
                className="block text-sm text-gold font-medium py-2"
              >
                Sign in
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
