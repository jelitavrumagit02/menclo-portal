'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import TopBar from '@/components/layout/TopBar';
import KpiCard from '@/components/dashboard/KpiCard';
import { ShoppingBag, Calendar, Wallet, Bell, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { formatRupiah, formatNumber, formatDate, formatDateTime, getStatusLabel, getStatusBadgeClass } from '@/lib/utils';
import Link from 'next/link';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [recentAttendance, setRecentAttendance] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      fetch('/api/employee/stats').then(r => r.json()),
      fetch('/api/employee/sales?limit=5').then(r => r.json()),
      fetch('/api/employee/attendance?limit=7').then(r => r.json()),
      fetch('/api/notifications?limit=5').then(r => r.json()),
    ]).then(([statsData, salesData, attendanceData, notifData]) => {
      setStats(statsData);
      setRecentSales(salesData.sales || []);
      setRecentAttendance(attendanceData.attendance || []);
      setNotifications(notifData.notifications || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user]);

  const shiftLabels: Record<string, string> = {
    shift1: 'Shift 1', shift2: 'Shift 2', jp: 'JP', overtime: 'Lembur', off: 'Libur', leave: 'Cuti'
  };
  const shiftColors: Record<string, string> = {
    shift1: 'badge-success', shift2: 'badge-info', jp: 'badge-warning', overtime: 'badge-info', off: 'badge-neutral', leave: 'badge-warning'
  };
  const notifIcons: Record<string, string> = {
    payroll: '💰', leave: '📋', attendance: '📅', announcement: '📢', system: '⚙️'
  };

  return (
    <div>
      <TopBar title="Dashboard Karyawan" breadcrumbs={[{ label: 'Dashboard Karyawan' }]} />

      <div className="p-4 md:p-6">
        {/* Welcome */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">
            Halo, {user?.fullName?.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { href: '/dashboard/employee/sales', icon: ShoppingBag, label: 'Input Penjualan', color: 'bg-red-50 text-brand-red border-red-200' },
            { href: '/dashboard/employee/attendance', icon: Clock, label: 'Absensi Hari Ini', color: 'bg-blue-50 text-blue-600 border-blue-200' },
            { href: '/dashboard/employee/leaves', icon: Calendar, label: 'Ajukan Cuti', color: 'bg-green-50 text-green-600 border-green-200' },
            { href: '/dashboard/employee/payroll', icon: Wallet, label: 'Lihat Gaji', color: 'bg-purple-50 text-purple-600 border-purple-200' },
          ].map(action => (
            <Link
              key={action.href}
              href={action.href}
              className={`flex flex-col items-center gap-2 p-4 rounded-lg border ${action.color} hover:opacity-80 transition-opacity`}
            >
              <action.icon className="h-6 w-6" />
              <span className="text-xs font-medium text-center">{action.label}</span>
            </Link>
          ))}
        </div>

        {/* KPI Stats */}
        {!loading && stats && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <KpiCard
              title="Penjualan Bulan Ini"
              value={formatRupiah(stats.monthlySales || 0)}
              subtitle={`${stats.monthlyTransactions || 0} transaksi`}
              icon={TrendingUp}
              iconColor="text-primary"
              iconBg="bg-red-50"
            />
            <KpiCard
              title="Kehadiran Bulan Ini"
              value={`${stats.attendanceDays || 0} hari`}
              subtitle={`${stats.lateDays || 0} kali terlambat`}
              icon={CheckCircle}
              iconColor="text-green-600"
              iconBg="bg-green-50"
            />
            <KpiCard
              title="Status Cuti"
              value={`${stats.approvedLeaves || 0} Disetujui`}
              subtitle={`${stats.pendingLeaves || 0} menunggu persetujuan`}
              icon={Calendar}
              iconColor="text-blue-600"
              iconBg="bg-blue-50"
            />
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Recent Sales */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">Penjualan Terakhir</h3>
              <Link href="/dashboard/employee/sales" className="text-xs text-primary hover:underline">Lihat semua →</Link>
            </div>
            {recentSales.length === 0 ? (
              <div className="px-5 py-8 text-center text-gray-400 text-sm">
                Belum ada data penjualan.{' '}
                <Link href="/dashboard/employee/sales" className="text-primary hover:underline">Input sekarang</Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {recentSales.map((sale: any) => (
                  <div key={sale.id} className="px-5 py-3 flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                        <span className="text-sm font-medium text-gray-800 truncate">
                          {sale.items?.slice(0, 2).map((i: any) => i.product?.name).join(', ')}
                          {sale.items?.length > 2 ? ` +${sale.items.length - 2} lainnya` : ''}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 ml-5">
                        {formatDateTime(sale.saleDate)} · {sale.store?.name || sale.bazaar?.name || 'Bazaar'} · {sale.totalItems} item
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-gray-900">{formatRupiah(sale.totalAmount)}</p>
                      <span className={`badge-status ${getStatusBadgeClass(sale.status)} text-xs`}>
                        {getStatusLabel(sale.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="space-y-4">
            {/* Attendance */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900">Kehadiran Terakhir</h3>
                <Link href="/dashboard/employee/attendance" className="text-xs text-primary hover:underline">Semua →</Link>
              </div>
              {recentAttendance.length === 0 ? (
                <div className="px-4 py-6 text-center text-gray-400 text-sm">Belum ada data</div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {recentAttendance.slice(0, 5).map((att: any) => (
                    <div key={att.id} className="px-4 py-2.5 flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-700">{formatDate(att.attendanceDate)}</p>
                        <p className="text-xs text-gray-400">
                          {att.checkIn ? new Date(att.checkIn).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'} –{' '}
                          {att.checkOut ? new Date(att.checkOut).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
                        </p>
                      </div>
                      <span className={`badge-status ${shiftColors[att.shiftType] || 'badge-neutral'} text-xs`}>
                        {shiftLabels[att.shiftType] || att.shiftType}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900">Notifikasi</h3>
                <Link href="/dashboard/employee/notifications" className="text-xs text-primary hover:underline">Semua →</Link>
              </div>
              {notifications.length === 0 ? (
                <div className="px-4 py-6 text-center text-gray-400 text-sm">Tidak ada notifikasi</div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {notifications.slice(0, 4).map((notif: any) => (
                    <div key={notif.id} className={`px-4 py-2.5 ${!notif.isRead ? 'bg-blue-50/40' : ''}`}>
                      <div className="flex items-start gap-2">
                        <span className="text-sm flex-shrink-0">{notifIcons[notif.type] || '🔔'}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-800 truncate">{notif.title}</p>
                          <p className="text-xs text-gray-500 truncate">{notif.message}</p>
                        </div>
                        {!notif.isRead && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 mt-1" />}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
