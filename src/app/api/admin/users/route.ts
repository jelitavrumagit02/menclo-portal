import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/session';

export async function GET(req: NextRequest) {
  const session = await requireAuth(['admin']);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search');

  const users = await prisma.user.findMany({
    where: search ? {
      OR: [
        { email: { contains: search } },
        { employeeId: { contains: search } },
      ],
    } : {},
    select: {
      id: true, employeeId: true, email: true, role: true, isActive: true, lastLoginAt: true, createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ users });
}
