'use client';

import React, { useEffect, useState } from 'react';
import TopBar from '@/components/layout/TopBar';
import { Plus, AlertTriangle } from 'lucide-react';
import { formatDate, getStatusBadgeClass, getStatusLabel } from '@/lib/utils';

export default function HRDWarningsPage() {
  const [warnings, setWarnings] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    employeeId: '', warningLevel: 'verbal', category: '', description: '', warningDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetch('/api/hrd/warnings').then(r => r.json()).then(d => setWarnings(d.warnings || []));
    fetch('/api/hrd/employees').then(r => r.json()).then(d => setEmployees(d.employees || []));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/hrd/warnings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowForm(false);
        fetch('/api/hrd/warnings').then(r => r.json()).then(d => setWarnings(d.warnings || []));
      }
    } finally {
      setLoading(false);
    }
  };

  const levelLabels: Record<string, string> = { verbal: 'Lisan', written: 'Tertulis', final: 'Peringatan Akhir' };
  const levelColors: Record<string, string> = { verbal: 'badge-warning', written: 'badge-info', final: 'badge-danger' };

  return (
    <div>
      <TopBar title="Peringatan" breadcrumbs={[{ label: 'HRD' }, { label: 'Peringatan Karyawan' }]} />
      <div className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-lg font-bold text-gray-900">Peringatan Karyawan</h1>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            <Plus className="h-4 w-4" />
            Buat Peringatan
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 mb-5">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Karyawan</label>
                <select value={form.employeeId} onChange={e => setForm(f => ({ ...f, employeeId: e.target.value }))} className="input-field" required>
                  <option value="">Pilih karyawan...</option>
                  {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.fullName} — {emp.store?.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Level Peringatan</label>
                <select value={form.warningLevel} onChange={e => setForm(f => ({ ...f, warningLevel: e.target.value }))} className="input-field">
                  <option value="verbal">Lisan</option>
                  <option value="written">Tertulis</option>
                  <option value="final">Peringatan Akhir</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Kategori</label>
                <input type="text" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="Keterlambatan, pelanggaran SOP, dll." className="input-field" required />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Tanggal</label>
                <input type="date" value={form.warningDate} onChange={e => setForm(f => ({ ...f, warningDate: e.target.value }))} className="input-field" required />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Deskripsi</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="input-field text-sm resize-none" required />
              </div>
              <div className="md:col-span-2 flex gap-2 justify-end">
                <button type="button" onClick={() => setShowForm(false)} className="btn-outline">Batal</button>
                <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Menyimpan...' : 'Simpan'}</button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr><th>Tanggal</th><th>Karyawan</th><th>Toko</th><th>Level</th><th>Kategori</th><th>Deskripsi</th><th>Status</th></tr>
              </thead>
              <tbody>
                {warnings.map((w: any) => (
                  <tr key={w.id}>
                    <td className="text-xs">{formatDate(w.warningDate)}</td>
                    <td className="text-xs font-medium">{w.employee?.fullName}</td>
                    <td className="text-xs text-gray-500">{w.employee?.store?.name}</td>
                    <td><span className={`badge-status ${levelColors[w.warningLevel] || 'badge-neutral'}`}>{levelLabels[w.warningLevel] || w.warningLevel}</span></td>
                    <td className="text-xs">{w.category}</td>
                    <td className="text-xs text-gray-600 max-w-[200px] truncate">{w.description}</td>
                    <td><span className={`badge-status ${w.status === 'active' ? 'badge-warning' : 'badge-success'}`}>{w.status === 'active' ? 'Aktif' : 'Selesai'}</span></td>
                  </tr>
                ))}
                {warnings.length === 0 && <tr><td colSpan={7} className="text-center py-6 text-gray-400 text-sm">Tidak ada data peringatan</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
