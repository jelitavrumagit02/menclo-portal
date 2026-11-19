import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/session';

export async function GET() {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const categories = await prisma.productCategory.findMany({ orderBy: { name: 'asc' } });
  return NextResponse.json({ categories });
}
