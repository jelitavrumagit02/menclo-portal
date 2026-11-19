'use client';

import React, { useEffect, useState, useCallback } from 'react';
import TopBar from '@/components/layout/TopBar';
import { Search, Download, Filter } from 'lucide-react';
import { formatDate, formatTime, formatDuration } from '@/lib/utils';

export default function HRDAttendancePage() {
  const [attendance, setAttendance] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [storeFilter, setStoreFilter] = useState('');
  const [dateFilter, setDateFilter] = useState(() => new Date().toISOString().split('T')[0]);
  const [search, setSearch] = useState('');

  const loadAttendance = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (storeFilter) params.set('storeId', storeFilter);
    if (dateFilter) params.set('date', dateFilter);
    if (search) params.set('search', search);
    const res = await fetch(`/api/hrd/attendance?${params}`);
    const data = await res.json();
    setAttendance(data.attendance || []);
    setLoading(false);
  }, [storeFilter, dateFilter, search]);

  useEffect(() => {
    loadAttendance();
    fetch('/api/stores').then(r => r.json()).then(d => setStores(d.stores || []));
  }, [loadAttendance]);

  const shiftLabels: Record<string, string> = {
    shift1: 'Shift 1', shift2: 'Shift 2', jp: 'JP', overtime: 'Lembur', off: 'Libur', leave: 'Cuti',
  };
  const shiftColors: Record<string, string> = {
    shift1: 'badge-success', shift2: 'badge-info', jp: 'badge-warning', overtime: 'badge-info',
    off: 'badge-neutral', leave: 'badge-warning',
  };

  const totalHadir = attendance.filter(a => a.checkIn && !['off', 'leave'].includes(a.shiftType)).length;
  const totalTerlambat = attendance.filter(a => a.isLate).length;

  return (
    <div>
      <TopBar title="Kehadiran" breadcrumbs={[{ label: 'HRD' }, { label: 'Kehadiran' }]} />

      <div className="p-4 md:p-6">
        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
            <p className="text-xl font-bold text-green-700">{totalHadir}</p>
            <p className="text-xs text-gray-500 mt-0.5">Hadir</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
            <p className="text-xl font-bold text-amber-600">{totalTerlambat}</p>
            <p className="text-xs text-gray-500 mt-0.5">Terlambat</p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
            <p className="text-xl font-bold text-gray-600">{attendance.filter(a => a.shiftType === 'off').length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Libur</p>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
            <p className="text-xl font-bold text-orange-600">{attendance.filter(a => a.shiftType === 'leave').length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Cuti</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Tanggal</label>
              <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="input-field text-sm w-36" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Toko</label>
              <select value={storeFilter} onChange={e => setStoreFilter(e.target.value)} className="input-field text-sm w-40">
                <option value="">Semua Toko</option>
                {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="flex-1 min-w-48">
              <label className="text-xs text-gray-500 block mb-1">Cari karyawan</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Nama karyawan..." className="input-field pl-9 text-sm" />
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          {loading ? (
            <div className="p-8 text-center text-gray-400 text-sm">Memuat...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Karyawan</th>
                    <th>Posisi</th>
                    <th>Toko</th>
                    <th>Tanggal</th>
                    <th>Shift</th>
                    <th>Masuk</th>
                    <th>Keluar</th>
                    <th>Durasi</th>
                    <th>Status</th>
                    <th>Catatan</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((att: any) => (
                    <tr key={att.id}>
                      <td>
                        <p className="text-xs font-medium">{att.employee?.fullName}</p>
                        <p className="text-xs text-gray-400">{att.employee?.employeeCode}</p>
                      </td>
                      <td className="text-xs text-gray-500">{att.employee?.position?.name}</td>
                      <td className="text-xs text-gray-500">{att.store?.name}</td>
                      <td className="text-xs">{formatDate(att.attendanceDate)}</td>
                      <td>
                        <span className={`badge-status ${shiftColors[att.shiftType] || 'badge-neutral'}`}>
                          {shiftLabels[att.shiftType] || att.shiftType}
                        </span>
                      </td>
                      <td className="text-xs font-medium">{att.checkIn ? formatTime(att.checkIn) : '-'}</td>
                      <td className="text-xs font-medium">{att.checkOut ? formatTime(att.checkOut) : '-'}</td>
                      <td className="text-xs">{att.workDuration ? formatDuration(att.workDuration) : '-'}</td>
                      <td>
                        {att.isLate ? (
                          <span className="badge-status badge-warning text-xs">Terlambat {att.lateMinutes}m</span>
                        ) : !['off', 'leave'].includes(att.shiftType) && att.checkIn ? (
                          <span className="badge-status badge-success text-xs">Hadir</span>
                        ) : (
                          <span className="badge-status badge-neutral text-xs">-</span>
                        )}
                      </td>
                      <td className="text-xs text-gray-500 max-w-[120px] truncate">{att.notes || '-'}</td>
                    </tr>
                  ))}
                  {attendance.length === 0 && (
                    <tr><td colSpan={10} className="text-center py-8 text-gray-400 text-sm">Tidak ada data kehadiran</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
