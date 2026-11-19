import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/session';

export async function GET(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const isActive = searchParams.get('isActive');

  try {
    const bazaars = await prisma.bazaar.findMany({
      where: isActive === 'true' ? { isActive: true } : {},
      orderBy: { startDate: 'desc' },
    });
    return NextResponse.json({ bazaars });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
