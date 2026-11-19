'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import TopBar from '@/components/layout/TopBar';
import { Plus, Trash2, Search, ChevronDown, CheckCircle, AlertCircle, ShoppingCart, X } from 'lucide-react';
import { formatRupiah, formatNumber, formatDateTime, getStatusBadgeClass, getStatusLabel } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface SaleItem {
  productId: string;
  articleCode: string;
  name: string;
  category: string;
  sellingPrice: number;
  quantity: number;
  totalPrice: number;
}

interface Product {
  id: string;
  articleCode: string;
  name: string;
  category: { name: string };
  sellingPrice: number;
}

export default function SalesInputPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [bazaars, setBazaars] = useState<any[]>([]);
  const [salesHistory, setSalesHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);

  // Form state
  const [locationType, setLocationType] = useState<'store' | 'bazaar'>('store');
  const [storeId, setStoreId] = useState('');
  const [bazaarId, setBazaarId] = useState('');
  const [bazaarName, setBazaarName] = useState('');
  const [items, setItems] = useState<SaleItem[]>([]);
  const [notes, setNotes] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  // Product search
  const [searchQuery, setSearchQuery] = useState('');
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    if (user?.storeId) setStoreId(user.storeId);
    fetch('/api/products?isActive=true').then(r => r.json()).then(d => setProducts(d.products || []));
    fetch('/api/stores').then(r => r.json()).then(d => setStores(d.stores || []));
    fetch('/api/bazaars?isActive=true').then(r => r.json()).then(d => setBazaars(d.bazaars || []));
    fetchHistory();
  }, [user]);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch('/api/employee/sales?limit=20');
      const data = await res.json();
      setSalesHistory(data.sales || []);
    } finally {
      setHistoryLoading(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || p.articleCode.toLowerCase().includes(q) || p.name.toLowerCase().includes(q);
    const matchCat = !categoryFilter || p.category.name === categoryFilter;
    return matchSearch && matchCat;
  }).slice(0, 20);

  const categories = [...new Set(products.map(p => p.category.name))];

  const addProduct = (product: Product) => {
    const existing = items.find(i => i.productId === product.id);
    if (existing) {
      setItems(items.map(i => i.productId === product.id
        ? { ...i, quantity: i.quantity + 1, totalPrice: (i.quantity + 1) * i.sellingPrice }
        : i
      ));
    } else {
      setItems([...items, {
        productId: product.id,
        articleCode: product.articleCode,
        name: product.name,
        category: product.category.name,
        sellingPrice: product.sellingPrice,
        quantity: 1,
        totalPrice: product.sellingPrice,
      }]);
    }
    setShowProductSearch(false);
    setSearchQuery('');
  };

  const updateQuantity = (productId: string, qty: number) => {
    if (qty <= 0) {
      setItems(items.filter(i => i.productId !== productId));
    } else {
      setItems(items.map(i => i.productId === productId
        ? { ...i, quantity: qty, totalPrice: qty * i.sellingPrice }
        : i
      ));
    }
  };

  const updatePrice = (productId: string, price: number) => {
    setItems(items.map(i => i.productId === productId
      ? { ...i, sellingPrice: price, totalPrice: i.quantity * price }
      : i
    ));
  };

  const totalAmount = items.reduce((s, i) => s + i.totalPrice, 0);
  const totalItems = items.reduce((s, i) => s + i.quantity, 0);

  const handleSubmit = async () => {
    if (items.length === 0) {
      toast({ title: 'Kesalahan', description: 'Tambahkan minimal 1 produk.', variant: 'destructive' });
      return;
    }
    if (locationType === 'store' && !storeId) {
      toast({ title: 'Kesalahan', description: 'Pilih toko terlebih dahulu.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationType,
          storeId: locationType === 'store' ? storeId : undefined,
          bazaarId: locationType === 'bazaar' && bazaarId ? bazaarId : undefined,
          bazaarName: locationType === 'bazaar' && !bazaarId ? bazaarName : undefined,
          items: items.map(i => ({
            productId: i.productId,
            quantity: i.quantity,
            sellingPrice: i.sellingPrice,
            totalPrice: i.totalPrice,
          })),
          notes,
          totalAmount,
          totalItems,
        }),
      });

      if (res.ok) {
        toast({ title: 'Berhasil!', description: 'Data penjualan berhasil disimpan.', variant: 'success' as any });
        setItems([]);
        setNotes('');
        setShowConfirm(false);
        fetchHistory();
      } else {
        const err = await res.json();
        toast({ title: 'Gagal', description: err.error || 'Gagal menyimpan penjualan.', variant: 'destructive' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <TopBar
        title="Input Penjualan"
        breadcrumbs={[{ label: 'Dashboard' }, { label: 'Input Penjualan' }]}
      />

      <div className="p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Form */}
          <div className="lg:col-span-3 space-y-5">
            {/* Location */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Informasi Lokasi</h3>

              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 block mb-2">Jenis Lokasi</label>
                <div className="flex gap-2">
                  {[{ value: 'store', label: 'Toko Permanen' }, { value: 'bazaar', label: 'Bazaar' }].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setLocationType(opt.value as any)}
                      className={`flex-1 py-2 rounded-md text-sm font-medium border transition-colors ${
                        locationType === opt.value
                          ? 'bg-primary text-white border-primary'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {locationType === 'store' ? (
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Toko</label>
                  <select
                    value={storeId}
                    onChange={e => setStoreId(e.target.value)}
                    className="input-field"
                  >
                    <option value="">Pilih toko...</option>
                    {stores.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">Nama Bazaar</label>
                    <input
                      type="text"
                      value={bazaarName}
                      onChange={e => setBazaarName(e.target.value)}
                      placeholder="Masukkan nama bazaar / event"
                      className="input-field"
                    />
                  </div>
                  {bazaars.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1.5">Atau pilih bazaar aktif</label>
                      <select value={bazaarId} onChange={e => setBazaarId(e.target.value)} className="input-field">
                        <option value="">Pilih bazaar aktif...</option>
                        {bazaars.map(b => <option key={b.id} value={b.id}>{b.name} — {b.location}</option>)}
                      </select>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Product Search & Items */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">Daftar Produk</h3>
                <button
                  onClick={() => setShowProductSearch(true)}
                  className="btn-primary text-xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Tambah Produk
                </button>
              </div>

              {/* Product search modal */}
              {showProductSearch && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50">
                  <div className="bg-white w-full sm:max-w-md sm:rounded-lg shadow-xl max-h-[90vh] flex flex-col">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                      <h4 className="text-sm font-semibold text-gray-900">Cari Produk</h4>
                      <button onClick={() => setShowProductSearch(false)}>
                        <X className="h-4 w-4 text-gray-500" />
                      </button>
                    </div>
                    <div className="p-3 border-b border-gray-100 space-y-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                          placeholder="Cari kode artikel atau nama..."
                          autoFocus
                          className="input-field pl-9 text-sm"
                        />
                      </div>
                      <div className="flex gap-1 flex-wrap">
                        <button
                          onClick={() => setCategoryFilter('')}
                          className={`text-xs px-2 py-1 rounded-full border ${!categoryFilter ? 'bg-primary text-white border-primary' : 'border-gray-300 text-gray-600'}`}
                        >
                          Semua
                        </button>
                        {categories.map(cat => (
                          <button
                            key={cat}
                            onClick={() => setCategoryFilter(cat)}
                            className={`text-xs px-2 py-1 rounded-full border ${categoryFilter === cat ? 'bg-primary text-white border-primary' : 'border-gray-300 text-gray-600'}`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
                      {filteredProducts.length === 0 ? (
                        <div className="p-6 text-center text-gray-400 text-sm">Produk tidak ditemukan</div>
                      ) : (
                        filteredProducts.map(product => (
                          <button
                            key={product.id}
                            onClick={() => addProduct(product)}
                            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 text-left transition-colors"
                          >
                            <div>
                              <p className="text-sm font-medium text-gray-900">{product.name}</p>
                              <p className="text-xs text-gray-500">{product.articleCode} · {product.category.name}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-primary">{formatRupiah(product.sellingPrice)}</p>
                              <p className="text-xs text-gray-400">/pcs</p>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Items list */}
              {items.length === 0 ? (
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
                  <ShoppingCart className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Belum ada produk ditambahkan</p>
                  <p className="text-xs text-gray-300 mt-1">Klik "Tambah Produk" untuk memulai</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map(item => (
                    <div key={item.productId} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                          <p className="text-xs text-gray-500">{item.articleCode} · {item.category}</p>
                        </div>
                        <button
                          onClick={() => setItems(items.filter(i => i.productId !== item.productId))}
                          className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-3 mt-3">
                        <div className="flex-1">
                          <label className="text-xs text-gray-500 block mb-1">Harga Jual (Rp)</label>
                          <input
                            type="number"
                            value={item.sellingPrice}
                            onChange={e => updatePrice(item.productId, Number(e.target.value))}
                            className="input-field text-sm"
                            min={0}
                          />
                        </div>
                        <div className="w-24">
                          <label className="text-xs text-gray-500 block mb-1">Qty</label>
                          <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              className="px-2 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 text-sm font-medium transition-colors"
                            >-</button>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={e => updateQuantity(item.productId, Number(e.target.value))}
                              className="flex-1 text-center text-sm py-1.5 border-0 outline-none w-10"
                              min={1}
                            />
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              className="px-2 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 text-sm font-medium transition-colors"
                            >+</button>
                          </div>
                        </div>
                        <div className="w-28 text-right">
                          <label className="text-xs text-gray-500 block mb-1">Total</label>
                          <p className="text-sm font-semibold text-gray-900">{formatRupiah(item.totalPrice)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Notes */}
              <div className="mt-4">
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Catatan (opsional)</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Catatan tambahan..."
                  rows={2}
                  className="input-field text-sm resize-none"
                />
              </div>
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 sticky top-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Ringkasan Penjualan</h3>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total Item</span>
                  <span className="font-medium">{totalItems} pcs</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Jumlah Produk</span>
                  <span className="font-medium">{items.length} artikel</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Lokasi</span>
                  <span className="font-medium">
                    {locationType === 'store'
                      ? stores.find(s => s.id === storeId)?.name || '-'
                      : bazaarName || bazaars.find(b => b.id === bazaarId)?.name || '-'}
                  </span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between">
                  <span className="text-sm font-semibold text-gray-900">Total</span>
                  <span className="text-lg font-bold text-primary">{formatRupiah(totalAmount)}</span>
                </div>
              </div>

              <button
                onClick={() => setShowConfirm(true)}
                disabled={items.length === 0}
                className="btn-primary w-full justify-center"
              >
                <CheckCircle className="h-4 w-4" />
                Konfirmasi & Simpan
              </button>
            </div>
          </div>
        </div>

        {/* Confirmation Modal */}
        {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-4">
              <div className="p-5">
                <h3 className="text-base font-semibold text-gray-900 mb-1">Konfirmasi Penjualan</h3>
                <p className="text-sm text-gray-500 mb-4">Pastikan data sudah benar sebelum disimpan.</p>

                <div className="bg-gray-50 rounded-lg p-3 mb-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Lokasi</span>
                    <span className="font-medium">
                      {locationType === 'store'
                        ? stores.find(s => s.id === storeId)?.name
                        : bazaarName || bazaars.find(b => b.id === bazaarId)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Total Item</span>
                    <span className="font-medium">{totalItems} pcs ({items.length} artikel)</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold text-gray-900">
                    <span>Total Penjualan</span>
                    <span className="text-primary">{formatRupiah(totalAmount)}</span>
                  </div>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto mb-4">
                  {items.map(item => (
                    <div key={item.productId} className="flex justify-between text-xs text-gray-600">
                      <span className="truncate flex-1">{item.name} × {item.quantity}</span>
                      <span className="font-medium ml-2">{formatRupiah(item.totalPrice)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button onClick={() => setShowConfirm(false)} className="btn-outline flex-1 justify-center">
                    Batal
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="btn-primary flex-1 justify-center"
                  >
                    {loading ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sales History */}
        <div className="mt-6 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Riwayat Penjualan Saya</h3>
          </div>
          {historyLoading ? (
            <div className="p-5 text-center text-gray-400 text-sm">Memuat...</div>
          ) : salesHistory.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">Belum ada riwayat penjualan</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th>Lokasi</th>
                    <th>Produk</th>
                    <th>Item</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {salesHistory.map((sale: any) => (
                    <tr key={sale.id}>
                      <td className="text-xs">{formatDateTime(sale.saleDate)}</td>
                      <td className="text-xs">{sale.store?.name || sale.bazaar?.name || 'Bazaar'}</td>
                      <td className="text-xs text-gray-500 max-w-[200px] truncate">
                        {sale.items?.map((i: any) => i.product?.name).join(', ')}
                      </td>
                      <td className="text-xs font-medium">{sale.totalItems} pcs</td>
                      <td className="text-xs font-semibold text-primary">{formatRupiah(sale.totalAmount)}</td>
                      <td>
                        <span className={`badge-status ${getStatusBadgeClass(sale.status)}`}>
                          {getStatusLabel(sale.status)}
                        </span>
                      </td>
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
