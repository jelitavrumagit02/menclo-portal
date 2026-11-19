import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/session';
import { startOfMonth, endOfMonth } from 'date-fns';

export async function GET(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const limit = Number(searchParams.get('limit') || '20');

  try {
    const employee = await prisma.employee.findUnique({ where: { userId: session.userId } });
    if (!employee) return NextResponse.json({ error: 'Karyawan tidak ditemukan.' }, { status: 404 });

    const sales = await prisma.sale.findMany({
      where: { employeeId: employee.id },
      include: {
        store: { select: { name: true, code: true } },
        bazaar: { select: { name: true } },
        items: {
          include: {
            product: { select: { name: true, articleCode: true, category: { select: { name: true } } } },
          },
        },
      },
      orderBy: { saleDate: 'desc' },
      take: limit,
    });

    return NextResponse.json({ sales });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
