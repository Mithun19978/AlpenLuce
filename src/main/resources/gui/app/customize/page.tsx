'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Layers, Palette, Type, Send } from 'lucide-react';
import Button from '@/components/ui/Button';
import { garmentApi, customizationApi } from '@/lib/api';
import { useCustomizerStore, useAuthStore } from '@/lib/store';
import type { Garment } from '@/types';

// Load 3D canvas client-side only (Three.js needs browser)
const CustomizerCanvas = dynamic(() => import('@/components/3d/CustomizerCanvas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center text-white/30 text-sm">
      Loading 3D viewer…
    </div>
  ),
});

const AREAS = ['FRONT', 'BACK', 'LEFT_SLEEVE', 'RIGHT_SLEEVE'] as const;
type Area = (typeof AREAS)[number];

const AREA_LABELS: Record<Area, string> = {
  FRONT: 'Front',
  BACK: 'Back',
  LEFT_SLEEVE: 'Left Sleeve',
  RIGHT_SLEEVE: 'Right Sleeve',
};

export default function CustomizePage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { layers, selectedArea, setSelectedArea, updateLayer, setGarmentId, garmentId } =
    useCustomizerStore();

  const [garments, setGarments] = useState<Garment[]>([]);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    garmentApi.getAll().then((r) => setGarments(r.data)).catch(() => {});
  }, []);

  const activeLayer = layers.find((l) => l.area === selectedArea);

  const handleSubmit = async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    if (!garmentId) {
      setError('Please select a garment first.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await customizationApi.create({
        garmentId,
        notes,
        layers: layers.map((l) => ({
          area: l.area,
          designText: l.designText ?? '',
          colorHex: l.colorHex,
          fontFamily: l.fontFamily ?? 'sans-serif',
          fontSize: l.fontSize ?? 24,
          positionX: l.positionX ?? 50,
          positionY: l.positionY ?? 50,
          scale: l.scale ?? 1,
          rotation: l.rotation ?? 0,
        })),
      });
      setSuccess('Design submitted! Our team will review it shortly.');
    } catch {
      setError('Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 px-4 pb-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <p className="text-gold text-xs tracking-[0.3em] uppercase mb-1">Studio</p>
          <h1 className="text-3xl font-black">3D Customizer</h1>
        </motion.div>

        {success && (
          <div className="mb-6 px-4 py-3 bg-gold/10 border border-gold/30 rounded-xl text-gold text-sm">
            {success}{' '}
            <button
              onClick={() => router.push('/dashboard')}
              className="underline ml-2 hover:no-underline"
            >
              View Dashboard
            </button>
          </div>
        )}
        {error && (
          <div className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
          {/* ── Left Panel ───────────────────────────────────────── */}
          <div className="space-y-4">
            {/* Garment selector */}
            <div className="bg-surface border border-white/10 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Layers className="w-4 h-4 text-gold" />
                <span className="text-sm font-bold">Base Garment</span>
              </div>
              <select
                value={garmentId ?? ''}
                onChange={(e) => setGarmentId(e.target.value ? Number(e.target.value) : null)}
                className="w-full bg-black border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold transition-colors"
              >
                <option value="">Select a garment…</option>
                {garments.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} — ${(g.basePrice / 100).toFixed(2)}
                  </option>
                ))}
              </select>
            </div>

            {/* Area tabs */}
            <div className="bg-surface border border-white/10 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Palette className="w-4 h-4 text-gold" />
                <span className="text-sm font-bold">Design Area</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {AREAS.map((area) => (
                  <button
                    key={area}
                    onClick={() => setSelectedArea(area)}
                    className={`py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                      selectedArea === area
                        ? 'bg-gold text-black'
                        : 'bg-black/40 text-white/60 hover:text-white border border-white/10'
                    }`}
                  >
                    {AREA_LABELS[area]}
                  </button>
                ))}
              </div>
            </div>

            {/* Layer editor */}
            {selectedArea && activeLayer && (
              <div className="bg-surface border border-white/10 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <Type className="w-4 h-4 text-gold" />
                  <span className="text-sm font-bold">{AREA_LABELS[selectedArea as Area]} Layer</span>
                </div>

                {/* Color */}
                <div>
                  <label className="text-xs text-white/50 block mb-1.5">Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={activeLayer.colorHex}
                      onChange={(e) =>
                        updateLayer(selectedArea, { colorHex: e.target.value })
                      }
                      className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border border-white/20"
                    />
                    <span className="text-sm text-white/50 font-mono">{activeLayer.colorHex}</span>
                  </div>
                </div>

                {/* Design text */}
                <div>
                  <label className="text-xs text-white/50 block mb-1.5">Text / Label</label>
                  <input
                    type="text"
                    value={activeLayer.designText ?? ''}
                    onChange={(e) => updateLayer(selectedArea, { designText: e.target.value })}
                    placeholder="e.g. AlpenLuce 2026"
                    className="w-full bg-black border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold transition-colors"
                  />
                </div>

                {/* Font */}
                <div>
                  <label className="text-xs text-white/50 block mb-1.5">Font</label>
                  <select
                    value={activeLayer.fontFamily ?? 'sans-serif'}
                    onChange={(e) => updateLayer(selectedArea, { fontFamily: e.target.value })}
                    className="w-full bg-black border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold transition-colors"
                  >
                    <option value="sans-serif">Sans-serif</option>
                    <option value="serif">Serif</option>
                    <option value="monospace">Monospace</option>
                    <option value="cursive">Cursive</option>
                  </select>
                </div>

                {/* Scale */}
                <div>
                  <label className="text-xs text-white/50 block mb-1.5">
                    Scale — {activeLayer.scale?.toFixed(2)}×
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="3"
                    step="0.05"
                    value={activeLayer.scale ?? 1}
                    onChange={(e) =>
                      updateLayer(selectedArea, { scale: parseFloat(e.target.value) })
                    }
                    className="w-full accent-gold"
                  />
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="bg-surface border border-white/10 rounded-2xl p-5">
              <label className="text-xs text-white/50 block mb-1.5">Notes for our team</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special instructions…"
                className="w-full bg-black border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold resize-none transition-colors"
              />
            </div>

            {/* Submit */}
            <Button
              variant="gold"
              className="w-full"
              loading={submitting}
              onClick={handleSubmit}
            >
              <Send className="w-4 h-4 mr-2" />
              Submit Design
            </Button>
            <p className="text-white/30 text-xs text-center px-2">
              Our technical team will review your design and set the final price before it goes to production.
            </p>
          </div>

          {/* ── 3D Canvas ────────────────────────────────────────── */}
          <div className="h-[520px] lg:h-auto lg:min-h-[600px] sticky top-24 self-start">
            <CustomizerCanvas />
          </div>
        </div>
      </div>
    </div>
  );
}
