import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/session';

export async function GET(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const employee = await prisma.employee.findUnique({ where: { userId: session.userId } });
    if (!employee) return NextResponse.json({ error: 'Karyawan tidak ditemukan.' }, { status: 404 });

    const leaves = await prisma.leaveRequest.findMany({
      where: { employeeId: employee.id },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ leaves });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { leaveType, startDate, endDate, reason, totalDays } = body;

    const employee = await prisma.employee.findUnique({ where: { userId: session.userId } });
    if (!employee) return NextResponse.json({ error: 'Karyawan tidak ditemukan.' }, { status: 404 });

    const leave = await prisma.leaveRequest.create({
      data: {
        employeeId: employee.id,
        leaveType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        totalDays: Number(totalDays),
        reason,
        status: 'pending',
      },
    });

    // Create notification for HRD users
    const hrdUsers = await prisma.user.findMany({ where: { role: 'hrd', isActive: true } });
    if (hrdUsers.length > 0) {
      await prisma.notification.createMany({
        data: hrdUsers.map(u => ({
          userId: u.id,
          title: 'Pengajuan Cuti Baru',
          message: `${employee.fullName} mengajukan ${leaveType} dari ${startDate} hingga ${endDate}.`,
          type: 'leave',
        })),
      });
    }

    return NextResponse.json({ leave }, { status: 201 });
  } catch (error) {
    console.error('Leave request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
