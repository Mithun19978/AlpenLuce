'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Shirt, Plus, Pencil, Trash2, Eye, EyeOff, Globe, Package, Megaphone, Users, Activity, Ticket, Tag, Upload, LayoutDashboard, BarChart3 } from 'lucide-react';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useAuthStore } from '@/lib/store';
import { garmentAdminApi, imageApi } from '@/lib/api';
import type { Garment } from '@/types';

const NAV_ITEMS = [
  { href: '/admin/dashboard',  label: 'Dashboard',         icon: LayoutDashboard },
  { href: '/admin/inventory',  label: 'Inventory',         icon: Package },
  { href: '/admin/users',      label: 'Users',             icon: Users },
  { href: '/admin/homepage',   label: 'Advertising',       icon: Megaphone },
  { href: '/admin/categories', label: 'Categories',        icon: Tag },
  { href: '/admin/activity',   label: 'Activity Logs',     icon: Activity },
  { href: '/admin/tickets',    label: 'Escalated Tickets', icon: Ticket },
  { href: '/admin/financial',  label: 'Financial',         icon: BarChart3 },
];

// garmentType stores the gender bucket
const GENDER_TYPES = ['mens', 'womens', 'kids', 'gym', 'couple', 'seasonal'] as const;
type GenderType = typeof GENDER_TYPES[number];

const GENDER_LABELS: Record<GenderType, string> = {
  mens: "Men's", womens: "Women's", kids: 'Kids',
  gym: 'Gym & Activewear', couple: 'Couple Collection', seasonal: 'Seasonal',
};

// ─── Form state ───────────────────────────────────────────────────────────────
interface FormState {
  name: string;
  description: string;
  garmentType: GenderType | '';
  type: string;               // product type label (e.g. T-Shirt, Hoodie)
  basePrice: string;
  baseColor: string;
  gsm: string;
  fabricDescription: string;
  imageUrl: string;
}

const BLANK_FORM: FormState = {
  name: '', description: '', garmentType: '', type: '',
  basePrice: '', baseColor: '', gsm: '', fabricDescription: '', imageUrl: '',
};

function formFromGarment(g: Garment): FormState {
  return {
    name:               g.name ?? '',
    description:        g.description ?? '',
    garmentType:        (g.garmentType ?? '') as GenderType | '',
    type:               (g.type ?? '') as string,
    basePrice:          g.basePrice != null ? String(g.basePrice) : '',
    baseColor:          g.baseColor ?? '',
    gsm:                g.gsm != null ? String(g.gsm) : '',
    fabricDescription:  g.fabricDescription ?? '',
    imageUrl:           g.imageUrl ?? '',
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminGarmentsPage() {
  const router  = useRouter();
  const user    = useAuthStore((s) => s.user);

  const [garments,  setGarments]  = useState<Garment[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [saving,    setSaving]    = useState(false);

  // form panel state
  const [editing,    setEditing]   = useState<Garment | null>(null);
  const [showForm,   setShowForm]  = useState(false);
  const [form,       setForm]      = useState<FormState>(BLANK_FORM);
  const [uploading,  setUploading] = useState(false);

  // ── auth guard ──────────────────────────────────────────────
  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    if (!(user.role & 6)) { router.push('/dashboard'); return; }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  function load() {
    setLoading(true);
    garmentAdminApi.getAll()
      .then((r) => setGarments(r.data))
      .catch(() => setError('Failed to load garments.'))
      .finally(() => setLoading(false));
  }

  // ── open form ────────────────────────────────────────────────
  function openNew() {
    setEditing(null);
    setForm(BLANK_FORM);
    setShowForm(true);
    setError('');
  }

  function openEdit(g: Garment) {
    setEditing(g);
    setForm(formFromGarment(g));
    setShowForm(true);
    setError('');
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
    setForm(BLANK_FORM);
  }

  // ── save ─────────────────────────────────────────────────────
  async function handleSave() {
    if (!form.name.trim())        { setError('Name is required.');         return; }
    if (!form.garmentType)        { setError('Gender type is required.');  return; }
    if (!form.basePrice.trim())   { setError('Base price is required.');   return; }

    const payload = {
      name:               form.name.trim(),
      description:        form.description.trim(),
      garmentType:        form.garmentType,
      type:               form.type.trim() || undefined,
      basePrice:          parseInt(form.basePrice, 10),
      baseColor:          form.baseColor.trim() || undefined,
      gsm:                form.gsm ? parseInt(form.gsm, 10) : undefined,
      fabricDescription:  form.fabricDescription.trim() || undefined,
      imageUrl:           form.imageUrl.trim() || undefined,
    };

    setSaving(true);
    setError('');
    try {
      if (editing) {
        await garmentAdminApi.update(editing.id, payload);
        setGarments((prev) =>
          prev.map((g) => g.id === editing.id ? ({ ...g, ...payload } as Garment) : g)
        );
      } else {
        await garmentAdminApi.create(payload);
        const fresh = await garmentAdminApi.getAll();
        setGarments(fresh.data);
      }
      closeForm();
    } catch {
      setError('Save failed. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  // ── toggle active ────────────────────────────────────────────
  async function handleToggleActive(g: Garment) {
    try {
      await garmentAdminApi.setActive(g.id, !g.active);
      setGarments((prev) =>
        prev.map((x) => x.id === g.id ? { ...x, active: !x.active } : x)
      );
    } catch {
      setError('Failed to update status.');
    }
  }

  // ── toggle featured ──────────────────────────────────────────
  async function handleToggleFeatured(g: Garment) {
    try {
      await garmentAdminApi.setFeatured(g.id, !g.featured);
      setGarments((prev) =>
        prev.map((x) => x.id === g.id ? { ...x, featured: !x.featured } : x)
      );
    } catch {
      setError('Failed to update home page visibility.');
    }
  }

  // ── delete ───────────────────────────────────────────────────
  async function handleDelete(g: Garment) {
    if (!confirm(`Delete "${g.name}"? This cannot be undone.`)) return;
    try {
      await garmentAdminApi.delete(g.id);
      setGarments((prev) => prev.filter((x) => x.id !== g.id));
    } catch {
      setError('Failed to delete garment.');
    }
  }

  function field(key: keyof FormState, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const res = await imageApi.upload(file);
      field('imageUrl', res.data.url);
    } catch {
      setError('Image upload failed. Check S3 configuration.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  // ── group by garmentType (gender bucket) ─────────────────────
  const grouped = GENDER_TYPES.map((gt) => ({
    gt,
    label: GENDER_LABELS[gt],
    items: garments.filter((g) => g.garmentType === gt),
  }));
  const uncategorised = garments.filter(
    (g) => !GENDER_TYPES.includes(g.garmentType as GenderType)
  );

  return (
    <div className="min-h-screen pt-20 px-4 pb-12">
      <div className="max-w-6xl mx-auto flex gap-6">
        <DashboardSidebar title="Admin Panel" items={NAV_ITEMS} />

        <div className="flex-1 min-w-0">
          {/* ── header ─────────────────────────────────────────── */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-gold text-xs tracking-[0.3em] uppercase mb-1">Catalogue</p>
              <h1 className="text-2xl font-black flex items-center gap-3">
                <Shirt className="w-6 h-6 text-gold" /> Garment Management
              </h1>
            </div>
            <Button variant="gold" size="sm" onClick={openNew}>
              <Plus className="w-4 h-4 mr-1" /> Add Garment
            </Button>
          </motion.div>

          {/* ── error ──────────────────────────────────────────── */}
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* ── form panel ─────────────────────────────────────── */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="mb-8 bg-surface border border-gold/30 rounded-2xl p-6"
              >
                <h2 className="font-bold text-lg mb-5">
                  {editing ? `Edit — ${editing.name}` : 'New Garment'}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  {/* name */}
                  <div className="sm:col-span-2">
                    <label className="text-xs text-white/40 mb-1 block">Name *</label>
                    <input
                      value={form.name}
                      onChange={(e) => field('name', e.target.value)}
                      className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold"
                      placeholder="e.g. Men's Slim Hoodie"
                    />
                  </div>

                  {/* garmentType — gender bucket */}
                  <div>
                    <label className="text-xs text-white/40 mb-1 block">Gender Type *</label>
                    <select
                      value={form.garmentType}
                      onChange={(e) => field('garmentType', e.target.value)}
                      className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold"
                    >
                      <option value="">Select gender type</option>
                      {GENDER_TYPES.map((gt) => (
                        <option key={gt} value={gt}>{GENDER_LABELS[gt]}</option>
                      ))}
                    </select>
                  </div>

                  {/* type — product label badge */}
                  <div>
                    <label className="text-xs text-white/40 mb-1 block">Product Type</label>
                    <input
                      value={form.type}
                      onChange={(e) => field('type', e.target.value)}
                      className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold"
                      placeholder="e.g. T-Shirt, Hoodie, Jogger"
                    />
                  </div>

                  {/* base price */}
                  <div>
                    <label className="text-xs text-white/40 mb-1 block">Base Price (₹) *</label>
                    <input
                      type="number"
                      min="0"
                      value={form.basePrice}
                      onChange={(e) => field('basePrice', e.target.value)}
                      className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold"
                      placeholder="2999"
                    />
                  </div>

                  {/* base color */}
                  <div>
                    <label className="text-xs text-white/40 mb-1 block">Base Color</label>
                    <input
                      value={form.baseColor}
                      onChange={(e) => field('baseColor', e.target.value)}
                      className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold"
                      placeholder="e.g. White"
                    />
                  </div>

                  {/* GSM */}
                  <div>
                    <label className="text-xs text-white/40 mb-1 block">GSM</label>
                    <input
                      type="number"
                      min="0"
                      value={form.gsm}
                      onChange={(e) => field('gsm', e.target.value)}
                      className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold"
                      placeholder="180 / 220 / 320"
                    />
                  </div>

                  {/* description */}
                  <div className="sm:col-span-2">
                    <label className="text-xs text-white/40 mb-1 block">Description</label>
                    <textarea
                      rows={2}
                      value={form.description}
                      onChange={(e) => field('description', e.target.value)}
                      className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold resize-none"
                      placeholder="Short product description…"
                    />
                  </div>

                  {/* fabric description */}
                  <div className="sm:col-span-2">
                    <label className="text-xs text-white/40 mb-1 block">Fabric Description</label>
                    <input
                      value={form.fabricDescription}
                      onChange={(e) => field('fabricDescription', e.target.value)}
                      className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold"
                      placeholder="e.g. 100% ring-spun cotton"
                    />
                  </div>

                  {/* Product image */}
                  <div className="sm:col-span-2">
                    <label className="text-xs text-white/40 mb-1 block">Product Image</label>
                    <div className="flex gap-3 items-start">
                      <input
                        value={form.imageUrl}
                        onChange={(e) => field('imageUrl', e.target.value)}
                        className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold"
                        placeholder="https://... (paste URL or upload below)"
                      />
                      {form.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={form.imageUrl}
                          alt="preview"
                          className="w-12 h-12 rounded-lg object-cover border border-white/10 shrink-0"
                        />
                      )}
                    </div>
                    <label className={`mt-2 flex items-center gap-2 w-fit cursor-pointer text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                      uploading
                        ? 'border-white/10 text-white/30 cursor-not-allowed'
                        : 'border-white/20 text-white/50 hover:border-gold/40 hover:text-gold'
                    }`}>
                      <Upload className="w-3.5 h-3.5" />
                      {uploading ? 'Uploading…' : 'Upload to S3'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploading}
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 justify-end">
                  <Button variant="outline" size="sm" onClick={closeForm} disabled={saving}>
                    Cancel
                  </Button>
                  <Button variant="gold" size="sm" onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Garment'}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── garment table ───────────────────────────────────── */}
          {loading ? (
            <p className="text-white/30 text-center py-16">Loading…</p>
          ) : (
            <div className="space-y-8">
              {[
                ...grouped.filter((g) => g.items.length > 0),
                ...(uncategorised.length ? [{ gt: 'other' as GenderType, label: 'Other', items: uncategorised }] : []),
              ].map(({ gt, label, items }) => (
                <div key={gt}>
                  <h3 className="text-xs text-gold tracking-[0.25em] uppercase mb-3">{label}</h3>
                  <div className="bg-surface border border-white/10 rounded-2xl overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/10 text-white/40 text-xs uppercase tracking-wider">
                          <th className="px-5 py-3 text-left">Garment</th>
                          <th className="px-5 py-3 text-left hidden md:table-cell">Type</th>
                          <th className="px-5 py-3 text-left hidden sm:table-cell">Price</th>
                          <th className="px-5 py-3 text-left">Status</th>
                          <th className="px-5 py-3 text-left hidden lg:table-cell">Home Page</th>
                          <th className="px-5 py-3 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((g) => (
                          <tr key={g.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                            <td className="px-5 py-4">
                              <p className="font-medium flex items-center gap-2">
                                {g.imageUrl ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={g.imageUrl} alt={g.name} className="w-8 h-8 rounded-md object-cover border border-white/10 shrink-0" />
                                ) : (
                                  <span>👕</span>
                                )}
                                {g.name}
                              </p>
                              {g.description && (
                                <p className="text-white/40 text-xs mt-0.5 line-clamp-1">{g.description}</p>
                              )}
                            </td>
                            <td className="px-5 py-4 text-white/50 hidden md:table-cell capitalize">
                              {g.type ?? g.garmentType}
                            </td>
                            <td className="px-5 py-4 text-gold font-bold hidden sm:table-cell">
                              ₹{g.basePrice?.toLocaleString('en-IN')}
                            </td>
                            <td className="px-5 py-4">
                              <Badge
                                label={g.active ? 'Active' : 'Inactive'}
                                color={g.active ? 'green' : 'gray'}
                              />
                            </td>
                            <td className="px-5 py-4 hidden lg:table-cell">
                              <button
                                onClick={() => handleToggleFeatured(g)}
                                title={g.featured ? 'Remove from home page' : 'Add to home page'}
                                disabled={!g.active}
                                className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-colors ${
                                  g.featured && g.active
                                    ? 'border-gold/50 text-gold bg-gold/10 hover:bg-gold/20'
                                    : 'border-white/10 text-white/30 hover:border-white/30 disabled:opacity-40 disabled:cursor-not-allowed'
                                }`}
                              >
                                <Globe className="w-3 h-3" />
                                {g.featured && g.active ? 'Showing' : 'Hidden'}
                              </button>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => openEdit(g)}
                                  title="Edit"
                                  className="p-1.5 rounded-lg text-white/40 hover:text-gold hover:bg-gold/10 transition-colors"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleToggleActive(g)}
                                  title={g.active ? 'Deactivate' : 'Activate'}
                                  className="p-1.5 rounded-lg text-white/40 hover:text-gold hover:bg-gold/10 transition-colors"
                                >
                                  {g.active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                                {(user?.role ?? 0) & 2 ? (
                                  <button
                                    onClick={() => handleDelete(g)}
                                    title="Delete"
                                    className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                ) : null}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
              {garments.length === 0 && !loading && (
                <p className="text-white/30 text-center py-16">No garments yet. Add one above.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
