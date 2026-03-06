// ── Currency detection & formatting ──────────────────────────────────────────
// Detects user location via browser geolocation → free reverse-geocode →
// fetches live INR exchange rate. Falls back to EUR if anything fails.

export interface Currency {
  code:   string; // 'USD', 'EUR', 'INR', …
  symbol: string; // '$', '€', '₹', …
  rate:   number; // 1 INR = X of this currency
}

export const DEFAULT_CURRENCY: Currency = { code: 'EUR', symbol: '€', rate: 0.011 };

// Country-code → currency info (comprehensive world map)
const CC_TO_CURRENCY: Record<string, { code: string; symbol: string }> = {
  // South Asia
  IN: { code: 'INR', symbol: '₹' },
  PK: { code: 'PKR', symbol: '₨' },
  BD: { code: 'BDT', symbol: '৳' },
  LK: { code: 'LKR', symbol: 'Rs' },
  NP: { code: 'NPR', symbol: 'Rs' },
  // Americas
  US: { code: 'USD', symbol: '$' }, PR: { code: 'USD', symbol: '$' },
  CA: { code: 'CAD', symbol: 'C$' },
  MX: { code: 'MXN', symbol: 'MX$' },
  BR: { code: 'BRL', symbol: 'R$' },
  AR: { code: 'ARS', symbol: '$' },
  CL: { code: 'CLP', symbol: '$' },
  CO: { code: 'COP', symbol: '$' },
  // Europe (non-euro)
  GB: { code: 'GBP', symbol: '£' },
  CH: { code: 'CHF', symbol: 'Fr.' },
  NO: { code: 'NOK', symbol: 'kr' },
  SE: { code: 'SEK', symbol: 'kr' },
  DK: { code: 'DKK', symbol: 'kr' },
  PL: { code: 'PLN', symbol: 'zł' },
  CZ: { code: 'CZK', symbol: 'Kč' },
  HU: { code: 'HUF', symbol: 'Ft' },
  RO: { code: 'RON', symbol: 'lei' },
  HR: { code: 'EUR', symbol: '€' }, // Croatia joined Eurozone 2023
  UA: { code: 'UAH', symbol: '₴' },
  // Eurozone
  DE: { code: 'EUR', symbol: '€' }, FR: { code: 'EUR', symbol: '€' },
  IT: { code: 'EUR', symbol: '€' }, ES: { code: 'EUR', symbol: '€' },
  NL: { code: 'EUR', symbol: '€' }, BE: { code: 'EUR', symbol: '€' },
  AT: { code: 'EUR', symbol: '€' }, FI: { code: 'EUR', symbol: '€' },
  PT: { code: 'EUR', symbol: '€' }, GR: { code: 'EUR', symbol: '€' },
  IE: { code: 'EUR', symbol: '€' }, LU: { code: 'EUR', symbol: '€' },
  SK: { code: 'EUR', symbol: '€' }, SI: { code: 'EUR', symbol: '€' },
  EE: { code: 'EUR', symbol: '€' }, LV: { code: 'EUR', symbol: '€' },
  LT: { code: 'EUR', symbol: '€' }, MT: { code: 'EUR', symbol: '€' },
  CY: { code: 'EUR', symbol: '€' },
  // East Asia
  JP: { code: 'JPY', symbol: '¥' },
  CN: { code: 'CNY', symbol: '¥' },
  KR: { code: 'KRW', symbol: '₩' },
  HK: { code: 'HKD', symbol: 'HK$' },
  TW: { code: 'TWD', symbol: 'NT$' },
  // Southeast Asia
  SG: { code: 'SGD', symbol: 'S$' },
  MY: { code: 'MYR', symbol: 'RM' },
  TH: { code: 'THB', symbol: '฿' },
  ID: { code: 'IDR', symbol: 'Rp' },
  PH: { code: 'PHP', symbol: '₱' },
  VN: { code: 'VND', symbol: '₫' },
  // Middle East
  AE: { code: 'AED', symbol: 'AED' },
  SA: { code: 'SAR', symbol: 'SR' },
  QA: { code: 'QAR', symbol: 'QR' },
  KW: { code: 'KWD', symbol: 'KD' },
  BH: { code: 'BHD', symbol: 'BD' },
  OM: { code: 'OMR', symbol: 'OMR' },
  IL: { code: 'ILS', symbol: '₪' },
  TR: { code: 'TRY', symbol: '₺' },
  // Oceania
  AU: { code: 'AUD', symbol: 'A$' },
  NZ: { code: 'NZD', symbol: 'NZ$' },
  // Africa
  ZA: { code: 'ZAR', symbol: 'R' },
  NG: { code: 'NGN', symbol: '₦' },
  EG: { code: 'EGP', symbol: 'E£' },
  KE: { code: 'KES', symbol: 'KSh' },
  GH: { code: 'GHS', symbol: 'GH₵' },
};

// These currencies have no sub-unit (no decimal places)
const ZERO_DECIMAL = new Set(['JPY', 'KRW', 'VND', 'IDR', 'CLP', 'HUF']);

// ── Exchange rate fetch ───────────────────────────────────────────────────────
async function fetchRate(code: string): Promise<number> {
  if (code === 'INR') return 1;
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/INR', {
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error('rate fetch failed');
    const data = await res.json() as { rates: Record<string, number> };
    const r = data.rates[code];
    return typeof r === 'number' && r > 0 ? r : 1;
  } catch {
    return 1; // safe fallback — display in INR-equivalent scale
  }
}

// ── Geolocation → currency ────────────────────────────────────────────────────
export async function detectCurrency(): Promise<Currency> {
  if (typeof window === 'undefined') return DEFAULT_CURRENCY;

  try {
    // 1. Get browser coordinates
    const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
      if (!navigator.geolocation) { reject(new Error('unavailable')); return; }
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        timeout: 7000,
        maximumAge: 3_600_000, // reuse cached GPS for 1 hour
      });
    });

    // 2. Reverse-geocode coordinates → country code (free, no key)
    const { latitude, longitude } = pos.coords;
    const geoRes = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
      { signal: AbortSignal.timeout(5000) },
    );
    if (!geoRes.ok) throw new Error('geocode failed');
    const geoData = await geoRes.json() as { countryCode?: string };
    const cc = geoData.countryCode ?? '';

    // 3. Map country → currency
    const info = CC_TO_CURRENCY[cc];
    if (!info) {
      const rate = await fetchRate('EUR');
      return { code: 'EUR', symbol: '€', rate };
    }

    // 4. Fetch live rate
    const rate = await fetchRate(info.code);
    return { ...info, rate };

  } catch {
    // Geolocation denied / unavailable / network error → default EUR
    const rate = await fetchRate('EUR');
    return { code: 'EUR', symbol: '€', rate };
  }
}

// ── Price formatter ───────────────────────────────────────────────────────────
export function formatPrice(inrAmount: number, currency: Currency): string {
  if (currency.code === 'INR') {
    return `₹${Number(inrAmount).toLocaleString('en-IN')}`;
  }
  const amount = Number(inrAmount) * currency.rate;
  if (ZERO_DECIMAL.has(currency.code)) {
    return `${currency.symbol} ${Math.round(amount).toLocaleString()}`;
  }
  // Thousands separator + 2 decimal places
  return `${currency.symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
