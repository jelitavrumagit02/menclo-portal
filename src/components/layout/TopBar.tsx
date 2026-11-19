'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, ChevronRight } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export default function TopBar({ title, breadcrumbs }: {
  title: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotif, setShowNotif] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetch('/api/notifications?limit=5')
        .then(r => r.json())
        .then(data => {
          setNotifications(data.notifications || []);
          setUnreadCount(data.unreadCount || 0);
        })
        .catch(() => {});
    }
  }, [user]);

  const markAllRead = async () => {
    await fetch('/api/notifications/mark-read', { method: 'POST' });
    setUnreadCount(0);
    setNotifications(n => n.map(notif => ({ ...notif, isRead: true })));
  };

  const typeIcons: Record<string, string> = {
    payroll: '💰',
    leave: '📋',
    attendance: '📅',
    announcement: '📢',
    system: '⚙️',
  };

  return (
    <div className="sticky top-0 z-30 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm">
      {/* Left — breadcrumbs */}
      <div className="flex items-center gap-1 text-sm min-w-0">
        {breadcrumbs && breadcrumbs.map((crumb, i) => (
          <React.Fragment key={i}>
            {i > 0 && <ChevronRight className="h-3 w-3 text-gray-400 flex-shrink-0" />}
            {crumb.href && i < breadcrumbs.length - 1 ? (
              <Link href={crumb.href} className="text-gray-500 hover:text-primary transition-colors truncate">
                {crumb.label}
              </Link>
            ) : (
              <span className="text-gray-900 font-medium truncate">{crumb.label}</span>
            )}
          </React.Fragment>
        ))}
        {!breadcrumbs && <span className="font-semibold text-gray-900">{title}</span>}
      </div>

      {/* Right — notifications + user */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotif(!showNotif)}
            className="relative p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-brand-red text-white text-xs rounded-full flex items-center justify-center font-medium">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotif && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowNotif(false)} />
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-20 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <span className="text-sm font-semibold text-gray-900">Notifikasi</span>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-xs text-primary hover:underline">
                      Tandai semua terbaca
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-6 text-center text-sm text-gray-400">
                      Tidak ada notifikasi
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        className={`px-4 py-3 hover:bg-gray-50 transition-colors ${!n.isRead ? 'bg-blue-50/50' : ''}`}
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-base flex-shrink-0">{typeIcons[n.type] || '🔔'}</span>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-medium ${!n.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                              {n.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                            <p className="text-xs text-gray-400 mt-1">{formatDateTime(n.createdAt)}</p>
                          </div>
                          {!n.isRead && (
                            <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1" />
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="px-4 py-2 border-t border-gray-100">
                  <Link
                    href="/dashboard/employee/notifications"
                    onClick={() => setShowNotif(false)}
                    className="text-xs text-primary hover:underline"
                  >
                    Lihat semua notifikasi →
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>

        {/* User avatar */}
        <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
          <div className="w-8 h-8 bg-brand-red rounded-full flex items-center justify-center text-white text-sm font-semibold">
            {user?.fullName.charAt(0) || 'U'}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-900 leading-none">{user?.fullName}</p>
            <p className="text-xs text-gray-400 mt-0.5">{user?.employeeId}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
