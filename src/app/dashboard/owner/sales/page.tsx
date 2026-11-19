'use client';

import React, { useEffect, useState, useCallback } from 'react';
import TopBar from '@/components/layout/TopBar';
import { Search, Filter, Download, TrendingUp } from 'lucide-react';
import { formatRupiah, formatDateTime, getStatusBadgeClass, getStatusLabel } from '@/lib/utils';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';

export default function OwnerSalesPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [trend, setTrend] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stores, setStores] = useState<any[]>([]);
  const [storeFilter, setStoreFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 25;

  const loadData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
    if (storeFilter) params.set('storeId', storeFilter);
    if (dateFrom) params.set('dateFrom', dateFrom);
    if (dateTo) params.set('dateTo', dateTo);

    await Promise.all([
      fetch(`/api/sales?${params}`).then(r => r.json()).then(d => { setSales(d.sales || []); setTotal(d.total || 0); }),
      fetch('/api/dashboard/stats?period=monthly').then(r => r.json()).then(d => setTrend(d.monthlyTrend || [])),
    ]);
    setLoading(false);
  }, [storeFilter, dateFrom, dateTo, page]);

  useEffect(() => { loadData(); fetch('/api/stores').then(r => r.json()).then(d => setStores(d.stores || [])); }, [loadData]);

  return (
    <div>
      <TopBar title="Laporan Penjualan" breadcrumbs={[{ label: 'Owner' }, { label: 'Laporan Penjualan' }]} />
      <div className="p-4 md:p-6">
        {/* Revenue Trend Chart */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 mb-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Tren Pendapatan 12 Bulan</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trend}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#B91C2C" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#B91C2C" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v/1000000).toFixed(0)}Jt`} />
              <Tooltip formatter={(v: number) => [formatRupiah(v), 'Pendapatan']} contentStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="revenue" stroke="#B91C2C" strokeWidth={2} fill="url(#salesGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Toko</label>
              <select value={storeFilter} onChange={e => setStoreFilter(e.target.value)} className="input-field text-sm w-40">
                <option value="">Semua Toko</option>
                {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Dari</label>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="input-field text-sm w-36" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Sampai</label>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="input-field text-sm w-36" />
            </div>
            <button onClick={() => { setStoreFilter(''); setDateFrom(''); setDateTo(''); setPage(1); }} className="btn-outline text-sm">Reset</button>
          </div>
        </div>

        {/* Sales Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-900">
              Transaksi Penjualan <span className="text-gray-400 font-normal">({total})</span>
            </span>
          </div>
          {loading ? (
            <div className="p-8 text-center text-gray-400 text-sm">Memuat...</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Waktu</th>
                      <th>Karyawan</th>
                      <th>Lokasi</th>
                      <th>Produk</th>
                      <th>Item</th>
                      <th>Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.map((sale: any) => (
                      <tr key={sale.id}>
                        <td className="text-xs">{formatDateTime(sale.saleDate)}</td>
                        <td>
                          <p className="text-xs font-medium">{sale.employee?.fullName}</p>
                          <p className="text-xs text-gray-400">{sale.employee?.employeeCode}</p>
                        </td>
                        <td className="text-xs">{sale.store?.name || sale.bazaar?.name || 'Bazaar'}</td>
                        <td className="text-xs text-gray-500 max-w-[180px] truncate">
                          {sale.items?.map((i: any) => i.product?.name).join(', ')}
                        </td>
                        <td className="text-xs font-medium">{sale.totalItems}</td>
                        <td className="text-xs font-semibold text-primary">{formatRupiah(sale.totalAmount)}</td>
                        <td>
                          <span className={`badge-status ${getStatusBadgeClass(sale.status)}`}>
                            {getStatusLabel(sale.status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {sales.length === 0 && (
                      <tr><td colSpan={7} className="text-center py-8 text-gray-400 text-sm">Tidak ada data penjualan</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              {total > LIMIT && (
                <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <span>Menampilkan {((page-1)*LIMIT)+1}–{Math.min(page*LIMIT, total)} dari {total}</span>
                  <div className="flex gap-1">
                    <button disabled={page === 1} onClick={() => setPage(p => p-1)} className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 hover:bg-gray-50">←</button>
                    <span className="px-3 py-1">{page}</span>
                    <button disabled={page * LIMIT >= total} onClick={() => setPage(p => p+1)} className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 hover:bg-gray-50">→</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
