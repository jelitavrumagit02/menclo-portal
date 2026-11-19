import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/session';
import { startOfMonth, endOfMonth, format } from 'date-fns';

export async function GET(req: NextRequest, { params }: { params: { type: string } }) {
  const session = await requireAuth(['owner', 'hrd', 'admin']);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const outputFormat = searchParams.get('format') || 'json';
  const now = new Date();

  try {
    let data: any;
    let headers: string[] = [];
    let rows: any[][] = [];

    switch (params.type) {
      case 'daily-sales': {
        const sales = await prisma.sale.findMany({
          where: { status: 'confirmed' },
          include: {
            employee: { select: { fullName: true, employeeCode: true } },
            store: { select: { name: true } },
            bazaar: { select: { name: true } },
            items: { include: { product: { select: { name: true, articleCode: true } } } },
          },
          orderBy: { saleDate: 'desc' },
          take: 100,
        });
        data = { sales, totalRevenue: sales.reduce((s, v) => s + v.totalAmount, 0), count: sales.length };
        headers = ['Tanggal', 'Karyawan', 'ID Karyawan', 'Lokasi', 'Item', 'Total (Rp)'];
        rows = sales.map(s => [
          format(s.saleDate, 'dd/MM/yyyy HH:mm'),
          s.employee?.fullName || '',
          s.employee?.employeeCode || '',
          s.store?.name || s.bazaar?.name || 'Bazaar',
          s.totalItems,
          s.totalAmount,
        ]);
        break;
      }
      case 'monthly-sales': {
        const start = startOfMonth(now);
        const end = endOfMonth(now);
        const sales = await prisma.sale.aggregate({
          where: { saleDate: { gte: start, lte: end }, status: 'confirmed' },
          _sum: { totalAmount: true, totalItems: true },
          _count: { id: true },
        });
        data = { period: format(now, 'MMMM yyyy'), ...sales };
        headers = ['Periode', 'Total Transaksi', 'Total Item', 'Total Pendapatan (Rp)'];
        rows = [[format(now, 'MMMM yyyy'), sales._count.id, sales._sum.totalItems || 0, sales._sum.totalAmount || 0]];
        break;
      }
      case 'payroll-summary': {
        const payrolls = await prisma.payroll.findMany({
          include: {
            employee: { include: { store: { select: { name: true } }, position: { select: { name: true } } } },
            payrollPeriod: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 100,
        });
        data = { payrolls, totalNetSalary: payrolls.reduce((s, p) => s + p.netSalary, 0) };
        headers = ['Karyawan', 'Toko', 'Posisi', 'Periode', 'Gaji Pokok', 'Gaji Kotor', 'Potongan', 'Gaji Bersih', 'Status'];
        rows = payrolls.map(p => [
          p.employee?.fullName, p.employee?.store?.name, p.employee?.position?.name,
          p.payrollPeriod?.periodName, p.basicSalary, p.grossSalary, p.totalDeductions, p.netSalary, p.status,
        ]);
        break;
      }
      case 'attendance-summary': {
        const attendance = await prisma.attendance.findMany({
          include: {
            employee: { include: { store: { select: { name: true } }, position: { select: { name: true } } } },
          },
          orderBy: { attendanceDate: 'desc' },
          take: 500,
        });
        data = { attendance, count: attendance.length };
        headers = ['Karyawan', 'Toko', 'Tanggal', 'Shift', 'Masuk', 'Keluar', 'Durasi (jam)', 'Terlambat', 'Menit Terlambat'];
        rows = attendance.map(a => [
          a.employee?.fullName, a.employee?.store?.name,
          format(a.attendanceDate, 'dd/MM/yyyy'), a.shiftType,
          a.checkIn ? format(a.checkIn, 'HH:mm') : '-',
          a.checkOut ? format(a.checkOut, 'HH:mm') : '-',
          a.workDuration?.toFixed(2) || '-',
          a.isLate ? 'Ya' : 'Tidak',
          a.lateMinutes || 0,
        ]);
        break;
      }
      case 'inventory-report': {
        const inventory = await prisma.inventory.findMany({
          include: {
            product: { include: { category: true } },
            store: { select: { name: true } },
          },
        });
        data = { inventory };
        headers = ['Kode Artikel', 'Nama Produk', 'Kategori', 'Toko', 'Stok', 'Min Stok', 'Harga Jual (Rp)'];
        rows = inventory.map(i => [
          i.product?.articleCode, i.product?.name, i.product?.category?.name,
          i.store?.name, i.quantity, i.product?.minStock, i.product?.sellingPrice,
        ]);
        break;
      }
      case 'store-performance': {
        const stores = await prisma.store.findMany({ select: { id: true, name: true, code: true } });
        const result = await Promise.all(stores.map(async store => {
          const agg = await prisma.sale.aggregate({
            where: { storeId: store.id, status: 'confirmed' },
            _sum: { totalAmount: true, totalItems: true },
            _count: { id: true },
          });
          return { storeName: store.name, storeCode: store.code, ...agg._sum, transactions: agg._count.id };
        }));
        data = { stores: result };
        headers = ['Toko', 'Kode', 'Total Transaksi', 'Total Item', 'Total Pendapatan (Rp)'];
        rows = result.map(r => [r.storeName, r.storeCode, r.transactions, r.totalItems || 0, r.totalAmount || 0]);
        break;
      }
      case 'employee-sales': {
        const empSales = await prisma.sale.groupBy({
          by: ['employeeId'],
          where: { status: 'confirmed' },
          _sum: { totalAmount: true, totalItems: true },
          _count: { id: true },
          orderBy: { _sum: { totalAmount: 'desc' } },
        });
        const empIds = empSales.map(e => e.employeeId);
        const employees = await prisma.employee.findMany({
          where: { id: { in: empIds } },
          select: { id: true, fullName: true, employeeCode: true, store: { select: { name: true } } },
        });
        const empMap = Object.fromEntries(employees.map(e => [e.id, e]));
        data = { employees: empSales.map(e => ({ ...empMap[e.employeeId], ...e._sum, transactions: e._count.id })) };
        headers = ['Karyawan', 'ID', 'Toko', 'Transaksi', 'Item', 'Total (Rp)'];
        rows = empSales.map(e => {
          const emp = empMap[e.employeeId];
          return [emp?.fullName, emp?.employeeCode, emp?.store?.name, e._count.id, e._sum.totalItems || 0, e._sum.totalAmount || 0];
        });
        break;
      }
      case 'defective-report': {
        const defectives = await prisma.defectiveProduct.findMany({
          include: {
            product: { select: { name: true, articleCode: true } },
            store: { select: { name: true } },
            employee: { select: { fullName: true } },
          },
          orderBy: { reportDate: 'desc' },
        });
        data = { defectives };
        headers = ['Tanggal', 'Produk', 'Kode Artikel', 'Toko', 'Qty', 'Deskripsi', 'Status'];
        rows = defectives.map(d => [
          format(d.reportDate, 'dd/MM/yyyy'), d.product?.name, d.product?.articleCode,
          d.store?.name, d.quantity, d.description, d.status,
        ]);
        break;
      }
      default:
        return NextResponse.json({ error: 'Jenis laporan tidak valid.' }, { status: 400 });
    }

    if (outputFormat === 'csv') {
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`).join(','))
      ].join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${params.type}-${format(now, 'yyyy-MM-dd')}.csv"`,
        },
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Report error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
