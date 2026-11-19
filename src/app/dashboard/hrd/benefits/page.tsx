'use client';

import React, { useEffect, useState } from 'react';
import TopBar from '@/components/layout/TopBar';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { formatRupiah } from '@/lib/utils';

export default function HRDBenefitsPage() {
  const [benefitTypes, setBenefitTypes] = useState<any[]>([]);
  const [deductionTypes, setDeductionTypes] = useState<any[]>([]);
  const [tab, setTab] = useState<'benefits' | 'deductions'>('benefits');

  useEffect(() => {
    fetch('/api/hrd/benefits').then(r => r.json()).then(d => {
      setBenefitTypes(d.benefitTypes || []);
      setDeductionTypes(d.deductionTypes || []);
    });
  }, []);

  return (
    <div>
      <TopBar title="Tunjangan & Potongan" breadcrumbs={[{ label: 'HRD' }, { label: 'Tunjangan & Potongan' }]} />
      <div className="p-4 md:p-6">
        <div className="flex border-b border-gray-200 mb-5">
          {[{ key: 'benefits', label: 'Jenis Tunjangan' }, { key: 'deductions', label: 'Jenis Potongan' }].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as any)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === t.key ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'benefits' && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">Jenis Tunjangan yang Dikonfigurasi</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {benefitTypes.map((bt: any) => (
                <div key={bt.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{bt.name}</p>
                    <p className="text-xs text-gray-500">{bt.description || '-'} · {bt.isFixed ? 'Tetap' : 'Variabel'}</p>
                  </div>
                  <span className="text-xs text-gray-400">{bt.isFixed ? 'Tunjangan Tetap' : 'Tunjangan Variabel'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'deductions' && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">Jenis Potongan yang Dikonfigurasi</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {deductionTypes.map((dt: any) => (
                <div key={dt.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{dt.name}</p>
                    <p className="text-xs text-gray-500">{dt.description || '-'}</p>
                  </div>
                  <span className="text-xs text-gray-400">{dt.isFixed ? 'Potongan Tetap' : 'Potongan Variabel'}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
