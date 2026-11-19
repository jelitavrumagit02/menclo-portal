'use client';

import React, { useEffect, useState, useCallback } from 'react';
import TopBar from '@/components/layout/TopBar';
import { Search, Package, AlertTriangle, ArrowUp, ArrowDown, Filter } from 'lucide-react';
import { formatRupiah, formatNumber, formatDate } from '@/lib/utils';

export default function InventoryPage() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [storeFilter, setStoreFilter] = useState('');
  const [tab, setTab] = useState<'stock' | 'movements'>('stock');

  const loadData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (storeFilter) params.set('storeId', storeFilter);

    await Promise.all([
      fetch(`/api/inventory?${params}`).then(r => r.json()).then(d => setInventory(d.inventory || [])),
      fetch('/api/inventory/movements?limit=30').then(r => r.json()).then(d => setMovements(d.movements || [])),
    ]);
    setLoading(false);
  }, [search, storeFilter]);

  useEffect(() => {
    loadData();
    fetch('/api/stores').then(r => r.json()).then(d => setStores(d.stores || []));
  }, [loadData]);

  const lowStockItems = inventory.filter(i => i.quantity <= i.product?.minStock);
  const totalStockValue = inventory.reduce((s, i) => s + (i.quantity * (i.product?.sellingPrice || 0)), 0);

  return (
    <div>
      <TopBar title="Inventaris" breadcrumbs={[{ label: 'Inventaris' }]} />

      <div className="p-4 md:p-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <p className="text-xs text-gray-500">Total Produk</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{[...new Set(inventory.map(i => i.productId))].length}</p>
          </div>
          <div className="bg-amber-50 rounded-lg border border-amber-200 p-4 shadow-sm">
            <p className="text-xs text-gray-500">Stok Menipis</p>
            <p className="text-xl font-bold text-amber-600 mt-1">{lowStockItems.length}</p>
          </div>
          <div className="bg-green-50 rounded-lg border border-green-200 p-4 shadow-sm">
            <p className="text-xs text-gray-500">Nilai Total Stok</p>
            <p className="text-xl font-bold text-green-700 mt-1">{formatRupiah(totalStockValue)}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-5">
          {[{ key: 'stock', label: 'Stok Produk' }, { key: 'movements', label: 'Pergerakan Stok' }].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as any)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === t.key ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'stock' && (
          <>
            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-4">
              <div className="relative flex-1 min-w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari produk..." className="input-field pl-9 text-sm" />
              </div>
              <select value={storeFilter} onChange={e => setStoreFilter(e.target.value)} className="input-field text-sm w-40">
                <option value="">Semua Toko</option>
                {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            {/* Low stock warning */}
            {lowStockItems.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-700">
                  <strong>{lowStockItems.length} produk</strong> mendekati atau di bawah batas stok minimum dan perlu segera diisi.
                </p>
              </div>
            )}

            {/* Inventory table */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              {loading ? (
                <div className="p-8 text-center text-gray-400 text-sm">Memuat...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Kode Artikel</th>
                        <th>Nama Produk</th>
                        <th>Kategori</th>
                        <th>Toko</th>
                        <th>Stok</th>
                        <th>Min. Stok</th>
                        <th>Harga Jual</th>
                        <th>Nilai Stok</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventory.map((item: any) => (
                        <tr key={item.id} className={item.quantity <= (item.product?.minStock || 0) ? 'bg-amber-50/50' : ''}>
                          <td className="text-xs font-mono font-medium">{item.product?.articleCode}</td>
                          <td className="text-xs font-medium text-gray-900">{item.product?.name}</td>
                          <td className="text-xs text-gray-500">{item.product?.category?.name}</td>
                          <td className="text-xs text-gray-500">{item.store?.name}</td>
                          <td className="text-xs font-semibold">
                            <span className={item.quantity <= (item.product?.minStock || 0) ? 'text-red-600' : 'text-gray-900'}>
                              {item.quantity}
                            </span>
                          </td>
                          <td className="text-xs text-gray-500">{item.product?.minStock}</td>
                          <td className="text-xs">{formatRupiah(item.product?.sellingPrice || 0)}</td>
                          <td className="text-xs font-medium">{formatRupiah((item.product?.sellingPrice || 0) * item.quantity)}</td>
                          <td>
                            {item.quantity <= (item.product?.minStock || 0) ? (
                              <span className="badge-status badge-warning text-xs">Menipis</span>
                            ) : (
                              <span className="badge-status badge-success text-xs">Tersedia</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {inventory.length === 0 && (
                    <div className="p-8 text-center text-gray-400 text-sm">Tidak ada data inventaris</div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {tab === 'movements' && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th>Produk</th>
                    <th>Toko</th>
                    <th>Jenis</th>
                    <th>Qty</th>
                    <th>Keterangan</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.map((m: any) => (
                    <tr key={m.id}>
                      <td className="text-xs">{formatDate(m.movementDate)}</td>
                      <td>
                        <p className="text-xs font-medium">{m.product?.name}</p>
                        <p className="text-xs text-gray-400">{m.product?.articleCode}</p>
                      </td>
                      <td className="text-xs text-gray-500">{m.store?.name}</td>
                      <td>
                        <span className={`flex items-center gap-1 text-xs font-medium ${m.movementType === 'incoming' ? 'text-green-600' : 'text-red-600'}`}>
                          {m.movementType === 'incoming' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                          {m.movementType === 'incoming' ? 'Masuk' : 'Keluar'}
                        </span>
                      </td>
                      <td className="text-xs font-semibold">{m.quantity}</td>
                      <td className="text-xs text-gray-500 max-w-[150px] truncate">{m.description || '-'}</td>
                      <td>
                        <span className={`badge-status ${m.status === 'approved' ? 'badge-success' : m.status === 'pending' ? 'badge-warning' : 'badge-danger'}`}>
                          {m.status === 'approved' ? 'Disetujui' : m.status === 'pending' ? 'Menunggu' : 'Ditolak'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {movements.length === 0 && (
                    <tr><td colSpan={7} className="text-center py-8 text-gray-400 text-sm">Tidak ada data pergerakan</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
