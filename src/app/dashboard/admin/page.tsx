'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import TopBar from '@/components/layout/TopBar';
import KpiCard from '@/components/dashboard/KpiCard';
import { Users, Shield, Store, Package, Activity } from 'lucide-react';
import { formatDate, formatNumber } from '@/lib/utils';

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  useEffect(() => {
    if (user && user.role !== 'admin') router.replace(`/dashboard/${user.role}`);
  }, [user, router]);

  useEffect(() => {
    fetch('/api/admin/audit?limit=20').then(r => r.json()).then(d => setAuditLogs(d.logs || []));
  }, []);

  return (
    <div>
      <TopBar title="Admin Dashboard" breadcrumbs={[{ label: 'Admin' }, { label: 'Beranda' }]} />
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-sm text-gray-500">Konfigurasi sistem dan manajemen teknis</p>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Manajemen User', icon: Users, href: '/dashboard/admin/users', color: 'text-blue-600 bg-blue-50' },
            { label: 'Data Toko', icon: Store, href: '/dashboard/admin/stores', color: 'text-green-600 bg-green-50' },
            { label: 'Master Produk', icon: Package, href: '/dashboard/admin/products', color: 'text-purple-600 bg-purple-50' },
            { label: 'Audit Log', icon: Shield, href: '/dashboard/admin/audit', color: 'text-primary bg-red-50' },
          ].map(item => (
            <a key={item.href} href={item.href} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow flex flex-col items-center gap-2">
              <div className={`p-2.5 rounded-lg ${item.color}`}>
                <item.icon className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium text-gray-700">{item.label}</span>
            </a>
          ))}
        </div>

        {/* Audit Log Preview */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <Activity className="h-4 w-4 text-gray-500" />
            <h3 className="text-sm font-semibold text-gray-900">Aktivitas Terbaru (Audit Log)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Waktu</th><th>Pengguna</th><th>Aksi</th><th>Modul</th><th>Detail</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log: any) => (
                  <tr key={log.id}>
                    <td className="text-xs">{formatDate(log.createdAt)}</td>
                    <td className="text-xs font-medium">{log.userName}</td>
                    <td>
                      <span className={`badge-status text-xs ${log.action === 'CREATE' ? 'badge-success' : log.action === 'UPDATE' ? 'badge-info' : log.action === 'DELETE' ? 'badge-danger' : 'badge-neutral'}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="text-xs text-gray-500">{log.module}</td>
                    <td className="text-xs text-gray-500 max-w-[200px] truncate">{log.newValue || '-'}</td>
                  </tr>
                ))}
                {auditLogs.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-6 text-gray-400 text-sm">Tidak ada log audit</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
