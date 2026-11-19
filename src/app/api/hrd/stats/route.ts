import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/session';
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from 'date-fns';

export async function GET() {
  const session = await requireAuth(['hrd', 'admin', 'owner']);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const today = startOfDay(now);
    const todayEnd = endOfDay(now);

    const [
      totalActiveEmployees,
      pendingLeaves,
      recentPendingLeaves,
      todayAttendanceRaw,
      activeWarnings,
      payrollThisMonth,
      employeesByStore,
    ] = await Promise.all([
      prisma.employee.count({ where: { status: 'active' } }),
      prisma.leaveRequest.count({ where: { status: 'pending' } }),
      prisma.leaveRequest.findMany({
        where: { status: 'pending' },
        include: { employee: { select: { fullName: true } } },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.attendance.findMany({
        where: { attendanceDate: { gte: today, lte: todayEnd } },
        include: { employee: { select: { fullName: true } } },
      }),
      prisma.employeeWarning.count({ where: { status: 'active' } }),
      prisma.payroll.findMany({
        where: { payrollPeriod: { startDate: { gte: monthStart }, endDate: { lte: monthEnd } } },
      }),
      prisma.employee.groupBy({
        by: ['storeId'],
        where: { status: 'active' },
        _count: { id: true },
      }),
    ]);

    // Calculate payroll totals
    const totalPayrollThisMonth = payrollThisMonth.reduce((s, p) => s + p.netSalary, 0);
    const paidPayrolls = payrollThisMonth.filter(p => p.status === 'paid').length;
    const payrollStatus = {
      draft: payrollThisMonth.filter(p => p.status === 'draft').length,
      review: payrollThisMonth.filter(p => p.status === 'review').length,
      approved: payrollThisMonth.filter(p => p.status === 'approved').length,
      paid: paidPayrolls,
    };

    // Today's attendance summary
    const hadir = todayAttendanceRaw.filter(a => a.checkIn && !['off', 'leave'].includes(a.shiftType)).length;
    const terlambat = todayAttendanceRaw.filter(a => a.isLate).length;
    const libur = todayAttendanceRaw.filter(a => ['off', 'leave'].includes(a.shiftType)).length;

    // Employees by store
    const storeIds = employeesByStore.map(e => e.storeId);
    const stores = await prisma.store.findMany({ where: { id: { in: storeIds } }, select: { id: true, name: true } });
    const storeMap = Object.fromEntries(stores.map(s => [s.id, s.name]));

    return NextResponse.json({
      totalActiveEmployees,
      newThisMonth: 0,
      pendingLeaves,
      recentPendingLeaves,
      totalPayrollThisMonth,
      paidPayrolls,
      activeWarnings,
      payrollStatus,
      todayAttendance: { hadir, terlambat, libur },
      employeesByStore: employeesByStore.map(e => ({
        storeId: e.storeId,
        storeName: storeMap[e.storeId] || 'Unknown',
        count: e._count.id,
      })),
    });
  } catch (error) {
    console.error('HRD stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
