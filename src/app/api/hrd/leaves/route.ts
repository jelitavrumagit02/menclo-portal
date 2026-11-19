import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/session';

export async function GET(req: NextRequest) {
  const session = await requireAuth(['hrd', 'admin', 'owner']);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const storeId = searchParams.get('storeId');

  try {
    const leaves = await prisma.leaveRequest.findMany({
      where: {
        ...(status ? { status } : {}),
      },
      include: {
        employee: {
          select: {
            fullName: true,
            employeeCode: true,
            store: { select: { name: true, code: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ leaves });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
