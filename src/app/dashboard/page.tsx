'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      const redirects: Record<string, string> = {
        owner: '/dashboard/owner',
        hrd: '/dashboard/hrd',
        admin: '/dashboard/admin',
        employee: '/dashboard/employee',
      };
      router.replace(redirects[user.role] || '/dashboard/employee');
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 bg-brand-red rounded-lg flex items-center justify-center mx-auto mb-3">
          <span className="text-white font-bold text-xl">M</span>
        </div>
        <p className="text-gray-500 text-sm">Mengarahkan...</p>
      </div>
    </div>
  );
}
