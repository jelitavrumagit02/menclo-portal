'use client';

import React, { useEffect, useState } from 'react';
import TopBar from '@/components/layout/TopBar';
import { Wallet, TrendingUp, Download } from 'lucide-react';
import { formatRupiah, formatDate, getStatusBadgeClass, getStatusLabel } from '@/lib/utils';

export default function EmployeePayrollPage() {
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/employee/payroll').then(r => r.json()).then(d => {
      setPayrolls(d.payrolls || []);
      if (d.payrolls?.length > 0) setSelected(d.payrolls[0]);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <TopBar title="Penggajian" breadcrumbs={[{ label: 'Dashboard' }, { label: 'Penggajian' }]} />

      <div className="p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Payroll List */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">Riwayat Penggajian</h3>
            </div>
            {loading ? (
              <div className="p-6 text-center text-sm text-gray-400">Memuat...</div>
            ) : payrolls.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-400">Belum ada data penggajian</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {payrolls.map((p: any) => (
                  <button
                    key={p.id}
                    onClick={() => setSelected(p)}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${selected?.id === p.id ? 'bg-red-50 border-r-2 border-primary' : ''}`}
                  >
                    <p className="text-sm font-medium text-gray-900">{p.payrollPeriod?.periodName}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{formatRupiah(p.netSalary)}</p>
                    <span className={`badge-status ${getStatusBadgeClass(p.status)} mt-1 inline-block`}>
                      {getStatusLabel(p.status)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Payslip Detail */}
          <div className="lg:col-span-2">
            {selected ? (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Slip Gaji</h3>
                    <p className="text-xs text-gray-500">{selected.payrollPeriod?.periodName}</p>
                  </div>
                  <span className={`badge-status ${getStatusBadgeClass(selected.status)}`}>
                    {getStatusLabel(selected.status)}
                  </span>
                </div>

                <div className="p-5 space-y-4">
                  {/* Summary */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-500">Gaji Kotor</p>
                      <p className="text-sm font-bold text-gray-900 mt-1">{formatRupiah(selected.grossSalary)}</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-500">Total Potongan</p>
                      <p className="text-sm font-bold text-red-600 mt-1">{formatRupiah(selected.totalDeductions)}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-500">Gaji Bersih</p>
                      <p className="text-sm font-bold text-green-600 mt-1">{formatRupiah(selected.netSalary)}</p>
                    </div>
                  </div>

                  {/* Breakdown */}
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Komponen Pendapatan</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Gaji Pokok</span>
                        <span className="font-medium">{formatRupiah(selected.basicSalary)}</span>
                      </div>
                      {selected.items?.filter((i: any) => i.itemType !== 'deduction').map((item: any) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-gray-600">{item.name}</span>
                          <span className="font-medium text-green-600">{formatRupiah(item.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selected.items?.some((i: any) => i.itemType === 'deduction') && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Potongan</h4>
                      <div className="space-y-2">
                        {selected.items.filter((i: any) => i.itemType === 'deduction').map((item: any) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span className="text-gray-600">{item.name}</span>
                            <span className="font-medium text-red-600">-{formatRupiah(item.amount)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border-t border-gray-200 pt-3 flex justify-between">
                    <span className="text-sm font-bold text-gray-900">Gaji Bersih Diterima</span>
                    <span className="text-lg font-bold text-primary">{formatRupiah(selected.netSalary)}</span>
                  </div>

                  {selected.paidAt && (
                    <div className="bg-green-50 border border-green-200 rounded-md px-3 py-2 flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-green-600" />
                      <p className="text-xs text-green-700">Dibayarkan pada {formatDate(selected.paidAt)}</p>
                    </div>
                  )}

                  {/* Simulated WhatsApp notification */}
                  {selected.status === 'paid' && !selected.notificationSent && (
                    <div className="border border-dashed border-gray-300 rounded-md p-3">
                      <p className="text-xs text-gray-500 mb-2">Simulasi Notifikasi</p>
                      <div className="bg-green-50 rounded-md p-2.5 flex items-start gap-2">
                        <span className="text-sm">📱</span>
                        <div>
                          <p className="text-xs font-medium text-gray-800">WhatsApp (Simulasi)</p>
                          <p className="text-xs text-gray-600">Slip gaji periode {selected.payrollPeriod?.periodName} telah diterbitkan. Gaji bersih: {formatRupiah(selected.netSalary)}</p>
                          <p className="text-xs text-green-600 mt-1">✓ Pesan ini adalah simulasi — tidak benar-benar terkirim</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex items-center justify-center h-64">
                <div className="text-center text-gray-400">
                  <Wallet className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">Pilih periode penggajian untuk melihat slip gaji</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
