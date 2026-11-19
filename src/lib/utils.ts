// Formatting utilities for Indonesian locale
// Note: We use a simple cn() implementation here to avoid the need for the clsx dependency in utils

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('id-ID').format(num);
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(d);
}

export function formatDateShort(date: Date | string | null | undefined): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function formatTime(date: Date | string | null | undefined): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function formatDuration(hours: number | null | undefined): string {
  if (!hours) return '-';
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}j ${m}m`;
}

export function calculateServiceDuration(hireDate: Date | string): string {
  const start = typeof hireDate === 'string' ? new Date(hireDate) : hireDate;
  const now = new Date();
  const years = now.getFullYear() - start.getFullYear();
  const months = now.getMonth() - start.getMonth();
  const totalMonths = years * 12 + months;
  const y = Math.floor(totalMonths / 12);
  const m = totalMonths % 12;
  if (y === 0) return `${m} bulan`;
  if (m === 0) return `${y} tahun`;
  return `${y} tahun ${m} bulan`;
}

export function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    employee: 'Karyawan',
    owner: 'Owner',
    hrd: 'HRD',
    admin: 'Admin',
  };
  return labels[role] || role;
}

export function getStatusBadgeClass(status: string): string {
  const classes: Record<string, string> = {
    active: 'badge-success',
    inactive: 'badge-neutral',
    terminated: 'badge-danger',
    approved: 'badge-success',
    pending: 'badge-warning',
    rejected: 'badge-danger',
    paid: 'badge-success',
    draft: 'badge-neutral',
    review: 'badge-info',
    confirmed: 'badge-success',
    cancelled: 'badge-danger',
    open: 'badge-info',
    closed: 'badge-neutral',
  };
  return classes[status?.toLowerCase()] || 'badge-neutral';
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    active: 'Aktif',
    inactive: 'Nonaktif',
    terminated: 'Diberhentikan',
    approved: 'Disetujui',
    pending: 'Menunggu',
    rejected: 'Ditolak',
    paid: 'Dibayar',
    draft: 'Draft',
    review: 'Ditinjau',
    confirmed: 'Dikonfirmasi',
    cancelled: 'Dibatalkan',
    open: 'Terbuka',
    closed: 'Ditutup',
    shift1: 'Shift 1',
    shift2: 'Shift 2',
    jp: 'JP',
    overtime: 'Lembur',
    off: 'Libur',
    leave: 'Cuti',
    store: 'Toko Permanen',
    bazaar: 'Bazaar',
    verbal: 'Lisan',
    written: 'Tertulis',
    final: 'Peringatan Akhir',
    annual: 'Cuti Tahunan',
    sick: 'Cuti Sakit',
    personal: 'Cuti Pribadi',
    maternity: 'Cuti Melahirkan',
    emergency: 'Cuti Darurat',
    incoming: 'Masuk',
    outgoing: 'Keluar',
    transfer: 'Transfer',
    adjustment: 'Penyesuaian',
  };
  return labels[status?.toLowerCase()] || status;
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
}

export function generateEmployeeId(storeCode: string, number: number): string {
  return `${storeCode}-${String(number).padStart(3, '0')}`;
}
