'use client';

import React, { useEffect, useState } from 'react';
import TopBar from '@/components/layout/TopBar';
import { Package, Plus, Search } from 'lucide-react';
import { formatRupiah, getStatusBadgeClass } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function AdminProductsPage() {
  const { toast } = useToast();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    articleCode: '', name: '', categoryId: '', sellingPrice: '', costPrice: '', minStock: '5', description: '',
  });

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    fetch(`/api/products?${params}`).then(r => r.json()).then(d => { setProducts(d.products || []); setLoading(false); });
    fetch('/api/admin/product-categories').then(r => r.json()).then(d => setCategories(d.categories || []));
  }, [search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: 'Berhasil', description: 'Produk baru berhasil ditambahkan.', variant: 'success' as any });
        setShowForm(false);
        setForm({ articleCode: '', name: '', categoryId: '', sellingPrice: '', costPrice: '', minStock: '5', description: '' });
        fetch('/api/products').then(r => r.json()).then(d => setProducts(d.products || []));
      } else {
        toast({ title: 'Gagal', description: data.error, variant: 'destructive' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <TopBar title="Master Produk" breadcrumbs={[{ label: 'Admin' }, { label: 'Master Produk' }]} />
      <div className="p-4 md:p-6">
        <div className="flex flex-wrap gap-3 mb-5 items-end">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari produk..." className="input-field pl-9 text-sm" />
          </div>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            <Plus className="h-4 w-4" />
            Tambah Produk
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 mb-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Produk Baru</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="text-sm font-medium text-gray-700 block mb-1.5">Kode Artikel *</label><input type="text" value={form.articleCode} onChange={e => setForm(f => ({ ...f, articleCode: e.target.value }))} placeholder="MC-KS-001" className="input-field" required /></div>
              <div><label className="text-sm font-medium text-gray-700 block mb-1.5">Nama Produk *</label><input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-field" required /></div>
              <div><label className="text-sm font-medium text-gray-700 block mb-1.5">Kategori *</label><select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))} className="input-field" required><option value="">Pilih kategori...</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
              <div><label className="text-sm font-medium text-gray-700 block mb-1.5">Harga Jual (Rp) *</label><input type="number" value={form.sellingPrice} onChange={e => setForm(f => ({ ...f, sellingPrice: e.target.value }))} className="input-field" required min={0} /></div>
              <div><label className="text-sm font-medium text-gray-700 block mb-1.5">Harga Beli (Rp)</label><input type="number" value={form.costPrice} onChange={e => setForm(f => ({ ...f, costPrice: e.target.value }))} className="input-field" min={0} /></div>
              <div><label className="text-sm font-medium text-gray-700 block mb-1.5">Stok Minimum</label><input type="number" value={form.minStock} onChange={e => setForm(f => ({ ...f, minStock: e.target.value }))} className="input-field" min={0} /></div>
              <div className="md:col-span-2"><label className="text-sm font-medium text-gray-700 block mb-1.5">Deskripsi</label><textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="input-field text-sm resize-none" /></div>
              <div className="md:col-span-2 flex gap-2 justify-end">
                <button type="button" onClick={() => setShowForm(false)} className="btn-outline">Batal</button>
                <button type="submit" disabled={submitting} className="btn-primary">{submitting ? 'Menyimpan...' : 'Tambah Produk'}</button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          {loading ? <div className="p-8 text-center text-sm text-gray-400">Memuat...</div> : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr><th>Kode Artikel</th><th>Nama Produk</th><th>Kategori</th><th>Harga Jual</th><th>Harga Beli</th><th>Min Stok</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {products.map((p: any) => (
                    <tr key={p.id}>
                      <td className="text-xs font-mono font-medium">{p.articleCode}</td>
                      <td className="text-xs font-medium">{p.name}</td>
                      <td className="text-xs text-gray-500">{p.category?.name}</td>
                      <td className="text-xs font-medium text-primary">{formatRupiah(p.sellingPrice)}</td>
                      <td className="text-xs text-gray-500">{p.costPrice ? formatRupiah(p.costPrice) : '-'}</td>
                      <td className="text-xs">{p.minStock}</td>
                      <td><span className={`badge-status ${p.isActive ? 'badge-success' : 'badge-neutral'}`}>{p.isActive ? 'Aktif' : 'Nonaktif'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
