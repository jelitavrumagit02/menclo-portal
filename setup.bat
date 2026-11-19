@echo off
chcp 65001 >nul
cls

echo.
echo ============================================
echo    MENCLO PORTAL - Setup Otomatis
echo ============================================
echo.

:: Cek Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js tidak ditemukan!
    echo.
    echo Cara install Node.js:
    echo   1. Buka: https://nodejs.org/en/download
    echo   2. Download Windows Installer ^(LTS, 64-bit^)
    echo   3. Install, restart Command Prompt ini
    echo   4. Jalankan setup.bat lagi
    echo.
    echo Atau via winget ^(Windows 11^):
    echo   winget install OpenJS.NodeJS.LTS
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VER=%%i
echo [OK] Node.js: %NODE_VER%

for /f "tokens=*" %%i in ('npm --version') do set NPM_VER=%%i
echo [OK] npm: v%NPM_VER%
echo.

echo >> Menginstall dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] npm install gagal!
    pause
    exit /b 1
)
echo [OK] Dependencies OK.
echo.

echo >> Generating Prisma client...
call npx prisma generate
if %errorlevel% neq 0 (
    echo [ERROR] prisma generate gagal!
    pause
    exit /b 1
)
echo [OK] Prisma client OK.
echo.

echo >> Membuat database...
call npx prisma db push
if %errorlevel% neq 0 (
    echo [ERROR] prisma db push gagal!
    pause
    exit /b 1
)
echo [OK] Database OK.
echo.

echo >> Mengisi data demo...
call npx ts-node --compiler-options "{\"module\":\"CommonJS\"}" prisma/seed.ts
if %errorlevel% neq 0 (
    echo [WARNING] Seed gagal - aplikasi tetap bisa dijalankan.
) else (
    echo [OK] Data demo OK.
)
echo.

echo ============================================
echo    SETUP SELESAI!
echo ============================================
echo.
echo Akun demo:
echo   Owner   : owner@menclo.demo  / demo1234
echo   HRD     : hrd@menclo.demo    / demo1234
echo   Admin   : admin@menclo.demo  / demo1234
echo   Karyawan: megamall@menclo.demo / demo1234
echo.
echo >> Menjalankan di http://localhost:3000 ...
echo    ^(Tekan Ctrl+C untuk berhenti^)
echo.
call npm run dev
pause
