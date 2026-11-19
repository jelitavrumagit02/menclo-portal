import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/session';
import { startOfDay, endOfDay } from 'date-fns';

export async function GET(req: NextRequest) {
  const session = await requireAuth(['hrd', 'admin', 'owner']);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');
  const storeId = searchParams.get('storeId');
  const search = searchParams.get('search');

  try {
    const targetDate = date ? new Date(date) : new Date();
    const dayStart = startOfDay(targetDate);
    const dayEnd = endOfDay(targetDate);

    const attendance = await prisma.attendance.findMany({
      where: {
        attendanceDate: { gte: dayStart, lte: dayEnd },
        ...(storeId ? { storeId } : {}),
        ...(search ? {
          employee: {
            OR: [
              { fullName: { contains: search } },
              { employeeCode: { contains: search } },
            ],
          },
        } : {}),
      },
      include: {
        employee: {
          select: {
            fullName: true,
            employeeCode: true,
            position: { select: { name: true } },
          },
        },
        store: { select: { name: true, code: true } },
      },
      orderBy: [{ store: { name: 'asc' } }, { employee: { fullName: 'asc' } }],
    });

    return NextResponse.json({ attendance });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
