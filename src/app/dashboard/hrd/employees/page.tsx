'use client';

import React, { useEffect, useState, useCallback } from 'react';
import TopBar from '@/components/layout/TopBar';
import { Plus, Search, Filter, Edit2, Trash2, UserCheck, UserX } from 'lucide-react';
import { formatDate, calculateServiceDuration, getStatusBadgeClass, getStatusLabel } from '@/lib/utils';
import Link from 'next/link';

export default function HRDEmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [storeFilter, setStoreFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [showForm, setShowForm] = useState(false);
  const [editEmployee, setEditEmployee] = useState<any>(null);
  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', positionId: '', storeId: '',
    hireDate: '', basicSalary: '', status: 'active',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadEmployees = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (storeFilter) params.set('storeId', storeFilter);
    if (statusFilter) params.set('status', statusFilter);
    const res = await fetch(`/api/hrd/employees?${params}`);
    const data = await res.json();
    setEmployees(data.employees || []);
    setLoading(false);
  }, [search, storeFilter, statusFilter]);

  useEffect(() => {
    loadEmployees();
    fetch('/api/stores').then(r => r.json()).then(d => setStores(d.stores || []));
    fetch('/api/positions').then(r => r.json()).then(d => setPositions(d.positions || []));
  }, [loadEmployees]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');

    try {
      const url = editEmployee ? `/api/hrd/employees/${editEmployee.id}` : '/api/hrd/employees';
      const method = editEmployee ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (res.ok) {
        setSuccess(editEmployee ? 'Data karyawan berhasil diperbarui.' : 'Karyawan baru berhasil ditambahkan.');
        setShowForm(false);
        setEditEmployee(null);
        setForm({ fullName: '', email: '', phone: '', positionId: '', storeId: '', hireDate: '', basicSalary: '', status: 'active' });
        loadEmployees();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Gagal menyimpan data.');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (emp: any) => {
    setEditEmployee(emp);
    setForm({
      fullName: emp.fullName,
      email: emp.user?.email || '',
      phone: emp.phone || '',
      positionId: emp.positionId,
      storeId: emp.storeId,
      hireDate: emp.hireDate ? new Date(emp.hireDate).toISOString().split('T')[0] : '',
      basicSalary: String(emp.basicSalary || ''),
      status: emp.status,
    });
    setShowForm(true);
  };

  const handleToggleStatus = async (emp: any) => {
    const newStatus = emp.status === 'active' ? 'inactive' : 'active';
    await fetch(`/api/hrd/employees/${emp.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    loadEmployees();
  };

  return (
    <div>
      <TopBar title="Data Karyawan" breadcrumbs={[{ label: 'HRD' }, { label: 'Data Karyawan' }]} />

      <div className="p-4 md:p-6">
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-md px-4 py-3 mb-4 text-sm">
            {success}
          </div>
        )}

        {/* Filter Bar */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-5">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-48">
              <label className="text-xs text-gray-500 block mb-1">Cari karyawan</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Nama atau ID karyawan..."
                  className="input-field pl-9 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Toko</label>
              <select value={storeFilter} onChange={e => setStoreFilter(e.target.value)} className="input-field text-sm w-40">
                <option value="">Semua Toko</option>
                {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Status</label>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field text-sm w-32">
                <option value="">Semua</option>
                <option value="active">Aktif</option>
                <option value="inactive">Nonaktif</option>
              </select>
            </div>
            <button onClick={() => { setShowForm(true); setEditEmployee(null); setForm({ fullName: '', email: '', phone: '', positionId: '', storeId: '', hireDate: '', basicSalary: '', status: 'active' }); }} className="btn-primary">
              <Plus className="h-4 w-4" />
              Tambah Karyawan
            </button>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 mb-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              {editEmployee ? 'Edit Karyawan' : 'Tambah Karyawan Baru'}
            </h3>
            {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-md px-3 py-2 mb-3 text-sm">{error}</div>}
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Nama Lengkap *</label>
                <input type="text" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} className="input-field" required />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Email *</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="input-field" required={!editEmployee} disabled={!!editEmployee} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">No. Telepon</label>
                <input type="text" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Posisi *</label>
                <select value={form.positionId} onChange={e => setForm(f => ({ ...f, positionId: e.target.value }))} className="input-field" required>
                  <option value="">Pilih posisi...</option>
                  {positions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Toko *</label>
                <select value={form.storeId} onChange={e => setForm(f => ({ ...f, storeId: e.target.value }))} className="input-field" required>
                  <option value="">Pilih toko...</option>
                  {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Tanggal Bergabung *</label>
                <input type="date" value={form.hireDate} onChange={e => setForm(f => ({ ...f, hireDate: e.target.value }))} className="input-field" required />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Gaji Pokok (Rp)</label>
                <input type="number" value={form.basicSalary} onChange={e => setForm(f => ({ ...f, basicSalary: e.target.value }))} className="input-field" min={0} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Status</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="input-field">
                  <option value="active">Aktif</option>
                  <option value="inactive">Nonaktif</option>
                </select>
              </div>
              <div className="md:col-span-2 flex gap-2 justify-end">
                <button type="button" onClick={() => { setShowForm(false); setEditEmployee(null); setError(''); }} className="btn-outline">Batal</button>
                <button type="submit" disabled={formLoading} className="btn-primary">
                  {formLoading ? 'Menyimpan...' : editEmployee ? 'Simpan Perubahan' : 'Tambah Karyawan'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Employee Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">
              Daftar Karyawan {employees.length > 0 && <span className="text-gray-400 font-normal">({employees.length})</span>}
            </h3>
          </div>
          {loading ? (
            <div className="p-6 text-center text-gray-400 text-sm">Memuat...</div>
          ) : employees.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">Tidak ada karyawan ditemukan</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nama</th>
                    <th>Posisi</th>
                    <th>Toko</th>
                    <th>Bergabung</th>
                    <th>Masa Kerja</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp: any) => (
                    <tr key={emp.id}>
                      <td className="text-xs font-mono text-gray-500">{emp.employeeCode}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center text-xs font-semibold text-gray-600 flex-shrink-0">
                            {emp.fullName.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{emp.fullName}</p>
                            <p className="text-xs text-gray-400">{emp.user?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-xs">{emp.position?.name}</td>
                      <td className="text-xs">{emp.store?.name}</td>
                      <td className="text-xs">{formatDate(emp.hireDate)}</td>
                      <td className="text-xs text-gray-500">{calculateServiceDuration(emp.hireDate)}</td>
                      <td>
                        <span className={`badge-status ${getStatusBadgeClass(emp.status)}`}>
                          {getStatusLabel(emp.status)}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleEdit(emp)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded hover:bg-blue-50 transition-colors">
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => handleToggleStatus(emp)} className={`p-1.5 rounded transition-colors ${emp.status === 'active' ? 'text-gray-400 hover:text-amber-600 hover:bg-amber-50' : 'text-gray-400 hover:text-green-600 hover:bg-green-50'}`}>
                            {emp.status === 'active' ? <UserX className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
                          </button>
                        </div>
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
  );
}
