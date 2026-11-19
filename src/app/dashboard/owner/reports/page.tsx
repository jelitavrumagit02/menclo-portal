'use client';

import React, { useEffect, useState } from 'react';
import TopBar from '@/components/layout/TopBar';
import { Download, FileText, Calendar, Users, Package, TrendingUp } from 'lucide-react';
import { formatRupiah, formatDate } from '@/lib/utils';

interface ReportConfig {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  category: string;
}

const REPORTS: ReportConfig[] = [
  { id: 'daily-sales', title: 'Penjualan Harian', description: 'Laporan penjualan per hari dengan detail transaksi', icon: TrendingUp, category: 'Penjualan' },
  { id: 'monthly-sales', title: 'Penjualan Bulanan', description: 'Ringkasan penjualan per bulan', icon: Calendar, category: 'Penjualan' },
  { id: 'store-performance', title: 'Performa Toko', description: 'Perbandingan performa antar toko', icon: TrendingUp, category: 'Penjualan' },
  { id: 'employee-sales', title: 'Penjualan per Karyawan', description: 'Kontribusi penjualan masing-masing karyawan', icon: Users, category: 'Penjualan' },
  { id: 'payroll-summary', title: 'Ringkasan Penggajian', description: 'Rekapitulasi gaji semua karyawan', icon: FileText, category: 'SDM' },
  { id: 'attendance-summary', title: 'Rekapitulasi Kehadiran', description: 'Laporan kehadiran bulanan karyawan', icon: Calendar, category: 'SDM' },
  { id: 'inventory-report', title: 'Laporan Inventaris', description: 'Status stok semua produk per toko', icon: Package, category: 'Inventaris' },
  { id: 'defective-report', title: 'Produk Rusak', description: 'Laporan produk cacat/rusak', icon: Package, category: 'Inventaris' },
];

export default function ReportsPage() {
  const [generating, setGenerating] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<any>(null);
  const [previewType, setPreviewType] = useState('');

  const generateReport = async (reportId: string, format: 'json' | 'csv') => {
    setGenerating(reportId);
    try {
      const res = await fetch(`/api/reports/${reportId}?format=${format}`);
      if (format === 'json') {
        const data = await res.json();
        setPreviewData(data);
        setPreviewType(reportId);
      } else {
        // For CSV, trigger download
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportId}-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch {
      alert('Gagal menghasilkan laporan. Coba lagi.');
    } finally {
      setGenerating(null);
    }
  };

  const categories = [...new Set(REPORTS.map(r => r.category))];

  return (
    <div>
      <TopBar title="Ekspor Laporan" breadcrumbs={[{ label: 'Laporan & Ekspor' }]} />
      <div className="p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-lg font-bold text-gray-900">Laporan & Ekspor Data</h1>
          <p className="text-sm text-gray-500">Unduh data bisnis dalam format CSV atau pratinjau di browser</p>
        </div>

        {categories.map(cat => (
          <div key={cat} className="mb-6">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{cat}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {REPORTS.filter(r => r.category === cat).map(report => (
                <div key={report.id} className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gray-50 rounded-lg flex-shrink-0">
                      <report.icon className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900">{report.title}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{report.description}</p>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => generateReport(report.id, 'json')}
                          disabled={generating === report.id}
                          className="text-xs flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded hover:bg-blue-100 transition-colors disabled:opacity-60"
                        >
                          <FileText className="h-3 w-3" />
                          Pratinjau
                        </button>
                        <button
                          onClick={() => generateReport(report.id, 'csv')}
                          disabled={generating === report.id}
                          className="text-xs flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded hover:bg-green-100 transition-colors disabled:opacity-60"
                        >
                          <Download className="h-3 w-3" />
                          Unduh CSV
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Preview Panel */}
        {previewData && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm mt-6">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">Pratinjau: {REPORTS.find(r => r.id === previewType)?.title}</h3>
              <button onClick={() => setPreviewData(null)} className="text-xs text-gray-400 hover:text-gray-600">Tutup</button>
            </div>
            <div className="p-4 max-h-96 overflow-auto">
              <pre className="text-xs text-gray-700 font-mono whitespace-pre-wrap">
                {JSON.stringify(previewData, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
