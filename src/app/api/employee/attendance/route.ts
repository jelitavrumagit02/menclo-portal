import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/session';

export async function GET(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const limit = Number(searchParams.get('limit') || '30');

  try {
    const employee = await prisma.employee.findUnique({ where: { userId: session.userId } });
    if (!employee) return NextResponse.json({ error: 'Karyawan tidak ditemukan.' }, { status: 404 });

    const attendance = await prisma.attendance.findMany({
      where: { employeeId: employee.id },
      orderBy: { attendanceDate: 'desc' },
      take: limit,
    });

    return NextResponse.json({ attendance });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { action, shiftType, notes, photoUrl } = body; // action: 'checkin' | 'checkout'

    const employee = await prisma.employee.findUnique({ where: { userId: session.userId } });
    if (!employee) return NextResponse.json({ error: 'Karyawan tidak ditemukan.' }, { status: 404 });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await prisma.attendance.findUnique({
      where: { employeeId_attendanceDate: { employeeId: employee.id, attendanceDate: today } },
    });

    if (action === 'checkin') {
      if (existing) return NextResponse.json({ error: 'Sudah absen masuk hari ini.' }, { status: 400 });

      const checkIn = new Date();
      const isLate = checkIn.getHours() >= 9 && checkIn.getMinutes() > 15;
      const lateMinutes = isLate ? (checkIn.getHours() - 9) * 60 + checkIn.getMinutes() - 15 : 0;

      const attendance = await prisma.attendance.create({
        data: {
          employeeId: employee.id,
          storeId: employee.storeId,
          attendanceDate: today,
          checkIn,
          shiftType: shiftType || 'shift1',
          isLate,
          lateMinutes: lateMinutes > 0 ? lateMinutes : 0,
          notes,
          photoUrl,
        },
      });
      return NextResponse.json({ attendance });
    }

    if (action === 'checkout') {
      if (!existing) return NextResponse.json({ error: 'Belum melakukan absen masuk.' }, { status: 400 });
      if (existing.checkOut) return NextResponse.json({ error: 'Sudah absen keluar hari ini.' }, { status: 400 });

      const checkOut = new Date();
      const workDuration = existing.checkIn
        ? (checkOut.getTime() - existing.checkIn.getTime()) / 3600000
        : null;

      const attendance = await prisma.attendance.update({
        where: { id: existing.id },
        data: { checkOut, workDuration, notes: notes || existing.notes },
      });
      return NextResponse.json({ attendance });
    }

    return NextResponse.json({ error: 'Action tidak valid.' }, { status: 400 });
  } catch (error) {
    console.error('Attendance error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
