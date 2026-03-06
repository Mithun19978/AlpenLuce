'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { MapPin, ArrowRight, ShieldCheck } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useAuthStore, useCurrencyStore } from '@/lib/store';
import { cartApi, garmentApi, paymentApi } from '@/lib/api';
import { formatPrice } from '@/lib/currency';
import type { CartItem, Garment } from '@/types';

// Razorpay is loaded from CDN — declare window type
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: new (options: Record<string, unknown>) => { open(): void; on(evt: string, cb: () => void): void };
  }
}

/** Load Razorpay checkout.js once from CDN */
function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && window.Razorpay) { resolve(); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload  = () => resolve();
    script.onerror = () => reject(new Error('Razorpay SDK failed to load'));
    document.body.appendChild(script);
  });
}

export default function CheckoutPage() {
  const router = useRouter();
  const user     = useAuthStore((s) => s.user);
  const currency = useCurrencyStore(useShallow((s) => ({ code: s.code, symbol: s.symbol, rate: s.rate })));

  const [cart,     setCart]     = useState<CartItem[]>([]);
  const [garments, setGarments] = useState<Record<number, Garment>>({});
  const [loading,  setLoading]  = useState(true);
  const [paying,   setPaying]   = useState(false);
  const [error,    setError]    = useState('');

  // Shipping fields
  const [shippingName,    setShippingName]    = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingCity,    setShippingCity]    = useState('');
  const [shippingPincode, setShippingPincode] = useState('');
  const [shippingPhone,   setShippingPhone]   = useState('');

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    Promise.all([cartApi.getMine(), garmentApi.getAll()])
      .then(([cartRes, garmentRes]) => {
        const items: CartItem[] = cartRes.data;
        if (items.length === 0) { router.push('/cart'); return; }
        setCart(items);
        const map: Record<number, Garment> = {};
        (garmentRes.data as Garment[]).forEach((g) => { map[g.id] = g; });
        setGarments(map);
      })
      .catch(() => setError('Failed to load cart.'))
      .finally(() => setLoading(false));
  }, [user, router]);

  const total = cart.reduce(
    (sum, item) => sum + (garments[item.garmentId]?.basePrice ?? 0) * item.quantity,
    0,
  );

  const handlePay = async () => {
    if (!shippingName || !shippingAddress || !shippingCity || !shippingPincode || !shippingPhone) {
      setError('Please fill in all shipping fields.');
      return;
    }
    setPaying(true);
    setError('');

    try {
      // 1. Load Razorpay SDK
      await loadRazorpayScript();

      // 2. Create Razorpay order on backend
      const orderRes = await paymentApi.createOrder(total * 100); // INR → paise
      const { razorpayOrderId, amount, currency, keyId } = orderRes.data as {
        razorpayOrderId: string;
        amount: number;
        currency: string;
        keyId: string;
      };

      // 3. Open Razorpay payment modal
      await new Promise<void>((resolve, reject) => {
        const rzp = new window.Razorpay({
          key:         keyId,
          amount,
          currency,
          name:        'AlpenLuce',
          description: 'Premium Fashion',
          image:       '/logo.png',
          order_id:    razorpayOrderId,
          prefill: {
            name:    shippingName,
            contact: shippingPhone,
          },
          notes: {
            address: shippingAddress,
          },
          theme: { color: '#FFD700' },

          handler: async (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
            try {
              // 4. Verify signature + place order on backend
              const verifyRes = await paymentApi.verify({
                razorpayOrderId:   response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                shippingName,
                shippingAddress,
                shippingCity,
                shippingPincode,
                shippingPhone,
              });
              const orderId: number = verifyRes.data.id;
              router.push(`/orders?id=${orderId}&placed=1`);
              resolve();
            } catch (e) {
              reject(e);
            }
          },
        });

        rzp.on('payment.failed', () => {
          reject(new Error('Payment was declined. Please try a different payment method.'));
        });

        rzp.open();
      });

    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg ?? (e instanceof Error ? e.message : 'Payment failed. Please try again.'));
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen pt-24 px-4 text-center text-white/30">Loading…</div>;
  }

  return (
    <div className="min-h-screen pt-24 px-4 pb-16">
      <div className="max-w-4xl mx-auto">

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="text-gold text-xs tracking-[0.3em] uppercase mb-1">Almost There</p>
          <h1 className="text-3xl font-black">Checkout</h1>
        </motion.div>

        {error && (
          <div className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Left: shipping form */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-surface border border-white/10 rounded-2xl p-6"
            >
              <h2 className="font-bold mb-5 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gold" /> Shipping Address
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-white/50 mb-1 block">Full Name</label>
                  <input value={shippingName} onChange={(e) => setShippingName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm placeholder-white/20 focus:outline-none focus:border-gold/50" />
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-1 block">Address</label>
                  <input value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="123 Main St, Apartment 4B"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm placeholder-white/20 focus:outline-none focus:border-gold/50" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-white/50 mb-1 block">City</label>
                    <input value={shippingCity} onChange={(e) => setShippingCity(e.target.value)}
                      placeholder="Chennai"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm placeholder-white/20 focus:outline-none focus:border-gold/50" />
                  </div>
                  <div>
                    <label className="text-xs text-white/50 mb-1 block">Pincode / ZIP</label>
                    <input value={shippingPincode} onChange={(e) => setShippingPincode(e.target.value)}
                      placeholder="600001"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm placeholder-white/20 focus:outline-none focus:border-gold/50" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-1 block">Phone</label>
                  <input value={shippingPhone} onChange={(e) => setShippingPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm placeholder-white/20 focus:outline-none focus:border-gold/50" />
                </div>
              </div>

              {/* Pay button */}
              <button
                onClick={handlePay}
                disabled={paying}
                className="mt-6 w-full py-4 bg-gold text-black font-black rounded-2xl hover:bg-gold/90 transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {paying ? (
                  'Opening Payment…'
                ) : (
                  <><ArrowRight className="w-4 h-4" /> Pay {formatPrice(total, currency)}</>
                )}
              </button>

              <p className="mt-4 text-center text-xs text-white/25 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Secured by Razorpay · UPI, Cards, Netbanking, Wallets · Global cards accepted
              </p>
              {currency.code !== 'INR' && (
                <p className="mt-2 text-center text-xs text-white/20">
                  Charged in INR · ₹{total.toLocaleString('en-IN')} · Price shown is indicative
                </p>
              )}
            </motion.div>
          </div>

          {/* Right: order summary */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-surface border border-white/10 rounded-2xl p-6 sticky top-24"
            >
              <h2 className="font-bold mb-5">Order Summary</h2>

              <div className="space-y-3 mb-5">
                {cart.map((item) => {
                  const g = garments[item.garmentId];
                  return (
                    <div key={item.id} className="flex items-start justify-between gap-3 text-sm">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{g?.name ?? `Garment #${item.garmentId}`}</p>
                        <p className="text-white/40 text-xs">{item.size} × {item.quantity}</p>
                      </div>
                      <span className="text-gold font-bold shrink-0">
                        {formatPrice((g?.basePrice ?? 0) * item.quantity, currency)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-white/10 pt-4 flex items-center justify-between">
                <span className="font-bold">Total</span>
                <span className="text-gold font-black text-xl">{formatPrice(total, currency)}</span>
              </div>

              <div className="mt-4 text-xs text-white/30 space-y-1">
                <p>✓ UPI (GPay, PhonePe, Paytm)</p>
                <p>✓ Credit / Debit cards (Visa, Mastercard, Amex)</p>
                <p>✓ Netbanking · EMI</p>
                <p>✓ International cards accepted</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
