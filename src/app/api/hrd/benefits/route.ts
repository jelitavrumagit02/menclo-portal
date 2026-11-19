import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/session';

export async function GET() {
  const session = await requireAuth(['hrd', 'admin', 'owner']);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [benefitTypes, deductionTypes] = await Promise.all([
    prisma.benefitType.findMany({ orderBy: { name: 'asc' } }),
    prisma.deductionType.findMany({ orderBy: { name: 'asc' } }),
  ]);

  return NextResponse.json({ benefitTypes, deductionTypes });
}
