'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((s) => s.login);

  useEffect(() => {
    const accessToken  = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    const username     = searchParams.get('username');
    const role         = Number(searchParams.get('role'));
    const error        = searchParams.get('error');

    if (error || !accessToken || !refreshToken || !username) {
      router.replace('/auth/login?error=oauth_failed');
      return;
    }

    login({ accessToken, refreshToken }, { username, role });

    if (role & 2)      router.replace('/admin');
    else if (role & 4) router.replace('/technical');
    else if (role & 8) router.replace('/support');
    else               router.replace('/dashboard');
  }, [searchParams, login, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/50 text-sm tracking-wide">Signing you in…</p>
      </div>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
