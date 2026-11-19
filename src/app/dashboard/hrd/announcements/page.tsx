'use client';

import React, { useEffect, useState } from 'react';
import TopBar from '@/components/layout/TopBar';
import { Plus, Megaphone } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function HRDAnnouncementsPage() {
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', targetType: 'all', expiryDate: '' });

  useEffect(() => {
    fetch('/api/announcements').then(r => r.json()).then(d => setAnnouncements(d.announcements || []));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast({ title: 'Berhasil', description: 'Pengumuman berhasil diterbitkan.', variant: 'success' as any });
        setShowForm(false);
        setForm({ title: '', content: '', targetType: 'all', expiryDate: '' });
        fetch('/api/announcements').then(r => r.json()).then(d => setAnnouncements(d.announcements || []));
      }
    } finally {
      setLoading(false);
    }
  };

  const targetLabels: Record<string, string> = {
    all: 'Semua Karyawan', store: 'Per Toko', position: 'Per Posisi', individual: 'Individual',
  };

  return (
    <div>
      <TopBar title="Pengumuman" breadcrumbs={[{ label: 'HRD' }, { label: 'Pengumuman' }]} />
      <div className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-lg font-bold text-gray-900">Pengumuman & Broadcast</h1>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            <Plus className="h-4 w-4" />
            Buat Pengumuman
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 mb-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Pengumuman Baru</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Judul Pengumuman</label>
                <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="input-field" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Target</label>
                  <select value={form.targetType} onChange={e => setForm(f => ({ ...f, targetType: e.target.value }))} className="input-field">
                    <option value="all">Semua Karyawan</option>
                    <option value="store">Per Toko</option>
                    <option value="position">Per Posisi</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Berlaku Hingga</label>
                  <input type="date" value={form.expiryDate} onChange={e => setForm(f => ({ ...f, expiryDate: e.target.value }))} className="input-field" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Isi Pengumuman</label>
                <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="Tulis isi pengumuman..." rows={4} className="input-field text-sm" required />
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowForm(false)} className="btn-outline">Batal</button>
                <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Menerbitkan...' : 'Terbitkan'}</button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-3">
          {announcements.map((ann: any) => (
            <div key={ann.id} className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-50 rounded-lg flex-shrink-0">
                  <Megaphone className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-gray-900">{ann.title}</h3>
                    <span className="badge-status badge-info text-xs">{targetLabels[ann.targetType] || ann.targetType}</span>
                    {ann.isActive && <span className="badge-status badge-success text-xs">Aktif</span>}
                  </div>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{ann.content}</p>
                  <div className="flex gap-3 mt-1 text-xs text-gray-400">
                    <span>Diterbitkan: {formatDate(ann.publishDate)}</span>
                    {ann.expiryDate && <span>Berlaku hingga: {formatDate(ann.expiryDate)}</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {announcements.length === 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-400 text-sm">
              Belum ada pengumuman
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
