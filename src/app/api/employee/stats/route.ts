import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/session';
import { startOfMonth, endOfMonth } from 'date-fns';

export async function GET(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const employee = await prisma.employee.findUnique({ where: { userId: session.userId } });
    if (!employee) return NextResponse.json({ error: 'Karyawan tidak ditemukan.' }, { status: 404 });

    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const [monthlySalesAgg, monthlyAttendance, leaves] = await Promise.all([
      prisma.sale.aggregate({
        where: { employeeId: employee.id, saleDate: { gte: monthStart, lte: monthEnd }, status: 'confirmed' },
        _sum: { totalAmount: true },
        _count: { id: true },
      }),
      prisma.attendance.findMany({
        where: { employeeId: employee.id, attendanceDate: { gte: monthStart, lte: monthEnd } },
      }),
      prisma.leaveRequest.findMany({
        where: { employeeId: employee.id },
        select: { status: true },
      }),
    ]);

    const attendanceDays = monthlyAttendance.filter(a => !['off', 'leave'].includes(a.shiftType)).length;
    const lateDays = monthlyAttendance.filter(a => a.isLate).length;
    const approvedLeaves = leaves.filter(l => l.status === 'approved').length;
    const pendingLeaves = leaves.filter(l => l.status === 'pending').length;

    return NextResponse.json({
      monthlySales: monthlySalesAgg._sum.totalAmount || 0,
      monthlyTransactions: monthlySalesAgg._count.id,
      attendanceDays,
      lateDays,
      approvedLeaves,
      pendingLeaves,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
