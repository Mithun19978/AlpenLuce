'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag, ShoppingCart, ChevronRight, Tag, SlidersHorizontal,
  X, Check, Search, ArrowUpDown, Home,
} from 'lucide-react';
import Link from 'next/link';
import { useShallow } from 'zustand/react/shallow';
import { useAuthStore, useCurrencyStore } from '@/lib/store';
import { garmentApi, publicCategoryApi, cartApi } from '@/lib/api';
import { useCartStore } from '@/lib/store';
import { formatPrice } from '@/lib/currency';
import type { Garment, Category } from '@/types';

// ── helpers ──────────────────────────────────────────────────────────────────

function getDescendants(cats: Category[], id: number): Set<number> {
  const result = new Set<number>([id]);
  const queue = [id];
  while (queue.length > 0) {
    const pid = queue.shift()!;
    cats.filter((c) => c.parentId === pid).forEach((c) => {
      result.add(c.id);
      queue.push(c.id);
    });
  }
  return result;
}

const GENDER_MAP: Record<string, string> = {
  'men':                 'mens',
  'women':               'womens',
  'kids':                'kids',
  'gym & activewear':    'gym',
  'couple collection':   'couple',
  'seasonal collection': 'seasonal',
};

type SortKey = 'default' | 'price-asc' | 'price-desc' | 'name-az' | 'name-za';

const SORT_LABELS: Record<SortKey, string> = {
  'default':    'Default',
  'price-asc':  'Price: Low → High',
  'price-desc': 'Price: High → Low',
  'name-az':    'Name: A → Z',
  'name-za':    'Name: Z → A',
};

// ── tree node ─────────────────────────────────────────────────────────────────

interface TreeNodeProps {
  cat:            Category;
  cats:           Category[];
  selectedId:     number | null;
  expanded:       Set<number>;
  onSelect:       (cat: Category) => void;
  onToggleExpand: (id: number) => void;
}

function TreeNode({ cat, cats, selectedId, expanded, onSelect, onToggleExpand }: TreeNodeProps) {
  const children = useMemo(
    () => cats.filter((c) => c.parentId === cat.id)
              .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)),
    [cats, cat.id]
  );
  const hasChildren = children.length > 0;
  const isExpanded  = expanded.has(cat.id);
  const isSelected  = selectedId === cat.id;

  const textCls = cat.depth === 0
    ? 'text-sm font-semibold text-white/80'
    : cat.depth === 1
      ? 'text-xs font-medium text-white/60'
      : 'text-xs text-white/45';

  const pl = cat.depth === 0 ? 16 : cat.depth === 1 ? 24 : 36;

  return (
    <div>
      <button
        onClick={() => {
          onSelect(cat);
          if (hasChildren) onToggleExpand(cat.id);
        }}
        style={{ paddingLeft: `${pl}px` }}
        className={`w-full flex items-center justify-between pr-3 py-2 transition-colors ${
          isSelected
            ? 'text-gold bg-gold/10'
            : `${textCls} hover:text-white/90 hover:bg-white/5`
        }`}
      >
        <span className={isSelected ? 'text-gold font-medium' : ''}>{cat.name}</span>
        {hasChildren && (
          <ChevronRight
            className={`w-3 h-3 shrink-0 transition-transform ${
              isSelected || isExpanded ? 'text-gold/60' : 'text-white/20'
            } ${isExpanded ? 'rotate-90' : ''}`}
          />
        )}
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            {children.map((child) => (
              <TreeNode
                key={child.id}
                cat={child}
                cats={cats}
                selectedId={selectedId}
                expanded={expanded}
                onSelect={onSelect}
                onToggleExpand={onToggleExpand}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── page ──────────────────────────────────────────────────────────────────────

export default function ShopPage() {
  const router = useRouter();
  const user        = useAuthStore((s) => s.user);
  const setCartItems = useCartStore((s) => s.setItems);
  const cartItems    = useCartStore((s) => s.items);
  const currency     = useCurrencyStore(useShallow((s) => ({ code: s.code, symbol: s.symbol, rate: s.rate })));

  const [garments,   setGarments]   = useState<Garment[]>([]);
  const [cats,       setCats]       = useState<Category[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [expanded,   setExpanded]   = useState<Set<number>>(new Set());
  const [mobileOpen, setMobileOpen] = useState(false);

  // search + sort
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy,      setSortBy]      = useState<SortKey>('default');
  const [sortOpen,    setSortOpen]    = useState(false);

  // size picker / added state
  const [sizeOpen, setSizeOpen] = useState<number | null>(null);
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set());

  // color variant: track active garment per group (keyed by first garment's id in each group)
  const [activeVariant, setActiveVariant] = useState<Map<number, number>>(new Map());

  // read URL params on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const s = params.get('search');
      const c = params.get('category');
      if (s) setSearchQuery(s);
      if (c) setSelectedId(Number(c));
    }
  }, []);

  // load data — no login required (shop is public)
  useEffect(() => {
    garmentApi.shopAll()
      .then((gr) => {
        const available = (gr.data as Garment[]).filter(
          (g) => g.sizes && g.sizes.trim() !== ''
        );
        setGarments(available);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    publicCategoryApi.getActive()
      .then((cr) => setCats((cr.data as Category[]).filter((c) => c.active)))
      .catch(() => {});
  }, []);

  async function handleAddToCart(garmentId: number, size: string) {
    if (!user) {
      localStorage.setItem('alpenluce-pending-cart', JSON.stringify({ garmentId, size }));
      router.push('/auth/login');
      return;
    }
    try {
      await cartApi.add(garmentId, size);
      cartApi.getMine().then((r) => setCartItems(r.data)).catch(() => {});
      setAddedIds((prev) => new Set([...prev, garmentId]));
      setSizeOpen(null);
      setTimeout(() => {
        setAddedIds((prev) => { const n = new Set(prev); n.delete(garmentId); return n; });
      }, 5000);
    } catch {
      // silently fail
    }
  }

  function selectCategory(cat: Category) {
    setSelectedId((prev) => (prev === cat.id ? null : cat.id));
    const ancestors = new Set<number>();
    let cur: Category | undefined = cat;
    while (cur?.parentId) {
      ancestors.add(cur.parentId);
      cur = cats.find((c) => c.id === cur!.parentId);
    }
    setExpanded((prev) => new Set([...prev, ...ancestors]));
    setMobileOpen(false);
  }

  function toggleExpand(id: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // ── category filter ───────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (selectedId === null) return garments;
    const cat = cats.find((c) => c.id === selectedId);
    if (!cat) return garments;
    const descs      = getDescendants(cats, selectedId);
    const byCategory = garments.filter((g) => g.categoryId != null && descs.has(g.categoryId));
    if (cat.depth === 0) {
      const gtype = GENDER_MAP[cat.name.toLowerCase()];
      if (gtype) {
        const byType = garments.filter((g) => g.garmentType === gtype);
        const seen   = new Set(byCategory.map((g) => g.id));
        return [...byCategory, ...byType.filter((g) => !seen.has(g.id))];
      }
    }
    return byCategory;
  }, [garments, cats, selectedId]);

  // ── search + sort ─────────────────────────────────────────────────────────
  const displayed = useMemo(() => {
    let result = [...filtered];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (g) =>
          g.name.toLowerCase().includes(q) ||
          g.description?.toLowerCase().includes(q) ||
          g.type?.toLowerCase().includes(q)
      );
    }
    switch (sortBy) {
      case 'price-asc':  return result.sort((a, b) => a.basePrice - b.basePrice);
      case 'price-desc': return result.sort((a, b) => b.basePrice - a.basePrice);
      case 'name-az':    return result.sort((a, b) => a.name.localeCompare(b.name));
      case 'name-za':    return result.sort((a, b) => b.name.localeCompare(a.name));
      default:           return result;
    }
  }, [filtered, searchQuery, sortBy]);

  // ── group by name for color variants ─────────────────────────────────────
  const groupedDisplayed = useMemo(() => {
    const groups = new Map<string, Garment[]>();
    for (const g of displayed) {
      if (!groups.has(g.name)) groups.set(g.name, []);
      groups.get(g.name)!.push(g);
    }
    return Array.from(groups.values());
  }, [displayed]);

  // ── breadcrumb ────────────────────────────────────────────────────────────
  const breadcrumb = useMemo(() => {
    if (selectedId === null) return [];
    const trail: Category[] = [];
    let cur = cats.find((c) => c.id === selectedId);
    while (cur) {
      trail.unshift(cur);
      cur = cats.find((c) => c.id === cur!.parentId);
    }
    return trail;
  }, [selectedId, cats]);

  const mains = useMemo(
    () => cats.filter((c) => c.depth === 0).sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)),
    [cats]
  );

  const selectedCat = cats.find((c) => c.id === selectedId);

  // ── sidebar ───────────────────────────────────────────────────────────────
  const SidebarContent = () => (
    <div className="py-2">
      <button
        onClick={() => { setSelectedId(null); setMobileOpen(false); }}
        className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
          selectedId === null ? 'text-gold bg-gold/10' : 'text-white/60 hover:text-white hover:bg-white/5'
        }`}
      >
        All Products
        <span className="ml-2 text-white/25 text-xs font-normal">({garments.length})</span>
      </button>
      <div className="my-1 mx-4 h-px bg-white/5" />
      {mains.map((main) => (
        <TreeNode
          key={main.id}
          cat={main}
          cats={cats}
          selectedId={selectedId}
          expanded={expanded}
          onSelect={selectCategory}
          onToggleExpand={toggleExpand}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen pt-24 px-4 pb-16">
      <div className="max-w-6xl mx-auto">

        {/* ── Quick nav: Home ──────────────────────────────────────── */}
        <div className="flex items-center mb-4">
          <Link
            href={user ? '/home' : '/'}
            className="flex items-center gap-1.5 text-sm text-white/45 hover:text-white transition-colors"
          >
            <Home className="w-3.5 h-3.5" /> Home
          </Link>
        </div>

        {/* header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gold text-xs tracking-[0.3em] uppercase mb-1">Catalogue</p>
              <h1 className="text-3xl font-black flex items-center gap-3">
                <ShoppingBag className="w-7 h-7 text-gold" /> Shop
              </h1>
            </div>
            {/* mobile filter button */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 bg-surface border border-white/10 rounded-xl text-sm text-white/60 hover:border-gold/30 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              {selectedCat ? selectedCat.name : 'Categories'}
            </button>
          </div>

          {/* Search + Sort bar */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search garments, types…"
                className="w-full pl-10 pr-9 py-2.5 bg-surface border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-gold/50 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort */}
            <div className="relative">
              <button
                onClick={() => setSortOpen((v) => !v)}
                className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-white/10 rounded-xl text-sm text-white/60 hover:border-gold/30 hover:text-white transition-colors whitespace-nowrap"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                {SORT_LABELS[sortBy]}
              </button>
              <AnimatePresence>
                {sortOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.12 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-xl py-1 z-30"
                  >
                    {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
                      <button
                        key={key}
                        onClick={() => { setSortBy(key); setSortOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                          sortBy === key ? 'text-gold bg-gold/10' : 'text-white/60 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {SORT_LABELS[key]}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <span className="text-white/30 text-sm">
              {groupedDisplayed.length} item{groupedDisplayed.length !== 1 ? 's' : ''}
            </span>
          </div>
        </motion.div>

        {/* mobile overlay */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/70 lg:hidden"
              onClick={() => setMobileOpen(false)}
            >
              <motion.div
                initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
                transition={{ type: 'tween', duration: 0.22 }}
                className="absolute left-0 top-0 bottom-0 w-72 bg-[#0a0a0a] border-r border-white/10 overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
                  <p className="text-xs font-bold tracking-[0.2em] uppercase text-white/40 flex items-center gap-1.5">
                    <Tag className="w-3 h-3" /> Categories
                  </p>
                  <button onClick={() => setMobileOpen(false)} className="text-white/30 hover:text-white transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <SidebarContent />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-6">
          {/* desktop sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
            className="hidden lg:block w-52 shrink-0"
          >
            <div className="sticky top-24 bg-surface border border-white/10 rounded-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-white/10">
                <p className="text-xs font-bold tracking-[0.2em] uppercase text-white/40 flex items-center gap-1.5">
                  <Tag className="w-3 h-3" /> Categories
                </p>
              </div>
              <div className="max-h-[72vh] overflow-y-auto">
                <SidebarContent />
              </div>
            </div>
          </motion.aside>

          {/* floating cart button */}
          {cartItems.length > 0 && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                className="fixed bottom-6 right-6 z-40"
              >
                <Link
                  href="/cart"
                  className="flex items-center gap-2 px-5 py-3 bg-gold text-black font-bold text-sm rounded-2xl shadow-lg hover:bg-gold/90 transition-colors"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Cart ({cartItems.length})
                </Link>
              </motion.div>
            </AnimatePresence>
          )}

          {/* product grid */}
          <div className="flex-1 min-w-0">

            {/* breadcrumb */}
            {breadcrumb.length > 0 && (
              <div className="flex items-center gap-1.5 mb-5 text-xs text-white/35 flex-wrap">
                <button onClick={() => setSelectedId(null)} className="hover:text-white/70 transition-colors">All</button>
                {breadcrumb.map((bc, i) => (
                  <span key={bc.id} className="flex items-center gap-1.5">
                    <ChevronRight className="w-3 h-3 text-white/15" />
                    <button
                      onClick={() => selectCategory(bc)}
                      className={i === breadcrumb.length - 1 ? 'text-gold font-medium' : 'hover:text-white/70 transition-colors'}
                    >
                      {bc.name}
                    </button>
                  </span>
                ))}
                <button
                  onClick={() => setSelectedId(null)}
                  className="ml-auto text-white/25 hover:text-white/50 border border-white/10 rounded-lg px-2 py-0.5 transition-colors"
                >
                  Clear ×
                </button>
              </div>
            )}

            {/* guest sign-in prompt */}
            {!user && (
              <div className="mb-5 px-4 py-3 bg-gold/5 border border-gold/20 rounded-xl flex items-center justify-between gap-4">
                <p className="text-white/50 text-sm">
                  <span className="text-gold font-medium">Sign in</span> to add items to your cart and place orders
                </p>
                <Link
                  href="/auth/login"
                  className="shrink-0 text-xs font-bold px-4 py-2 bg-gold text-black rounded-lg hover:bg-gold/90 transition-colors"
                >
                  Sign In
                </Link>
              </div>
            )}

            {loading ? (
              <p className="text-white/30 text-center py-20">Loading catalogue…</p>
            ) : displayed.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-white/30 text-sm">
                  {searchQuery ? `No results for "${searchQuery}"` : 'No garments in this category yet.'}
                </p>
                <button
                  onClick={() => { setSelectedId(null); setSearchQuery(''); }}
                  className="mt-3 text-gold text-xs hover:underline"
                >
                  Browse all products
                </button>
              </div>
            ) : (
              <motion.div
                key={`${selectedId ?? 'all'}-${searchQuery}-${sortBy}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18 }}
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
              >
                {groupedDisplayed.map((group, idx) => {
                  const firstId   = group[0].id;
                  const activeId  = activeVariant.get(firstId) ?? firstId;
                  const g         = group.find((x) => x.id === activeId) ?? group[0];
                  const hasVariants = group.length > 1;

                  return (
                    <motion.div
                      key={firstId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="group bg-surface border border-white/10 rounded-2xl p-5 flex flex-col gap-4 hover:border-gold/25 transition-all"
                    >
                      {/* image + type badge */}
                      <div className="flex items-start justify-between">
                        {g.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={g.imageUrl} alt={g.name} className="w-16 h-16 rounded-xl object-cover border border-white/10" />
                        ) : (
                          <span className="text-4xl">👕</span>
                        )}
                        {g.type && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gold/10 text-gold border border-gold/20">
                            {g.type}
                          </span>
                        )}
                      </div>

                      {/* info */}
                      <div className="flex-1">
                        <p className="font-bold text-sm leading-snug">{g.name}</p>
                        {g.description && (
                          <p className="text-white/35 text-xs mt-1 line-clamp-2 leading-relaxed">{g.description}</p>
                        )}
                        {g.gsm && <p className="text-white/25 text-xs mt-1">{g.gsm} GSM</p>}

                        {/* color swatches — shown when multiple variants exist */}
                        {hasVariants && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {group.map((variant) => (
                              <button
                                key={variant.id}
                                title={variant.baseColor ?? 'Default'}
                                onClick={() => {
                                  setActiveVariant((prev) => new Map(prev).set(firstId, variant.id));
                                  setSizeOpen(null);
                                }}
                                className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                                  variant.id === g.id
                                    ? 'border-gold text-gold bg-gold/10 font-medium'
                                    : 'border-white/15 text-white/40 hover:border-white/30'
                                }`}
                              >
                                {variant.baseColor || 'Default'}
                              </button>
                            ))}
                          </div>
                        )}
                        {/* single-variant color label */}
                        {!hasVariants && g.baseColor && (
                          <p className="text-white/25 text-xs mt-1">Color: {g.baseColor}</p>
                        )}
                      </div>

                      {/* price + cart */}
                      <div className="pt-2 border-t border-white/5">
                        <div className="flex items-center justify-between mb-2 gap-2">
                          <span className="text-gold font-black text-sm shrink-0">
                            {formatPrice(g.basePrice, currency)}
                          </span>
                          {addedIds.has(g.id) ? (
                            <div className="flex items-center gap-2">
                              <span className="flex items-center gap-1 text-xs font-bold text-green-400">
                                <Check className="w-3.5 h-3.5" /> Added!
                              </span>
                              <Link
                                href="/cart"
                                className="text-xs font-bold px-3 py-1.5 bg-gold/15 text-gold border border-gold/30 rounded-xl hover:bg-gold/25 transition-colors whitespace-nowrap"
                              >
                                View Cart →
                              </Link>
                            </div>
                          ) : (
                            <button
                              onClick={() => setSizeOpen(sizeOpen === g.id ? null : g.id)}
                              className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 bg-gold text-black rounded-xl hover:bg-gold/90 transition-colors whitespace-nowrap"
                            >
                              <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
                            </button>
                          )}
                        </div>
                        {sizeOpen === g.id && (
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {(g.sizes || 'S,M,L,XL,XXL').split(',').map((sz) => (
                              <button
                                key={sz}
                                onClick={() => handleAddToCart(g.id, sz.trim())}
                                className="text-xs px-3 py-1.5 border border-white/20 rounded-lg hover:border-gold hover:text-gold transition-colors"
                              >
                                {sz.trim()}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
