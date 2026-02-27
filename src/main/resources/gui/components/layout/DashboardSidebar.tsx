'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

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

  return (
    <aside className="w-56 shrink-0 hidden lg:block">
      <div className="sticky top-24 bg-surface border border-white/10 rounded-2xl p-4">
        <p className="text-gold text-xs tracking-widest uppercase font-medium px-2 mb-4">{title}</p>
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
      </div>
    </aside>
  );
}
