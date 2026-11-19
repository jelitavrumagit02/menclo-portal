'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, TrendingUp, Users, Package, ClipboardList,
  Calendar, Wallet, Bell, LogOut, Menu, X, ChevronRight,
  FileText, Settings, AlertTriangle, Megaphone, BarChart3,
  ShoppingBag, Store, UserCheck, Shield, ChevronDown, Home,
  ClipboardCheck, Boxes
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
  children?: NavItem[];
}

function getNavItems(role: string): NavItem[] {
  if (role === 'owner') {
    return [
      { href: '/dashboard/owner', label: 'Beranda', icon: LayoutDashboard },
      { href: '/dashboard/owner/sales', label: 'Laporan Penjualan', icon: TrendingUp },
      { href: '/dashboard/owner/stores', label: 'Performa Toko', icon: Store },
      { href: '/dashboard/owner/employees', label: 'Karyawan', icon: Users },
      { href: '/dashboard/owner/inventory', label: 'Inventaris', icon: Boxes },
      { href: '/dashboard/owner/insights', label: 'AI Insights', icon: BarChart3 },
      { href: '/dashboard/owner/hrd-overview', label: 'Ringkasan HRD', icon: UserCheck },
      { href: '/dashboard/owner/reports', label: 'Ekspor Laporan', icon: FileText },
    ];
  }

  if (role === 'hrd') {
    return [
      { href: '/dashboard/hrd', label: 'Beranda', icon: LayoutDashboard },
      { href: '/dashboard/hrd/employees', label: 'Data Karyawan', icon: Users },
      { href: '/dashboard/hrd/attendance', label: 'Kehadiran', icon: Calendar },
      { href: '/dashboard/hrd/payroll', label: 'Penggajian', icon: Wallet },
      { href: '/dashboard/hrd/benefits', label: 'Tunjangan & Potongan', icon: ShoppingBag },
      { href: '/dashboard/hrd/leaves', label: 'Cuti Karyawan', icon: ClipboardList },
      { href: '/dashboard/hrd/warnings', label: 'Peringatan', icon: AlertTriangle },
      { href: '/dashboard/hrd/announcements', label: 'Pengumuman', icon: Megaphone },
      { href: '/dashboard/hrd/reports', label: 'Laporan SDM', icon: FileText },
    ];
  }

  if (role === 'admin') {
    return [
      { href: '/dashboard/admin', label: 'Beranda', icon: LayoutDashboard },
      { href: '/dashboard/admin/users', label: 'Manajemen User', icon: Users },
      { href: '/dashboard/admin/stores', label: 'Data Toko', icon: Store },
      { href: '/dashboard/admin/products', label: 'Master Produk', icon: Package },
      { href: '/dashboard/admin/audit', label: 'Audit Log', icon: Shield },
      { href: '/dashboard/admin/settings', label: 'Pengaturan', icon: Settings },
    ];
  }

  // Employee default
  return [
    { href: '/dashboard/employee', label: 'Beranda', icon: Home },
    { href: '/dashboard/employee/sales', label: 'Input Penjualan', icon: ShoppingBag },
    { href: '/dashboard/employee/attendance', label: 'Kehadiran', icon: ClipboardCheck },
    { href: '/dashboard/employee/leaves', label: 'Pengajuan Cuti', icon: Calendar },
    { href: '/dashboard/employee/payroll', label: 'Penggajian', icon: Wallet },
    { href: '/dashboard/employee/inventory', label: 'Laporan Stok', icon: Boxes },
    { href: '/dashboard/employee/defective', label: 'Produk Rusak', icon: AlertTriangle },
    { href: '/dashboard/employee/notifications', label: 'Notifikasi', icon: Bell },
  ];
}

const roleColors: Record<string, string> = {
  owner: 'bg-purple-600',
  hrd: 'bg-blue-600',
  admin: 'bg-gray-600',
  employee: 'bg-brand-red',
};

const roleLabels: Record<string, string> = {
  owner: 'Owner',
  hrd: 'HRD',
  admin: 'Admin',
  employee: 'Karyawan',
};

export default function AppSidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return null;

  const navItems = getNavItems(user.role);
  const roleColor = roleColors[user.role] || 'bg-brand-red';
  const roleLabel = roleLabels[user.role] || 'Karyawan';

  const NavLink = ({ item }: { item: NavItem }) => {
    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

    return (
      <Link
        href={item.href}
        onClick={() => setMobileOpen(false)}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors group',
          isActive
            ? 'bg-brand-red text-white'
            : 'text-gray-400 hover:bg-white/10 hover:text-white'
        )}
      >
        <item.icon className={cn('h-4 w-4 flex-shrink-0', isActive ? 'text-white' : 'text-gray-500 group-hover:text-white')} />
        {!collapsed && (
          <span className="truncate">{item.label}</span>
        )}
        {!collapsed && item.badge && item.badge > 0 && (
          <span className="ml-auto bg-brand-red text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
        <div className="w-8 h-8 bg-brand-red rounded-md flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm">M</span>
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <span className="text-white font-bold text-base tracking-wide">MENCLO</span>
            <p className="text-gray-500 text-xs">PORTAL</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex text-gray-500 hover:text-white p-1 rounded"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {/* User info */}
      {!collapsed && (
        <div className="px-4 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className={cn('w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0', roleColor)}>
              {user.fullName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{user.fullName}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={cn('text-xs text-white/70 px-1.5 py-0.5 rounded', roleColor + '/40')}>
                  {roleLabel}
                </span>
                {user.storeCode && (
                  <span className="text-xs text-gray-500">{user.storeCode}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {navItems.map(item => <NavLink key={item.href} item={item} />)}
      </nav>

      {/* Footer */}
      <div className="px-2 py-4 border-t border-white/10">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span>Keluar</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={cn('hidden lg:flex flex-col h-screen bg-brand-charcoal fixed left-0 top-0 z-40 transition-all duration-300', collapsed ? 'w-16' : 'w-64')}>
        <SidebarContent />
      </div>

      {/* Mobile Toggle Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-brand-charcoal text-white p-2 rounded-md shadow-lg"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="relative w-72 bg-brand-charcoal h-full flex-shrink-0">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-white z-10"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main content spacer */}
      <div className={cn('hidden lg:block flex-shrink-0 transition-all duration-300', collapsed ? 'w-16' : 'w-64')} />
    </>
  );
}
