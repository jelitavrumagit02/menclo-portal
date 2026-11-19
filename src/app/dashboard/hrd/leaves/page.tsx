'use client';

import React, { useEffect, useState, useCallback } from 'react';
import TopBar from '@/components/layout/TopBar';
import { CheckCircle, XCircle, MessageCircle, Filter, Clock } from 'lucide-react';
import { formatDate, getStatusBadgeClass, getStatusLabel } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function HRDLeavesPage() {
  const { toast } = useToast();
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadLeaves = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    const res = await fetch(`/api/hrd/leaves?${params}`);
    const data = await res.json();
    setLeaves(data.leaves || []);
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => { loadLeaves(); }, [loadLeaves]);

  const handleReview = async (leaveId: string, action: 'approved' | 'rejected') => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/hrd/leaves/${leaveId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action, reviewComment: comment }),
      });
      if (res.ok) {
        toast({ title: action === 'approved' ? 'Cuti Disetujui' : 'Cuti Ditolak', description: 'Status pengajuan cuti berhasil diperbarui.', variant: 'success' as any });
        setReviewingId(null);
        setComment('');
        loadLeaves();
      }
    } finally {
      setActionLoading(false);
    }
  };

  const leaveTypeLabels: Record<string, string> = {
    annual: 'Cuti Tahunan', sick: 'Cuti Sakit', personal: 'Cuti Pribadi',
    maternity: 'Cuti Melahirkan', emergency: 'Cuti Darurat',
  };

  return (
    <div>
      <TopBar title="Kelola Cuti" breadcrumbs={[{ label: 'HRD' }, { label: 'Cuti Karyawan' }]} />

      <div className="p-4 md:p-6">
        {/* Filter */}
        <div className="flex flex-wrap gap-2 mb-5">
          {[
            { value: 'pending', label: 'Menunggu' },
            { value: 'approved', label: 'Disetujui' },
            { value: 'rejected', label: 'Ditolak' },
            { value: '', label: 'Semua' },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`text-sm px-4 py-1.5 rounded-full border transition-colors ${statusFilter === opt.value ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Leaves Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          {loading ? (
            <div className="p-8 text-center text-gray-400 text-sm">Memuat...</div>
          ) : leaves.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">Tidak ada pengajuan cuti</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {leaves.map((leave: any) => (
                <div key={leave.id} className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-sm font-semibold text-gray-600 flex-shrink-0">
                      {leave.employee?.fullName?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">{leave.employee?.fullName}</span>
                        <span className="text-xs text-gray-400">{leave.employee?.store?.name}</span>
                        <span className={`badge-status ${getStatusBadgeClass(leave.status)}`}>
                          {getStatusLabel(leave.status)}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3 mt-1">
                        <span className="text-xs text-gray-600">
                          {leaveTypeLabels[leave.leaveType] || leave.leaveType}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(leave.startDate)} – {formatDate(leave.endDate)} ({leave.totalDays} hari)
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{leave.reason}</p>
                      {leave.reviewComment && (
                        <div className="mt-2 bg-gray-50 rounded px-3 py-2">
                          <p className="text-xs text-gray-500">Komentar: {leave.reviewComment}</p>
                        </div>
                      )}

                      {/* Review Form */}
                      {leave.status === 'pending' && reviewingId === leave.id && (
                        <div className="mt-3 bg-gray-50 rounded-lg p-3 space-y-2">
                          <textarea
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                            placeholder="Komentar (opsional)..."
                            rows={2}
                            className="input-field text-sm resize-none"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleReview(leave.id, 'approved')}
                              disabled={actionLoading}
                              className="flex items-center gap-1.5 bg-green-600 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-green-700 transition-colors"
                            >
                              <CheckCircle className="h-3.5 w-3.5" />
                              Setujui
                            </button>
                            <button
                              onClick={() => handleReview(leave.id, 'rejected')}
                              disabled={actionLoading}
                              className="flex items-center gap-1.5 bg-red-600 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-red-700 transition-colors"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              Tolak
                            </button>
                            <button onClick={() => { setReviewingId(null); setComment(''); }} className="btn-outline text-xs py-1.5">
                              Batal
                            </button>
                          </div>
                        </div>
                      )}

                      {leave.status === 'pending' && reviewingId !== leave.id && (
                        <button
                          onClick={() => setReviewingId(leave.id)}
                          className="mt-2 text-xs text-primary hover:underline flex items-center gap-1"
                        >
                          <MessageCircle className="h-3 w-3" />
                          Tinjau Pengajuan
                        </button>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-gray-400">Diajukan</p>
                      <p className="text-xs text-gray-600">{formatDate(leave.createdAt)}</p>
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
