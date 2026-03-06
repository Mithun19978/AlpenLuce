'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';

export default function AdminPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!user) { router.replace('/auth/login'); return; }
    if (!(user.role & 2)) { router.replace('/access-denied'); return; }
    router.replace('/admin/dashboard');
  }, [user, router]);

  return null;
}
