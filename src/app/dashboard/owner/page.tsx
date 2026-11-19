'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import TopBar from '@/components/layout/TopBar';
import KpiCard from '@/components/dashboard/KpiCard';
import {
  TrendingUp, Users, ShoppingBag, Store, BarChart3, Package,
  RefreshCw, Calendar, Building2, Zap
} from 'lucide-react';
import { formatRupiah, formatNumber } from '@/lib/utils';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const STORE_COLORS = ['#B91C2C', '#1D4ED8', '#059669', '#D97706'];
const CATEGORY_COLORS = ['#B91C2C', '#1D4ED8', '#059669', '#D97706', '#7C3AED'];
const PERIODS = [
  { value: 'daily', label: 'Hari Ini' },
  { value: 'weekly', label: 'Minggu Ini' },
  { value: 'monthly', label: 'Bulan Ini' },
  { value: 'yearly', label: 'Tahun Ini' },
];

export default function OwnerDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('monthly');
  const [storeFilter, setStoreFilter] = useState('all');
  const [stores, setStores] = useState<any[]>([]);

  useEffect(() => {
    if (user && user.role !== 'owner' && user.role !== 'admin') {
      router.replace(`/dashboard/${user.role}`);
    }
  }, [user, router]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ period, storeId: storeFilter });
      const res = await fetch(`/api/dashboard/stats?${params}`);
      const json = await res.json();
      setData(json);
    } catch {
      console.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  }, [period, storeFilter]);

  useEffect(() => {
    fetchData();
    fetch('/api/stores').then(r => r.json()).then(d => setStores(d.stores || []));
  }, [fetchData]);

  const LoadingState = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {[1,2,3,4].map(i => (
        <div key={i} className="bg-white rounded-lg border border-gray-200 p-5 h-28 skeleton" />
      ))}
    </div>
  );

  return (
    <div>
      <TopBar
        title="Dashboard Owner"
        breadcrumbs={[{ label: 'Owner Dashboard' }, { label: 'Beranda' }]}
      />

      <div className="p-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Selamat datang, {user?.fullName?.split(' ')[0]} 👋</h1>
            <p className="text-sm text-gray-500 mt-0.5">Ringkasan performa bisnis Men & Clo</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {/* Store filter */}
            <select
              value={storeFilter}
              onChange={e => setStoreFilter(e.target.value)}
              className="text-sm border border-gray-300 rounded-md px-3 py-1.5 bg-white focus:ring-2 focus:ring-primary/30 focus:border-primary"
            >
              <option value="all">Semua Toko</option>
              {stores.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>

            {/* Period filter */}
            <div className="flex border border-gray-300 rounded-md overflow-hidden bg-white">
              {PERIODS.map(p => (
                <button
                  key={p.value}
                  onClick={() => setPeriod(p.value)}
                  className={`text-xs px-3 py-1.5 transition-colors ${period === p.value ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <button
              onClick={fetchData}
              className="p-1.5 border border-gray-300 rounded-md bg-white text-gray-500 hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        {loading ? <LoadingState /> : data && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KpiCard
              title="Pendapatan Hari Ini"
              value={formatRupiah(data.today.revenue)}
              subtitle={`${formatNumber(data.today.transactions)} transaksi`}
              icon={TrendingUp}
              iconColor="text-primary"
              iconBg="bg-red-50"
              highlight
            />
            <KpiCard
              title={`Pendapatan ${PERIODS.find(p => p.value === period)?.label}`}
              value={formatRupiah(data.period.revenue)}
              subtitle={`${formatNumber(data.period.items)} item terjual`}
              icon={ShoppingBag}
              iconColor="text-blue-600"
              iconBg="bg-blue-50"
            />
            <KpiCard
              title="Pendapatan YTD"
              value={formatRupiah(data.ytdRevenue)}
              subtitle="Total tahun berjalan"
              icon={BarChart3}
              iconColor="text-green-600"
              iconBg="bg-green-50"
              trend="up"
              trendLabel="Tahun ini"
            />
            <KpiCard
              title="Karyawan Aktif"
              value={formatNumber(data.activeEmployees)}
              subtitle={`${data.pendingLeaves} cuti menunggu persetujuan`}
              icon={Users}
              iconColor="text-purple-600"
              iconBg="bg-purple-50"
            />
          </div>
        )}

        {/* Charts Row 1 */}
        {!loading && data && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
              {/* Revenue trend */}
              <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Tren Pendapatan 12 Bulan</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Pendapatan bulanan seluruh toko</p>
                  </div>
                  <Calendar className="h-4 w-4 text-gray-400" />
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={data.monthlyTrend}>
                    <defs>
                      <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#B91C2C" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#B91C2C" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={v => `${(v/1000000).toFixed(0)}Jt`} />
                    <Tooltip
                      formatter={(v: number) => [formatRupiah(v), 'Pendapatan']}
                      contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#B91C2C" strokeWidth={2} fill="url(#revenueGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Category pie chart */}
              <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-900">Distribusi Kategori</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Berdasarkan unit terjual</p>
                </div>
                {data.categoryBreakdown.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={160}>
                      <PieChart>
                        <Pie
                          data={data.categoryBreakdown}
                          dataKey="totalQty"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={65}
                          innerRadius={35}
                        >
                          {data.categoryBreakdown.map((_: any, i: number) => (
                            <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v: number) => [`${v} unit`, 'Qty']} contentStyle={{ fontSize: 12 }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-3 space-y-1">
                      {data.categoryBreakdown.map((cat: any, i: number) => (
                        <div key={cat.name} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ background: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
                            <span className="text-gray-700">{cat.name}</span>
                          </div>
                          <span className="text-gray-500 font-medium">{cat.totalQty} unit</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-40 text-gray-400 text-sm">Tidak ada data</div>
                )}
              </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
              {/* Store performance bar chart */}
              <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Performa per Toko</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Perbandingan pendapatan toko</p>
                  </div>
                  <Building2 className="h-4 w-4 text-gray-400" />
                </div>
                {data.salesByStore.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={data.salesByStore} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={v => `${(v/1000000).toFixed(0)}Jt`} />
                      <YAxis type="category" dataKey="storeName" tick={{ fontSize: 11, fill: '#374151' }} width={80} />
                      <Tooltip formatter={(v: number) => [formatRupiah(v), 'Pendapatan']} contentStyle={{ fontSize: 12 }} />
                      <Bar dataKey="totalRevenue" radius={[0, 4, 4, 0]}>
                        {data.salesByStore.map((_: any, i: number) => (
                          <Cell key={i} fill={STORE_COLORS[i % STORE_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-40 text-gray-400 text-sm">Tidak ada data</div>
                )}
              </div>

              {/* Top products table */}
              <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Produk Terlaris</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Berdasarkan unit terjual</p>
                  </div>
                  <Package className="h-4 w-4 text-gray-400" />
                </div>
                {data.topProducts.length > 0 ? (
                  <div className="space-y-2.5">
                    {data.topProducts.slice(0, 6).map((product: any, i: number) => (
                      <div key={product.productId} className="flex items-center gap-3">
                        <span className="text-xs font-bold text-gray-400 w-4 text-right">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-800 truncate">{product.name}</p>
                          <p className="text-xs text-gray-400">{product.articleCode} · {product.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-semibold text-gray-900">{product.totalQty} unit</p>
                          <p className="text-xs text-gray-400">{formatRupiah(product.totalRevenue)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-40 text-gray-400 text-sm">Tidak ada data</div>
                )}
              </div>
            </div>

            {/* Store Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
              {data.salesByStore.map((store: any, i: number) => (
                <div key={store.storeId} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: STORE_COLORS[i % STORE_COLORS.length] }} />
                    <span className="text-sm font-semibold text-gray-900 truncate">{store.storeName}</span>
                    <span className="text-xs text-gray-400 ml-auto">{store.storeCode}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <p className="text-xs text-gray-400">Pendapatan</p>
                      <p className="text-sm font-bold text-gray-900">{formatRupiah(store.totalRevenue)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Item</p>
                      <p className="text-sm font-bold text-gray-900">{formatNumber(store.totalItems)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Transaksi</p>
                      <p className="text-sm font-bold text-gray-900">{formatNumber(store.totalTransactions)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Low stock alert */}
            {data.lowStockProducts.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Package className="h-4 w-4 text-amber-600" />
                  <h3 className="text-sm font-semibold text-amber-800">Peringatan Stok Menipis</h3>
                  <span className="text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">{data.lowStockProducts.length} produk</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {data.lowStockProducts.slice(0, 8).map((p: any) => (
                    <div key={p.articleCode} className="bg-white rounded-md border border-amber-200 px-3 py-2">
                      <p className="text-xs font-semibold text-gray-800 truncate">{p.articleCode}</p>
                      <p className="text-xs text-gray-500 truncate">{p.name}</p>
                      <p className="text-xs text-amber-700 font-medium mt-1">Stok: {p.totalStock} / Min: {p.minStock}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
