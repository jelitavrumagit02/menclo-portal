'use client';

import React, { useEffect, useState } from 'react';
import TopBar from '@/components/layout/TopBar';
import { Plus, ArrowUp, ArrowDown, Search } from 'lucide-react';
import { formatDate, getStatusBadgeClass } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function EmployeeInventoryPage() {
  const { toast } = useToast();
  const [movements, setMovements] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    productId: '', storeId: '', movementType: 'incoming', quantity: '', description: '',
  });

  useEffect(() => {
    fetch('/api/inventory/movements?limit=20').then(r => r.json()).then(d => setMovements(d.movements || []));
    fetch('/api/products?isActive=true').then(r => r.json()).then(d => setProducts(d.products || []));
    fetch('/api/stores').then(r => r.json()).then(d => setStores(d.stores || []));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/inventory/movements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast({ title: 'Berhasil', description: 'Laporan pergerakan stok berhasil disimpan.', variant: 'success' as any });
        setShowForm(false);
        setForm({ productId: '', storeId: '', movementType: 'incoming', quantity: '', description: '' });
        fetch('/api/inventory/movements?limit=20').then(r => r.json()).then(d => setMovements(d.movements || []));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <TopBar title="Laporan Stok" breadcrumbs={[{ label: 'Dashboard' }, { label: 'Laporan Stok' }]} />
      <div className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-lg font-bold text-gray-900">Laporan Inventaris</h1>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            <Plus className="h-4 w-4" />
            Laporan Baru
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 mb-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Laporan Pergerakan Stok</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Jenis Pergerakan</label>
                <select value={form.movementType} onChange={e => setForm(f => ({ ...f, movementType: e.target.value }))} className="input-field">
                  <option value="incoming">Stok Masuk</option>
                  <option value="outgoing">Stok Keluar</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Produk</label>
                <select value={form.productId} onChange={e => setForm(f => ({ ...f, productId: e.target.value }))} className="input-field" required>
                  <option value="">Pilih produk...</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.articleCode} — {p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Toko</label>
                <select value={form.storeId} onChange={e => setForm(f => ({ ...f, storeId: e.target.value }))} className="input-field" required>
                  <option value="">Pilih toko...</option>
                  {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Jumlah</label>
                <input type="number" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} className="input-field" required min={1} />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Keterangan</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Keterangan pergerakan stok..." rows={2} className="input-field text-sm resize-none" />
              </div>
              <div className="md:col-span-2 flex gap-2 justify-end">
                <button type="button" onClick={() => setShowForm(false)} className="btn-outline">Batal</button>
                <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Menyimpan...' : 'Simpan Laporan'}</button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Riwayat Pergerakan Stok</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr><th>Tanggal</th><th>Produk</th><th>Toko</th><th>Jenis</th><th>Qty</th><th>Keterangan</th><th>Status</th></tr>
              </thead>
              <tbody>
                {movements.map((m: any) => (
                  <tr key={m.id}>
                    <td className="text-xs">{formatDate(m.movementDate)}</td>
                    <td><p className="text-xs font-medium">{m.product?.name}</p><p className="text-xs text-gray-400">{m.product?.articleCode}</p></td>
                    <td className="text-xs text-gray-500">{m.store?.name}</td>
                    <td>
                      <span className={`flex items-center gap-1 text-xs font-medium ${m.movementType === 'incoming' ? 'text-green-600' : 'text-red-600'}`}>
                        {m.movementType === 'incoming' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                        {m.movementType === 'incoming' ? 'Masuk' : 'Keluar'}
                      </span>
                    </td>
                    <td className="text-xs font-semibold">{m.quantity}</td>
                    <td className="text-xs text-gray-500 max-w-[150px] truncate">{m.description || '-'}</td>
                    <td><span className={`badge-status ${m.status === 'approved' ? 'badge-success' : 'badge-warning'}`}>{m.status === 'approved' ? 'Disetujui' : 'Menunggu'}</span></td>
                  </tr>
                ))}
                {movements.length === 0 && <tr><td colSpan={7} className="text-center py-6 text-gray-400 text-sm">Belum ada laporan</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
