'use client';

import { useEffect } from 'react';
import { useCurrencyStore } from '@/lib/store';
import { detectCurrency } from '@/lib/currency';

/**
 * Invisible component mounted once at the root.
 * On first render it detects the user's country via browser geolocation,
 * fetches the live INR → local currency exchange rate, and stores the result
 * in useCurrencyStore so every page can render prices in the visitor's currency.
 */
export default function CurrencyDetector() {
  const detected    = useCurrencyStore((s) => s.detected);
  const setCurrency = useCurrencyStore((s) => s.setCurrency);

  useEffect(() => {
    if (detected) return;
    detectCurrency().then(setCurrency).catch(() => {/* keep default EUR */});
  }, []); // run once on mount

  return null;
}
