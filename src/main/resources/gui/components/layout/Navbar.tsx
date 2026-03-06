'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, User, LogOut, ShoppingBag, Package,
  LayoutDashboard, Ticket, Search, ChevronDown, UserCircle, ArrowLeft,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { useCartStore } from '@/lib/store';
import { publicCategoryApi } from '@/lib/api';
import type { Category } from '@/types';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  // Show back button on any page that is not a root/home page
  const HOME_PAGES = ['/', '/home'];
  const showBack = !HOME_PAGES.includes(pathname);
  const cartItems = useCartStore((s) => s.items);
  const [menuOpen, setMenuOpen] = useState(false);

  // Guest: categories + search state
  const [categories,  setCategories]  = useState<Category[]>([]);
  const [catOpen,     setCatOpen]     = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const catRef = useRef<HTMLDivElement>(null);

  // Customer: user dropdown
  const [userDropOpen, setUserDropOpen] = useState(false);
  const userDropRef = useRef<HTMLDivElement>(null);

  // Fetch top-level categories for guest navbar (public endpoint)
  useEffect(() => {
    if (!user) {
      publicCategoryApi.getActive()
        .then((r) => setCategories(r.data.filter((c: Category) => c.active && c.depth === 0)))
        .catch(() => {});
    }
  }, [user]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (catRef.current && !catRef.current.contains(e.target as Node)) setCatOpen(false);
      if (userDropRef.current && !userDropRef.current.contains(e.target as Node)) setUserDropOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = async () => {
    setMenuOpen(false);
    setUserDropOpen(false);
    await logout();
    router.push('/auth/login');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) router.push(`/shop?search=${encodeURIComponent(q)}`);
    setMenuOpen(false);
  };

  // Role helpers
  const isAdmin   = !!user && !!(user.role & 2);
  const isTech    = !!user && !!(user.role & 4) && !(user.role & 2);
  const isSupport = !!user && !!(user.role & 8) && !(user.role & 2) && !(user.role & 4);
  const isStaff   = isAdmin || isTech || isSupport;

  const staffLabel = isAdmin ? 'Admin' : isTech ? 'Technical' : 'Support';
  const staffHome  = isAdmin ? '/admin/dashboard' : isTech ? '/tech/dashboard' : '/support/dashboard';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0d0d0d] backdrop-blur-xl border-b border-white/15">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-3">

        {/* ── Back + Logo ───────────────────────────────────────── */}
        <div className="flex items-center gap-2 shrink-0">
          {showBack && (
            <button
              onClick={() => router.back()}
              className="p-1.5 text-white/30 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              title="Go back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <Link href={user ? (isStaff ? staffHome : '/home') : '/'}>
            <span className="text-gold font-black text-xl tracking-tight">AlpenLuce</span>
          </Link>
        </div>

        {/* ══════════════════════════════════════════════════════
            GUEST — Home + Shop links + Categories dropdown + Search bar
        ════════════════════════════════════════════════════════ */}
        {!user && (
          <div className="hidden md:flex items-center gap-3 flex-1">
            {/* Home + Shop links */}
            <Link href="/" className="text-sm text-white/60 hover:text-white font-medium transition-colors whitespace-nowrap">
              Home
            </Link>
            <Link href="/shop" className="text-sm text-white/60 hover:text-white font-medium transition-colors whitespace-nowrap">
              Shop
            </Link>
            {/* Categories dropdown */}
            <div className="relative" ref={catRef}>
              <button
                onClick={() => setCatOpen((v) => !v)}
                className="flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors font-medium py-2 px-1"
              >
                Categories
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${catOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {catOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-2 w-52 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-xl py-2 z-50"
                  >
                    {categories.length === 0 ? (
                      <p className="px-4 py-3 text-xs text-white/30">Loading…</p>
                    ) : (
                      categories.map((cat) => (
                        <Link
                          key={cat.id}
                          href={`/shop?category=${cat.id}`}
                          onClick={() => setCatOpen(false)}
                          className="block px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          {cat.name}
                        </Link>
                      ))
                    )}
                    <div className="border-t border-white/10 mt-1 pt-1">
                      <Link
                        href="/shop"
                        onClick={() => setCatOpen(false)}
                        className="block px-4 py-2.5 text-sm text-gold hover:text-gold/80 transition-colors"
                      >
                        Browse All →
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="flex-1 max-w-sm relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products…"
                className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:border-gold/50 transition-colors"
              />
            </form>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            CUSTOMER — nav links
        ════════════════════════════════════════════════════════ */}
        {user && !isStaff && (
          <nav className="hidden md:flex items-center gap-1 flex-1">
            {[
              { href: '/home',      label: 'Home' },
              { href: '/shop',      label: 'Shop' },
              { href: '/orders',    label: 'Orders' },
              { href: '/dashboard', label: 'Dashboard' },
            ].map(({ href, label }) => {
              const active = pathname === href || pathname.startsWith(href + '/');
              return (
                <Link
                  key={href}
                  href={href}
                  className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
                    active ? 'text-gold bg-gold/10' : 'text-white/55 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        )}

        {/* ══════════════════════════════════════════════════════
            RIGHT SECTION (desktop)
        ════════════════════════════════════════════════════════ */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          {user ? (
            isStaff ? (
              /* ── Staff ──────────────────────────────────── */
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold/10 border border-gold/30">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
                  </span>
                  <User className="w-3.5 h-3.5 text-gold" />
                  <span className="text-sm font-bold text-gold">{user.username}</span>
                  <span className="text-[10px] text-gold/50 uppercase tracking-widest border-l border-gold/20 pl-2">
                    {staffLabel}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold text-red-400 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 hover:border-red-500/50 rounded-xl transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </>
            ) : (
              /* ── Customer ────────────────────────────────── */
              <>
                {/* Cart — labeled button with badge */}
                <Link
                  href="/cart"
                  className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white/60 hover:border-gold/40 hover:text-white transition-colors"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Cart</span>
                  {cartItems.length > 0 && (
                    <span className="bg-gold text-black text-[10px] font-black px-1.5 py-0.5 rounded-full leading-none">
                      {cartItems.length > 9 ? '9+' : cartItems.length}
                    </span>
                  )}
                </Link>

                {/* Username dropdown — navigation */}
                <div className="relative" ref={userDropRef}>
                  <button
                    onClick={() => setUserDropOpen((v) => !v)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gold/10 border border-gold/30 hover:bg-gold/20 transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-gold" />
                    <span className="text-sm font-bold text-gold">{user.username}</span>
                    <ChevronDown className={`w-3 h-3 text-gold/60 transition-transform duration-200 ${userDropOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {userDropOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full right-0 mt-2 w-48 bg-[#0d0d0d] border border-white/10 rounded-xl shadow-xl py-2 z-50"
                      >
                        <Link href="/dashboard" onClick={() => setUserDropOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors">
                          <UserCircle className="w-4 h-4" /> My Profile
                        </Link>
                        <Link href="/orders" onClick={() => setUserDropOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors">
                          <Package className="w-4 h-4" /> Orders
                        </Link>
                        <Link href="/shop" onClick={() => setUserDropOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors">
                          <ShoppingBag className="w-4 h-4" /> Shop
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Sign Out — always visible */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold text-red-400 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 hover:border-red-500/50 rounded-xl transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </>
            )
          ) : (
            /* ── Guest right ─────────────────────────────── */
            <>
              <Link href="/cart" className="p-2 text-white/50 hover:text-white transition-colors" title="Cart">
                <ShoppingBag className="w-4 h-4" />
              </Link>
              <Link
                href="/auth/login"
                className="text-sm bg-gold text-black font-bold px-4 py-2 rounded-lg hover:bg-gold/90 transition-colors"
              >
                Sign In
              </Link>
            </>
          )}
        </div>

        {/* ── Mobile: user dot + hamburger ─────────────────────── */}
        <div className="md:hidden flex items-center gap-3">
          {user && (
            <span className="flex items-center gap-1.5 text-xs text-gold font-medium">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              {user.username}
            </span>
          )}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-white/60 hover:text-white transition-colors"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ── Mobile menu ──────────────────────────────────────────── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#0a0a0a] border-t border-white/10 px-4 py-4"
          >
            {user ? (
              <div className="space-y-2">
                {/* User info */}
                <div className="flex items-center gap-2 px-3 py-2 bg-gold/5 border border-gold/20 rounded-xl mb-3">
                  <span className="w-2 h-2 rounded-full bg-green-400" />
                  <User className="w-3.5 h-3.5 text-gold" />
                  <span className="text-sm font-bold text-gold">{user.username}</span>
                  <span className="ml-auto text-[10px] text-white/30 uppercase tracking-wider">
                    {isAdmin ? 'Admin' : isTech ? 'Tech' : isSupport ? 'Support' : 'Customer'}
                  </span>
                </div>

                {isStaff ? (
                  <Link
                    href={staffHome}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4" /> {staffLabel} Dashboard
                  </Link>
                ) : (
                  <>
                    <Link href="/home" onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                      Home
                    </Link>
                    <Link href="/shop" onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                      Shop
                    </Link>
                    <Link href="/cart" onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                      <ShoppingBag className="w-4 h-4" /> Cart
                      {cartItems.length > 0 && (
                        <span className="ml-auto text-xs text-gold font-bold">{cartItems.length}</span>
                      )}
                    </Link>
                    <Link href="/orders" onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                      <Package className="w-4 h-4" /> My Orders
                    </Link>
                    <Link href="/tickets" onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                      <Ticket className="w-4 h-4" /> Raise Ticket
                    </Link>
                    <Link href="/dashboard" onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </Link>
                  </>
                )}

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition-colors mt-2"
                >
                  <LogOut className="w-4 h-4" /> Sign out
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Mobile search */}
                <form onSubmit={handleSearch} className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products…"
                    className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:border-gold/50"
                  />
                </form>

                <Link href="/" onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 text-sm py-2.5 px-3 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                  🏠 Home
                </Link>
                <Link href="/shop" onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 text-sm py-2.5 px-3 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                  <ShoppingBag className="w-4 h-4" /> Shop
                </Link>

                {/* Mobile categories */}
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/shop?category=${cat.id}`}
                    onClick={() => setMenuOpen(false)}
                    className="block text-sm py-2 px-5 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  >
                    {cat.name}
                  </Link>
                ))}

                <div className="pt-2 space-y-2">
                  <Link href="/auth/login" onClick={() => setMenuOpen(false)}
                    className="block text-sm text-center py-2.5 px-4 border border-white/20 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-colors">
                    Sign in
                  </Link>
                  <Link href="/auth/register" onClick={() => setMenuOpen(false)}
                    className="block text-sm text-center py-2.5 px-4 bg-gold text-black font-bold rounded-lg hover:bg-gold/90 transition-colors">
                    Get started
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
