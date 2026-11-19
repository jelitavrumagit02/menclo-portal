'use client';

import React, { useEffect, useState } from 'react';
import TopBar from '@/components/layout/TopBar';
import { Plus, AlertTriangle } from 'lucide-react';
import { formatDate, getStatusBadgeClass, getStatusLabel } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function DefectivePage() {
  const { toast } = useToast();
  const [reports, setReports] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ productId: '', storeId: '', quantity: '', description: '' });

  useEffect(() => {
    fetch('/api/defective').then(r => r.json()).then(d => setReports(d.reports || []));
    fetch('/api/products?isActive=true').then(r => r.json()).then(d => setProducts(d.products || []));
    fetch('/api/stores').then(r => r.json()).then(d => setStores(d.stores || []));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/defective', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast({ title: 'Berhasil', description: 'Laporan produk rusak berhasil dikirim.', variant: 'success' as any });
        setShowForm(false);
        setForm({ productId: '', storeId: '', quantity: '', description: '' });
        fetch('/api/defective').then(r => r.json()).then(d => setReports(d.reports || []));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <TopBar title="Produk Rusak" breadcrumbs={[{ label: 'Dashboard' }, { label: 'Produk Rusak' }]} />
      <div className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-lg font-bold text-gray-900">Laporan Produk Rusak/Cacat</h1>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            <Plus className="h-4 w-4" />
            Laporan Baru
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 mb-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Laporan Produk Rusak</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <input type="number" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} className="input-field" min={1} required />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Deskripsi Kerusakan</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Jelaskan jenis kerusakan..." rows={3} className="input-field text-sm resize-none" required />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Foto Produk (opsional)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-sm text-gray-400">
                  Upload foto tidak tersedia di versi demo — fitur siap diintegrasikan dengan penyimpanan file
                </div>
              </div>
              <div className="md:col-span-2 flex gap-2 justify-end">
                <button type="button" onClick={() => setShowForm(false)} className="btn-outline">Batal</button>
                <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Mengirim...' : 'Kirim Laporan'}</button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr><th>Tanggal</th><th>Produk</th><th>Toko</th><th>Qty</th><th>Deskripsi</th><th>Status</th><th>Resolusi</th></tr>
              </thead>
              <tbody>
                {reports.map((r: any) => (
                  <tr key={r.id}>
                    <td className="text-xs">{formatDate(r.reportDate)}</td>
                    <td><p className="text-xs font-medium">{r.product?.name}</p><p className="text-xs text-gray-400">{r.product?.articleCode}</p></td>
                    <td className="text-xs text-gray-500">{r.store?.name}</td>
                    <td className="text-xs font-semibold text-red-600">{r.quantity}</td>
                    <td className="text-xs text-gray-600 max-w-[180px] truncate">{r.description}</td>
                    <td><span className={`badge-status ${r.status === 'reviewed' ? 'badge-info' : r.status === 'resolved' ? 'badge-success' : 'badge-warning'}`}>{r.status === 'reviewed' ? 'Ditinjau' : r.status === 'resolved' ? 'Selesai' : 'Menunggu'}</span></td>
                    <td className="text-xs text-gray-500 max-w-[150px] truncate">{r.resolution || '-'}</td>
                  </tr>
                ))}
                {reports.length === 0 && <tr><td colSpan={7} className="text-center py-6 text-gray-400 text-sm">Belum ada laporan</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
