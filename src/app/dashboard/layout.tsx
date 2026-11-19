'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AppSidebar from '@/components/layout/AppSidebar';
import { AuthProvider } from '@/contexts/AuthContext';

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-offwhite flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 bg-brand-red rounded-lg flex items-center justify-center mx-auto mb-3">
            <span className="text-white font-bold text-xl">M</span>
          </div>
          <p className="text-gray-500 text-sm">Memuat portal...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-brand-offwhite">
      <AppSidebar />
      <main className="flex-1 min-w-0 overflow-hidden">
        {children}
      </main>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DashboardContent>{children}</DashboardContent>
    </AuthProvider>
  );
}
