import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/session';

export async function GET() {
  const session = await requireAuth(['hrd', 'admin', 'owner']);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const periods = await prisma.payrollPeriod.findMany({
      orderBy: { startDate: 'desc' },
      take: 12,
    });
    return NextResponse.json({ periods });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
