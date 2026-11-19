'use client';

import React, { useEffect, useState } from 'react';
import TopBar from '@/components/layout/TopBar';
import { Plus, Search, Eye, EyeOff } from 'lucide-react';
import { formatDate, getRoleLabel, getStatusBadgeClass } from '@/lib/utils';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    fetch(`/api/admin/users?${params}`).then(r => r.json()).then(d => {
      setUsers(d.users || []);
      setLoading(false);
    });
  }, [search]);

  const toggleStatus = async (userId: string, isActive: boolean) => {
    await fetch(`/api/admin/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !isActive }),
    });
    setUsers(us => us.map(u => u.id === userId ? { ...u, isActive: !isActive } : u));
  };

  const roleColors: Record<string, string> = {
    owner: 'badge-info', hrd: 'badge-info', admin: 'badge-neutral', employee: 'badge-success',
  };

  return (
    <div>
      <TopBar title="Manajemen User" breadcrumbs={[{ label: 'Admin' }, { label: 'Manajemen User' }]} />
      <div className="p-4 md:p-6">
        <div className="relative mb-5 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari email atau ID..." className="input-field pl-9 text-sm" />
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          {loading ? <div className="p-8 text-center text-sm text-gray-400">Memuat...</div> : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr><th>ID Karyawan</th><th>Email</th><th>Role</th><th>Terakhir Login</th><th>Status</th><th>Aksi</th></tr>
                </thead>
                <tbody>
                  {users.map((u: any) => (
                    <tr key={u.id}>
                      <td className="text-xs font-mono font-medium">{u.employeeId}</td>
                      <td className="text-xs">{u.email}</td>
                      <td><span className={`badge-status text-xs ${roleColors[u.role] || 'badge-neutral'}`}>{getRoleLabel(u.role)}</span></td>
                      <td className="text-xs text-gray-500">{u.lastLoginAt ? formatDate(u.lastLoginAt) : 'Belum pernah'}</td>
                      <td><span className={`badge-status ${u.isActive ? 'badge-success' : 'badge-neutral'}`}>{u.isActive ? 'Aktif' : 'Nonaktif'}</span></td>
                      <td>
                        <button onClick={() => toggleStatus(u.id, u.isActive)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded hover:bg-blue-50 transition-colors">
                          {u.isActive ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
