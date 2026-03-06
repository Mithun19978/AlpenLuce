'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TechPage() {
  const router = useRouter();
  useEffect(() => { router.replace('/tech/dashboard'); }, [router]);
  return null;
}
