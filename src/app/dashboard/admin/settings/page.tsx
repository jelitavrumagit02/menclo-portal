'use client';

import React from 'react';
import TopBar from '@/components/layout/TopBar';
import { Settings, Shield, Database, Bell } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <div>
      <TopBar title="Pengaturan" breadcrumbs={[{ label: 'Admin' }, { label: 'Pengaturan' }]} />
      <div className="p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-50 rounded-lg"><Shield className="h-4 w-4 text-blue-600" /></div>
              <h3 className="text-sm font-semibold text-gray-900">Keamanan</h3>
            </div>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span>Enkripsi Password</span>
                <span className="badge-status badge-success">bcrypt aktif</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span>Sesi Terenkripsi</span>
                <span className="badge-status badge-success">iron-session aktif</span>
              </div>
              <div className="flex justify-between py-2">
                <span>RBAC</span>
                <span className="badge-status badge-success">aktif</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-50 rounded-lg"><Database className="h-4 w-4 text-green-600" /></div>
              <h3 className="text-sm font-semibold text-gray-900">Database</h3>
            </div>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span>ORM</span>
                <span className="font-medium">Prisma</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span>Database (Dev)</span>
                <span className="font-medium">SQLite</span>
              </div>
              <div className="flex justify-between py-2">
                <span>Database (Prod)</span>
                <span className="font-medium">PostgreSQL</span>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 md:col-span-2">
            <p className="text-sm text-amber-700">
              <strong>⚠️ Catatan Produksi:</strong> Sebelum deploy ke production, pastikan untuk:
              (1) Mengganti SESSION_SECRET di .env dengan nilai acak yang panjang,
              (2) Mengubah DATABASE_URL ke koneksi PostgreSQL,
              (3) Menonaktifkan atau menghapus akun demo,
              (4) Mengaktifkan HTTPS.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
