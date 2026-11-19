'use client';

import React from 'react';
import TopBar from '@/components/layout/TopBar';
import { FileText } from 'lucide-react';
import Link from 'next/link';

export default function HRDReportsPage() {
  return (
    <div>
      <TopBar title="Laporan SDM" breadcrumbs={[{ label: 'HRD' }, { label: 'Laporan SDM' }]} />
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-lg font-bold text-gray-900">Laporan SDM</h1>
          <p className="text-sm text-gray-500">Unduh laporan karyawan, kehadiran, dan penggajian</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
          <p className="text-sm text-gray-600 mb-4">Semua fitur laporan tersedia melalui halaman Ekspor Laporan utama:</p>
          <Link href="/dashboard/owner/reports" className="btn-primary">
            <FileText className="h-4 w-4" />
            Buka Halaman Laporan
          </Link>
        </div>
      </div>
    </div>
  );
}
