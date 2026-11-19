'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import TopBar from '@/components/layout/TopBar';
import { Plus, Calendar, Clock, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { formatDate, formatRupiah, getStatusBadgeClass, getStatusLabel } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const LEAVE_TYPES = [
  { value: 'annual', label: 'Cuti Tahunan' },
  { value: 'sick', label: 'Cuti Sakit' },
  { value: 'personal', label: 'Cuti Pribadi' },
  { value: 'maternity', label: 'Cuti Melahirkan' },
  { value: 'emergency', label: 'Cuti Darurat' },
];

export default function LeavePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [leaves, setLeaves] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    leaveType: 'annual',
    startDate: '',
    endDate: '',
    reason: '',
  });

  useEffect(() => {
    loadLeaves();
  }, []);

  const loadLeaves = async () => {
    const res = await fetch('/api/employee/leaves');
    const data = await res.json();
    setLeaves(data.leaves || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.startDate || !form.endDate || !form.reason) {
      toast({ title: 'Kesalahan', description: 'Lengkapi semua data wajib.', variant: 'destructive' });
      return;
    }

    const start = new Date(form.startDate);
    const end = new Date(form.endDate);
    if (end < start) {
      toast({ title: 'Kesalahan', description: 'Tanggal akhir harus setelah tanggal mulai.', variant: 'destructive' });
      return;
    }

    const totalDays = Math.ceil((end.getTime() - start.getTime()) / 86400000) + 1;

    setLoading(true);
    try {
      const res = await fetch('/api/employee/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, totalDays }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: 'Berhasil', description: 'Pengajuan cuti berhasil dikirim.', variant: 'success' as any });
        setShowForm(false);
        setForm({ leaveType: 'annual', startDate: '', endDate: '', reason: '' });
        loadLeaves();
      } else {
        toast({ title: 'Gagal', description: data.error, variant: 'destructive' });
      }
    } finally {
      setLoading(false);
    }
  };

  const statusIcons: Record<string, React.ElementType> = {
    approved: CheckCircle,
    pending: Clock,
    rejected: XCircle,
  };
  const statusColors: Record<string, string> = {
    approved: 'text-green-500',
    pending: 'text-amber-500',
    rejected: 'text-red-500',
  };

  return (
    <div>
      <TopBar
        title="Pengajuan Cuti"
        breadcrumbs={[{ label: 'Dashboard' }, { label: 'Pengajuan Cuti' }]}
      />

      <div className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Cuti Karyawan</h1>
            <p className="text-sm text-gray-500">Ajukan dan pantau status cuti Anda</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            <Plus className="h-4 w-4" />
            Ajukan Cuti
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Form Pengajuan Cuti</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Jenis Cuti</label>
                <select
                  value={form.leaveType}
                  onChange={e => setForm(f => ({ ...f, leaveType: e.target.value }))}
                  className="input-field"
                >
                  {LEAVE_TYPES.map(lt => <option key={lt.value} value={lt.value}>{lt.label}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Tanggal Mulai</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Tanggal Selesai</label>
                  <input
                    type="date"
                    value={form.endDate}
                    min={form.startDate}
                    onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                    className="input-field"
                    required
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Alasan Cuti</label>
                <textarea
                  value={form.reason}
                  onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                  placeholder="Jelaskan alasan pengajuan cuti..."
                  rows={3}
                  className="input-field text-sm resize-none"
                  required
                />
              </div>
              <div className="md:col-span-2 flex gap-2 justify-end">
                <button type="button" onClick={() => setShowForm(false)} className="btn-outline">Batal</button>
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? 'Mengirim...' : 'Kirim Pengajuan'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Leave History */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Riwayat Pengajuan Cuti</h3>
          </div>
          {leaves.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">Belum ada pengajuan cuti</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {leaves.map((leave: any) => {
                const StatusIcon = statusIcons[leave.status] || Clock;
                return (
                  <div key={leave.id} className="px-5 py-4 flex items-start gap-4">
                    <StatusIcon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${statusColors[leave.status] || 'text-gray-400'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-gray-900">
                          {LEAVE_TYPES.find(lt => lt.value === leave.leaveType)?.label || leave.leaveType}
                        </span>
                        <span className={`badge-status ${getStatusBadgeClass(leave.status)}`}>
                          {getStatusLabel(leave.status)}
                        </span>
                        <span className="text-xs text-gray-400">{leave.totalDays} hari</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(leave.startDate)} – {formatDate(leave.endDate)}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">{leave.reason}</p>
                      {leave.reviewComment && (
                        <div className="mt-2 bg-gray-50 rounded-md px-3 py-2">
                          <p className="text-xs text-gray-500">Komentar HRD:</p>
                          <p className="text-xs text-gray-700">{leave.reviewComment}</p>
                        </div>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-gray-400">Diajukan</p>
                      <p className="text-xs text-gray-600">{formatDate(leave.createdAt)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
