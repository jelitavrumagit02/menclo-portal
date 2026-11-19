# MENCLO PORTAL

**Platform Manajemen Ritel Terpadu untuk Men & Clo**

> Sistem manajemen penjualan, SDM, inventaris, dan laporan bisnis untuk operasional toko fashion pria Men & Clo di Manado (Megamall, MTC, Mantos).

---

## 🚀 CARA MENJALANKAN (Langkah-langkah)

### Prasyarat: Install Node.js terlebih dahulu

Jika Node.js belum terinstall:
1. Buka browser → kunjungi **https://nodejs.org/en/download**
2. Download **Windows Installer (LTS, 64-bit)**
3. Jalankan installer, klik Next semua sampai selesai
4. Restart komputer / Command Prompt

### Setup & Jalankan (Pertama Kali)

**Cara termudah — klik dua kali file berikut:**

```
📁 menclo-portal/
   └── 🖱️ setup.bat   ← Double-click untuk setup otomatis
```

Script ini akan otomatis:
1. Install semua dependencies (node_modules)
2. Generate Prisma client
3. Buat database SQLite
4. Isi data demo (12 karyawan, 32 produk, 12 bulan penjualan)
5. Jalankan aplikasi di http://localhost:3000

### Menjalankan Setelah Setup

```
📁 menclo-portal/
   └── 🖱️ start.bat   ← Double-click untuk jalankan aplikasi
```

Atau via terminal:
```bash
npm run dev
```

Buka browser → **http://localhost:3000**

---

## 🔑 Akun Demo Login

| Role | Email | Password |
|------|-------|----------|
| **Owner** | owner@menclo.demo | demo1234 |
| **HRD** | hrd@menclo.demo | demo1234 |
| **Admin** | admin@menclo.demo | demo1234 |
| **Karyawan (Megamall)** | megamall@menclo.demo | demo1234 |
| **Karyawan (MTC)** | mtc@menclo.demo | demo1234 |
| **Karyawan (Mantos)** | mantos@menclo.demo | demo1234 |

> ⚠️ Semua akun di atas adalah data fiktif untuk keperluan demonstrasi saja.

---

## 📋 Fitur Lengkap

### 🧑‍💼 Dashboard Karyawan
- Input penjualan harian (mobile-friendly, autocomplete produk)
- Absensi check-in/check-out dengan timer real-time
- Pengajuan cuti dengan status persetujuan
- Lihat slip gaji & riwayat penggajian
- Laporan stok masuk/keluar
- Laporan produk rusak/cacat
- Pusat notifikasi

### 👔 Dashboard Owner
- KPI bisnis real-time (pendapatan hari ini, bulan ini, YTD)
- Grafik tren 12 bulan, perbandingan toko, distribusi kategori
- Produk terlaris & ranking artikel
- Filter per toko & periode waktu
- Peringatan stok minimum
- AI Business Insights (rule-based analytics)
- Ekspor laporan ke CSV

### 👩‍💼 Dashboard HRD
- Manajemen data karyawan (tambah, edit, nonaktifkan)
- Monitor kehadiran harian semua toko
- Penggajian otomatis (kalkulasi gaji pokok + tunjangan + potongan)
- Persetujuan cuti karyawan
- Manajemen peringatan karyawan (SP1, SP2, dsb.)
- Pengumuman & broadcast ke karyawan
- Laporan SDM

### 🔧 Admin Panel
- Manajemen user & akun
- Master produk & kategori
- Data toko
- Audit log lengkap
- Pengaturan sistem

---

## 🗄️ Struktur Database (23 Tabel)

| Tabel | Deskripsi |
|-------|-----------|
| users | Akun login & role |
| employees | Data karyawan |
| stores | Data toko (Megamall, MTC, Mantos) |
| positions | Jabatan/posisi |
| products | Master produk/artikel |
| product_categories | Kategori (Kaos, Kemeja, Celana, Jaket) |
| sales | Header transaksi penjualan |
| sale_items | Detail item per transaksi |
| bazaars | Event bazaar |
| inventory | Stok per produk per toko |
| inventory_movements | Pergerakan stok masuk/keluar |
| defective_products | Laporan produk rusak |
| attendance | Kehadiran harian |
| payroll_periods | Periode penggajian |
| payrolls | Data gaji per karyawan |
| payroll_items | Komponen gaji (tunjangan, potongan) |
| benefit_types | Jenis tunjangan |
| deduction_types | Jenis potongan |
| employee_benefits | Tunjangan per karyawan |
| employee_deductions | Potongan per karyawan |
| leave_requests | Pengajuan cuti |
| employee_warnings | Surat peringatan |
| announcements | Pengumuman HRD |
| notifications | Notifikasi internal |
| audit_logs | Log aktivitas sistem |

---

## 🛠️ Tech Stack

| Komponen | Teknologi |
|----------|-----------|
| Framework | Next.js 14 (App Router) |
| Bahasa | TypeScript |
| Styling | Tailwind CSS |
| Database | SQLite (dev) / PostgreSQL (prod) |
| ORM | Prisma |
| Auth | iron-session (session terenkripsi) |
| Charts | Recharts |
| Icons | Lucide React |
| Font | Inter (Google Fonts) |

---

## 📁 Struktur Folder

```
menclo-portal/
├── setup.bat              ← Jalankan pertama kali (Windows)
├── start.bat              ← Jalankan setelah setup
├── setup.ps1              ← Versi PowerShell
├── .env                   ← Konfigurasi (database URL, secret)
├── prisma/
│   ├── schema.prisma      ← Skema database 23 tabel
│   └── seed.ts            ← Data demo lengkap
└── src/
    ├── app/
    │   ├── page.tsx        ← Halaman login
    │   ├── api/            ← 35+ REST API endpoints
    │   └── dashboard/
    │       ├── employee/   ← 7 halaman karyawan
    │       ├── owner/      ← 7 halaman owner
    │       ├── hrd/        ← 8 halaman HRD
    │       └── admin/      ← 5 halaman admin
    ├── components/         ← Komponen UI reusable
    ├── contexts/           ← React AuthContext
    ├── hooks/              ← Custom hooks
    └── lib/                ← Utilities, session, Prisma, AI insights
```

---

## ⚠️ Catatan Penting

1. **Data Demo** — Semua data yang diisi seed script adalah fiktif, hanya untuk demonstrasi
2. **Notifikasi WhatsApp/Email** — Hanya simulasi internal; tidak dikirim ke luar tanpa konfigurasi API
3. **Upload Foto** — Fitur upload foto absensi perlu konfigurasi penyimpanan file (Cloudinary/S3) untuk production
4. **Production** — Ganti `SESSION_SECRET` di `.env` dan hapus akun demo sebelum deploy
5. **Database Production** — Ganti `DATABASE_URL` ke koneksi PostgreSQL di `.env`

---

© 2025 MENCLO PORTAL — Men & Clo Retail Management System  
Dibuat untuk Men & Clo, Manado — Megamall · MTC · Mantos · Bazaar
