'use client';

import React, { useEffect, useState } from 'react';
import TopBar from '@/components/layout/TopBar';
import { Shield, Activity } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [moduleFilter, setModuleFilter] = useState('');

  useEffect(() => {
    const params = new URLSearchParams({ limit: '100' });
    if (moduleFilter) params.set('module', moduleFilter);
    fetch(`/api/admin/audit?${params}`).then(r => r.json()).then(d => {
      setLogs(d.logs || []);
      setLoading(false);
    });
  }, [moduleFilter]);

  const modules = [...new Set(logs.map(l => l.module))];

  return (
    <div>
      <TopBar title="Audit Log" breadcrumbs={[{ label: 'Admin' }, { label: 'Audit Log' }]} />
      <div className="p-4 md:p-6">
        <div className="flex items-center gap-3 mb-5">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Filter Modul</label>
            <select value={moduleFilter} onChange={e => setModuleFilter(e.target.value)} className="input-field text-sm w-40">
              <option value="">Semua Modul</option>
              {modules.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          {loading ? <div className="p-8 text-center text-gray-400 text-sm">Memuat...</div> : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr><th>Waktu</th><th>Pengguna</th><th>Aksi</th><th>Modul</th><th>Record ID</th><th>Nilai Lama</th><th>Nilai Baru</th></tr>
                </thead>
                <tbody>
                  {logs.map((log: any) => (
                    <tr key={log.id}>
                      <td className="text-xs">{formatDate(log.createdAt)}</td>
                      <td className="text-xs font-medium">{log.userName}</td>
                      <td><span className={`badge-status text-xs ${log.action === 'CREATE' ? 'badge-success' : log.action === 'UPDATE' ? 'badge-info' : log.action === 'DELETE' ? 'badge-danger' : 'badge-neutral'}`}>{log.action}</span></td>
                      <td className="text-xs text-gray-500">{log.module}</td>
                      <td className="text-xs font-mono text-gray-400 max-w-[80px] truncate">{log.recordId || '-'}</td>
                      <td className="text-xs text-gray-400 max-w-[120px] truncate">{log.previousValue || '-'}</td>
                      <td className="text-xs text-gray-600 max-w-[150px] truncate">{log.newValue || '-'}</td>
                    </tr>
                  ))}
                  {logs.length === 0 && <tr><td colSpan={7} className="text-center py-6 text-gray-400 text-sm">Tidak ada log audit</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
