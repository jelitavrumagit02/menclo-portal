import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/session';

export async function GET() {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const positions = await prisma.position.findMany({ orderBy: { level: 'desc' } });
    return NextResponse.json({ positions });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
