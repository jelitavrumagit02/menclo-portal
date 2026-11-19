'use client';

import React, { useEffect, useState } from 'react';
import TopBar from '@/components/layout/TopBar';
import KpiCard from '@/components/dashboard/KpiCard';
import { Users, Calendar, Wallet, AlertTriangle } from 'lucide-react';
import { formatRupiah, formatNumber } from '@/lib/utils';

export default function OwnerHRDOverviewPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/hrd/stats').then(r => r.json()).then(setData);
  }, []);

  if (!data) return <div><TopBar title="Ringkasan HRD" breadcrumbs={[{ label: 'Owner' }, { label: 'Ringkasan HRD' }]} /><div className="p-6 text-center text-gray-400">Memuat...</div></div>;

  return (
    <div>
      <TopBar title="Ringkasan HRD" breadcrumbs={[{ label: 'Owner' }, { label: 'Ringkasan HRD' }]} />
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KpiCard title="Karyawan Aktif" value={formatNumber(data.totalActiveEmployees)} icon={Users} iconColor="text-blue-600" iconBg="bg-blue-50" />
          <KpiCard title="Cuti Menunggu" value={formatNumber(data.pendingLeaves)} icon={Calendar} iconColor="text-amber-600" iconBg="bg-amber-50" />
          <KpiCard title="Total Gaji Bulan Ini" value={formatRupiah(data.totalPayrollThisMonth)} icon={Wallet} iconColor="text-green-600" iconBg="bg-green-50" />
          <KpiCard title="Peringatan Aktif" value={formatNumber(data.activeWarnings)} icon={AlertTriangle} iconColor="text-red-600" iconBg="bg-red-50" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Kehadiran Hari Ini</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-green-600">{data.todayAttendance?.hadir || 0}</p>
                <p className="text-xs text-gray-500">Hadir</p>
              </div>
              <div className="bg-amber-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-amber-600">{data.todayAttendance?.terlambat || 0}</p>
                <p className="text-xs text-gray-500">Terlambat</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-gray-600">{data.todayAttendance?.libur || 0}</p>
                <p className="text-xs text-gray-500">Libur/Cuti</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Karyawan per Toko</h3>
            {(data.employeesByStore || []).map((s: any) => (
              <div key={s.storeId} className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="text-sm text-gray-700">{s.storeName}</span>
                <span className="text-sm font-semibold">{s.count} karyawan</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
