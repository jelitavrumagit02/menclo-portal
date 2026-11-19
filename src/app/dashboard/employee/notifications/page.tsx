'use client';

import React, { useEffect, useState } from 'react';
import TopBar from '@/components/layout/TopBar';
import { Bell, BellOff } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function NotificationsPage() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/notifications?limit=50').then(r => r.json()).then(d => {
      setNotifications(d.notifications || []);
      setLoading(false);
    });
  }, []);

  const markAllRead = async () => {
    await fetch('/api/notifications/mark-read', { method: 'POST' });
    setNotifications(n => n.map(notif => ({ ...notif, isRead: true })));
    toast({ title: 'Semua notifikasi ditandai terbaca', variant: 'success' as any });
  };

  const typeIcons: Record<string, string> = {
    payroll: '💰', leave: '📋', attendance: '📅', announcement: '📢', system: '⚙️'
  };
  const typeLabels: Record<string, string> = {
    payroll: 'Penggajian', leave: 'Cuti', attendance: 'Kehadiran', announcement: 'Pengumuman', system: 'Sistem'
  };
  const typeColors: Record<string, string> = {
    payroll: 'bg-purple-100 text-purple-800', leave: 'bg-blue-100 text-blue-800',
    attendance: 'bg-green-100 text-green-800', announcement: 'bg-orange-100 text-orange-800',
    system: 'bg-gray-100 text-gray-700',
  };

  const unread = notifications.filter(n => !n.isRead).length;

  return (
    <div>
      <TopBar title="Notifikasi" breadcrumbs={[{ label: 'Dashboard' }, { label: 'Notifikasi' }]} />

      <div className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-gray-900">Notifikasi</h1>
            {unread > 0 && (
              <span className="bg-brand-red text-white text-xs rounded-full px-2 py-0.5 font-medium">{unread} baru</span>
            )}
          </div>
          {unread > 0 && (
            <button onClick={markAllRead} className="btn-outline text-sm">
              <BellOff className="h-4 w-4" />
              Tandai semua terbaca
            </button>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          {loading ? (
            <div className="p-8 text-center text-gray-400 text-sm">Memuat notifikasi...</div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <Bell className="h-8 w-8 mx-auto mb-3" />
              <p className="text-sm">Tidak ada notifikasi</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {notifications.map((n: any) => (
                <div key={n.id} className={`px-5 py-4 ${!n.isRead ? 'bg-blue-50/40' : ''}`}>
                  <div className="flex items-start gap-3">
                    <span className="text-xl flex-shrink-0">{typeIcons[n.type] || '🔔'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-gray-900">{n.title}</span>
                        <span className={`badge-status text-xs ${typeColors[n.type] || 'bg-gray-100 text-gray-700'}`}>
                          {typeLabels[n.type] || n.type}
                        </span>
                        {!n.isRead && <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />}
                      </div>
                      <p className="text-sm text-gray-600">{n.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{formatDateTime(n.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
