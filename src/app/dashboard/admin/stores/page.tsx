'use client';

import React, { useEffect, useState } from 'react';
import TopBar from '@/components/layout/TopBar';
import { Store } from 'lucide-react';

export default function AdminStoresPage() {
  const [stores, setStores] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/stores').then(r => r.json()).then(d => setStores(d.stores || []));
  }, []);

  return (
    <div>
      <TopBar title="Data Toko" breadcrumbs={[{ label: 'Admin' }, { label: 'Data Toko' }]} />
      <div className="p-4 md:p-6">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Daftar Toko</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {stores.map((store: any) => (
              <div key={store.id} className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Store className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{store.name}</p>
                    <p className="text-xs text-gray-500">{store.code} · {store.location}</p>
                    {store.address && <p className="text-xs text-gray-400 mt-0.5">{store.address}</p>}
                  </div>
                  <div className="ml-auto">
                    <span className={`badge-status ${store.isActive ? 'badge-success' : 'badge-neutral'}`}>
                      {store.isActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
