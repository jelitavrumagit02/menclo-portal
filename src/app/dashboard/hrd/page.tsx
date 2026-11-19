'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import TopBar from '@/components/layout/TopBar';
import KpiCard from '@/components/dashboard/KpiCard';
import { Users, Calendar, Wallet, Bell, AlertTriangle, Clock, CheckCircle, XCircle } from 'lucide-react';
import { formatRupiah, formatDate, formatNumber, getStatusBadgeClass, getStatusLabel } from '@/lib/utils';
import Link from 'next/link';

export default function HRDDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role !== 'hrd' && user.role !== 'admin') {
      router.replace(`/dashboard/${user.role}`);
    }
  }, [user, router]);

  useEffect(() => {
    fetch('/api/hrd/stats').then(r => r.json()).then(d => {
      setData(d);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <TopBar title="HRD Dashboard" breadcrumbs={[{ label: 'HRD Dashboard' }, { label: 'Beranda' }]} />

      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Selamat datang, {user?.fullName?.split(' ')[0]}</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manajemen SDM Men & Clo</p>
        </div>

        {/* KPI Cards */}
        {!loading && data && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KpiCard
              title="Total Karyawan Aktif"
              value={formatNumber(data.totalActiveEmployees)}
              subtitle={`${data.newThisMonth || 0} baru bulan ini`}
              icon={Users}
              iconColor="text-blue-600"
              iconBg="bg-blue-50"
            />
            <KpiCard
              title="Cuti Menunggu"
              value={formatNumber(data.pendingLeaves)}
              subtitle="Perlu ditinjau"
              icon={Calendar}
              iconColor="text-amber-600"
              iconBg="bg-amber-50"
              highlight={data.pendingLeaves > 0}
            />
            <KpiCard
              title="Gaji Bulan Ini"
              value={formatRupiah(data.totalPayrollThisMonth)}
              subtitle={`${data.paidPayrolls} sudah dibayar`}
              icon={Wallet}
              iconColor="text-green-600"
              iconBg="bg-green-50"
            />
            <KpiCard
              title="Peringatan Aktif"
              value={formatNumber(data.activeWarnings)}
              subtitle="Peringatan karyawan"
              icon={AlertTriangle}
              iconColor="text-red-600"
              iconBg="bg-red-50"
            />
          </div>
        )}

        {/* Main Content */}
        {!loading && data && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Pending Leave Requests */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900">Cuti Menunggu Persetujuan</h3>
                <Link href="/dashboard/hrd/leaves" className="text-xs text-primary hover:underline">Kelola →</Link>
              </div>
              {data.recentPendingLeaves?.length === 0 ? (
                <div className="p-6 text-center text-sm text-gray-400">Tidak ada pengajuan cuti</div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {(data.recentPendingLeaves || []).slice(0, 5).map((leave: any) => (
                    <div key={leave.id} className="px-5 py-3 flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-semibold text-gray-600 flex-shrink-0">
                        {leave.employee?.fullName?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{leave.employee?.fullName}</p>
                        <p className="text-xs text-gray-500">
                          {getStatusLabel(leave.leaveType)} · {formatDate(leave.startDate)} – {formatDate(leave.endDate)}
                        </p>
                      </div>
                      <span className="badge-status badge-warning text-xs flex-shrink-0">Menunggu</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Attendance Summary */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900">Kehadiran Hari Ini</h3>
                <Link href="/dashboard/hrd/attendance" className="text-xs text-primary hover:underline">Detail →</Link>
              </div>
              {data.todayAttendance ? (
                <div className="p-5 grid grid-cols-3 gap-3">
                  <div className="text-center bg-green-50 rounded-lg p-3">
                    <p className="text-2xl font-bold text-green-600">{data.todayAttendance.hadir}</p>
                    <p className="text-xs text-gray-500 mt-1">Hadir</p>
                  </div>
                  <div className="text-center bg-amber-50 rounded-lg p-3">
                    <p className="text-2xl font-bold text-amber-600">{data.todayAttendance.terlambat}</p>
                    <p className="text-xs text-gray-500 mt-1">Terlambat</p>
                  </div>
                  <div className="text-center bg-gray-50 rounded-lg p-3">
                    <p className="text-2xl font-bold text-gray-600">{data.todayAttendance.libur}</p>
                    <p className="text-xs text-gray-500 mt-1">Libur/Cuti</p>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-sm text-gray-400">Memuat data kehadiran...</div>
              )}
            </div>

            {/* Employee List Summary */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900">Karyawan per Toko</h3>
                <Link href="/dashboard/hrd/employees" className="text-xs text-primary hover:underline">Kelola →</Link>
              </div>
              <div className="p-4 space-y-2">
                {(data.employeesByStore || []).map((s: any) => (
                  <div key={s.storeId} className="flex items-center justify-between py-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="text-sm text-gray-700">{s.storeName}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{s.count} karyawan</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payroll Status */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900">Status Penggajian Bulan Ini</h3>
                <Link href="/dashboard/hrd/payroll" className="text-xs text-primary hover:underline">Kelola →</Link>
              </div>
              <div className="p-5 grid grid-cols-2 gap-3">
                {[
                  { label: 'Draft', value: data.payrollStatus?.draft || 0, color: 'bg-gray-100 text-gray-700' },
                  { label: 'Ditinjau', value: data.payrollStatus?.review || 0, color: 'bg-blue-100 text-blue-800' },
                  { label: 'Disetujui', value: data.payrollStatus?.approved || 0, color: 'bg-green-100 text-green-800' },
                  { label: 'Dibayar', value: data.payrollStatus?.paid || 0, color: 'bg-purple-100 text-purple-800' },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                    <span className="text-sm text-gray-600">{item.label}</span>
                    <span className={`badge-status ${item.color}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
