import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/session';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAuth(['admin']);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const user = await prisma.user.update({
    where: { id: params.id },
    data: { isActive: body.isActive },
  });
  return NextResponse.json({ user });
}
