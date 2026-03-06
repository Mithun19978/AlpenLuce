'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LucideIcon, ArrowLeft, LogOut } from 'lucide-react';
import { useAuthStore } from '@/lib/store';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface Props {
  title: string;
  items: NavItem[];
}

export default function DashboardSidebar({ title, items }: Props) {
  const pathname = usePathname();
  const router   = useRouter();
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  return (
    <aside className="w-56 shrink-0 hidden lg:block">
      <div className="sticky top-24 bg-surface border border-white/10 rounded-2xl p-4 flex flex-col gap-2">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-white/40 hover:text-white text-xs font-medium px-2 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>

        <p className="text-gold text-xs tracking-widest uppercase font-medium px-2 mt-2">{title}</p>

        <nav className="space-y-1">
          {items.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link key={href} href={href}>
                <motion.div
                  whileHover={{ x: 2 }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    active
                      ? 'bg-gold/15 text-gold border border-gold/30'
                      : 'text-white/50 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Sign out — always at bottom of sidebar */}
        <div className="mt-2 pt-2 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}
