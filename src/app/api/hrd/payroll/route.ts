import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/session';

export async function GET(req: NextRequest) {
  const session = await requireAuth(['hrd', 'admin', 'owner']);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const periodId = searchParams.get('periodId');
  const search = searchParams.get('search');
  const storeId = searchParams.get('storeId');

  try {
    const payrolls = await prisma.payroll.findMany({
      where: {
        ...(periodId ? { payrollPeriodId: periodId } : {}),
        ...(search ? { employee: { fullName: { contains: search } } } : {}),
        ...(storeId ? { employee: { storeId } } : {}),
      },
      include: {
        employee: {
          include: {
            store: { select: { name: true, code: true } },
            position: { select: { name: true } },
          },
        },
        payrollPeriod: true,
        items: {
          include: {
            benefitType: { select: { name: true } },
            deductionType: { select: { name: true } },
          },
        },
      },
      orderBy: { employee: { fullName: 'asc' } },
    });

    return NextResponse.json({ payrolls });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
