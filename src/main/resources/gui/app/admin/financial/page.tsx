'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  BarChart3, TrendingUp, IndianRupee, ShoppingBag, Package,
  Users, Megaphone, Activity, Ticket, Tag, LayoutDashboard,
  AlertTriangle, ArrowUpRight, ArrowDownRight, Layers,
} from 'lucide-react';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import { useAuthStore } from '@/lib/store';
import { analyticsApi } from '@/lib/api';

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

interface ProductStat {
  garmentId: number;
  name: string;
  color: string | null;
  unitsSold: number;
  revenue: number;
  profit: number;
}

interface LowStockItem {
  id: number;
  name: string;
  color: string | null;
  stockQuantity: number;
}

interface AnalyticsSummary {
  totalRevenue: number;
  totalProfit: number;
  totalOrders: number;
  totalUnitsSold: number;
  totalStockValue: number;
  lowStockCount: number;
  topSelling: ProductStat[];
  topByRevenue: ProductStat[];
  lowStockItems: LowStockItem[];
}

const fmt = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;
const pct = (num: number, den: number) =>
  den === 0 ? '0%' : `${((num / den) * 100).toFixed(1)}%`;

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const w = max === 0 ? 0 : Math.min(100, (value / max) * 100);
  return (
    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${w}%` }} />
    </div>
  );
}

export default function FinancialPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) { router.replace('/auth/login'); return; }
    if (!(user.role & 2)) { router.replace('/access-denied'); return; }

    analyticsApi.getSummary()
      .then((res) => setData(res.data))
      .catch(() => setError('Failed to load financial data.'))
      .finally(() => setLoading(false));
  }, [user, router]);

  const margin = data ? ((data.totalProfit / data.totalRevenue) * 100) : 0;
  const avgOrder = data && data.totalOrders > 0
    ? data.totalRevenue / data.totalOrders : 0;
  const totalCost = data ? data.totalRevenue - data.totalProfit : 0;

  const maxTopRevenue = data?.topByRevenue?.[0]?.revenue ?? 1;
  const maxTopUnits   = data?.topSelling?.[0]?.unitsSold  ?? 1;

  return (
    <div className="min-h-screen pt-20 px-4 pb-12">
      <div className="max-w-6xl mx-auto flex gap-6">
        <DashboardSidebar title="Admin Panel" items={NAV_ITEMS} />

        <div className="flex-1 min-w-0">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <p className="text-gold text-xs tracking-[0.3em] uppercase mb-1">Admin Panel</p>
            <h1 className="text-2xl font-black flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-gold" /> Financial Overview
            </h1>
            <p className="text-white/40 text-sm mt-2">
              Revenue, profit margins, top products, cost breakdown and inventory value.
            </p>
          </motion.div>

          {loading && (
            <div className="text-white/30 text-sm text-center py-20">Loading financial data…</div>
          )}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-4 text-red-400 text-sm mb-6">{error}</div>
          )}

          {data && !loading && (
            <>
              {/* ── Key Metrics ───────────────────────────────── */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.06 }}
                className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                  {
                    label: 'Total Revenue', value: fmt(data.totalRevenue),
                    sub: `${data.totalOrders} orders`,
                    icon: IndianRupee, color: 'text-green-400', bg: 'bg-green-400/10',
                    trend: null,
                  },
                  {
                    label: 'Net Profit', value: fmt(data.totalProfit),
                    sub: `Margin: ${pct(data.totalProfit, data.totalRevenue)}`,
                    icon: TrendingUp, color: 'text-gold', bg: 'bg-gold/10',
                    trend: data.totalProfit > 0 ? 'up' : 'down',
                  },
                  {
                    label: 'Avg Order Value', value: fmt(avgOrder),
                    sub: `${data.totalUnitsSold} units total`,
                    icon: ShoppingBag, color: 'text-blue-400', bg: 'bg-blue-400/10',
                    trend: null,
                  },
                  {
                    label: 'Stock Value', value: fmt(data.totalStockValue),
                    sub: `${data.lowStockCount} items low stock`,
                    icon: Layers, color: 'text-purple-400', bg: 'bg-purple-400/10',
                    trend: null,
                  },
                ].map(({ label, value, sub, icon: Icon, color, bg, trend }) => (
                  <div key={label} className="bg-surface border border-white/10 rounded-2xl p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center`}>
                        <Icon className={`w-4.5 h-4.5 ${color}`} />
                      </div>
                      {trend === 'up' && <ArrowUpRight className="w-4 h-4 text-green-400" />}
                      {trend === 'down' && <ArrowDownRight className="w-4 h-4 text-red-400" />}
                    </div>
                    <div className={`text-xl font-black ${color} truncate`}>{value}</div>
                    <div className="text-white/40 text-xs mt-0.5">{label}</div>
                    <div className="text-white/25 text-xs mt-1">{sub}</div>
                  </div>
                ))}
              </motion.div>

              {/* ── Revenue vs Cost Breakdown ─────────────────── */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-surface border border-white/10 rounded-2xl p-6 mb-6">
                <h2 className="text-xs text-gold tracking-[0.25em] uppercase font-medium mb-5">
                  Revenue vs Cost Breakdown
                </h2>
                <div className="grid grid-cols-3 gap-6 mb-6 text-center">
                  <div>
                    <div className="text-lg font-black text-green-400">{fmt(data.totalRevenue)}</div>
                    <div className="text-white/40 text-xs mt-0.5">Total Revenue</div>
                  </div>
                  <div>
                    <div className="text-lg font-black text-red-400">{fmt(totalCost)}</div>
                    <div className="text-white/40 text-xs mt-0.5">Total Cost</div>
                  </div>
                  <div>
                    <div className={`text-lg font-black ${data.totalProfit >= 0 ? 'text-gold' : 'text-red-400'}`}>
                      {fmt(data.totalProfit)}
                    </div>
                    <div className="text-white/40 text-xs mt-0.5">Net Profit</div>
                  </div>
                </div>
                {/* stacked bar */}
                <div className="w-full h-4 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-gold transition-all"
                    style={{ width: pct(data.totalProfit, data.totalRevenue) }}
                    title={`Profit ${pct(data.totalProfit, data.totalRevenue)}`}
                  />
                  <div
                    className="h-full bg-red-500/60"
                    style={{ width: pct(totalCost, data.totalRevenue) }}
                    title={`Cost ${pct(totalCost, data.totalRevenue)}`}
                  />
                </div>
                <div className="flex gap-4 mt-3 text-xs text-white/40">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-gold inline-block" />Profit {pct(data.totalProfit, data.totalRevenue)}</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-red-500/60 inline-block" />Cost {pct(totalCost, data.totalRevenue)}</span>
                </div>

                {/* Profit margin indicator */}
                <div className="mt-5 pt-5 border-t border-white/5 flex items-center justify-between">
                  <div className="text-sm">
                    <span className="text-white/50">Profit Margin </span>
                    <span className={`font-bold text-base ${margin >= 30 ? 'text-green-400' : margin >= 15 ? 'text-gold' : 'text-red-400'}`}>
                      {margin.toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-xs text-white/30">
                    {margin >= 30 ? 'Excellent' : margin >= 15 ? 'Good' : margin >= 0 ? 'Low' : 'Net loss'}
                  </div>
                </div>
              </motion.div>

              {/* ── Top Products by Revenue + by Units ───────── */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.14 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

                {/* by Revenue */}
                <div className="bg-surface border border-white/10 rounded-2xl p-5">
                  <h2 className="text-xs text-gold tracking-[0.25em] uppercase font-medium mb-4">
                    Top Products by Revenue
                  </h2>
                  {data.topByRevenue.length === 0 ? (
                    <p className="text-white/30 text-sm">No sales data yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {data.topByRevenue.map((item, i) => (
                        <div key={item.garmentId}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-white/20 text-xs w-4 text-right shrink-0">{i + 1}</span>
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate">{item.name}</p>
                                {item.color && <p className="text-xs text-white/30">{item.color}</p>}
                              </div>
                            </div>
                            <div className="text-right shrink-0 ml-2">
                              <p className="text-sm font-bold text-green-400">{fmt(item.revenue)}</p>
                              <p className="text-xs text-white/30">{item.unitsSold} sold</p>
                            </div>
                          </div>
                          <ProgressBar value={item.revenue} max={maxTopRevenue} color="bg-green-400/50" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* by Units */}
                <div className="bg-surface border border-white/10 rounded-2xl p-5">
                  <h2 className="text-xs text-gold tracking-[0.25em] uppercase font-medium mb-4">
                    Top Products by Units Sold
                  </h2>
                  {data.topSelling.length === 0 ? (
                    <p className="text-white/30 text-sm">No sales data yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {data.topSelling.map((item, i) => (
                        <div key={item.garmentId}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-white/20 text-xs w-4 text-right shrink-0">{i + 1}</span>
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate">{item.name}</p>
                                {item.color && <p className="text-xs text-white/30">{item.color}</p>}
                              </div>
                            </div>
                            <div className="text-right shrink-0 ml-2">
                              <p className="text-sm font-bold text-gold">{item.unitsSold} units</p>
                              <p className="text-xs text-white/30">{fmt(item.revenue)}</p>
                            </div>
                          </div>
                          <ProgressBar value={item.unitsSold} max={maxTopUnits} color="bg-gold/50" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>

              {/* ── Per-Product Profit Table ───────────────────── */}
              {data.topByRevenue.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.17 }}
                  className="bg-surface border border-white/10 rounded-2xl overflow-hidden mb-6">
                  <div className="px-5 py-4 border-b border-white/5">
                    <h2 className="text-xs text-gold tracking-[0.25em] uppercase font-medium">
                      Product Profit Detail
                    </h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/5 text-white/30 text-xs uppercase tracking-wider">
                          <th className="px-5 py-3 text-left">Product</th>
                          <th className="px-5 py-3 text-right">Units</th>
                          <th className="px-5 py-3 text-right">Revenue</th>
                          <th className="px-5 py-3 text-right">Profit</th>
                          <th className="px-5 py-3 text-right">Margin</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.topByRevenue.map((item) => {
                          const m = item.revenue > 0
                            ? ((item.profit / item.revenue) * 100).toFixed(1) : '0.0';
                          const mNum = parseFloat(m);
                          return (
                            <tr key={item.garmentId} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                              <td className="px-5 py-3">
                                <p className="font-medium">{item.name}</p>
                                {item.color && <p className="text-xs text-white/30">{item.color}</p>}
                              </td>
                              <td className="px-5 py-3 text-right text-white/60">{item.unitsSold}</td>
                              <td className="px-5 py-3 text-right text-green-400 font-semibold">{fmt(item.revenue)}</td>
                              <td className="px-5 py-3 text-right font-semibold">
                                <span className={item.profit >= 0 ? 'text-gold' : 'text-red-400'}>
                                  {fmt(item.profit)}
                                </span>
                              </td>
                              <td className="px-5 py-3 text-right">
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                  mNum >= 30 ? 'bg-green-400/15 text-green-400'
                                  : mNum >= 15 ? 'bg-gold/15 text-gold'
                                  : 'bg-red-400/15 text-red-400'
                                }`}>{m}%</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {/* ── Low Stock Risk ─────────────────────────────── */}
              {data.lowStockItems.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-surface border border-orange-500/20 rounded-2xl overflow-hidden">
                  <div className="px-5 py-4 border-b border-white/5 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-400" />
                    <h2 className="text-xs text-orange-400 tracking-[0.25em] uppercase font-medium">
                      Low / Out of Stock ({data.lowStockCount} items)
                    </h2>
                  </div>
                  <div className="divide-y divide-white/5">
                    {data.lowStockItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between px-5 py-3">
                        <div>
                          <p className="text-sm font-medium">{item.name}</p>
                          {item.color && <p className="text-xs text-white/30">{item.color}</p>}
                        </div>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          item.stockQuantity === 0
                            ? 'bg-red-500/15 text-red-400'
                            : 'bg-orange-500/15 text-orange-400'
                        }`}>
                          {item.stockQuantity === 0 ? 'Out of stock' : `${item.stockQuantity} left`}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
