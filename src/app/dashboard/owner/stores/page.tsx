'use client';

import React, { useEffect, useState } from 'react';
import TopBar from '@/components/layout/TopBar';
import KpiCard from '@/components/dashboard/KpiCard';
import { Store, TrendingUp, Package } from 'lucide-react';
import { formatRupiah, formatNumber } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['#B91C2C', '#1D4ED8', '#059669'];

export default function OwnerStoresPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/dashboard/stats?period=monthly').then(r => r.json()).then(setData);
  }, []);

  if (!data) return <div><TopBar title="Performa Toko" breadcrumbs={[{ label: 'Owner' }, { label: 'Performa Toko' }]} /><div className="p-6 text-center text-gray-400">Memuat...</div></div>;

  return (
    <div>
      <TopBar title="Performa Toko" breadcrumbs={[{ label: 'Owner' }, { label: 'Performa Toko' }]} />
      <div className="p-6">
        {/* Store KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {data.salesByStore?.map((store: any, i: number) => (
            <div key={store.storeId} className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                <h3 className="text-sm font-semibold text-gray-900">{store.storeName}</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Pendapatan</span>
                  <span className="font-semibold text-gray-900">{formatRupiah(store.totalRevenue)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Item Terjual</span>
                  <span className="font-medium">{formatNumber(store.totalItems)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Transaksi</span>
                  <span className="font-medium">{formatNumber(store.totalTransactions)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Comparison Chart */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Perbandingan Pendapatan per Toko</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.salesByStore || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="storeName" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v/1000000).toFixed(0)}Jt`} />
              <Tooltip formatter={(v: number) => [formatRupiah(v), 'Pendapatan']} contentStyle={{ fontSize: 12 }} />
              <Bar dataKey="totalRevenue" radius={[4, 4, 0, 0]}>
                {(data.salesByStore || []).map((_: any, i: number) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
