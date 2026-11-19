import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/session';

export async function GET(req: NextRequest) {
  const session = await requireAuth(['admin', 'owner']);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const limit = Number(searchParams.get('limit') || '50');
  const module = searchParams.get('module');

  try {
    const logs = await prisma.auditLog.findMany({
      where: module ? { module } : {},
      include: {
        user: { select: { email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json({ logs });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
