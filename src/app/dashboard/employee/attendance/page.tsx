'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import TopBar from '@/components/layout/TopBar';
import { Clock, CheckCircle, LogIn, LogOut, Camera, AlertCircle } from 'lucide-react';
import { formatDate, formatTime, formatDuration, getStatusLabel, cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function AttendancePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [attendance, setAttendance] = useState<any[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [shiftType, setShiftType] = useState('shift1');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadAttendance();
  }, []);

  const loadAttendance = async () => {
    const res = await fetch('/api/employee/attendance?limit=30');
    const data = await res.json();
    setAttendance(data.attendance || []);

    // Find today
    const today = new Date().toDateString();
    const todayRec = (data.attendance || []).find((a: any) =>
      new Date(a.attendanceDate).toDateString() === today
    );
    setTodayAttendance(todayRec || null);
  };

  const handleAttendance = async (action: 'checkin' | 'checkout') => {
    setLoading(true);
    try {
      const res = await fetch('/api/employee/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, shiftType, notes }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({
          title: action === 'checkin' ? 'Absen Masuk Berhasil' : 'Absen Keluar Berhasil',
          description: `Waktu: ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`,
          variant: 'success' as any,
        });
        loadAttendance();
        setNotes('');
      } else {
        toast({ title: 'Gagal', description: data.error, variant: 'destructive' });
      }
    } finally {
      setLoading(false);
    }
  };

  const shiftLabels: Record<string, string> = {
    shift1: 'Shift 1 (09:00–17:00)',
    shift2: 'Shift 2 (13:00–21:00)',
    jp: 'JP / Jam Pendek',
    overtime: 'Lembur',
    off: 'Libur',
    leave: 'Cuti',
  };
  const shiftColors: Record<string, string> = {
    shift1: 'bg-green-100 text-green-800',
    shift2: 'bg-blue-100 text-blue-800',
    jp: 'bg-yellow-100 text-yellow-800',
    overtime: 'bg-purple-100 text-purple-800',
    off: 'bg-gray-100 text-gray-700',
    leave: 'bg-orange-100 text-orange-800',
  };

  const now = new Date();
  const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStr = now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div>
      <TopBar
        title="Kehadiran"
        breadcrumbs={[{ label: 'Dashboard' }, { label: 'Kehadiran' }]}
      />

      <div className="p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Check In/Out Panel */}
          <div className="lg:col-span-2 space-y-4">
            {/* Clock */}
            <div className="bg-brand-charcoal text-white rounded-lg p-6 text-center">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{dateStr}</p>
              <ClockDisplay />
              <p className="text-xs text-gray-500 mt-2">Waktu Server</p>
            </div>

            {/* Status Card */}
            {todayAttendance ? (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-semibold text-gray-900">Status Kehadiran Hari Ini</span>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Shift</span>
                    <span className={`badge-status ${shiftColors[todayAttendance.shiftType] || 'bg-gray-100 text-gray-700'}`}>
                      {shiftLabels[todayAttendance.shiftType] || todayAttendance.shiftType}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Masuk</span>
                    <span className="font-medium">{todayAttendance.checkIn ? formatTime(todayAttendance.checkIn) : '-'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Keluar</span>
                    <span className="font-medium">{todayAttendance.checkOut ? formatTime(todayAttendance.checkOut) : '-'}</span>
                  </div>
                  {todayAttendance.workDuration && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Durasi Kerja</span>
                      <span className="font-medium">{formatDuration(todayAttendance.workDuration)}</span>
                    </div>
                  )}
                  {todayAttendance.isLate && (
                    <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                      <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                      <span className="text-xs text-amber-700">Terlambat {todayAttendance.lateMinutes} menit</span>
                    </div>
                  )}
                </div>

                {!todayAttendance.checkOut && (
                  <button
                    onClick={() => handleAttendance('checkout')}
                    disabled={loading}
                    className="w-full mt-4 flex items-center justify-center gap-2 bg-gray-800 text-white py-2.5 rounded-md text-sm font-semibold hover:bg-gray-900 transition-colors disabled:opacity-60"
                  >
                    <LogOut className="h-4 w-4" />
                    Absen Keluar
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Absen Masuk</h3>

                <div className="mb-3">
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Jenis Shift</label>
                  <select
                    value={shiftType}
                    onChange={e => setShiftType(e.target.value)}
                    className="input-field"
                  >
                    {Object.entries(shiftLabels).map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Catatan (opsional)</label>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Catatan..."
                    rows={2}
                    className="input-field text-sm resize-none"
                  />
                </div>

                <button
                  onClick={() => handleAttendance('checkin')}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-brand-red text-white py-3 rounded-md text-sm font-semibold hover:bg-red-800 transition-colors disabled:opacity-60"
                >
                  <LogIn className="h-4 w-4" />
                  {loading ? 'Memproses...' : 'Absen Masuk Sekarang'}
                </button>
              </div>
            )}
          </div>

          {/* Attendance History */}
          <div className="lg:col-span-3 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">Riwayat Kehadiran</h3>
            </div>
            {attendance.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">Belum ada riwayat kehadiran</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Tanggal</th>
                      <th>Shift</th>
                      <th>Masuk</th>
                      <th>Keluar</th>
                      <th>Durasi</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendance.map((att: any) => (
                      <tr key={att.id}>
                        <td className="text-xs font-medium">{formatDate(att.attendanceDate)}</td>
                        <td>
                          <span className={`badge-status ${shiftColors[att.shiftType] || 'badge-neutral'}`}>
                            {shiftLabels[att.shiftType] || att.shiftType}
                          </span>
                        </td>
                        <td className="text-xs">{att.checkIn ? formatTime(att.checkIn) : '-'}</td>
                        <td className="text-xs">{att.checkOut ? formatTime(att.checkOut) : '-'}</td>
                        <td className="text-xs">{att.workDuration ? formatDuration(att.workDuration) : '-'}</td>
                        <td>
                          {att.isLate ? (
                            <span className="badge-status badge-warning text-xs">Terlambat</span>
                          ) : att.shiftType === 'off' ? (
                            <span className="badge-status badge-neutral text-xs">Libur</span>
                          ) : att.checkIn ? (
                            <span className="badge-status badge-success text-xs">Hadir</span>
                          ) : (
                            <span className="badge-status badge-danger text-xs">-</span>
                          )}
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
    </div>
  );
}

function ClockDisplay() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const update = () => setTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);
  return <div className="text-5xl font-bold tracking-tight my-3">{time}</div>;
}
