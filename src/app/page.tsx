'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, User, Lock, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useRouter } from 'next/navigation';

const DEMO_ACCOUNTS = [
  { role: 'Owner', email: 'owner@menclo.demo', password: 'demo1234', color: 'bg-purple-100 text-purple-800' },
  { role: 'HRD', email: 'hrd@menclo.demo', password: 'demo1234', color: 'bg-blue-100 text-blue-800' },
  { role: 'Admin', email: 'admin@menclo.demo', password: 'demo1234', color: 'bg-gray-100 text-gray-700' },
  { role: 'Karyawan (Megamall)', email: 'megamall@menclo.demo', password: 'demo1234', color: 'bg-green-100 text-green-800' },
  { role: 'Karyawan (MTC)', email: 'mtc@menclo.demo', password: 'demo1234', color: 'bg-green-100 text-green-800' },
  { role: 'Karyawan (Mantos)', email: 'mantos@menclo.demo', password: 'demo1234', color: 'bg-green-100 text-green-800' },
];

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDemo, setShowDemo] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login gagal. Periksa kembali data Anda.');
        setLoading(false);
        return;
      }

      // Redirect based on role
      const roleRedirects: Record<string, string> = {
        owner: '/dashboard/owner',
        hrd: '/dashboard/hrd',
        admin: '/dashboard/admin',
        employee: '/dashboard/employee',
      };
      router.push(roleRedirects[data.role] || '/dashboard/employee');
    } catch {
      setError('Terjadi kesalahan koneksi. Coba lagi.');
      setLoading(false);
    }
  };

  const fillDemo = (email: string, password: string) => {
    setForm({ email, password });
    setError('');
  };

  return (
    <div className="min-h-screen bg-brand-offwhite flex">
      {/* Left Panel — Brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-brand-charcoal flex-col justify-between p-12 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-brand-red translate-x-[-50%] translate-y-[-50%]" />
          <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-brand-red translate-x-[50%] translate-y-[50%]" />
        </div>

        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-brand-red rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">M</span>
            </div>
            <div>
              <span className="text-white font-bold text-2xl tracking-wide">MENCLO</span>
              <span className="text-gray-400 text-xs block">PORTAL</span>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <h2 className="text-white text-3xl font-bold leading-tight mb-4">
            Kelola bisnis fashion Anda<br />
            <span className="text-brand-red">lebih cerdas</span> dan terpusat.
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed max-w-md">
            Platform manajemen ritel terpadu untuk Men & Clo — menghubungkan penjualan, SDM, inventaris, dan laporan bisnis dalam satu sistem.
          </p>

          {/* Feature chips */}
          <div className="flex flex-wrap gap-2 mt-6">
            {['Laporan Penjualan Real-time', 'Manajemen SDM', 'Multi-Toko', 'AI Insights', 'Payroll Otomatis'].map(f => (
              <span key={f} className="text-xs text-gray-300 bg-white/10 px-3 py-1 rounded-full border border-white/20">
                {f}
              </span>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-gray-500 text-xs">
            Men & Clo — Megamall · MTC · Mantos · Bazaar<br />
            <span className="text-gray-600">© 2025 MENCLO PORTAL. Semua hak dilindungi.</span>
          </p>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-brand-red rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">M</span>
          </div>
          <div>
            <span className="text-brand-charcoal font-bold text-2xl tracking-wide">MENCLO</span>
            <span className="text-gray-400 text-xs block">PORTAL</span>
          </div>
        </div>

        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Masuk ke Portal</h1>
            <p className="text-gray-500 text-sm mt-1">Gunakan ID karyawan atau email dan kata sandi Anda.</p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-md px-4 py-3 mb-5 text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">
                ID Karyawan / Email
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="Masukkan ID atau email"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-gray-700">Kata Sandi</label>
                <button type="button" className="text-xs text-primary hover:underline">
                  Lupa kata sandi?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Masukkan kata sandi"
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="remember" className="rounded border-gray-300 text-primary" />
              <label htmlFor="remember" className="text-sm text-gray-600">Ingat saya di perangkat ini</label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-red text-white py-2.5 rounded-md text-sm font-semibold hover:bg-red-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Memverifikasi...
                </>
              ) : 'Masuk'}
            </button>
          </form>

          {/* Demo Access Section */}
          <div className="mt-8">
            <div className="border border-dashed border-amber-300 rounded-lg bg-amber-50 p-4">
              <button
                onClick={() => setShowDemo(!showDemo)}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-sm font-semibold text-amber-800">DEMO ACCESS</span>
                  <span className="text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">Hanya untuk demonstrasi</span>
                </div>
                {showDemo ? <ChevronUp className="h-4 w-4 text-amber-600" /> : <ChevronDown className="h-4 w-4 text-amber-600" />}
              </button>

              {showDemo && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs text-amber-700 mb-3">
                    Klik akun di bawah untuk mengisi form login secara otomatis. Semua data adalah fiktif untuk keperluan demonstrasi.
                  </p>
                  {DEMO_ACCOUNTS.map(acc => (
                    <button
                      key={acc.email}
                      onClick={() => fillDemo(acc.email, acc.password)}
                      className="w-full flex items-center justify-between bg-white rounded-md border border-amber-200 px-3 py-2 text-xs hover:bg-amber-50 transition-colors text-left group"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full font-medium ${acc.color}`}>{acc.role}</span>
                        <span className="text-gray-600">{acc.email}</span>
                      </div>
                      <span className="text-gray-400 group-hover:text-primary text-xs">Isi →</span>
                    </button>
                  ))}
                  <p className="text-xs text-amber-600 mt-2">
                    Password untuk semua akun demo: <strong>demo1234</strong>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
