'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Users, Search, Shield } from 'lucide-react';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useAuthStore } from '@/lib/store';
import { userApi } from '@/lib/api';
import type { User } from '@/types';
import { LayoutDashboard, Activity, Ticket } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/activity', label: 'Activity Logs', icon: Activity },
  { href: '/admin/tickets', label: 'Escalated Tickets', icon: Ticket },
];

const ROLE_LABELS: Record<number, string> = {
  1: 'USER',
  2: 'ADMIN',
  4: 'TECHNICAL',
  8: 'SUPPORT',
};

export default function AdminUsersPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [changingRole, setChangingRole] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    if (!(user.role & 2)) { router.push('/dashboard'); return; }
    userApi.getAll()
      .then((r) => setUsers(r.data))
      .catch(() => setError('Failed to load users.'))
      .finally(() => setLoading(false));
  }, [user, router]);

  const handleRoleChange = async (userId: number, newRole: number) => {
    setChangingRole(userId);
    try {
      await userApi.changeRole(userId, newRole);
      setUsers((u) => u.map((usr) => usr.id === userId ? { ...usr, role: newRole } : usr));
    } catch {
      setError('Failed to change role.');
    } finally {
      setChangingRole(null);
    }
  };

  const filtered = users.filter(
    (u) =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen pt-20 px-4 pb-12">
      <div className="max-w-6xl mx-auto flex gap-6">
        <DashboardSidebar title="Admin Panel" items={NAV_ITEMS} />

        <div className="flex-1 min-w-0">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <p className="text-gold text-xs tracking-[0.3em] uppercase mb-1">Admin</p>
            <h1 className="text-2xl font-black flex items-center gap-3">
              <Users className="w-6 h-6 text-gold" /> User Management
            </h1>
          </motion.div>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users…"
              className="w-full bg-surface border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors"
            />
          </div>

          {loading ? (
            <p className="text-white/30 text-center py-16">Loading…</p>
          ) : (
            <div className="bg-surface border border-white/10 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-white/40 text-xs uppercase tracking-wider">
                    <th className="px-5 py-3 text-left">User</th>
                    <th className="px-5 py-3 text-left hidden md:table-cell">Mobile</th>
                    <th className="px-5 py-3 text-left">Role</th>
                    <th className="px-5 py-3 text-left">Status</th>
                    <th className="px-5 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => (
                    <tr key={u.id} className="border-b border-white/5 last:border-0 hover:bg-white/2">
                      <td className="px-5 py-4">
                        <p className="font-medium">{u.username}</p>
                        <p className="text-white/40 text-xs">{u.email}</p>
                      </td>
                      <td className="px-5 py-4 text-white/50 hidden md:table-cell">
                        {u.mobileNumber}
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-gold font-mono text-xs">
                          {ROLE_LABELS[u.role] ?? `role=${u.role}`}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <Badge
                          label={u.active === 'Y' ? 'Active' : 'Inactive'}
                          color={u.active === 'Y' ? 'green' : 'gray'}
                        />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2 flex-wrap">
                          {[1, 2, 4, 8].filter((r) => r !== u.role).map((r) => (
                            <button
                              key={r}
                              disabled={changingRole === u.id}
                              onClick={() => handleRoleChange(u.id, r)}
                              className="text-xs text-white/40 hover:text-gold transition-colors border border-white/10 hover:border-gold/30 px-2 py-1 rounded"
                            >
                              → {ROLE_LABELS[r]}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <p className="text-white/30 text-center py-10 text-sm">No users found.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
