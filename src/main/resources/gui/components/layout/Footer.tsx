import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#080808] border-t border-white/8 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          {/* Brand */}
          <div>
            <span className="text-gold font-black text-xl">AlpenLuce</span>
            <p className="text-white/30 text-sm mt-2 leading-relaxed max-w-xs">
              Premium custom clothing, crafted to your design. Every piece is unique.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-white/50 text-xs tracking-widest uppercase mb-3">Navigation</p>
            <div className="space-y-2">
              {[
                { href: '/', label: 'Home' },
                { href: '/customize', label: 'Customize' },
                { href: '/auth/login', label: 'Sign In' },
                { href: '/auth/register', label: 'Register' },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="block text-sm text-white/40 hover:text-white transition-colors"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Policy */}
          <div className="border border-gold/20 rounded-xl p-4 bg-gold/3">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-gold" />
              <p className="text-gold text-xs font-bold tracking-wider uppercase">Return Policy</p>
            </div>
            <p className="text-white/40 text-xs leading-relaxed">
              All sales are final. We do not accept returns on custom orders. If you experience a
              quality issue, damage, or receive the wrong item, please open a support ticket and
              our team will investigate.
            </p>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-white/20 text-xs">
            &copy; {new Date().getFullYear()} AlpenLuce. All rights reserved.
          </p>
          <p className="text-white/20 text-xs">
            Premium Custom Clothing Platform
          </p>
        </div>
      </div>
    </footer>
  );
}
