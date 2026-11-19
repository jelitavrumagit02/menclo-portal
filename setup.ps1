# ============================================================
#  MENCLO PORTAL — Setup & Launch Script
#  Jalankan script ini untuk pertama kali setup aplikasi
# ============================================================

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   MENCLO PORTAL — Setup Otomatis" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# --- Cek Node.js ---
$nodeCmd = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodeCmd) {
    Write-Host "[ERROR] Node.js tidak ditemukan!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Langkah instalasi Node.js:" -ForegroundColor Yellow
    Write-Host "  1. Buka browser, kunjungi: https://nodejs.org/en/download" -ForegroundColor White
    Write-Host "  2. Download installer Windows (LTS, 64-bit)" -ForegroundColor White
    Write-Host "  3. Jalankan installer, ikuti semua langkah default" -ForegroundColor White
    Write-Host "  4. Restart PowerShell, lalu jalankan script ini lagi" -ForegroundColor White
    Write-Host ""
    Write-Host "Atau install via winget (Windows 11):" -ForegroundColor Yellow
    Write-Host "  winget install OpenJS.NodeJS.LTS" -ForegroundColor White
    Write-Host ""
    Read-Host "Tekan Enter untuk keluar"
    exit 1
}

$nodeVersion = node --version
Write-Host "[OK] Node.js ditemukan: $nodeVersion" -ForegroundColor Green

$npmCmd = Get-Command npm -ErrorAction SilentlyContinue
if (-not $npmCmd) {
    Write-Host "[ERROR] npm tidak ditemukan. Reinstall Node.js." -ForegroundColor Red
    Read-Host "Tekan Enter untuk keluar"
    exit 1
}
$npmVersion = npm --version
Write-Host "[OK] npm ditemukan: v$npmVersion" -ForegroundColor Green
Write-Host ""

# --- Install dependencies ---
Write-Host ">> Menginstall dependencies (mungkin membutuhkan beberapa menit)..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] npm install gagal!" -ForegroundColor Red
    Read-Host "Tekan Enter untuk keluar"
    exit 1
}
Write-Host "[OK] Dependencies terinstall." -ForegroundColor Green
Write-Host ""

# --- Generate Prisma client ---
Write-Host ">> Generating Prisma client..." -ForegroundColor Yellow
npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] prisma generate gagal!" -ForegroundColor Red
    Read-Host "Tekan Enter untuk keluar"
    exit 1
}
Write-Host "[OK] Prisma client berhasil dibuat." -ForegroundColor Green
Write-Host ""

# --- Push database schema ---
Write-Host ">> Membuat database (SQLite)..." -ForegroundColor Yellow
npx prisma db push
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] prisma db push gagal!" -ForegroundColor Red
    Read-Host "Tekan Enter untuk keluar"
    exit 1
}
Write-Host "[OK] Database berhasil dibuat." -ForegroundColor Green
Write-Host ""

# --- Seed demo data ---
Write-Host ">> Mengisi data demo (karyawan, produk, penjualan 12 bulan)..." -ForegroundColor Yellow
npx ts-node --compiler-options "{`"module`":`"CommonJS`"}" prisma/seed.ts
if ($LASTEXITCODE -ne 0) {
    Write-Host "[WARNING] Seed gagal, tapi aplikasi tetap bisa dijalankan." -ForegroundColor Yellow
} else {
    Write-Host "[OK] Data demo berhasil diisi." -ForegroundColor Green
}
Write-Host ""

# --- Sukses ---
Write-Host "============================================" -ForegroundColor Green
Write-Host "   SETUP SELESAI!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Akun demo login:" -ForegroundColor Cyan
Write-Host "  Owner   : owner@menclo.demo / demo1234" -ForegroundColor White
Write-Host "  HRD     : hrd@menclo.demo   / demo1234" -ForegroundColor White
Write-Host "  Admin   : admin@menclo.demo / demo1234" -ForegroundColor White
Write-Host "  Karyawan: megamall@menclo.demo / demo1234" -ForegroundColor White
Write-Host ""
Write-Host ">> Menjalankan aplikasi di http://localhost:3000 ..." -ForegroundColor Yellow
Write-Host "   (Tekan Ctrl+C untuk berhenti)" -ForegroundColor Gray
Write-Host ""
npm run dev
