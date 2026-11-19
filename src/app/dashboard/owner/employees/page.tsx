'use client';

import React, { useEffect, useState } from 'react';
import TopBar from '@/components/layout/TopBar';
import { Users, Search, UserPlus } from 'lucide-react';
import { formatDate, calculateServiceDuration, getStatusBadgeClass, getStatusLabel, formatRupiah } from '@/lib/utils';

export default function OwnerEmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    fetch(`/api/hrd/employees?${params}`).then(r => r.json()).then(d => {
      setEmployees(d.employees || []);
      setLoading(false);
    });
  }, [search]);

  return (
    <div>
      <TopBar title="Karyawan" breadcrumbs={[{ label: 'Owner' }, { label: 'Karyawan' }]} />
      <div className="p-4 md:p-6">
        <div className="flex flex-wrap gap-3 mb-5">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari karyawan..." className="input-field pl-9 text-sm" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          {loading ? <div className="p-8 text-center text-sm text-gray-400">Memuat...</div> : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th><th>Nama</th><th>Posisi</th><th>Toko</th><th>Bergabung</th><th>Masa Kerja</th><th>Gaji Pokok</th><th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp: any) => (
                    <tr key={emp.id}>
                      <td className="text-xs font-mono text-gray-500">{emp.employeeCode}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center text-xs font-semibold text-gray-600">{emp.fullName.charAt(0)}</div>
                          <div>
                            <p className="text-xs font-medium">{emp.fullName}</p>
                            <p className="text-xs text-gray-400">{emp.user?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-xs">{emp.position?.name}</td>
                      <td className="text-xs">{emp.store?.name}</td>
                      <td className="text-xs">{formatDate(emp.hireDate)}</td>
                      <td className="text-xs text-gray-500">{calculateServiceDuration(emp.hireDate)}</td>
                      <td className="text-xs">{formatRupiah(emp.basicSalary)}</td>
                      <td><span className={`badge-status ${getStatusBadgeClass(emp.status)}`}>{getStatusLabel(emp.status)}</span></td>
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
