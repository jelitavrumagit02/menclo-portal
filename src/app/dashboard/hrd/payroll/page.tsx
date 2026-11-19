'use client';

import React, { useEffect, useState, useCallback } from 'react';
import TopBar from '@/components/layout/TopBar';
import { Search, Eye, CheckCircle, DollarSign, FileText } from 'lucide-react';
import { formatRupiah, formatDate, getStatusBadgeClass, getStatusLabel } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function HRDPayrollPage() {
  const { toast } = useToast();
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [periods, setPeriods] = useState<any[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [updating, setUpdating] = useState(false);

  const loadPayrolls = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedPeriod) params.set('periodId', selectedPeriod);
    if (search) params.set('search', search);
    const res = await fetch(`/api/hrd/payroll?${params}`);
    const data = await res.json();
    setPayrolls(data.payrolls || []);
    setLoading(false);
  }, [selectedPeriod, search]);

  useEffect(() => {
    loadPayrolls();
    fetch('/api/hrd/payroll/periods').then(r => r.json()).then(d => {
      setPeriods(d.periods || []);
      if (d.periods?.length > 0) setSelectedPeriod(d.periods[0].id);
    });
  }, [loadPayrolls]);

  const updatePayrollStatus = async (payrollId: string, status: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/hrd/payroll/${payrollId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        toast({ title: 'Status diperbarui', description: `Status penggajian berhasil diubah ke: ${getStatusLabel(status)}`, variant: 'success' as any });
        loadPayrolls();
        if (selected?.id === payrollId) setSelected((prev: any) => prev ? { ...prev, status } : null);
      }
    } finally {
      setUpdating(false);
    }
  };

  const totalNetSalary = payrolls.reduce((s, p) => s + p.netSalary, 0);
  const totalGross = payrolls.reduce((s, p) => s + p.grossSalary, 0);

  return (
    <div>
      <TopBar title="Penggajian" breadcrumbs={[{ label: 'HRD' }, { label: 'Penggajian' }]} />

      <div className="p-4 md:p-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <p className="text-xs text-gray-500">Total Karyawan</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{payrolls.length}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <p className="text-xs text-gray-500">Total Gaji Kotor</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{formatRupiah(totalGross)}</p>
          </div>
          <div className="bg-green-50 rounded-lg border border-green-200 p-4 shadow-sm">
            <p className="text-xs text-gray-500">Total Gaji Bersih</p>
            <p className="text-xl font-bold text-green-700 mt-1">{formatRupiah(totalNetSalary)}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-5">
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Periode</label>
              <select value={selectedPeriod} onChange={e => setSelectedPeriod(e.target.value)} className="input-field text-sm w-48">
                {periods.map(p => <option key={p.id} value={p.id}>{p.periodName}</option>)}
              </select>
            </div>
            <div className="flex-1 min-w-48">
              <label className="text-xs text-gray-500 block mb-1">Cari karyawan</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Nama karyawan..." className="input-field pl-9 text-sm" />
              </div>
            </div>
          </div>
        </div>

        {/* Payroll Table */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 shadow-sm">
            {loading ? (
              <div className="p-8 text-center text-gray-400 text-sm">Memuat...</div>
            ) : payrolls.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">Tidak ada data penggajian</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Karyawan</th>
                      <th>Toko</th>
                      <th>Gaji Kotor</th>
                      <th>Potongan</th>
                      <th>Gaji Bersih</th>
                      <th>Status</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payrolls.map((p: any) => (
                      <tr key={p.id} className={selected?.id === p.id ? 'bg-red-50' : ''}>
                        <td>
                          <p className="text-sm font-medium text-gray-900">{p.employee?.fullName}</p>
                          <p className="text-xs text-gray-400">{p.employee?.employeeCode}</p>
                        </td>
                        <td className="text-xs text-gray-500">{p.employee?.store?.name}</td>
                        <td className="text-xs font-medium">{formatRupiah(p.grossSalary)}</td>
                        <td className="text-xs text-red-600">-{formatRupiah(p.totalDeductions)}</td>
                        <td className="text-xs font-semibold text-green-700">{formatRupiah(p.netSalary)}</td>
                        <td>
                          <span className={`badge-status ${getStatusBadgeClass(p.status)}`}>{getStatusLabel(p.status)}</span>
                        </td>
                        <td>
                          <button onClick={() => setSelected(p)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded hover:bg-blue-50 transition-colors">
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Payslip Detail */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            {selected ? (
              <>
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900">{selected.employee?.fullName}</p>
                  <p className="text-xs text-gray-500">{selected.employee?.position?.name} · {selected.employee?.store?.name}</p>
                </div>
                <div className="p-4 space-y-3">
                  {/* Items */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Pendapatan</p>
                    {selected.items?.filter((i: any) => i.itemType !== 'deduction').map((item: any) => (
                      <div key={item.id} className="flex justify-between text-xs py-1">
                        <span className="text-gray-600">{item.name}</span>
                        <span className="font-medium">{formatRupiah(item.amount)}</span>
                      </div>
                    ))}
                  </div>
                  {selected.items?.some((i: any) => i.itemType === 'deduction') && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Potongan</p>
                      {selected.items.filter((i: any) => i.itemType === 'deduction').map((item: any) => (
                        <div key={item.id} className="flex justify-between text-xs py-1">
                          <span className="text-gray-600">{item.name}</span>
                          <span className="font-medium text-red-600">-{formatRupiah(item.amount)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between">
                    <span className="text-xs font-bold">Gaji Bersih</span>
                    <span className="text-sm font-bold text-green-700">{formatRupiah(selected.netSalary)}</span>
                  </div>

                  {/* Status Actions */}
                  <div className="border-t pt-3 space-y-2">
                    <p className="text-xs text-gray-500">Ubah Status</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {['draft', 'review', 'approved', 'paid'].map(s => (
                        <button
                          key={s}
                          onClick={() => updatePayrollStatus(selected.id, s)}
                          disabled={updating || selected.status === s}
                          className={`text-xs px-2 py-1.5 rounded border transition-colors ${selected.status === s ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
                        >
                          {getStatusLabel(s)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-6 text-center text-gray-400 text-sm">
                <DollarSign className="h-6 w-6 mx-auto mb-2" />
                Pilih karyawan untuk melihat slip gaji
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
