import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/session';

export async function GET(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const employee = await prisma.employee.findUnique({ where: { userId: session.userId } });
    if (!employee) return NextResponse.json({ error: 'Karyawan tidak ditemukan.' }, { status: 404 });

    const payrolls = await prisma.payroll.findMany({
      where: { employeeId: employee.id },
      include: {
        payrollPeriod: true,
        items: {
          include: {
            benefitType: { select: { name: true } },
            deductionType: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ payrolls });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
