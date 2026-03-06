'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, Plus, Pencil, Trash2, Eye, EyeOff, Globe,
  Megaphone, Users, Activity, Ticket, Tag, Search, X,
  CheckCircle2, AlertCircle, LayoutDashboard, Upload, Layers, AlertTriangle, BarChart3,
} from 'lucide-react';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useAuthStore } from '@/lib/store';
import { garmentAdminApi, categoryApi, imageApi } from '@/lib/api';
import type { Garment, Category } from '@/types';

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

const GENDER_TYPES = ['mens', 'womens', 'kids', 'gym', 'couple', 'seasonal'] as const;
type GenderType = typeof GENDER_TYPES[number];

const GENDER_LABELS: Record<GenderType, string> = {
  mens: "Men's", womens: "Women's", kids: 'Kids',
  gym: 'Gym & Activewear', couple: 'Couple Collection', seasonal: 'Seasonal',
};

// Auto-derive garmentType from main category name
const CAT_TO_GTYPE: Record<string, GenderType> = {
  'men': 'mens', 'women': 'womens', 'kids': 'kids',
  'gym & activewear': 'gym', 'couple collection': 'couple', 'seasonal collection': 'seasonal',
};
function inferGType(catMainId: string, mains: Category[]): GenderType | '' {
  if (!catMainId) return '';
  const name = mains.find((c) => String(c.id) === catMainId)?.name?.toLowerCase() ?? '';
  return CAT_TO_GTYPE[name] ?? '';
}

// ── shared input class ────────────────────────────────────────────────────────
const INPUT = 'w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold';
const INPUT_SM = 'w-full bg-surface border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold';

// ── Single-product form ───────────────────────────────────────────────────────
interface FormState {
  name: string; description: string; garmentType: GenderType | ''; type: string;
  basePrice: string; baseColor: string; gsm: string; fabricDescription: string;
  sizes: string; imageUrl: string; catMain: string; catSub: string; catType: string;
  stockQuantity: string; costPrice: string;
}
const BLANK_FORM: FormState = {
  name: '', description: '', garmentType: '', type: '',
  basePrice: '', baseColor: '', gsm: '', fabricDescription: '', sizes: '',
  imageUrl: '', catMain: '', catSub: '', catType: '', stockQuantity: '', costPrice: '',
};
function formFromGarment(g: Garment, cats: Category[]): FormState {
  let catMain = '', catSub = '', catType = '';
  if (g.categoryId) {
    const cat = cats.find((c) => c.id === g.categoryId);
    if (cat) {
      if (cat.depth === 2) {
        catType = String(cat.id);
        const sub = cats.find((c) => c.id === cat.parentId);
        if (sub) { catSub = String(sub.id); const main = cats.find((c) => c.id === sub.parentId); if (main) catMain = String(main.id); }
      } else if (cat.depth === 1) {
        catSub = String(cat.id);
        const main = cats.find((c) => c.id === cat.parentId); if (main) catMain = String(main.id);
      } else { catMain = String(cat.id); }
    }
  }
  return {
    name: g.name ?? '', description: g.description ?? '',
    garmentType: (g.garmentType ?? '') as GenderType | '', type: (g.type ?? '') as string,
    basePrice: g.basePrice != null ? String(g.basePrice) : '', baseColor: g.baseColor ?? '',
    gsm: g.gsm != null ? String(g.gsm) : '', fabricDescription: g.fabricDescription ?? '',
    sizes: g.sizes ?? '', imageUrl: g.imageUrl ?? '', catMain, catSub, catType,
    stockQuantity: g.stockQuantity != null ? String(g.stockQuantity) : '',
    costPrice: g.costPrice != null ? String(g.costPrice) : '',
  };
}

// ── Batch-create form ─────────────────────────────────────────────────────────
interface BatchRow { id: number; baseColor: string; sizes: string; imageUrl: string; }
interface BatchForm {
  name: string; garmentType: GenderType | ''; type: string;
  catMain: string; catSub: string; catType: string;
  basePrice: string; gsm: string; description: string; fabricDescription: string;
  rows: BatchRow[];
}
const BLANK_BATCH: BatchForm = {
  name: '', garmentType: '', type: '', catMain: '', catSub: '', catType: '',
  basePrice: '', gsm: '', description: '', fabricDescription: '',
  rows: [
    { id: 1, baseColor: '', sizes: 'S,M,L,XL,XXL', imageUrl: '' },
  ],
};

// ── Category hint helper ──────────────────────────────────────────────────────
function catHint(catMain: string, catSub: string, catType: string, mainCats: Category[], subCats: Category[], typeCats: Category[]) {
  if (catType)  return `Category: ${typeCats.find((c) => String(c.id) === catType)?.name  ?? ''}`;
  if (catSub)   return `Category: ${subCats.find((c) => String(c.id) === catSub)?.name    ?? ''}`;
  if (catMain)  return `Category: ${mainCats.find((c) => String(c.id) === catMain)?.name  ?? ''}`;
  return 'No category — product shows only by garment type filter';
}

export default function AdminInventoryPage() {
  const router = useRouter();
  const user   = useAuthStore((s) => s.user);

  const [garments,       setGarments]       = useState<Garment[]>([]);
  const [cats,           setCats]           = useState<Category[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState('');
  const [saving,         setSaving]         = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  // single-product form
  const [editing,  setEditing]  = useState<Garment | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form,     setForm]     = useState<FormState>(BLANK_FORM);

  // batch form
  const [showBatch,   setShowBatch]   = useState(false);
  const [batch,       setBatch]       = useState<BatchForm>(BLANK_BATCH);
  const [batchSaving, setBatchSaving] = useState(false);
  const [batchRowSeq, setBatchRowSeq] = useState(2);

  // filters
  const [search,       setSearch]       = useState('');
  const [filterType,   setFilterType]   = useState<GenderType | ''>('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'featured'>('all');

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    if (!(user.role & 2)) { router.push('/'); return; }
    load();
    categoryApi.getAll().then((r) => setCats(r.data)).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  function load() {
    setLoading(true);
    garmentAdminApi.getAll()
      .then((r) => setGarments(r.data))
      .catch(() => setError('Failed to load inventory.'))
      .finally(() => setLoading(false));
  }

  // ── single product form ───────────────────────────────────────────────────
  function openNew() {
    setEditing(null); setForm(BLANK_FORM);
    setShowForm(true); setShowBatch(false); setError('');
  }
  function openEdit(g: Garment) {
    setEditing(g); setForm(formFromGarment(g, cats));
    setShowForm(true); setShowBatch(false); setError('');
  }
  function closeForm() { setShowForm(false); setEditing(null); setForm(BLANK_FORM); }

  async function handleSave() {
    if (!form.name.trim())      { setError('Name is required.');       return; }
    if (!form.basePrice.trim()) { setError('Base price is required.'); return; }

    const effectiveCategoryId = form.catType  ? parseInt(form.catType, 10)
      : form.catSub  ? parseInt(form.catSub, 10)
      : form.catMain ? parseInt(form.catMain, 10) : undefined;

    const payload = {
      name: form.name.trim(), description: form.description.trim(),
      garmentType: form.garmentType, type: form.type.trim() || undefined,
      basePrice: parseInt(form.basePrice, 10), baseColor: form.baseColor.trim() || undefined,
      gsm: form.gsm ? parseInt(form.gsm, 10) : undefined,
      fabricDescription: form.fabricDescription.trim() || undefined,
      sizes: form.sizes.trim() || undefined,
      categoryId: effectiveCategoryId, imageUrl: form.imageUrl.trim() || undefined,
      stockQuantity: form.stockQuantity ? parseInt(form.stockQuantity, 10) : undefined,
      costPrice: form.costPrice ? parseInt(form.costPrice, 10) : undefined,
    };

    setSaving(true); setError('');
    try {
      if (editing) {
        await garmentAdminApi.update(editing.id, payload);
        setGarments((prev) => prev.map((g) => g.id === editing.id ? ({ ...g, ...payload } as Garment) : g));
      } else {
        await garmentAdminApi.create(payload);
        const fresh = await garmentAdminApi.getAll();
        setGarments(fresh.data);
      }
      closeForm();
    } catch { setError('Save failed. Please try again.'); }
    finally   { setSaving(false); }
  }

  function field(key: keyof FormState, value: string) { setForm((f) => ({ ...f, [key]: value })); }
  function onMainChange(val: string) {
    setForm((f) => ({ ...f, catMain: val, catSub: '', catType: '', garmentType: inferGType(val, mainCats) }));
  }
  function onSubChange(val: string)  { setForm((f) => ({ ...f, catSub: val, catType: '' })); }

  async function handleImageUpload(file: File) {
    setImageUploading(true); setError('');
    try { const res = await imageApi.upload(file); setForm((f) => ({ ...f, imageUrl: res.data.url })); }
    catch { setError('Image upload failed. Check S3 configuration.'); }
    finally { setImageUploading(false); }
  }

  // ── batch form ────────────────────────────────────────────────────────────
  function openBatch() {
    setShowBatch(true); setShowForm(false); setEditing(null); setForm(BLANK_FORM); setError('');
  }
  function closeBatch() { setShowBatch(false); setBatch(BLANK_BATCH); setBatchRowSeq(2); }

  function bField<K extends keyof Omit<BatchForm, 'rows'>>(key: K, val: BatchForm[K]) {
    setBatch((b) => ({ ...b, [key]: val }));
  }
  function onBatchMainChange(val: string) {
    setBatch((b) => ({ ...b, catMain: val, catSub: '', catType: '', garmentType: inferGType(val, mainCats) }));
  }
  function onBatchSubChange(val: string)  { setBatch((b) => ({ ...b, catSub: val, catType: '' })); }

  function addBatchRow() {
    setBatch((b) => ({ ...b, rows: [...b.rows, { id: batchRowSeq, baseColor: '', sizes: 'S,M,L,XL,XXL', imageUrl: '' }] }));
    setBatchRowSeq((n) => n + 1);
  }
  function removeBatchRow(id: number) { setBatch((b) => ({ ...b, rows: b.rows.filter((r) => r.id !== id) })); }
  function updateRow(id: number, key: keyof Omit<BatchRow, 'id'>, val: string) {
    setBatch((b) => ({ ...b, rows: b.rows.map((r) => r.id === id ? { ...r, [key]: val } : r) }));
  }

  async function handleBatchCreate() {
    if (!batch.name.trim())      { setError('Product name is required.'); return; }
    if (!batch.basePrice.trim()) { setError('Base price is required.');   return; }
    if (batch.rows.length === 0) { setError('Add at least one variant.'); return; }

    const effectiveCategoryId = batch.catType  ? parseInt(batch.catType, 10)
      : batch.catSub  ? parseInt(batch.catSub, 10)
      : batch.catMain ? parseInt(batch.catMain, 10) : undefined;

    const requests = batch.rows.map((row) => ({
      name: batch.name.trim(), description: batch.description.trim() || undefined,
      garmentType: batch.garmentType, type: batch.type.trim() || undefined,
      basePrice: parseInt(batch.basePrice, 10),
      gsm: batch.gsm ? parseInt(batch.gsm, 10) : undefined,
      fabricDescription: batch.fabricDescription.trim() || undefined,
      categoryId: effectiveCategoryId,
      baseColor:  row.baseColor.trim()  || undefined,
      sizes:      row.sizes.trim()      || undefined,
      imageUrl:   row.imageUrl.trim()   || undefined,
    }));

    setBatchSaving(true); setError('');
    try {
      await garmentAdminApi.bulkCreate(requests);
      const fresh = await garmentAdminApi.getAll();
      setGarments(fresh.data);
      closeBatch();
    } catch { setError('Batch create failed. Please try again.'); }
    finally   { setBatchSaving(false); }
  }

  // ── toggle helpers ────────────────────────────────────────────────────────
  async function handleToggleActive(g: Garment) {
    try { await garmentAdminApi.setActive(g.id, !g.active); setGarments((prev) => prev.map((x) => x.id === g.id ? { ...x, active: !x.active } : x)); }
    catch { setError('Failed to update status.'); }
  }
  async function handleToggleFeatured(g: Garment) {
    try { await garmentAdminApi.setFeatured(g.id, !g.featured); setGarments((prev) => prev.map((x) => x.id === g.id ? { ...x, featured: !x.featured } : x)); }
    catch { setError('Failed to update home page visibility.'); }
  }
  async function handleDelete(g: Garment) {
    if (!confirm(`Delete "${g.name}"? This cannot be undone.`)) return;
    try { await garmentAdminApi.delete(g.id); setGarments((prev) => prev.filter((x) => x.id !== g.id)); }
    catch { setError('Failed to delete product.'); }
  }

  // ── derived stats ─────────────────────────────────────────────────────────
  const totalCount     = garments.length;
  const activeCount    = garments.filter((g) => g.active).length;
  const featuredCount  = garments.filter((g) => g.active && g.featured).length;
  const inactiveCount  = garments.filter((g) => !g.active).length;
  const lowStockCount  = garments.filter((g) => g.active && g.stockQuantity != null && g.stockQuantity < 10).length;

  // ── filtered list ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => garments.filter((g) => {
    const q = search.toLowerCase();
    if (q && !g.name?.toLowerCase().includes(q) && !g.type?.toLowerCase().includes(q)) return false;
    if (filterType   && g.garmentType !== filterType)      return false;
    if (filterStatus === 'active'   && !g.active)          return false;
    if (filterStatus === 'inactive' && g.active)           return false;
    if (filterStatus === 'featured' && !(g.active && g.featured)) return false;
    return true;
  }), [garments, search, filterType, filterStatus]);

  // ── category cascading lists (single form) ────────────────────────────────
  const mainCats  = cats.filter((c) => c.depth === 0).sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  const subCats   = form.catMain  ? cats.filter((c) => c.depth === 1 && c.parentId === parseInt(form.catMain,  10)) : [];
  const typeCats  = form.catSub   ? cats.filter((c) => c.depth === 2 && c.parentId === parseInt(form.catSub,   10)) : [];

  // ── category cascading lists (batch form) ─────────────────────────────────
  const bSubCats  = batch.catMain ? cats.filter((c) => c.depth === 1 && c.parentId === parseInt(batch.catMain, 10)) : [];
  const bTypeCats = batch.catSub  ? cats.filter((c) => c.depth === 2 && c.parentId === parseInt(batch.catSub,  10)) : [];

  // ── reusable category selects JSX ─────────────────────────────────────────
  function CatSelects({ cm, cs, ct, onMain, onSub, onType, mains, subs, types }: {
    cm: string; cs: string; ct: string;
    onMain: (v: string) => void; onSub: (v: string) => void; onType: (v: string) => void;
    mains: Category[]; subs: Category[]; types: Category[];
  }) {
    return (
      <div className="sm:col-span-2">
        <label className="text-xs text-white/40 mb-1 block">Category</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <select value={cm} onChange={(e) => onMain(e.target.value)} className={INPUT}>
            <option value="">Main category</option>
            {mains.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={cs} onChange={(e) => onSub(e.target.value)} disabled={!cm || subs.length === 0}
            className={`${INPUT} disabled:opacity-40 disabled:cursor-not-allowed`}>
            <option value="">Sub-category</option>
            {subs.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={ct} onChange={(e) => onType(e.target.value)} disabled={!cs || types.length === 0}
            className={`${INPUT} disabled:opacity-40 disabled:cursor-not-allowed`}>
            <option value="">Type (optional)</option>
            {types.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <p className="text-white/25 text-xs mt-1">{catHint(cm, cs, ct, mains, subs, types)}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 px-4 pb-12">
      <div className="max-w-6xl mx-auto flex gap-6">
        <DashboardSidebar title="Admin Panel" items={NAV_ITEMS} />

        <div className="flex-1 min-w-0">
          {/* ── header ─────────────────────────────────────────── */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center justify-between gap-3">
            <div>
              <p className="text-gold text-xs tracking-[0.3em] uppercase mb-1">Stock</p>
              <h1 className="text-2xl font-black flex items-center gap-3">
                <Package className="w-6 h-6 text-gold" /> Inventory Management
              </h1>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button variant="outline" size="sm" onClick={openBatch}>
                <Layers className="w-4 h-4 mr-1" /> Batch Create
              </Button>
              <Button variant="gold" size="sm" onClick={openNew}>
                <Plus className="w-4 h-4 mr-1" /> Add Product
              </Button>
            </div>
          </motion.div>

          {/* ── stats row ──────────────────────────────────────── */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Total Products', value: totalCount,    icon: Package,       color: 'text-white' },
              { label: 'Active',         value: activeCount,   icon: CheckCircle2,  color: 'text-green-400' },
              { label: 'On Home Page',   value: featuredCount, icon: Globe,         color: 'text-gold' },
              { label: 'Low / Out Stock',value: lowStockCount, icon: AlertTriangle, color: 'text-orange-400' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-surface border border-white/10 rounded-2xl p-4 text-center">
                <Icon className={`w-4 h-4 mx-auto mb-1 ${color}`} />
                <div className={`text-2xl font-black ${color}`}>{value}</div>
                <div className="text-white/40 text-xs mt-0.5">{label}</div>
              </div>
            ))}
          </motion.div>

          {/* ── filters ────────────────────────────────────────── */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
            className="flex flex-wrap gap-3 mb-6">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products…"
                className="w-full bg-surface border border-white/10 rounded-xl pl-9 pr-9 py-2 text-sm focus:outline-none focus:border-gold/50" />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value as GenderType | '')}
              className="bg-surface border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-gold/50">
              <option value="">All types</option>
              {GENDER_TYPES.map((gt) => <option key={gt} value={gt}>{GENDER_LABELS[gt]}</option>)}
            </select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
              className="bg-surface border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-gold/50">
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="featured">Featured (home page)</option>
            </select>
          </motion.div>

          {/* ── error ──────────────────────────────────────────── */}
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* ── single product form ─────────────────────────────── */}
          <AnimatePresence>
            {showForm && (
              <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
                className="mb-8 bg-surface border border-gold/30 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-bold text-lg">{editing ? `Edit — ${editing.name}` : 'New Product'}</h2>
                  <button onClick={closeForm} className="text-white/30 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div className="sm:col-span-2">
                    <label className="text-xs text-white/40 mb-1 block">Name *</label>
                    <input value={form.name} onChange={(e) => field('name', e.target.value)} className={INPUT} placeholder="e.g. Men's Slim Hoodie" />
                  </div>
                  <div>
                    <label className="text-xs text-white/40 mb-1 block">Product Type</label>
                    <input value={form.type} onChange={(e) => field('type', e.target.value)} className={INPUT} placeholder="e.g. T-Shirt, Hoodie, Jogger" />
                  </div>

                  <CatSelects cm={form.catMain} cs={form.catSub} ct={form.catType}
                    onMain={onMainChange} onSub={onSubChange} onType={(v) => field('catType', v)}
                    mains={mainCats} subs={subCats} types={typeCats} />

                  <div>
                    <label className="text-xs text-white/40 mb-1 block">Base Price (₹) *</label>
                    <input type="number" min="0" value={form.basePrice} onChange={(e) => field('basePrice', e.target.value)} className={INPUT} placeholder="2999" />
                  </div>
                  <div>
                    <label className="text-xs text-white/40 mb-1 block">Cost Price (₹)</label>
                    <input type="number" min="0" value={form.costPrice} onChange={(e) => field('costPrice', e.target.value)} className={INPUT} placeholder="1200" />
                  </div>
                  <div>
                    <label className="text-xs text-white/40 mb-1 block">Stock Quantity</label>
                    <input type="number" min="0" value={form.stockQuantity} onChange={(e) => field('stockQuantity', e.target.value)} className={INPUT} placeholder="100" />
                  </div>
                  <div>
                    <label className="text-xs text-white/40 mb-1 block">Base Color</label>
                    <input value={form.baseColor} onChange={(e) => field('baseColor', e.target.value)} className={INPUT} placeholder="e.g. White" />
                  </div>
                  <div>
                    <label className="text-xs text-white/40 mb-1 block">GSM</label>
                    <input type="number" min="0" value={form.gsm} onChange={(e) => field('gsm', e.target.value)} className={INPUT} placeholder="180 / 220 / 320" />
                  </div>
                  <div>
                    <label className="text-xs text-white/40 mb-1 block">Available Sizes</label>
                    <input value={form.sizes} onChange={(e) => field('sizes', e.target.value)} className={INPUT} placeholder="e.g. S,M,L,XL,XXL" />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs text-white/40 mb-1 block">Product Image (URL or upload to S3)</label>
                    <div className="flex gap-2 items-center">
                      <input value={form.imageUrl} onChange={(e) => field('imageUrl', e.target.value)}
                        placeholder="https://your-bucket.s3.amazonaws.com/..."
                        className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold" />
                      <label className={`flex items-center gap-2 px-4 py-2.5 text-sm border rounded-xl cursor-pointer whitespace-nowrap transition-colors ${
                        imageUploading ? 'border-white/5 text-white/25 cursor-not-allowed' : 'border-white/15 text-white/60 hover:border-gold/50 hover:text-white'}`}>
                        <Upload className="w-4 h-4" />
                        {imageUploading ? 'Uploading…' : 'Upload'}
                        <input type="file" accept="image/*" className="hidden" disabled={imageUploading}
                          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); e.target.value = ''; }} />
                      </label>
                      {form.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={form.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover border border-white/10 shrink-0" />
                      )}
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs text-white/40 mb-1 block">Description</label>
                    <textarea rows={2} value={form.description} onChange={(e) => field('description', e.target.value)}
                      className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold resize-none"
                      placeholder="Short product description…" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs text-white/40 mb-1 block">Fabric Description</label>
                    <input value={form.fabricDescription} onChange={(e) => field('fabricDescription', e.target.value)} className={INPUT} placeholder="e.g. 100% ring-spun cotton" />
                  </div>
                </div>

                <div className="flex gap-3 justify-end">
                  <Button variant="outline" size="sm" onClick={closeForm} disabled={saving}>Cancel</Button>
                  <Button variant="gold" size="sm" onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Product'}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── batch create form ───────────────────────────────── */}
          <AnimatePresence>
            {showBatch && (
              <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
                className="mb-8 bg-surface border border-gold/30 rounded-2xl p-6">

                {/* header */}
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h2 className="font-bold text-lg flex items-center gap-2">
                      <Layers className="w-5 h-5 text-gold" /> Batch Create — Color Variants
                    </h2>
                    <p className="text-white/35 text-xs mt-1">
                      One product name, one category, multiple colors — creates a separate garment record per color.
                    </p>
                  </div>
                  <button onClick={closeBatch} className="text-white/30 hover:text-white transition-colors mt-0.5">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* ── shared product details ── */}
                <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Shared product details</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="sm:col-span-2">
                    <label className="text-xs text-white/40 mb-1 block">Product Name * <span className="text-white/25 normal-case">(same for all variants)</span></label>
                    <input value={batch.name} onChange={(e) => bField('name', e.target.value)} className={INPUT} placeholder="e.g. Men's Slim Hoodie" />
                  </div>
                  <div>
                    <label className="text-xs text-white/40 mb-1 block">Product Type Label</label>
                    <input value={batch.type} onChange={(e) => bField('type', e.target.value)} className={INPUT} placeholder="e.g. T-Shirt, Hoodie, Jogger" />
                  </div>

                  <CatSelects cm={batch.catMain} cs={batch.catSub} ct={batch.catType}
                    onMain={onBatchMainChange} onSub={onBatchSubChange} onType={(v) => bField('catType', v)}
                    mains={mainCats} subs={bSubCats} types={bTypeCats} />

                  <div>
                    <label className="text-xs text-white/40 mb-1 block">Base Price (₹) *</label>
                    <input type="number" min="0" value={batch.basePrice} onChange={(e) => bField('basePrice', e.target.value)} className={INPUT} placeholder="2999" />
                  </div>
                  <div>
                    <label className="text-xs text-white/40 mb-1 block">GSM</label>
                    <input type="number" min="0" value={batch.gsm} onChange={(e) => bField('gsm', e.target.value)} className={INPUT} placeholder="220" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs text-white/40 mb-1 block">Description</label>
                    <textarea rows={2} value={batch.description} onChange={(e) => bField('description', e.target.value)}
                      className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold resize-none"
                      placeholder="Short product description…" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs text-white/40 mb-1 block">Fabric Description</label>
                    <input value={batch.fabricDescription} onChange={(e) => bField('fabricDescription', e.target.value)} className={INPUT} placeholder="e.g. 100% ring-spun cotton" />
                  </div>
                </div>

                {/* ── color variants table ── */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Color Variants</p>
                    <p className="text-xs text-white/25 mt-0.5">Each row = one garment. Sizes are comma-separated.</p>
                  </div>
                  <button onClick={addBatchRow}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-gold/30 text-gold rounded-xl hover:bg-gold/10 transition-colors">
                    <Plus className="w-3.5 h-3.5" /> Add Variant
                  </button>
                </div>

                {/* column headers (desktop) */}
                <div className="hidden sm:grid sm:grid-cols-[2rem_1fr_1.6fr_2fr_2rem] gap-2 px-3 mb-1 text-xs text-white/25 uppercase tracking-wider">
                  <span>#</span><span>Color</span><span>Sizes</span><span>Image URL (optional)</span><span></span>
                </div>

                <div className="space-y-2 mb-6">
                  {batch.rows.map((row, idx) => (
                    <div key={row.id}
                      className="grid grid-cols-1 sm:grid-cols-[2rem_1fr_1.6fr_2fr_2rem] gap-2 items-center p-3 bg-black/40 border border-white/5 rounded-xl">
                      <span className="hidden sm:block text-white/20 text-xs text-center">{idx + 1}</span>
                      <input value={row.baseColor} onChange={(e) => updateRow(row.id, 'baseColor', e.target.value)}
                        placeholder="Color (e.g. Black)" className={INPUT_SM} />
                      <input value={row.sizes} onChange={(e) => updateRow(row.id, 'sizes', e.target.value)}
                        placeholder="S,M,L,XL,XXL" className={INPUT_SM} />
                      <input value={row.imageUrl} onChange={(e) => updateRow(row.id, 'imageUrl', e.target.value)}
                        placeholder="Image URL (optional)" className={INPUT_SM} />
                      <button onClick={() => removeBatchRow(row.id)} disabled={batch.rows.length === 1}
                        className="justify-self-center text-white/30 hover:text-red-400 transition-colors disabled:opacity-20 disabled:cursor-not-allowed">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* footer */}
                <div className="flex gap-3 justify-between items-center pt-4 border-t border-white/5">
                  <p className="text-white/30 text-xs">
                    {batch.rows.length} garment{batch.rows.length !== 1 ? 's' : ''} will be created
                  </p>
                  <div className="flex gap-3">
                    <Button variant="outline" size="sm" onClick={closeBatch} disabled={batchSaving}>Cancel</Button>
                    <Button variant="gold" size="sm" onClick={handleBatchCreate} disabled={batchSaving}>
                      {batchSaving ? 'Creating…' : `Create ${batch.rows.length} Variant${batch.rows.length !== 1 ? 's' : ''} →`}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── product table ───────────────────────────────────── */}
          {loading ? (
            <p className="text-white/30 text-center py-16">Loading…</p>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-white/30">
              {garments.length === 0 ? 'No products yet. Add one above.' : 'No products match your filters.'}
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
              className="bg-surface border border-white/10 rounded-2xl overflow-hidden">
              <div className="px-5 py-3 border-b border-white/10">
                <span className="text-xs text-white/40">Showing {filtered.length} of {garments.length} products</span>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-white/40 text-xs uppercase tracking-wider">
                    <th className="px-5 py-3 text-left">Product</th>
                    <th className="px-5 py-3 text-left hidden md:table-cell">Type</th>
                    <th className="px-5 py-3 text-left hidden sm:table-cell">Price</th>
                    <th className="px-5 py-3 text-left hidden md:table-cell">Stock</th>
                    <th className="px-5 py-3 text-left">Status</th>
                    <th className="px-5 py-3 text-left hidden lg:table-cell">Home</th>
                    <th className="px-5 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((g) => (
                    <tr key={g.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                      <td className="px-5 py-4">
                        <p className="font-medium flex items-center gap-2">
                          {g.imageUrl
                            // eslint-disable-next-line @next/next/no-img-element
                            ? <img src={g.imageUrl} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0 border border-white/10" />
                            : <span>👕</span>}
                          {g.name}
                        </p>
                        {g.description && <p className="text-white/40 text-xs mt-0.5 line-clamp-1">{g.description}</p>}
                        {g.sizes     && <p className="text-white/30 text-xs mt-0.5">Sizes: {g.sizes}</p>}
                        {g.baseColor && <p className="text-white/30 text-xs mt-0.5">Color: {g.baseColor}</p>}
                      </td>
                      <td className="px-5 py-4 text-white/50 hidden md:table-cell capitalize">{g.type ?? g.garmentType}</td>
                      <td className="px-5 py-4 text-gold font-bold hidden sm:table-cell">₹{g.basePrice?.toLocaleString('en-IN')}</td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        {g.stockQuantity != null ? (
                          <span className={`flex items-center gap-1 text-sm font-semibold ${
                            g.stockQuantity === 0 ? 'text-red-400' : g.stockQuantity < 10 ? 'text-orange-400' : 'text-white/70'
                          }`}>
                            {g.stockQuantity === 0 && <AlertTriangle className="w-3.5 h-3.5" />}
                            {g.stockQuantity < 10 && g.stockQuantity > 0 && <AlertTriangle className="w-3.5 h-3.5" />}
                            {g.stockQuantity}
                            {g.stockQuantity === 0 && <span className="text-xs font-normal text-red-400/70">Out</span>}
                            {g.stockQuantity > 0 && g.stockQuantity < 10 && <span className="text-xs font-normal text-orange-400/70">Low</span>}
                          </span>
                        ) : <span className="text-white/20">—</span>}
                      </td>
                      <td className="px-5 py-4">
                        <Badge label={g.active ? 'Active' : 'Inactive'} color={g.active ? 'green' : 'gray'} />
                      </td>
                      <td className="px-5 py-4 hidden lg:table-cell">
                        <button onClick={() => handleToggleFeatured(g)} disabled={!g.active}
                          title={g.featured && g.active ? 'Remove from home page' : 'Add to home page'}
                          className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-colors ${
                            g.featured && g.active
                              ? 'border-gold/50 text-gold bg-gold/10 hover:bg-gold/20'
                              : 'border-white/10 text-white/30 hover:border-white/30 disabled:opacity-40 disabled:cursor-not-allowed'}`}>
                          <Globe className="w-3 h-3" />
                          {g.featured && g.active ? 'Showing' : 'Hidden'}
                        </button>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEdit(g)} title="Edit"
                            className="p-1.5 rounded-lg text-white/40 hover:text-gold hover:bg-gold/10 transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleToggleActive(g)} title={g.active ? 'Deactivate' : 'Activate'}
                            className="p-1.5 rounded-lg text-white/40 hover:text-gold hover:bg-gold/10 transition-colors">
                            {g.active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          {(user?.role ?? 0) & 2 ? (
                            <button onClick={() => handleDelete(g)} title="Delete"
                              className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
