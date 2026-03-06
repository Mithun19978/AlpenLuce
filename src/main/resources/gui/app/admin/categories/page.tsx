'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, Megaphone, Users, Activity, Ticket,
  Tag, Eye, EyeOff, Plus, X, ChevronDown, Pencil, Trash2, Check, LayoutDashboard, BarChart3,
} from 'lucide-react';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import { useAuthStore } from '@/lib/store';
import { categoryApi } from '@/lib/api';
import type { Category } from '@/types';

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

function buildTreeOrder(cats: Category[], parentId: number | null): Category[] {
  const children = cats
    .filter((c) => (c.parentId ?? null) === parentId)
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  const result: Category[] = [];
  for (const child of children) {
    result.push(child);
    result.push(...buildTreeOrder(cats, child.id));
  }
  return result;
}

const DEPTH_INDENT = ['', 'pl-6', 'pl-12'] as const;
const DEPTH_COLOR  = ['text-gold font-bold', 'text-white/80 font-medium', 'text-white/55'] as const;
const DEPTH_LABEL  = ['Main', 'Sub', 'Type'] as const;

/* ── Custom dark dropdown to avoid native white browser dropdown ── */
function CatDropdown({
  placeholder, options, value, onChange, disabled,
}: {
  placeholder: string;
  options: { id: number; label: string }[];
  value: number | '';
  onChange: (v: number | '') => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = options.find((o) => o.id === value);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        className={`w-full flex items-center justify-between px-4 py-2.5 bg-white/5 border rounded-xl text-sm transition-colors ${
          disabled
            ? 'opacity-40 cursor-not-allowed border-white/5'
            : 'border-white/10 hover:border-gold/30 cursor-pointer'
        }`}
      >
        <span className={selected ? 'text-white' : 'text-white/25'}>
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-white/30 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute top-full left-0 right-0 mt-1 bg-[#0d0d0d] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
            style={{ maxHeight: 200, overflowY: 'auto' }}
          >
            {value !== '' && (
              <button
                type="button"
                onClick={() => { onChange(''); setOpen(false); }}
                className="w-full text-left px-4 py-2.5 text-xs text-white/30 hover:bg-white/5 transition-colors"
              >
                — Clear
              </button>
            )}
            {options.length === 0 ? (
              <p className="px-4 py-3 text-xs text-white/20">No options available</p>
            ) : (
              options.map((opt) => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => { onChange(opt.id); setOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                    value === opt.id ? 'text-gold bg-gold/10' : 'text-white/70 hover:bg-white/5'
                  }`}
                >
                  {opt.label}
                </button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AdminCategoriesPage() {
  const router = useRouter();
  const user   = useAuthStore((s) => s.user);

  const [cats,      setCats]      = useState<Category[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [toggling,  setToggling]  = useState<number | null>(null);
  const [deleting,  setDeleting]  = useState<number | null>(null);
  const [error,     setError]     = useState('');

  // inline rename state
  const [editingId,   setEditingId]   = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [renaming,    setRenaming]    = useState(false);
  const editInputRef = useRef<HTMLInputElement>(null);

  // 3-level form state
  const [showForm, setShowForm]   = useState(false);
  const [f1,       setF1]        = useState<number | ''>('');   // selected main ID
  const [f2,       setF2]        = useState<number | ''>('');   // selected sub ID
  const [f3Name,   setF3Name]    = useState('');                // new type name
  const [newMainName, setNewMainName] = useState('');
  const [newSubName,  setNewSubName]  = useState('');
  const [saving,   setSaving]    = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    if (!(user.role & 6)) { router.push('/access-denied'); return; }
    loadCategories();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, router]);

  useEffect(() => {
    if (editingId !== null) editInputRef.current?.focus();
  }, [editingId]);

  // Reset sub/type when main changes
  useEffect(() => {
    setF2(''); setNewSubName(''); setF3Name('');
  }, [f1]);

  // Reset type when sub changes
  useEffect(() => {
    setF3Name('');
  }, [f2]);

  const loadCategories = () => {
    setLoading(true);
    categoryApi.getAll()
      .then((r) => setCats(r.data))
      .catch(() => setError('Failed to load categories.'))
      .finally(() => setLoading(false));
  };

  const resetForm = () => {
    setF1(''); setF2(''); setF3Name(''); setNewMainName(''); setNewSubName(''); setFormError('');
  };

  // ── Derived options ──────────────────────────────────────────────
  const mainOpts = cats
    .filter((c) => c.depth === 0)
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
    .map((c) => ({ id: c.id, label: c.name }));

  const subOpts = cats
    .filter((c) => c.depth === 1 && typeof f1 === 'number' && c.parentId === f1)
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
    .map((c) => ({ id: c.id, label: c.name }));

  // ── Create logic ─────────────────────────────────────────────────
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Determine the action based on what's filled:
    // Priority: Type > New Sub > New Main

    if (f3Name.trim()) {
      // Create a TYPE under existing sub
      if (typeof f2 !== 'number') { setFormError('Select a sub-category first.'); return; }
      setSaving(true);
      try {
        await categoryApi.create({ name: f3Name.trim(), parentId: f2 });
        resetForm(); loadCategories();
      } catch { setFormError('Failed to create type.'); }
      finally { setSaving(false); }
      return;
    }

    if (newSubName.trim()) {
      // Create a SUB under existing main
      if (typeof f1 !== 'number') { setFormError('Select a main category first.'); return; }
      setSaving(true);
      try {
        await categoryApi.create({ name: newSubName.trim(), parentId: f1 });
        resetForm(); loadCategories();
      } catch { setFormError('Failed to create sub-category.'); }
      finally { setSaving(false); }
      return;
    }

    if (newMainName.trim()) {
      // Create a new MAIN category
      setSaving(true);
      try {
        await categoryApi.create({ name: newMainName.trim(), parentId: null });
        resetForm(); loadCategories();
      } catch { setFormError('Failed to create main category.'); }
      finally { setSaving(false); }
      return;
    }

    setFormError('Fill in at least one new category name.');
  };

  // ── Toggle / rename / delete ─────────────────────────────────────
  const handleToggle = async (cat: Category) => {
    setToggling(cat.id);
    setError('');
    try {
      await categoryApi.setActive(cat.id, !cat.active);
      setCats((prev) => prev.map((c) => c.id === cat.id ? { ...c, active: !c.active } : c));
    } catch { setError('Failed to update category.'); }
    finally { setToggling(null); }
  };

  const startEdit = (cat: Category) => { setEditingId(cat.id); setEditingName(cat.name); };
  const cancelEdit = () => { setEditingId(null); setEditingName(''); };

  const handleRename = async (id: number) => {
    const trimmed = editingName.trim();
    if (!trimmed) return;
    setRenaming(true);
    setError('');
    try {
      await categoryApi.rename(id, trimmed);
      setCats((prev) => prev.map((c) => c.id === id ? { ...c, name: trimmed } : c));
      setEditingId(null);
    } catch { setError('Failed to rename category.'); }
    finally { setRenaming(false); }
  };

  const handleDelete = async (cat: Category) => {
    const childCount = cats.filter((c) => c.parentId === cat.id).length;
    const confirmMsg = childCount > 0
      ? `Delete "${cat.name}" and its ${childCount} child categor${childCount === 1 ? 'y' : 'ies'}?`
      : `Delete "${cat.name}"?`;
    if (!window.confirm(confirmMsg)) return;
    setDeleting(cat.id);
    setError('');
    try {
      await categoryApi.delete(cat.id);
      const toRemove = new Set<number>();
      const queue = [cat.id];
      while (queue.length) {
        const cur = queue.shift()!;
        toRemove.add(cur);
        cats.filter((c) => c.parentId === cur).forEach((c) => queue.push(c.id));
      }
      setCats((prev) => prev.filter((c) => !toRemove.has(c.id)));
    } catch { setError('Failed to delete category.'); }
    finally { setDeleting(null); }
  };

  const mains = cats
    .filter((c) => c.depth === 0)
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

  return (
    <div className="min-h-screen pt-20 px-4 pb-12">
      <div className="max-w-6xl mx-auto flex gap-6">
        <DashboardSidebar title="Admin Panel" items={NAV_ITEMS} />

        <div className="flex-1 min-w-0">
          {/* header */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-gold text-xs tracking-[0.3em] uppercase mb-1">Storefront</p>
                <h1 className="text-2xl font-black flex items-center gap-3">
                  <Tag className="w-6 h-6 text-gold" /> Category Management
                </h1>
                <p className="text-white/40 text-sm mt-2">
                  Add, rename, delete, or hide categories. Changes reflect immediately.
                </p>
              </div>
              <button
                onClick={() => { setShowForm((v) => !v); resetForm(); }}
                className="shrink-0 flex items-center gap-2 px-4 py-2 bg-gold text-black font-bold text-sm rounded-xl hover:bg-gold/90 transition-colors"
              >
                {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {showForm ? 'Cancel' : 'Add Category'}
              </button>
            </div>
          </motion.div>

          {/* ── 3-column add form ── */}
          <AnimatePresence>
            {showForm && (
              <motion.form
                onSubmit={handleCreate}
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mb-6 bg-surface border border-gold/30 rounded-2xl p-5 overflow-visible"
              >
                <p className="text-gold text-xs tracking-[0.2em] uppercase font-medium mb-4">New Category</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                  {/* ── Column 1: MAIN ── */}
                  <div className="space-y-2">
                    <p className="text-white/40 text-[11px] uppercase tracking-widest font-medium">1 — Main Category</p>
                    <CatDropdown
                      placeholder="Select existing main…"
                      options={mainOpts}
                      value={f1}
                      onChange={setF1}
                    />
                    <p className="text-white/25 text-[11px] text-center">— or create new —</p>
                    <input
                      type="text"
                      value={newMainName}
                      onChange={(e) => setNewMainName(e.target.value)}
                      placeholder="New main name…"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-gold/50 placeholder:text-white/20 transition-colors"
                    />
                  </div>

                  {/* ── Column 2: SUB ── */}
                  <div className="space-y-2">
                    <p className={`text-[11px] uppercase tracking-widest font-medium ${typeof f1 === 'number' ? 'text-white/40' : 'text-white/15'}`}>
                      2 — Sub-Category
                    </p>
                    <CatDropdown
                      placeholder="Select existing sub…"
                      options={subOpts}
                      value={f2}
                      onChange={setF2}
                      disabled={typeof f1 !== 'number'}
                    />
                    <p className={`text-[11px] text-center ${typeof f1 === 'number' ? 'text-white/25' : 'text-white/10'}`}>— or create new —</p>
                    <input
                      type="text"
                      value={newSubName}
                      onChange={(e) => setNewSubName(e.target.value)}
                      placeholder="New sub name…"
                      disabled={typeof f1 !== 'number'}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-gold/50 placeholder:text-white/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    />
                  </div>

                  {/* ── Column 3: TYPE ── */}
                  <div className="space-y-2">
                    <p className={`text-[11px] uppercase tracking-widest font-medium ${typeof f2 === 'number' ? 'text-white/40' : 'text-white/15'}`}>
                      3 — Type
                    </p>
                    <input
                      type="text"
                      value={f3Name}
                      onChange={(e) => setF3Name(e.target.value)}
                      placeholder="New type name…"
                      disabled={typeof f2 !== 'number'}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-gold/50 placeholder:text-white/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    />
                    <p className={`text-[11px] ${typeof f2 === 'number' ? 'text-white/25' : 'text-white/10'}`}>
                      Requires a selected sub-category
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                  {formError ? (
                    <p className="text-red-400 text-xs">{formError}</p>
                  ) : (
                    <p className="text-white/25 text-xs">
                      Fill the deepest level you want to create
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 bg-gold text-black font-bold text-sm rounded-xl hover:bg-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving…' : 'Create'}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* summary */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-3 gap-4 mb-8"
          >
            {[
              { label: 'Main Categories', count: cats.filter((c) => c.depth === 0 && c.active).length, total: cats.filter((c) => c.depth === 0).length },
              { label: 'Sub-Categories',  count: cats.filter((c) => c.depth === 1 && c.active).length, total: cats.filter((c) => c.depth === 1).length },
              { label: 'Types',           count: cats.filter((c) => c.depth === 2 && c.active).length, total: cats.filter((c) => c.depth === 2).length },
            ].map(({ label, count, total }) => (
              <div key={label} className="bg-surface border border-white/10 rounded-2xl p-4 text-center">
                <div className="text-2xl font-black text-gold">{count}</div>
                <div className="text-white/40 text-xs mt-0.5">of {total} showing</div>
                <div className="text-white/60 text-xs font-medium mt-0.5">{label}</div>
              </div>
            ))}
          </motion.div>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <p className="text-white/30 text-center py-16">Loading…</p>
          ) : (
            <div className="space-y-4">
              {mains.map((main, idx) => {
                const section = [main, ...buildTreeOrder(cats, main.id)];

                return (
                  <motion.div
                    key={main.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 + idx * 0.04 }}
                    className="bg-surface border border-white/10 rounded-2xl overflow-hidden"
                  >
                    {section.map((cat) => {
                      const depth = Math.min(cat.depth, 2) as 0 | 1 | 2;
                      const isEditing = editingId === cat.id;

                      return (
                        <div
                          key={cat.id}
                          className={`flex items-center justify-between px-5 py-3 border-b border-white/5 last:border-0 transition-opacity ${
                            !cat.active ? 'opacity-50' : ''
                          } ${depth === 0 ? 'bg-white/[0.02]' : ''}`}
                        >
                          <div className={`flex items-center gap-2.5 flex-1 min-w-0 ${DEPTH_INDENT[depth]}`}>
                            {depth > 0 && (
                              <span className="text-white/15 text-xs select-none shrink-0">{'─'.repeat(depth)}</span>
                            )}
                            {isEditing ? (
                              <input
                                ref={editInputRef}
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleRename(cat.id);
                                  if (e.key === 'Escape') cancelEdit();
                                }}
                                className="flex-1 bg-white/10 border border-gold/40 rounded-lg px-3 py-1 text-sm outline-none text-white min-w-0"
                              />
                            ) : (
                              <>
                                <span className={`text-sm truncate ${DEPTH_COLOR[depth]}`}>{cat.name}</span>
                                <span className="text-white/20 text-[10px] uppercase tracking-widest shrink-0">
                                  {DEPTH_LABEL[depth]}
                                </span>
                              </>
                            )}
                          </div>

                          <div className="flex items-center gap-1 ml-3 shrink-0">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={() => handleRename(cat.id)}
                                  disabled={renaming}
                                  title="Save rename"
                                  className="p-1.5 rounded-lg text-green-400 hover:bg-green-500/10 transition-colors disabled:opacity-40"
                                >
                                  {renaming
                                    ? <span className="w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin block" />
                                    : <Check className="w-3.5 h-3.5" />}
                                </button>
                                <button onClick={cancelEdit} title="Cancel"
                                  className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors">
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button onClick={() => startEdit(cat)} title="Rename"
                                  className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-colors">
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={() => handleToggle(cat)}
                                  disabled={toggling === cat.id}
                                  title={cat.active ? 'Hide from Shop' : 'Show in Shop'}
                                  className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
                                    cat.active
                                      ? 'border-gold/40 text-gold bg-gold/10 hover:bg-gold/20'
                                      : 'border-white/10 text-white/40 hover:border-white/30'
                                  }`}
                                >
                                  {toggling === cat.id ? (
                                    <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                                  ) : cat.active ? (
                                    <><Eye className="w-3 h-3" /> Visible</>
                                  ) : (
                                    <><EyeOff className="w-3 h-3" /> Hidden</>
                                  )}
                                </button>

                                <button
                                  onClick={() => handleDelete(cat)}
                                  disabled={deleting === cat.id}
                                  title="Delete"
                                  className="p-1.5 rounded-lg text-red-400/40 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-30"
                                >
                                  {deleting === cat.id
                                    ? <span className="w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin block" />
                                    : <Trash2 className="w-3.5 h-3.5" />}
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
